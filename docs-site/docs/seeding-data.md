# Seeding Data

Learn how to populate the API Test Harness with deterministic response data for your tests.

## Overview

Before running your end-to-end tests, you need to seed the DynamoDB table with the responses you want the test harness to return. This allows you to create predictable test scenarios for both success and failure cases.

The seeding process involves creating DynamoDB items with a specific structure that the test harness uses to match requests and return appropriate responses.

## DynamoDB Item Structure

Each item in the DynamoDB table follows this structure:

### Primary Key (pk)

The partition key (`pk`) is a UUID that uniquely identifies the request. This UUID should match the identifier you use when calling the test harness API.

**Example**: `"f5d5f080-d366-4c1e-8447-b8b70eb8df64"`

### Sort Key (sk)

The sort key (`sk`) is a numeric value that allows you to store multiple responses for the same partition key. This is useful for testing scenarios where the same endpoint is called multiple times with different expected responses.

**Example**: `1`

### Status Code

The `statusCode` attribute defines the HTTP status code that the test harness will return.

**Example**: `200` (success), `404` (not found), `500` (server error)

### Response

The `response` attribute contains the JSON response body as a string. This is the actual data that will be returned to your application.

**Example**: A stringified JSON object containing your test data

## Complete Example Item

Here's a complete example of a DynamoDB item for testing a car order API:

```json
{
  "pk": "f5d5f080-d366-4c1e-8447-b8b70eb8df64",
  "sk": 1,
  "statusCode": 200,
  "response": "{\"orderId\":\"ORD-20250522-001\",\"customer\":{\"firstName\":\"Jane\",\"lastName\":\"Doe\",\"email\":\"jane.doe@example.com\",\"phone\":\"+44 7700 900123\"},\"car\":{\"make\":\"Tesla\",\"model\":\"Model Y\",\"year\":2025,\"trim\":\"Long Range AWD\",\"color\":\"Midnight Silver Metallic\",\"interior\":\"Black and White\",\"extras\":[\"Autopilot\",\"Premium Interior\",\"Tow Hitch\"]},\"orderDate\":\"2025-05-22T12:00:00.000Z\",\"delivery\":{\"type\":\"Home Delivery\",\"address\":{\"street\":\"123 Electric Ave\",\"city\":\"London\",\"postalCode\":\"SW1A 1AA\",\"country\":\"UK\"},\"expectedDeliveryDate\":\"2025-06-15\"},\"payment\":{\"method\":\"Credit Card\",\"depositPaid\":1000,\"totalPrice\":58990},\"status\":\"Processing\"}"
}
```

### Response Format Explained

The `response` field contains a stringified JSON object. When parsed, it represents:

```json
{
  "orderId": "ORD-20250522-001",
  "customer": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "phone": "+44 7700 900123"
  },
  "car": {
    "make": "Tesla",
    "model": "Model Y",
    "year": 2025,
    "trim": "Long Range AWD",
    "color": "Midnight Silver Metallic",
    "interior": "Black and White",
    "extras": ["Autopilot", "Premium Interior", "Tow Hitch"]
  },
  "orderDate": "2025-05-22T12:00:00.000Z",
  "delivery": {
    "type": "Home Delivery",
    "address": {
      "street": "123 Electric Ave",
      "city": "London",
      "postalCode": "SW1A 1AA",
      "country": "UK"
    },
    "expectedDeliveryDate": "2025-06-15"
  },
  "payment": {
    "method": "Credit Card",
    "depositPaid": 1000,
    "totalPrice": 58990
  },
  "status": "Processing"
}
```

## Seeding with AWS SDK

You can seed data programmatically using the AWS SDK for JavaScript/TypeScript. This is ideal for integrating seeding into your test setup.

### Prerequisites

Install the AWS SDK v3 DynamoDB client:

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### Example: Seeding a Single Item

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Initialize the DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Define your test data
const testResponse = {
  orderId: 'ORD-20250522-001',
  customer: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+44 7700 900123'
  },
  car: {
    make: 'Tesla',
    model: 'Model Y',
    year: 2025
  },
  status: 'Processing'
};

