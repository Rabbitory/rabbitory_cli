import { deleteTable } from '../dynamoDB/deleteTable';
import { getDDBClient } from '../dynamoDB/getDDBClient';
import { DeleteTableCommand } from '@aws-sdk/client-dynamodb';

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

it('should delete the table if it exists', async () => {
  mockSend.mockResolvedValueOnce({});

  await deleteTable();

  expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteTableCommand));
  expect(mockSend).toHaveBeenCalledTimes(1);
});

it('should do nothing if table does not exist (ResourceNotFoundException)', async () => {
  mockSend.mockRejectedValueOnce(resourceNotFoundError());

  await expect(deleteTable()).resolves.toBeUndefined();

  expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteTableCommand));
});

it('should throw an error if deletion fails for a reason other than ResourceNotFoundException', async () => {
  const unexpectedError = new Error('Something went wrong');
  Object.defineProperty(unexpectedError, 'name', { value: 'AccessDeniedException' });

  mockSend.mockRejectedValueOnce(unexpectedError);

  await expect(deleteTable()).rejects.toThrow('Error deleting table\nSomething went wrong');
});
