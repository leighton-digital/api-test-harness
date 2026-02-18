# Configuration

The API Test Harness provides several configuration options to customize its behavior for your specific needs. This guide covers all available configuration options, their default values, and usage examples.

## Configuration Options

All configuration options are passed as properties when instantiating the `ApiTestHarness` construct in your CDK stack.

### Configuration Reference

| Name                | Description                                                                 | Example Value           | Default Value |
|---------------------|-----------------------------------------------------------------------------|--------------------------|---------------|
| `stage`             | The deployment stage name (used in resource naming and tagging).            | `"dev"`                 | Required      |
| `loggerEnabled`     | Whether to enable the internal logger in the service code for debugging (the internal Fastify app). | `"true"` or `"false"`   | `"false"`     |
| `logLevel`          | Logging level for the Lambda function. | `"INFO"`                | `"DEBUG"`     |
| `logSampleRate`     | Logging debug sample rate for Lambda, typically a decimal string between 0 and 1. | `"0.5"`                 | `"1"`         |
| `lambdaRuntime`     | The Lambda runtime to use.                                                  | `lambda.Runtime.NODEJS_18_X` | `lambda.Runtime.NODEJS_LATEST` |
| `lambdaMemorySize`  | Memory size (in MB) to allocate to the Lambda function.                    | `512`                   | `1024`        |
| `resourceNamePrefix`| Optional prefix for resource names like table, Lambda, SSM params.          | `"booking-service"`     | None          |
| `entryPathOverride` | Optional entry path override for the Lambda function code.                  | `"./adapters/primary/api-test-harness-adapter.ts"` | None |

## Configuration Details

### stage

**Type**: `string` (required)

The deployment stage name is used throughout the test harness for resource naming and tagging. This helps you identify which environment the resources belong to.

**Example**:
```typescript
new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  // ... other options
});
```

Common values include `"dev"`, `"test"`, `"staging"`, or `"prod"`.

### loggerEnabled

**Type**: `string` (`"true"` or `"false"`)  
**Default**: `"false"`

Controls whether the internal Fastify application logger is enabled. When enabled, the Fastify app will output detailed logs about incoming requests, routing, and responses. This is useful for debugging issues with the test harness itself.

**Example**:
```typescript
new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  loggerEnabled: 'true', // Enable for debugging
  // ... other options
});
```

**Note**: This is separate from the Lambda function logging controlled by `logLevel`.

### logLevel

**Type**: `string`  
**Default**: `"DEBUG"`

Sets the logging level for the Lambda function. This controls the verbosity of logs sent to CloudWatch Logs.

**Valid values**:
- `"DEBUG"` - Most verbose, includes all log levels
- `"INFO"` - Informational messages and above
- `"WARN"` - Warning messages and above
- `"ERROR"` - Error messages and above
- `"CRITICAL"` - Only critical errors
- `"SILENT"` - No logging

**Example**:
```typescript
new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  logLevel: 'INFO', // Less verbose than DEBUG
  // ... other options
});
```

**Recommendation**: Use `"DEBUG"` during development and `"INFO"` or `"WARN"` in test environments to reduce log volume.

### logSampleRate

**Type**: `string` (decimal between 0 and 1)  
**Default**: `"1"`

Controls the sampling rate for debug logs in the Lambda function. A value of `"1"` means all debug logs are captured, while `"0.5"` means only 50% of debug logs are captured.

**Example**:
```typescript
new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  logLevel: 'DEBUG',
  logSampleRate: '0.5', // Sample 50% of debug logs
  // ... other options
});
```

**Use case**: Reduce log volume and costs in high-traffic test environments while still capturing a representative sample of debug information.

### lambdaRuntime

**Type**: `lambda.Runtime`  
**Default**: `lambda.Runtime.NODEJS_LATEST`

Specifies the Node.js runtime version for the Lambda function. You can override this to use a specific Node.js version if needed.

**Example**:
```typescript
import * as lambda from 'aws-cdk-lib/aws-lambda';

new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  lambdaRuntime: lambda.Runtime.NODEJS_18_X, // Use Node.js 18
  // ... other options
});
```

**Recommendation**: Use the default `NODEJS_LATEST` unless you have specific compatibility requirements.

### lambdaMemorySize

**Type**: `number` (in MB)  
**Default**: `1024`

Sets the amount of memory allocated to the Lambda function. More memory also provides proportionally more CPU power.

**Example**:
```typescript
new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  lambdaMemorySize: 512, // Reduce memory for cost savings
  // ... other options
});
```

**Considerations**:
- **Lower values** (256-512 MB): Suitable for simple responses and lower traffic
- **Default** (1024 MB): Good balance for most use cases
- **Higher values** (1536-3008 MB): Use if returning large response payloads or handling high concurrency

