# Class: ApiTestHarness

Defined in: src/index.ts:48

A construct that provisions a DynamoDB table, a Lambda function
with a function URL, and stores the URL/API key in SSM Parameter Store.
This allows the consumer to seed the DynamoDB table with determinstic items
which will be returned in order when the API receives requests.

Useful for testing API functionality in isolated environments.

## Extends

- `Construct`

## Constructors

### Constructor

> **new ApiTestHarness**(`scope`, `id`, `props`): `ApiTestHarness`

Defined in: src/index.ts:65

Creates a new instance of the ApiTestHarness.

#### Parameters

##### scope

`Construct`

The parent construct.

##### id

`string`

The ID of the construct.

##### props

`ApiTestHarnessConstructProps`

Configuration options for the construct.

#### Returns

`ApiTestHarness`

#### Overrides

`Construct.constructor`

## Properties

### dynamoDbTable

> `readonly` **dynamoDbTable**: `Table`

Defined in: src/index.ts:50

Reference to the DynamoDB table created for storing test data.

***

### functionApiKey

> `readonly` **functionApiKey**: `string`

Defined in: src/index.ts:56

The API key used to invoke the Lambda function.

***

### functionUrl

> `readonly` **functionUrl**: `string`

Defined in: src/index.ts:53

The function URL of the deployed Lambda function.

***

### node

> `readonly` **node**: `Node`

Defined in: node\_modules/.pnpm/constructs@10.5.0/node\_modules/constructs/lib/construct.d.ts:277

The tree node.

#### Inherited from

`Construct.node`

## Methods

### toString()

> **toString**(): `string`

Defined in: node\_modules/.pnpm/constructs@10.5.0/node\_modules/constructs/lib/construct.d.ts:302

Returns a string representation of this construct.

#### Returns

`string`

#### Inherited from

`Construct.toString`

***

### with()

> **with**(...`mixins`): `IConstruct`

Defined in: node\_modules/.pnpm/constructs@10.5.0/node\_modules/constructs/lib/construct.d.ts:298

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

#### Parameters

##### mixins

...`IMixin`[]

The mixins to apply

#### Returns

`IConstruct`

This construct for chaining

#### Inherited from

`Construct.with`

***

### isConstruct()

> `static` **isConstruct**(`x`): `x is Construct`

Defined in: node\_modules/.pnpm/constructs@10.5.0/node\_modules/constructs/lib/construct.d.ts:273

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

#### Parameters

##### x

`any`

Any object

#### Returns

`x is Construct`

true if `x` is an object created from a class which extends `Construct`.

#### Inherited from

`Construct.isConstruct`
