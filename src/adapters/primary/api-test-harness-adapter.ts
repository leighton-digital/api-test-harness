import awsLambdaFastify from '@fastify/aws-lambda';
import { app } from './api-test-harness-service';

export const handler = awsLambdaFastify(app);