// Seed the item
async function seedTestData() {
  const command = new PutCommand({
    TableName: 'your-test-harness-table-name',
    Item: {
      pk: 'f5d5f080-d366-4c1e-8447-b8b70eb8df64',
      sk: 1,
      statusCode: 200,
      response: JSON.stringify(testResponse)
    }
  });

  try {
    await docClient.send(command);
    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

// Run the seeding function
seedTestData();
```

### Example: Seeding Multiple Scenarios

You can seed multiple items to test different scenarios:

```typescript
async function seedMultipleScenarios() {
  const scenarios = [
    {
      pk: 'test-success-scenario',
      sk: 1,
      statusCode: 200,
      response: JSON.stringify({ status: 'success', data: { id: 123 } })
    },
    {
      pk: 'test-not-found-scenario',
      sk: 1,
      statusCode: 404,
      response: JSON.stringify({ error: 'Resource not found' })
    },
    {
      pk: 'test-server-error-scenario',
      sk: 1,
      statusCode: 500,
      response: JSON.stringify({ error: 'Internal server error' })
    }
  ];

  for (const scenario of scenarios) {
    const command = new PutCommand({
      TableName: 'your-test-harness-table-name',
      Item: scenario
    });

    await docClient.send(command);
    console.log(`Seeded scenario: ${scenario.pk}`);
  }
}
```

### Example: Test Setup Integration

Integrate seeding into your test setup (e.g., Jest):

```typescript
import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';

describe('E2E Tests with API Test Harness', () => {
  beforeAll(async () => {
    // Seed test data before running tests
    await seedTestData();
  });

  afterAll(async () => {
    // Optional: Clean up test data after tests
    await cleanupTestData();
  });

  it('should return seeded order data', async () => {
    // Your test code here
    const response = await callTestHarness('f5d5f080-d366-4c1e-8447-b8b70eb8df64');
    expect(response.statusCode).toBe(200);
    expect(response.data.orderId).toBe('ORD-20250522-001');
  });
});
```

## Seeding with AWS CLI

For quick manual testing or CI/CD pipeline integration, you can use the AWS CLI to seed data.

### Example: Seeding a Single Item

```bash
aws dynamodb put-item \
  --table-name your-test-harness-table-name \
  --item '{
    "pk": {"S": "f5d5f080-d366-4c1e-8447-b8b70eb8df64"},
    "sk": {"N": "1"},
    "statusCode": {"N": "200"},
    "response": {"S": "{\"orderId\":\"ORD-20250522-001\",\"status\":\"Processing\"}"}
  }' \
  --region us-east-1
```

### Example: Seeding from a JSON File

Create a JSON file (`test-item.json`):

```json
{
  "pk": {"S": "f5d5f080-d366-4c1e-8447-b8b70eb8df64"},
  "sk": {"N": "1"},
  "statusCode": {"N": "200"},
  "response": {"S": "{\"orderId\":\"ORD-20250522-001\",\"customer\":{\"firstName\":\"Jane\",\"lastName\":\"Doe\"},\"status\":\"Processing\"}"}
}
```

Then seed it:

```bash
aws dynamodb put-item \
  --table-name your-test-harness-table-name \
  --item file://test-item.json \
  --region us-east-1
```

### Example: Batch Seeding Multiple Items

Create a batch file (`batch-items.json`):

```json
{
  "your-test-harness-table-name": [
    {
      "PutRequest": {
        "Item": {
          "pk": {"S": "test-success"},
          "sk": {"N": "1"},
          "statusCode": {"N": "200"},
          "response": {"S": "{\"status\":\"success\"}"}
        }
      }
    },
    {
      "PutRequest": {
        "Item": {
          "pk": {"S": "test-error"},
          "sk": {"N": "1"},
          "statusCode": {"N": "500"},
          "response": {"S": "{\"error\":\"Server error\"}"}
        }
      }
    }
  ]
}
```

Batch write the items:

```bash
aws dynamodb batch-write-item \
  --request-items file://batch-items.json \
  --region us-east-1
```

## Finding Your Table Name

After deploying the API Test Harness, you need to find the DynamoDB table name. It follows this pattern:

```
{resourceNamePrefix}-api-test-harness-table-{stage}
```

You can find it using the AWS CLI:

```bash
aws dynamodb list-tables --region us-east-1 | grep api-test-harness
```

Or retrieve it from CloudFormation stack outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name YourStackName \
  --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' \
  --output text
```

## Best Practices

### 1. Use Descriptive Partition Keys

Use meaningful UUIDs or identifiers that describe the test scenario:

```typescript
{
  pk: 'test-order-success-scenario',
  sk: 1,
  // ...
}
```

### 2. Clean Up After Tests

Remove test data after your tests complete to avoid clutter:

```typescript
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';

async function cleanupTestData(pk: string, sk: number) {
  const command = new DeleteCommand({
    TableName: 'your-test-harness-table-name',
    Key: { pk, sk }
  });

  await docClient.send(command);
}
```

### 3. Version Your Test Data

Use the sort key to version responses for the same scenario:

```typescript
// First call returns processing status
{ pk: 'order-123', sk: 1, statusCode: 200, response: '{"status":"processing"}' }

// Second call returns completed status
{ pk: 'order-123', sk: 2, statusCode: 200, response: '{"status":"completed"}' }
```

### 4. Test Error Scenarios

Don't just test success cases—seed error responses too:

```typescript
const errorScenarios = [
  { statusCode: 400, response: '{"error":"Bad request"}' },
  { statusCode: 401, response: '{"error":"Unauthorized"}' },
  { statusCode: 404, response: '{"error":"Not found"}' },
  { statusCode: 500, response: '{"error":"Internal server error"}' },
  { statusCode: 503, response: '{"error":"Service unavailable"}' }
];
```

### 5. Use Environment Variables

Store the table name in environment variables for flexibility:

```typescript
const TABLE_NAME = process.env.TEST_HARNESS_TABLE_NAME || 'default-table-name';
```

## Troubleshooting

### Item Not Found

If the test harness returns a 404, verify:
- The partition key (`pk`) matches exactly what you're requesting
- The item was successfully written to the table
- You're using the correct table name

### Invalid Response Format

If you get parsing errors:
- Ensure the `response` field is a valid JSON string
- Use `JSON.stringify()` when creating the response
- Escape special characters properly

### Permission Errors

If seeding fails with permission errors:
- Verify your AWS credentials have `dynamodb:PutItem` permission
- Check the table name is correct
- Ensure you're in the correct AWS region

## Next Steps

Now that you know how to seed data, explore:

- **[Usage Examples](usage-examples.md)**: See how to call the test harness with seeded data
- **[Configuration](configuration.md)**: Learn about test harness configuration options
- **[Architecture](architecture.md)**: Understand how the test harness processes requests

---

Need help? Check the [GitHub repository](https://github.com/leighton-digital/api-test-harness) or [open an issue](https://github.com/leighton-digital/api-test-harness/issues).
