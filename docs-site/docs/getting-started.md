# Getting Started

Welcome to the API Test Harness! This guide will help you understand what the test harness is, why you need it, and how to get started quickly.

## What is the API Test Harness?

The API Test Harness is a CDK-based solution for returning predefined, deterministic API responses. It allows you to create reliable, repeatable end-to-end (e2e) tests by simulating third-party API behavior without depending on actual external services.

## Why Do You Need This?

When building solutions on AWS with the AWS CDK, your application often relies on third-party APIs. This creates several challenges for testing:

- **Unpredictable Responses**: You can't control what external APIs return, making it difficult to test specific scenarios
- **Limited Failure Testing**: You can't force external APIs to fail in specific ways to test error handling
- **Flaky Tests**: External API availability and response times can cause test failures unrelated to your code
- **Cost and Rate Limits**: Repeatedly calling real APIs during testing can be expensive and hit rate limits

The API Test Harness solves these problems by acting as a stand-in for third-party APIs in your test environments. You seed a DynamoDB table with the exact responses you want, and the test harness returns them deterministically.

## Key Features

- **Deterministic API Responses**: Configure predefined responses to ensure consistent, repeatable tests
- **Hermetic Test Environments**: Create isolated testing environments that simulate real-world scenarios
- **Comprehensive Scenario Testing**: Easily test both success and failure paths, including complex conditional flows
- **AWS CDK Integration**: Seamlessly integrate into your CDK projects with infrastructure as code
- **Enhanced Debugging**: Control external interactions to identify and resolve issues more easily

## How It Works

The test harness follows a simple workflow:

1. **Seed the Database**: Before running tests, populate the DynamoDB table with deterministic data (status codes and response objects)
2. **Configure Your System**: Point your system under test to the test harness instead of the real API
3. **Run Your Tests**: Execute your e2e tests against the system
4. **Get Deterministic Responses**: The test harness returns the exact responses you seeded, allowing you to test various scenarios

![Solution Architecture](../../images/solution.png)

## Quick Start

### Prerequisites

- Node.js 18.0 or higher
- AWS CDK installed and configured
- An AWS account with appropriate permissions

### Installation

Install the package using npm or pnpm:

```bash
npm install @leighton-digital/api-test-harness
```

Or with pnpm:

```bash
pnpm add @leighton-digital/api-test-harness
```

### Basic Usage

Import and use the test harness in your CDK stack:

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

### Deploy the Stack

Deploy your CDK stack to create the test harness infrastructure:

```bash
cdk deploy
```

After deployment, the API Test Harness URL and API Key are stored in AWS Parameter Store for easy access in your tests.

## Next Steps

Now that you understand the basics, explore these topics to get the most out of the API Test Harness:

- **[Installation](installation.md)**: Detailed installation instructions and prerequisites
- **[Configuration](configuration.md)**: Learn about all available configuration options
- **[Seeding Data](seeding-data.md)**: How to populate the test harness with response data
- **[Usage Examples](usage-examples.md)**: More advanced usage patterns and examples
- **[Architecture](architecture.md)**: Deep dive into how the test harness works

## Security Note

The API Test Harness uses a Lambda Function URL with an auto-generated API key for access control. The API key is deterministically generated using UUID v5 and stored in AWS Parameter Store. 

**Important**: Do not seed the database with actual production data. This is a test harness designed for non-production environments only.

## Getting Help

If you encounter issues or have questions:

- Check the [documentation](https://leighton-digital.github.io/api-test-harness/)
- Review the [GitHub repository](https://github.com/leighton-digital/api-test-harness)
- Open an [issue on GitHub](https://github.com/leighton-digital/api-test-harness/issues)

---

Ready to dive deeper? Continue to the [Installation](installation.md) guide for detailed setup instructions.
