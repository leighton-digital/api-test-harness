# Interface: ApiTestHarnessConstructProps

Defined in: src/index.ts:14

Properties for configuring the ApiTestHarness

## Properties

### entryPathOverride?

> `optional` **entryPathOverride**: `string`

Defined in: src/index.ts:37

Optional entry path override for the Lambda function code.

***

### lambdaMemorySize?

> `optional` **lambdaMemorySize**: `number`

Defined in: src/index.ts:31

Memory size (in MB) for the Lambda function. Defaults to 1024.

***

### lambdaRuntime?

> `optional` **lambdaRuntime**: `Runtime`

Defined in: src/index.ts:28

The AWS Lambda runtime to use. Defaults to NODEJS_LATEST.

***

### loggerEnabled

> **loggerEnabled**: `string`

Defined in: src/index.ts:19

Whether the logger is enabled in the internal service ('true' or 'false').

***

### logLevel?

> `optional` **logLevel**: `string`

Defined in: src/index.ts:22

Logging level (e.g., 'DEBUG', 'INFO'). Defaults to 'DEBUG'.

***

### logSampleRate?

> `optional` **logSampleRate**: `string`

Defined in: src/index.ts:25

Sample rate for logging. Defaults to '1'.

***

### resourceNamePrefix?

> `optional` **resourceNamePrefix**: `string`

Defined in: src/index.ts:34

Optional prefix to use for named resources (table, function, etc), example, api-test-harness.

***

### stage

> **stage**: `string`

Defined in: src/index.ts:16

The deployment stage, e.g., 'dev', 'prod', etc.
