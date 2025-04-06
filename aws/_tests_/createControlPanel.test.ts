import { createControlPanel } from '../EC2/createControlPanel';
import { getEC2Client } from '../EC2/getEC2Client';
import { getRegion } from '../../cli/utils/region';
import { getUbuntuAmiId } from '../AMI/getUbuntuAmiId';
import { RunInstancesCommand, waitUntilInstanceRunning } from '@aws-sdk/client-ec2';

jest.mock('../EC2/getEC2Client', () => ({
  getEC2Client: jest.fn(),
}));

jest.mock('../../cli/utils/region', () => ({
  getRegion: jest.fn(),
}));

jest.mock('../AMI/getUbuntuAmiId', () => ({
  getUbuntuAmiId: jest.fn(),
}));

jest.mock('@aws-sdk/client-ec2', () => ({
  RunInstancesCommand: jest.fn().mockImplementation((params) => {
    return { ...params };
  }),
  waitUntilInstanceRunning: jest.fn(),
}));

const mockClient = {
  send: jest.fn(),
};

const securityGroupId = 'sg-12345';

beforeEach(() => {
  jest.clearAllMocks();
});

it('should create an EC2 instance and return the instance ID', async () => {
  const mockInstanceId = 'i-abc123';
  const mockImageId = 'ami-123456';

  (getEC2Client as jest.Mock).mockReturnValue(mockClient);
  (getRegion as jest.Mock).mockReturnValue('us-east-1');
  (getUbuntuAmiId as jest.Mock).mockResolvedValue(mockImageId);
  (mockClient.send as jest.Mock).mockResolvedValue({
    Instances: [{ InstanceId: mockInstanceId }],
  });
  (waitUntilInstanceRunning as jest.Mock).mockResolvedValue({});

  await createControlPanel(securityGroupId);

  expect(RunInstancesCommand).toHaveBeenCalledWith(
    expect.objectContaining({
      ImageId: mockImageId,
      InstanceType: 't3.small',
      MinCount: 1,
      MaxCount: 1,
    })
  );

  expect(mockClient.send).toHaveBeenCalledWith(
    expect.objectContaining({
      ImageId: mockImageId,
      InstanceType: 't3.small',
      MinCount: 1,
      MaxCount: 1,
    })
  );

  const instanceId = await createControlPanel(securityGroupId);
  expect(instanceId).toBe(mockInstanceId);

  expect(waitUntilInstanceRunning).toHaveBeenCalledWith(
    { client: mockClient, maxWaitTime: 240 },
    { InstanceIds: [mockInstanceId] }
  );
});

it('should throw an error if no instance is created', async () => {
  const mockImageId = 'ami-123456';

  (getEC2Client as jest.Mock).mockReturnValue(mockClient);
  (getRegion as jest.Mock).mockReturnValue('us-east-1');
  (getUbuntuAmiId as jest.Mock).mockResolvedValue(mockImageId);
  (mockClient.send as jest.Mock).mockResolvedValue({
    Instances: [],
  });

  await expect(createControlPanel(securityGroupId)).rejects.toThrow(
    'No instances were created or instance ID is missing'
  );
});

it('should handle errors thrown by the EC2 client', async () => {
  const mockImageId = 'ami-123456';

  (getEC2Client as jest.Mock).mockReturnValue(mockClient);
  (getRegion as jest.Mock).mockReturnValue('us-east-1');
  (getUbuntuAmiId as jest.Mock).mockResolvedValue(mockImageId);
  (mockClient.send as jest.Mock).mockRejectedValue(new Error('EC2 Error'));

  await expect(createControlPanel(securityGroupId)).rejects.toThrow(
    'Error creating instance\nEC2 Error'
  );
});
