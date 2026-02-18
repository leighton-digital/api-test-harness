# Installation

This guide will walk you through installing the API Test Harness in your project.

## Prerequisites

Before installing the API Test Harness, ensure you have the following:

- **Node.js**: Version 18.0 or higher
- **AWS CDK**: Version 2.220.0 or higher
- **Package Manager**: npm or pnpm

## Installation

You can install the API Test Harness using either npm or pnpm:

### Using npm

```bash
npm install @leighton-digital/api-test-harness
```

### Using pnpm

```bash
pnpm add @leighton-digital/api-test-harness
```

## Basic Import

Once installed, you can import the package in your CDK stack:

```typescript
import { ApiTestHarness } from '@leighton-digital/api-test-harness';
```

## Next Steps

After installation, you can:

- Review the [Configuration](./configuration.md) options to customize your test harness
- Check out [Usage Examples](./usage-examples.md) to see how to integrate it into your CDK stack
- Learn about [Seeding Data](./seeding-data.md) to set up test scenarios
