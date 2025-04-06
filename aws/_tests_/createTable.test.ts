import { createTable } from '../dynamoDB/createTable';
import { getDDBClient } from '../dynamoDB/getDDBClient';
import {
  DescribeTableCommand,
  CreateTableCommand,
} from '@aws-sdk/client-dynamodb';

jest.mock('../dynamoDB/getDDBClient');

const mockSend = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getDDBClient as jest.Mock).mockReturnValue({ send: mockSend });
});

const resourceNotFoundError = () => {
  const err = new Error('Table not found');
  Object.defineProperty(err, 'name', { value: 'ResourceNotFoundException' });
  return err;
};

it('should not create table if it already exists', async () => {
  mockSend.mockResolvedValueOnce({}); // DescribeTableCommand resolves, table exists

  await createTable();

  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeTableCommand));
  expect(mockSend).toHaveBeenCalledTimes(1);
});

it('should create table if it does not exist', async () => {
  mockSend
    .mockRejectedValueOnce(resourceNotFoundError()) // DescribeTableCommand throws
    .mockResolvedValueOnce({}); // CreateTableCommand succeeds

  await createTable();

  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeTableCommand));
  expect(mockSend).toHaveBeenCalledWith(expect.any(CreateTableCommand));
  expect(mockSend).toHaveBeenCalledTimes(2);
});

it('should throw error if table existence check fails with unexpected error', async () => {
  const unexpectedError = new Error('Unknown failure');
  Object.defineProperty(unexpectedError, 'name', { value: 'SomeOtherError' });

  mockSend.mockRejectedValueOnce(unexpectedError);

  await expect(createTable()).rejects.toThrow('Error checking table existence');
  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeTableCommand));
});

it('should throw error if table creation fails', async () => {
  mockSend
    .mockRejectedValueOnce(resourceNotFoundError()) // table doesn't exist
    .mockRejectedValueOnce(new Error('Create failed')); // create fails

  await expect(createTable()).rejects.toThrow('Error creating table\nCreate failed');

  expect(mockSend).toHaveBeenCalledWith(expect.any(DescribeTableCommand));
  expect(mockSend).toHaveBeenCalledWith(expect.any(CreateTableCommand));
});
