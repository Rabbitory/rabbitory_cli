import { getUbuntuAmiId } from '../AMI/getUbuntuAmiId';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

jest.mock('@aws-sdk/client-ssm');

const mockSend = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (SSMClient as jest.Mock).mockImplementation(() => ({
    send: mockSend,
  }));
});

it('should return the Ubuntu AMI ID from SSM', async () => {
  const mockAmiId = 'ami-1234567890abcdef0';
  mockSend.mockResolvedValueOnce({
    Parameter: { Value: mockAmiId },
  });

  const result = await getUbuntuAmiId('us-east-1');

  expect(SSMClient).toHaveBeenCalledWith({ region: 'us-east-1' });
  expect(mockSend).toHaveBeenCalledWith(expect.any(GetParameterCommand));
  expect(result).toBe(mockAmiId);
});

it('should return undefined if the Parameter is missing', async () => {
  mockSend.mockResolvedValueOnce({});

  const result = await getUbuntuAmiId('us-east-1');

  expect(result).toBeUndefined();
});
