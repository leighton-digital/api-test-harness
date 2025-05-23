import fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import { config } from '../../config';
import { logger } from '../../logger';
import { getAndDeleteLastRecord } from '../secondary/database-adapter';

const tableName = config.get('tableName');
const apiKey = config.get('apiKey');
const loggerEnabled = config.get('loggerEnabled');

export const app = fastify({ logger: loggerEnabled });

app.all('/*', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const headerApiKey = request.headers['x-api-key'] as string;

    if (!headerApiKey) {
      return reply.status(401).send('API key is missing');
    }

    if (headerApiKey !== apiKey) {
      return reply.status(403).send('Not authorised');
    }

    const record = await getAndDeleteLastRecord(tableName);

    logger.debug(
      `response: ${JSON.stringify(record.response)}, statusCode: ${
        record.statusCode
      }`,
    );

    return reply.status(record.statusCode).send(record.response);
  } catch (error) {
    logger.error(`${error}`);
    reply.status(500).send('An error has occured');
  }
});
