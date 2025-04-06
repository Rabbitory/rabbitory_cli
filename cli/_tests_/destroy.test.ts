import { destroy } from '../commands/destroy';
import { runWithSpinner } from '../utils/spinner';
import { promptUserForRegionCode } from '../utils/promptUserForAWSRegion';

jest.mock('../utils/spinner', () => ({
  runWithSpinner: jest.fn(),
}));

jest.mock('../utils/promptUserForAWSRegion', () => ({
  promptUserForRegionCode: jest.fn(),
}));

const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('should run all teardown steps in order and log completion message', async () => {
  (runWithSpinner as jest.Mock).mockResolvedValue(undefined);

  await destroy();

  expect(promptUserForRegionCode).toHaveBeenCalled();

  expect(runWithSpinner).toHaveBeenCalledTimes(7);
  expect(runWithSpinner).toHaveBeenCalledWith(
    "Deleting DynamoDB Table...",
    expect.any(Function),
    "Deleted DynamoDB Table"
  );
  expect(runWithSpinner).toHaveBeenCalledWith(
    "Terminating Control Panel EC2 instance...",
    expect.any(Function),
    "Terminated EC2 instance"
  );
  expect(runWithSpinner).toHaveBeenCalledWith(
    "Deleting RabbitMQ Broker Instances...",
    expect.any(Function),
    "Deleted RabbitMQ Broker Instances"
  );
  expect(runWithSpinner).toHaveBeenCalledWith(
    "Deleting Rabbitory Control Panel security group...",
    expect.any(Function),
    "Deleted Rabbitory Control Panel security group"
  );
  expect(runWithSpinner).toHaveBeenCalledWith(
    "Deleting Rabbitory security group...",
    expect.any(Function),
    "Deleted Rabbitory security group"
  );
  expect(runWithSpinner).toHaveBeenCalledWith(
    "Deleting RMQ Broker IAM role...",
    expect.any(Function),
    "Deleted RMQ Broker IAM role"
  );
  expect(runWithSpinner).toHaveBeenCalledWith(
    "Deleting Rabbitory IAM role...",
    expect.any(Function),
    "Deleted Rabbitory IAM role"
  );

  expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Preparing to teardown the Rabbitory Infrastructure'));
  expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Rabbitory infrastructure teardown complete'));
});

it('should catch and log errors if something goes wrong', async () => {
  const fakeError = new Error('teardown failed');
  (promptUserForRegionCode as jest.Mock).mockRejectedValue(fakeError);

  await destroy();

  expect(mockError).toHaveBeenCalledWith(
    expect.stringContaining('Rabbitory destruction failed'),
    fakeError,
    '\n'
  );
});