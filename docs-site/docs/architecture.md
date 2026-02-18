# Architecture

The API Test Harness is designed as a lightweight, cost-effective solution for providing deterministic API responses in test environments. This page explains the overall architecture, data flow, and key design decisions.

## Solution Overview

The following diagram illustrates the complete architecture and data flow:

![Solution Architecture](/img/solution.png)

The architecture follows a simple four-step workflow:

1. **Data Seeding**: Before e2e tests run, the DynamoDB table is seeded with deterministic data (status codes and response objects)
2. **Test Execution**: E2e tests run against the system under test
3. **Configuration**: The system under test is configured to point to the API Test Harness instead of the concrete API implementation
4. **Deterministic Responses**: The API Test Harness responds with the seeded values, enabling testing of various scenarios

This approach allows you to test both success and failure scenarios by controlling the data returned from the API that is consumed by your system under test.

## Core Components

### Lambda Function with Function URL

The API Test Harness is implemented as a **Fastify application** running inside an AWS Lambda function. This design choice provides several benefits:

- **Simplicity**: No need for API Gateway or additional infrastructure
- **Cost-Effectiveness**: Pay only for actual invocations
- **Performance**: Fast cold starts with modern Node.js runtimes
- **Scalability**: Automatic scaling handled by Lambda

The Lambda Function URL provides a public HTTPS endpoint that can be called directly, making it easy to integrate with your test infrastructure.

### DynamoDB Table

The DynamoDB table stores the deterministic responses that the API Test Harness will return. The table uses a simple key structure:

**Primary Key Structure:**
- **Partition Key (pk)**: A unique identifier (typically a UUID) that represents a specific test scenario or request
- **Sort Key (sk)**: A numeric value (typically `1`) allowing for potential future expansion

**Item Attributes:**
- `pk`: The partition key (UUID)
- `sk`: The sort key (number)
- `statusCode`: The HTTP status code to return (e.g., 200, 404, 500)
- `response`: A JSON string containing the response body

**Example DynamoDB Item:**
```json
{
  "pk": "f5d5f080-d366-4c1e-8447-b8b70eb8df64",
  "sk": 1,
  "statusCode": 200,
  "response": "{\"orderId\":\"ORD-20250522-001\",\"customer\":{\"firstName\":\"Jane\",\"lastName\":\"Doe\"}}"
}
```

## Data Flow

1. **Request Arrives**: A test client makes an HTTP request to the Lambda Function URL with a specific identifier in the path
2. **Authentication**: The Lambda function validates the `x-api-key` header against the generated API key
3. **Database Lookup**: The function queries DynamoDB using the identifier from the request path as the partition key
4. **Response Construction**: The function retrieves the `statusCode` and `response` from DynamoDB
5. **Response Delivery**: The function returns the HTTP response with the specified status code and body

## API Key Generation and Security

### API Key Generation

The API Test Harness automatically generates an API key during CDK deployment using a deterministic approach:

- **Algorithm**: UUID v5 (namespace-based UUID)
- **Inputs**: Combination of namespace, deployment stage, and construct logical ID
- **Storage**: The generated API key is stored in AWS Systems Manager Parameter Store
- **Retrieval**: Test code can retrieve the API key from Parameter Store using the AWS SDK

### Security Considerations

Since the Lambda Function URL is publicly accessible, the API key provides a basic level of security:

- **Header-Based Authentication**: All requests must include the `x-api-key` header with the correct value
- **Environment-Specific**: Different stages (dev, test, prod) generate different API keys
- **No Production Data**: You should never seed the database with actual production data
- **Test Environments Only**: This harness is designed exclusively for test environments

**Best Practice**: Configure your application code to only pass the `x-api-key` header when an environment variable is present, ensuring the header is not sent to production APIs.

## Infrastructure as Code

The entire API Test Harness is defined using AWS CDK, providing:

- **Reproducibility**: Deploy identical test harnesses across multiple environments
- **Version Control**: Infrastructure changes are tracked in source control
- **Automation**: Integrate deployment into CI/CD pipelines
- **Configuration**: Customize runtime, memory, logging, and resource naming through construct properties

## Configuration Options

The API Test Harness supports various configuration options to customize its behavior:

| Configuration | Purpose | Impact |
|--------------|---------|--------|
| `stage` | Environment identifier | Used in resource naming and API key generation |
| `loggerEnabled` | Enable/disable internal logging | Helps with debugging the Fastify application |
| `logLevel` | Control log verbosity | Adjust between DEBUG, INFO, WARN, ERROR, CRITICAL, SILENT |
| `lambdaRuntime` | Node.js runtime version | Affects performance and available features |
| `lambdaMemorySize` | Lambda memory allocation | Impacts performance and cost |
| `resourceNamePrefix` | Custom resource naming | Helps identify resources in AWS console |

## Design Rationale

### Why Lambda Function URL?

- **No API Gateway Overhead**: Eliminates additional latency and cost
- **Direct Invocation**: Simpler request/response flow
- **Built-in HTTPS**: Automatic SSL/TLS without additional configuration
- **Simplified IAM**: Function URL has straightforward permission model

### Why DynamoDB?

- **Fast Lookups**: Single-digit millisecond latency for key-value queries
- **Serverless**: No infrastructure to manage
- **Cost-Effective**: Pay only for what you use
- **Flexible Schema**: Easy to add new attributes as needs evolve

### Why Fastify?

- **Performance**: One of the fastest Node.js web frameworks
- **TypeScript Support**: First-class TypeScript integration
- **Lightweight**: Minimal overhead for Lambda cold starts
- **Extensible**: Easy to add middleware and plugins if needed

## Deployment Architecture

When you deploy the API Test Harness, CDK creates:

1. **DynamoDB Table**: For storing test response data
2. **Lambda Function**: Running the Fastify application
3. **Lambda Function URL**: Public HTTPS endpoint
4. **IAM Role**: With permissions to read from DynamoDB
5. **SSM Parameters**: Storing the Function URL and API key
6. **CloudWatch Log Group**: For Lambda execution logs

All resources are tagged with the deployment stage and can be customized with a resource name prefix for easy identification.

## Scalability and Performance

- **Automatic Scaling**: Lambda scales automatically based on request volume
- **Concurrent Executions**: Multiple test suites can run simultaneously
- **DynamoDB Capacity**: On-demand billing mode handles variable workloads
- **Cold Start Optimization**: Modern Node.js runtimes minimize cold start impact

## Monitoring and Debugging

The API Test Harness provides several mechanisms for monitoring and debugging:

- **CloudWatch Logs**: All Lambda invocations are logged
- **Configurable Log Levels**: Adjust verbosity based on debugging needs
- **Internal Logger**: Optional Fastify application logging for request/response details
- **Log Sampling**: Control the percentage of debug logs to reduce costs

## Integration with Testing Frameworks

The API Test Harness integrates seamlessly with common testing approaches:

1. **Setup Phase**: Seed DynamoDB with test data using AWS SDK or CLI
2. **Configuration Phase**: Update system under test to use the Function URL
3. **Execution Phase**: Run tests that make API calls
4. **Teardown Phase**: Clean up test data from DynamoDB

The Function URL and API key are available in Parameter Store, making them easy to retrieve in test setup code.
