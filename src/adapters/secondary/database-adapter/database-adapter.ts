import {
  DeleteItemCommand,
  DynamoDBClient,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { logger } from '../../../logger';

export interface DatabaseRecord {
  pk: string;
  sk: number;
  statusCode: number;
  response: Record<string, string | number | boolean | object | null>;
}

const client = new DynamoDBClient({});

export async function getAndDeleteLastRecord(
  tableName: string,
): Promise<DatabaseRecord> {
  try {
    const scanCommand = new ScanCommand({
      TableName: tableName,
    });

    const results = await client.send(scanCommand);

    logger.debug(`results: ${JSON.stringify(results.Items)}`);

    if (results.Items && results.Items.length > 0) {
      const items = results.Items.map(
        (item) => unmarshall(item) as DatabaseRecord,
      );
      items.sort((a, b) => a.sk - b.sk);
      const lastItem = items[0];

      const deleteCommand = new DeleteItemCommand({
        TableName: tableName,
        Key: {
          pk: { S: lastItem.pk },
          sk: { N: lastItem.sk.toString() },
        },
      });

      await client.send(deleteCommand);

      return lastItem;
    }
    throw new Error('no items to retrieve');
  } catch (error) {
    logger.error(`error fetching and deleting record: ${error}`);
    throw error;
  }
}
