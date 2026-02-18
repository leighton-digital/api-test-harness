# Usage Examples

This guide provides practical examples of how to use the API Test Harness in different scenarios. Whether you're integrating it into an existing CDK project or creating a new test environment, these examples will help you get started quickly.

## Basic CDK Stack Example

The simplest way to use the API Test Harness is to add it to a CDK stack with minimal configuration:

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiTestHarness } from '@leighton-digital/api-test-harness';

export class MyTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ApiTestHarness(this, 'ApiTestHarness', {
      stage: 'dev',
      loggerEnabled: 'true',
      logLevel: 'INFO',
      logSampleRate: '1',
      lambdaMemorySize: 512,
      resourceNamePrefix: 'my-test-harness',
    });
  }
}
```

This creates a test harness with:
- Development stage configuration
- Logging enabled for debugging
- INFO level logging
- 512 MB Lambda memory allocation
- Custom resource name prefix for easy identification

## Integrating into Existing CDK Projects

### Adding to an Existing Stack

If you have an existing CDK stack, you can add the test harness alongside your other resources:

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiTestHarness } from '@leighton-digital/api-test-harness';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class MyApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Your existing application resources
    const myFunction = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
    });

    const api = new apigateway.RestApi(this, 'MyApi', {
      restApiName: 'My Service',
    });

    // Add the test harness for testing
    const testHarness = new ApiTestHarness(this, 'TestHarness', {
      stage: 'test',
      loggerEnabled: 'true',
      logLevel: 'DEBUG',
      resourceNamePrefix: 'my-app-test',
    });
  }
}
```

### Creating a Dedicated Test Stack

For better separation of concerns, create a dedicated stack for your test infrastructure:

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiTestHarness } from '@leighton-digital/api-test-harness';

export class TestInfrastructureStack extends Stack {
  public readonly testHarness: ApiTestHarness;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.testHarness = new ApiTestHarness(this, 'ApiTestHarness', {
      stage: 'test',
      loggerEnabled: 'true',
      logLevel: 'DEBUG',
      logSampleRate: '1',
      lambdaMemorySize: 1024,
      resourceNamePrefix: 'test-infrastructure',
    });
  }
}
```

Then reference it in your main application:

```typescript
import { App } from 'aws-cdk-lib';
import { MyApplicationStack } from './my-application-stack';
import { TestInfrastructureStack } from './test-infrastructure-stack';

const app = new App();

const testInfra = new TestInfrastructureStack(app, 'TestInfraStack', {
  env: { account: '123456789012', region: 'us-east-1' },
});

const appStack = new MyApplicationStack(app, 'MyAppStack', {
  env: { account: '123456789012', region: 'us-east-1' },
});
```

## Configuration Scenarios

### Development Environment

For local development and debugging, use verbose logging:

```typescript
new ApiTestHarness(this, 'DevTestHarness', {
  stage: 'dev',
  loggerEnabled: 'true',
  logLevel: 'DEBUG',
  logSampleRate: '1',
  lambdaMemorySize: 512,
  resourceNamePrefix: 'dev-harness',
});
```

### CI/CD Pipeline Testing

For automated testing in CI/CD pipelines, use minimal logging to reduce noise:

```typescript
new ApiTestHarness(this, 'CiTestHarness', {
  stage: 'ci',
  loggerEnabled: 'false',
  logLevel: 'ERROR',
  logSampleRate: '0.1',
  lambdaMemorySize: 256,
  resourceNamePrefix: 'ci-harness',
});
```

### Performance Testing

For performance testing scenarios, allocate more memory and use sampling:

```typescript
new ApiTestHarness(this, 'PerfTestHarness', {
  stage: 'perf',
  loggerEnabled: 'true',
  logLevel: 'WARN',
  logSampleRate: '0.1',
  lambdaMemorySize: 2048,
  resourceNamePrefix: 'perf-harness',
});
```

### Multi-Environment Setup

Deploy different configurations for different environments:

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiTestHarness } from '@leighton-digital/api-test-harness';

interface TestHarnessStackProps extends StackProps {
  environment: 'dev' | 'test' | 'staging';
}

export class TestHarnessStack extends Stack {
  constructor(scope: Construct, id: string, props: TestHarnessStackProps) {
    super(scope, id, props);

    const config = this.getConfigForEnvironment(props.environment);

    new ApiTestHarness(this, 'ApiTestHarness', config);
  }

  private getConfigForEnvironment(env: string) {
    const baseConfig = {
      stage: env,
      resourceNamePrefix: `${env}-harness`,
    };

    switch (env) {
      case 'dev':
        return {
          ...baseConfig,
          loggerEnabled: 'true',
          logLevel: 'DEBUG',
          logSampleRate: '1',
          lambdaMemorySize: 512,
        };
      case 'test':
        return {
          ...baseConfig,
          loggerEnabled: 'true',
          logLevel: 'INFO',
          logSampleRate: '0.5',
          lambdaMemorySize: 512,
        };
      case 'staging':
        return {
          ...baseConfig,
          loggerEnabled: 'false',
          logLevel: 'WARN',
          logSampleRate: '0.1',
          lambdaMemorySize: 1024,
        };
      default:
        throw new Error(`Unknown environment: ${env}`);
    }
  }
}
```

## Custom Lambda Runtime

If you need to use a specific Node.js version:

```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';

new ApiTestHarness(this, 'CustomRuntimeHarness', {
  stage: 'test',
  loggerEnabled: 'true',
  logLevel: 'INFO',
  lambdaRuntime: lambda.Runtime.NODEJS_20_X,
  lambdaMemorySize: 512,
  resourceNamePrefix: 'custom-runtime',
});
```