### resourceNamePrefix

**Type**: `string` (optional)  
**Default**: None

Adds a prefix to all resource names created by the test harness, including the DynamoDB table, Lambda function, and SSM parameters. This is useful when deploying multiple test harnesses in the same account or when you want to align resource names with your project naming conventions.

**Example**:
```typescript
new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  resourceNamePrefix: 'booking-service', // Prefix all resources
  // ... other options
});
```

**Result**: Resources will be named like `booking-service-api-test-harness-table`, `booking-service-api-test-harness-lambda`, etc.

### entryPathOverride

**Type**: `string` (optional)  
**Default**: None

Overrides the entry point for the Lambda function code. This advanced option allows you to use a custom Lambda handler instead of the default one provided by the test harness.

**Example**:
```typescript
new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  entryPathOverride: './adapters/primary/api-test-harness-adapter.ts',
  // ... other options
});
```

**Use case**: Extend or customize the test harness behavior by providing your own Lambda handler implementation.

## Configuration Examples

### Minimal Configuration

The simplest configuration with only required options:

```typescript
import { ApiTestHarness } from '@leighton-digital/api-test-harness';

new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
});
```

### Development Configuration

Optimized for development with verbose logging:

```typescript
import { ApiTestHarness } from '@leighton-digital/api-test-harness';

new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  loggerEnabled: 'true',
  logLevel: 'DEBUG',
  logSampleRate: '1',
  lambdaMemorySize: 512,
});
```

### Production-Like Test Configuration

Optimized for production-like test environments with reduced logging:

```typescript
import { ApiTestHarness } from '@leighton-digital/api-test-harness';

new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'test',
  loggerEnabled: 'false',
  logLevel: 'WARN',
  logSampleRate: '0.1',
  lambdaMemorySize: 1024,
  resourceNamePrefix: 'my-app',
});
```

### Multi-Service Configuration

When deploying multiple test harnesses for different services:

```typescript
import { ApiTestHarness } from '@leighton-digital/api-test-harness';

// Test harness for payment service
new ApiTestHarness(this, 'PaymentTestHarness', {
  stage: 'dev',
  resourceNamePrefix: 'payment-service',
  lambdaMemorySize: 512,
});

// Test harness for inventory service
new ApiTestHarness(this, 'InventoryTestHarness', {
  stage: 'dev',
  resourceNamePrefix: 'inventory-service',
  lambdaMemorySize: 512,
});
```

### Custom Runtime Configuration

Using a specific Node.js runtime version:

```typescript
import { ApiTestHarness } from '@leighton-digital/api-test-harness';
import * as lambda from 'aws-cdk-lib/aws-lambda';

new ApiTestHarness(this, 'ApiTestHarness', {
  stage: 'dev',
  lambdaRuntime: lambda.Runtime.NODEJS_18_X,
  lambdaMemorySize: 1024,
});
```

## Accessing Deployed Resources

After deployment, the API Test Harness stores important information in AWS Parameter Store:

- **API URL**: The Lambda Function URL endpoint
- **API Key**: The auto-generated API key for authentication

You can retrieve these values in your test setup using the AWS SDK:

```typescript
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ region: 'us-east-1' });

// Get API URL
const urlParam = await ssmClient.send(
  new GetParameterCommand({
    Name: '/api-test-harness/dev/url',
  })
);

// Get API Key
const keyParam = await ssmClient.send(
  new GetParameterCommand({
    Name: '/api-test-harness/dev/api-key',
    WithDecryption: true,
  })
);

const apiUrl = urlParam.Parameter?.Value;
const apiKey = keyParam.Parameter?.Value;
```

## Best Practices

1. **Use descriptive stage names**: Choose stage names that clearly indicate the environment (e.g., `"dev"`, `"test"`, `"staging"`)

2. **Enable logging during development**: Set `loggerEnabled: 'true'` and `logLevel: 'DEBUG'` when developing or debugging

3. **Reduce logging in test environments**: Use `logLevel: 'INFO'` or `'WARN'` and lower `logSampleRate` to reduce CloudWatch costs

4. **Right-size Lambda memory**: Start with the default 1024 MB and adjust based on your response payload sizes and performance requirements

5. **Use resource prefixes for multiple harnesses**: When deploying multiple test harnesses, use `resourceNamePrefix` to keep resources organized

6. **Keep API keys secure**: Never commit API keys to source control; always retrieve them from Parameter Store at runtime

## Next Steps

Now that you understand the configuration options, you can:

- Learn about [Seeding Data](seeding-data.md) to populate the test harness with response data
- Explore [Usage Examples](usage-examples.md) for more advanced integration patterns
- Review the [Architecture](architecture.md) to understand how the test harness works internally
