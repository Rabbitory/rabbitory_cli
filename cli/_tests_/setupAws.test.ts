import { setupAws } from '../utils/setupAws';
import { execSync } from 'child_process';

jest.mock('child_process');
const mockedExecSync = execSync as jest.Mock;

beforeEach(() => {
  mockedExecSync.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called');
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('should succeed when AWS CLI is installed and authenticated', () => {
  mockedExecSync.mockImplementation((command: string) => {
    if (command === 'aws --version' || command === 'aws sts get-caller-identity') {
      return '';
    }
  });

  expect(() => setupAws()).not.toThrow();
});

it('should exit if AWS CLI is not installed', () => {
  mockedExecSync.mockImplementation((command: string) => {
    if (command === 'aws --version') throw new Error('Command not found');
  });

  expect(() => setupAws()).toThrow('process.exit called');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('AWS CLI is not installed'));
});

it('should exit if AWS is not authenticated', () => {
  mockedExecSync.mockImplementation((command: string) => {
    if (command === 'aws --version') return '';
    if (command === 'aws sts get-caller-identity') throw new Error('Not authenticated');
  });

  expect(() => setupAws()).toThrow('process.exit called');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('You are not logged in to the AWS CLI'));
});