## Advanced: Custom Entry Point

For advanced use cases where you need to customize the Lambda handler:

```typescript
new ApiTestHarness(this, 'CustomEntryHarness', {
  stage: 'test',
  loggerEnabled: 'true',
  logLevel: 'INFO',
  lambdaMemorySize: 512,
  resourceNamePrefix: 'custom-entry',
  entryPathOverride: './adapters/primary/custom-api-handler.ts',
});
```

## Using the Test Harness in Tests

### Retrieving Configuration from Parameter Store

After deploying the test harness, retrieve the URL and API key from Parameter Store:

```typescript
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ region: 'us-east-1' });

async function getTestHarnessConfig(stage: string, resourcePrefix: string) {
  const urlParam = await ssmClient.send(
    new GetParameterCommand({
      Name: `/${resourcePrefix}/${stage}/api-test-harness-url`,
    })
  );

  const apiKeyParam = await ssmClient.send(
    new GetParameterCommand({
      Name: `/${resourcePrefix}/${stage}/api-test-harness-api-key`,
      WithDecryption: true,
    })
  );

  return {
    url: urlParam.Parameter?.Value,
    apiKey: apiKeyParam.Parameter?.Value,
  };
}
```

### Making Requests to the Test Harness

Use the retrieved configuration to make requests:

```typescript
async function callTestHarness(
  url: string,
  apiKey: string,
  requestId: string
) {
  const response = await fetch(`${url}?pk=${requestId}&sk=1`, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Test harness request failed: ${response.statusText}`);
  }

  return response.json();
}
```

### Complete Test Example

Here's a complete example of using the test harness in a test:

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

describe('API Test Harness Integration', () => {
  let testHarnessUrl: string;
  let testHarnessApiKey: string;
  const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
  const ssmClient = new SSMClient({ region: 'us-east-1' });

  beforeAll(async () => {
    // Get test harness configuration
    const urlParam = await ssmClient.send(
      new GetParameterCommand({
        Name: '/my-test-harness/test/api-test-harness-url',
      })
    );
    const apiKeyParam = await ssmClient.send(
      new GetParameterCommand({
        Name: '/my-test-harness/test/api-test-harness-api-key',
        WithDecryption: true,
      })
    );

    testHarnessUrl = urlParam.Parameter!.Value!;
    testHarnessApiKey = apiKeyParam.Parameter!.Value!;

    // Seed test data
    await dynamoClient.send(
      new PutItemCommand({
        TableName: 'my-test-harness-test-api-test-harness-table',
        Item: {
          pk: { S: 'test-request-123' },
          sk: { N: '1' },
          statusCode: { N: '200' },
          response: {
            S: JSON.stringify({
              orderId: 'ORD-123',
              status: 'success',
            }),
          },
        },
      })
    );
  });

  it('should return seeded response', async () => {
    const response = await fetch(
      `${testHarnessUrl}?pk=test-request-123&sk=1`,
      {
        headers: {
          'x-api-key': testHarnessApiKey,
        },
      }
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.orderId).toBe('ORD-123');
    expect(data.status).toBe('success');
  });
});
```

## Best Practices

### 1. Use Descriptive Resource Prefixes

Always use descriptive resource name prefixes to identify your test harnesses:

```typescript
resourceNamePrefix: 'booking-service-test'
```

### 2. Separate Test Harnesses by Service

Create separate test harnesses for different services or components:

```typescript
// Order service test harness
new ApiTestHarness(this, 'OrderServiceHarness', {
  stage: 'test',
  resourceNamePrefix: 'order-service-test',
  // ...
});

// Payment service test harness
new ApiTestHarness(this, 'PaymentServiceHarness', {
  stage: 'test',
  resourceNamePrefix: 'payment-service-test',
  // ...
});
```

### 3. Use Environment Variables

Configure your application to use environment variables for the test harness URL:

```typescript
const apiUrl = process.env.USE_TEST_HARNESS === 'true'
  ? process.env.TEST_HARNESS_URL
  : process.env.PRODUCTION_API_URL;
```

### 4. Clean Up Test Data

Always clean up test data after your tests complete:

```typescript
afterAll(async () => {
  await dynamoClient.send(
    new DeleteItemCommand({
      TableName: 'test-harness-table',
      Key: {
        pk: { S: 'test-request-123' },
        sk: { N: '1' },
      },
    })
  );
});
```

## Next Steps

- Learn how to [seed data](seeding-data.md) into the test harness
- Understand the [architecture](architecture.md) in detail
- Explore all [configuration options](configuration.md)
- Review the [API reference](api-reference/) for detailed type information

## Troubleshooting

### API Key Not Working

If you're getting authentication errors, verify the API key is correct:

```bash
aws ssm get-parameter \
  --name "/my-test-harness/test/api-test-harness-api-key" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text
```

### Lambda Timeout Issues

If requests are timing out, increase the Lambda memory size:

```typescript
lambdaMemorySize: 1024, // Increase from 512
```

### Missing Responses

If the test harness returns 404, verify your data is seeded correctly:

```bash
aws dynamodb get-item \
  --table-name my-test-harness-test-api-test-harness-table \
  --key '{"pk":{"S":"test-request-123"},"sk":{"N":"1"}}'
```

---

For more examples and patterns, check out the [GitHub repository](https://github.com/leighton-digital/api-test-harness) or open an [issue](https://github.com/leighton-digital/api-test-harness/issues) if you need help.
