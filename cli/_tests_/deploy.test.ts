// import { deploy } from '../commands/deploy';
// import * as setupAwsModule from '../utils/setupAws';
// import * as regionModule from '../utils/promptUserForAWSRegion';
// import * as spinnerModule from '../utils/spinner';
// import * as urlModule from '../../aws/EC2/getReadyRabbitoryUrl';
// import * as destroyModule from '../commands/destroy';
// import * as logoModule from '../utils/logo';

// jest.mock('../utils/spinner', () => ({
//   runWithSpinner: jest.fn(),
// }));

// jest.mock('../utils/promptUserForAWSRegion', () => ({
//   promptUserForRegionCode: jest.fn(),
// }));

// jest.mock('../utils/setupAws');
// jest.mock('../../aws/EC2/getReadyRabbitoryUrl');
// jest.mock('../commands/destroy');
// jest.mock('../utils/logo');

// const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
// const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

// beforeEach(() => {
//   jest.clearAllMocks();
// });

// it('should deploy infrastructure successfully', async () => {
//   (spinnerModule.runWithSpinner as jest.Mock)
//     .mockResolvedValueOnce(undefined) // IAM role
//     .mockResolvedValueOnce(undefined) // Broker IAM
//     .mockResolvedValueOnce(undefined) // wait
//     .mockResolvedValueOnce('mock-sg-id') // SG
//     .mockResolvedValueOnce('mock-instance-id') // EC2
//     .mockResolvedValueOnce(undefined); // DynamoDB

//   (urlModule.getReadyRabbitoryUrl as jest.Mock).mockResolvedValue('http://mock-url');
//   (logoModule.formatLogo as jest.Mock).mockReturnValue('<MOCKED LOGO>');

//   await deploy();

//   expect(setupAwsModule.setupAws).toHaveBeenCalled();
//   expect(regionModule.promptUserForRegionCode).toHaveBeenCalled();
//   expect(spinnerModule.runWithSpinner).toHaveBeenCalledTimes(6);
//   expect(urlModule.getReadyRabbitoryUrl).toHaveBeenCalledWith('mock-instance-id');
//   expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('The Rabbitory Control Panel is available at'));
//   expect(mockLog).toHaveBeenCalledWith('<MOCKED LOGO>');
// });

// it('should rollback if an error occurs during deployment', async () => {
//   (spinnerModule.runWithSpinner as jest.Mock).mockImplementationOnce(() => {
//     throw new Error('mock failure');
//   });

//   await deploy();

//   expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Rabbitory deployment failed'), expect.any(Error), '\n');
//   expect(destroyModule.destroy).toHaveBeenCalled();
//   expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Deployment successfully rolled back'));
// });

import { deploy } from '../commands/deploy';
import { setupAws } from '../utils/setupAws';
import { promptUserForRegionCode } from '../utils/promptUserForAWSRegion';
import { runWithSpinner } from '../utils/spinner';
import { getReadyRabbitoryUrl } from '../../aws/EC2/getReadyRabbitoryUrl';
import { destroy } from '../commands/destroy';
import { formatLogo } from '../utils/logo';

jest.mock('../utils/spinner');
jest.mock('../utils/promptUserForAWSRegion');
jest.mock('../utils/setupAws');
jest.mock('../../aws/EC2/getReadyRabbitoryUrl');
jest.mock('../commands/destroy');
jest.mock('../utils/logo');

const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

it('should deploy infrastructure successfully', async () => {
  (runWithSpinner as jest.Mock)
    .mockResolvedValueOnce(undefined) // IAM role
    .mockResolvedValueOnce(undefined) // Broker IAM
    .mockResolvedValueOnce(undefined) // wait
    .mockResolvedValueOnce('mock-sg-id') // SG
    .mockResolvedValueOnce('mock-instance-id') // EC2
    .mockResolvedValueOnce(undefined); // DynamoDB

  (getReadyRabbitoryUrl as jest.Mock).mockResolvedValue('http://mock-url');
  (formatLogo as jest.Mock).mockReturnValue('<MOCKED LOGO>');

  await deploy();

  expect(setupAws).toHaveBeenCalled();
  expect(promptUserForRegionCode).toHaveBeenCalled();
  expect(runWithSpinner).toHaveBeenCalledTimes(6);

  expect(runWithSpinner).toHaveBeenNthCalledWith(
    1,
    'Setting up Rabbitory Contol Panel IAM...',
    expect.any(Function),
    'Created Rabbitory Control Panel IAM role and instance profile'
  );

  expect(runWithSpinner).toHaveBeenNthCalledWith(
    2,
    'Setting up Rabbitmq Broker IAM...',
    expect.any(Function),
    'Created Rabbitmq Broker IAM role and instance profile'
  );

  expect(runWithSpinner).toHaveBeenNthCalledWith(
    3,
    'Waiting for IAM instance profile to propagate...',
    expect.any(Function),
    'IAM instance profile propagated'
  );

  expect(runWithSpinner).toHaveBeenNthCalledWith(
    4,
    'Setting up Rabbitory Security Group...',
    expect.any(Function),
    'Created Rabbitory security group'
  );

  expect(runWithSpinner).toHaveBeenNthCalledWith(
    5,
    'Creating Rabbitory Control Panel EC2 instance...',
    expect.any(Function),
    'Created Rabbitory EC2 instance'
  );

  expect(runWithSpinner).toHaveBeenNthCalledWith(
    6,
    'Creating DynamoDB Table..',
    expect.any(Function),
    'Created DynamoDB Table'
  );

  expect(getReadyRabbitoryUrl).toHaveBeenCalledWith('mock-instance-id');

  expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('The Rabbitory Control Panel is available at:'));
  expect(mockLog).toHaveBeenCalledWith('<MOCKED LOGO>');
});

it('should rollback if an error occurs during deployment', async () => {
  (runWithSpinner as jest.Mock)
    .mockResolvedValueOnce(undefined) // IAM role
    .mockResolvedValueOnce(undefined) // Broker IAM
    .mockImplementationOnce(() => {
      throw new Error('mock failure');
    });

  await deploy();

  expect(mockError).toHaveBeenCalledWith(
    expect.stringContaining('Rabbitory deployment failed'),
    expect.any(Error),
    '\n'
  );

  expect(destroy).toHaveBeenCalled();
  expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Deployment successfully rolled back'));
});
