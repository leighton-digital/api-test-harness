import * as lambda from 'aws-cdk-lib/aws-lambda';

import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { ApiTestHarness } from '../src/index';

let template: Template;
let app: App;

beforeAll(() => {
  app = new App();
  const stack = new Stack(app, 'TestStack');

  new ApiTestHarness(stack, 'Harness', {
    stage: 'dev',
    loggerEnabled: 'true',
    entryPathOverride: './adapters/primary/api-test-harness-adapter.ts',
  });

  template = Template.fromStack(stack);
});

describe('DynamoDB Table', () => {
  it('should create a DynamoDB table with correct properties', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
      TableName: Match.stringLikeRegexp('api-test-harness-table-dev-Harness'),
      KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
      ],
      PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: false },
    });
  });

  it('should set the removal policy to DESTROY for the DynamoDB table', () => {
    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Delete',
    });
  });
});

describe('Lambda Function', () => {
  it('should create a Lambda function with correct environment variables and settings', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      MemorySize: 1024,
      Handler: 'index.handler',
      Environment: {
        Variables: Match.objectLike({
          LOGGER_ENABLED: 'true',
          STAGE: 'dev',
        }),
      },
    });
  });

  it('should create a Lambda function URL', () => {
    template.resourceCountIs('AWS::Lambda::Url', 1);
  });

  it('should use ARM_64 architecture and NODEJS_LATEST as default runtime', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Architectures: ['arm64'],
      Runtime: Match.stringLikeRegexp('nodejs'),
    });
  });

  it('should allow public access to Lambda function URL', () => {
    template.hasResourceProperties('AWS::Lambda::Permission', {
      Action: 'lambda:InvokeFunctionUrl',
      Principal: '*',
    });
  });

  it('should allow function invocation via function URL', () => {
    template.hasResourceProperties('AWS::Lambda::Permission', {
      Action: 'lambda:InvokeFunction',
      Principal: '*',
      InvokedViaFunctionUrl: true,
    });
  });

  it('should configure Lambda function URL with no auth and CORS enabled', () => {
    template.hasResourceProperties('AWS::Lambda::Url', {
      AuthType: 'NONE',
      Cors: {
        AllowOrigins: ['*'],
      },
      InvokeMode: 'BUFFERED',
    });
  });
});

describe('SSM Parameters', () => {
  it('should create SSM parameter for the function URL', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: Match.stringLikeRegexp('/dev/api-test-harness-url-Harness'),
    });
  });

  it('should create SSM parameter for the API key', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Type: 'String',
      Name: Match.stringLikeRegexp('/dev/api-test-harness-api-key-Harness'),
    });
  });
});

describe('Optional Parameters', () => {
  it('should generate correctly with all optional params present', () => {
    const app = new App();
    const stack = new Stack(app, 'OptionalArgsStack');

    new ApiTestHarness(stack, 'HarnessWithOptions', {
      stage: 'test',
      loggerEnabled: 'false',
      logLevel: 'INFO',
      logSampleRate: '0.5',
      lambdaRuntime: lambda.Runtime.NODEJS_18_X,
      lambdaMemorySize: 2048,
      resourceNamePrefix: 'custom-prefix',
      entryPathOverride: './adapters/primary/api-test-harness-adapter.ts',
    });

    template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs18.x',
      Environment: {
        Variables: Match.objectLike({
          POWERTOOLS_LOGGER_SAMPLE_RATE: '0.5',
          LOG_LEVEL: 'INFO',
        }),
      },
    });
  });
});
