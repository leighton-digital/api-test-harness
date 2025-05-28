import { Logger } from '@aws-lambda-powertools/logger';
import { config } from '../config';

const serviceName = config.get('serviceName');

export const logger = new Logger({ serviceName: serviceName });
