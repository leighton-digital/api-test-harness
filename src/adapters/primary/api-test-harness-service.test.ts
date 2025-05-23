import { getAndDeleteLastRecord } from '../secondary/database-adapter';

jest.mock('../secondary/database-adapter');

const mockGetAndDeleteLastRecord = getAndDeleteLastRecord as jest.Mock;

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV };

  process.env.TABLE_NAME = 'test-table';
  process.env.X_API_KEY = 'test-api-key';
  process.env.LOGGER_ENABLED = 'false';
});

afterEach(() => {
  process.env = OLD_ENV;
});

describe('API Test Harness App', () => {
  it('should return 401 if API key is missing', async () => {
    const app = require('./api-test-harness-service').app;

    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toBe('API key is missing');
  });

  it('should return 403 if API key is incorrect', async () => {
    const app = require('./api-test-harness-service').app;

    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        'x-api-key': 'wrong-key', // wrong key
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.body).toBe('Not authorised');
  });

  it('should return the record if API key is correct', async () => {
    const app = require('./api-test-harness-service').app;

    mockGetAndDeleteLastRecord.mockResolvedValue({
      response: { message: 'ok' },
      statusCode: 200,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        'x-api-key': 'test-api-key',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ message: 'ok' });
    expect(mockGetAndDeleteLastRecord).toHaveBeenCalledWith('test-table');
  });

  it('should return 500 if getAndDeleteLastRecord throws', async () => {
    const app = require('./api-test-harness-service').app;

    mockGetAndDeleteLastRecord.mockRejectedValue(new Error('DB error'));

    const response = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        'x-api-key': 'test-api-key',
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe('An error has occured');
  });
});
