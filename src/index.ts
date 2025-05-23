import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { v5 as uuid } from 'uuid';

/**
 * Properties for configuring the ApiTestHarness
 */
interface ApiTestHarnessConstructProps {
  /** The deployment stage, e.g., 'dev', 'prod', etc. */
  stage: string;

  /** Whether the logger is enabled ('true' or 'false'). */
  loggerEnabled: string;

  /** Whether to log the full event in logs. Defaults to 'true'. */
  logEvent?: string;

  /** Logging level (e.g., 'DEBUG', 'INFO'). Defaults to 'DEBUG'. */
  logLevel?: string;

  /** Sample rate for logging. Defaults to '1'. */
  logSampleRate?: string;

  /** Whether X-Ray tracing is enabled. Defaults to 'true'. */
  traceEnabled?: string;

  /** The AWS Lambda runtime to use. Defaults to NODEJS_LATEST. */
  lambdaRuntime?: lambda.Runtime;

  /** Memory size (in MB) for the Lambda function. Defaults to 1024. */
  lambdaMemorySize?: number;

  /** Optional prefix to use for named resources (table, function, etc), example, api-test-harness. */
  resourceNamePrefix?: string;

  /** Whether to capture X-Ray tracing or not. Defaults to 'true'. */
  captureTrace?: string;

  /** Optional entry path override for the Lambda function code. */
  entryPathOverride?: string;
}

/**
 * A construct that provisions a DynamoDB table, a Lambda function
 * with a function URL, and stores the URL/API key in SSM Parameter Store.
 * This allows the consumer to seed the DynamoDB table with determinstic items
 * which will be returned in order when the API receives requests.
 *
 * Useful for testing API functionality in isolated environments.
 */
export class ApiTestHarness extends Construct {
  /** Reference to the DynamoDB table created for storing test data. */
  public readonly dynamoDbTable: dynamodb.Table;

  /** The function URL of the deployed Lambda function. */
  public readonly functionUrl: string;

  /** The API key used to invoke the Lambda function. */
  public readonly functionApiKey: string;

  /**
   * Creates a new instance of the ApiTestHarness.
   *
   * @param scope - The parent construct.
   * @param id - The ID of the construct.
   * @param props - Configuration options for the construct.
   */
  constructor(
    scope: Construct,
    id: string,
    props: ApiTestHarnessConstructProps,
  ) {
    super(scope, id);

    const {
      stage,
      loggerEnabled,
      logEvent,
      logLevel,
      logSampleRate,
      traceEnabled,
      lambdaRuntime,
      lambdaMemorySize,
      resourceNamePrefix,
      captureTrace,
      entryPathOverride,
    } = props;

    const nameSuffix = `${stage}-${id}`;
    const namePrefix = resourceNamePrefix || 'api-test-harness';

    const namespace = '2419158b-a3dd-4daa-8f98-97fd57a83ec3'; // non-secret hash
    const apiKey = uuid(nameSuffix, namespace);

    const tableName = `${namePrefix}-table-${nameSuffix}`;
    const functionName = `${namePrefix}-${nameSuffix}`;
    const ssmUrlParamName = `/${stage}/${namePrefix}-url-${id}`;
    const ssmKeyParamName = `/${stage}/${namePrefix}-api-key-${id}`;

    this.dynamoDbTable = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.NUMBER },
      tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const lambdaConfig = {
      LOG_LEVEL: logLevel || 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: logEvent || 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: logSampleRate || '1',
      POWERTOOLS_TRACE_ENABLED: traceEnabled || 'true',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'true',
      POWERTOOLS_SERVICE_NAME: `${namePrefix}-service-${nameSuffix}`,
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: captureTrace || 'true',
      POWERTOOLS_METRICS_NAMESPACE: `${namePrefix}-${nameSuffix}`,
    };

    const apiTestHarnessLambda = new nodeLambda.NodejsFunction(this, 'Lambda', {
      functionName,
      runtime: lambdaRuntime || lambda.Runtime.NODEJS_LATEST,
      entry: path.join(
        __dirname,
        entryPathOverride
          ? entryPathOverride
          : './adapters/primary/api-test-harness-adapter.js',
      ),
      memorySize: lambdaMemorySize || 1024,
      handler: 'handler',
      description: `${stage} ${namePrefix} service lambdalith`,
      architecture: lambda.Architecture.ARM_64,
      tracing: lambda.Tracing.ACTIVE,
      bundling: {
        minify: true,
      },
      environment: {
        ...lambdaConfig,
        TABLE_NAME: this.dynamoDbTable.tableName,
        X_API_KEY: apiKey,
        LOGGER_ENABLED: loggerEnabled,
        STAGE: stage,
      },
    });

    apiTestHarnessLambda.addPermission('FunctionUrlInvokePermission', {
      principal: new iam.AnyPrincipal(),
      action: 'lambda:InvokeFunctionUrl',
      functionUrlAuthType: lambda.FunctionUrlAuthType.NONE,
    });

    this.dynamoDbTable.grantReadWriteData(apiTestHarnessLambda);

    const functionUrl = apiTestHarnessLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      invokeMode: lambda.InvokeMode.BUFFERED,
      cors: {
        allowedOrigins: ['*'],
      },
    });

    new cdk.CfnOutput(this, 'FunctionUrlOutput', {
      value: functionUrl.url,
      exportName: `${namePrefix}-url-${nameSuffix}`,
    });

    new ssm.StringParameter(this, 'FunctionUrlParam', {
      parameterName: ssmUrlParamName,
      stringValue: functionUrl.url,
    });

    new ssm.StringParameter(this, 'FunctionApiKeyParam', {
      parameterName: ssmKeyParamName,
      stringValue: apiKey,
    });

    this.functionUrl = functionUrl.url;
    this.functionApiKey = apiKey;

    cdk.Tags.of(this).add('Service', namePrefix);
    cdk.Tags.of(this).add('Stage', stage);
  }
}
