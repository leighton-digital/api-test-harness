const convict = require('convict');

export const config = convict({
  stage: {
    doc: 'The stage being deployed',
    format: String,
    default: 'develop',
    env: 'STAGE',
  },
  tableName: {
    doc: 'The database table where we store the responses',
    format: String,
    default: '',
    env: 'TABLE_NAME',
  },
  apiKey: {
    doc: 'The API key to secure the API',
    format: String,
    default: '',
    env: 'X_API_KEY',
  },
  loggerEnabled: {
    doc: 'Whether to enable the logger',
    format: Boolean,
    default: true,
    env: 'LOGGER_ENABLED',
  },
}).validate({ allowed: 'strict' });
