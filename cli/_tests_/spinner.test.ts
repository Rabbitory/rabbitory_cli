import ora from 'ora';
import chalk from 'chalk';
import { runWithSpinner } from '../spinner';

jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn(),
    fail: jest.fn(),
  }));
});

describe('runWithSpinner', () => {
  let mockSpinner: any;

  beforeEach(() => {
    mockSpinner = ora();
    jest.clearAllMocks();
  });

  it('should call the callback function and return its result', async () => {
    const mockCallback = jest.fn().mockResolvedValue('Success Result');
    
    const result = await runWithSpinner('Loading...', mockCallback, 'Completed!');

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockSpinner.succeed).toHaveBeenCalledWith(chalk.green('Completed!'));
    expect(result).toBe('Success Result');
  });

  it('should handle errors and fail the spinner', async () => {
    const mockError = new Error('Something went wrong');
    const mockCallback = jest.fn().mockRejectedValue(mockError);

    await expect(runWithSpinner('Loading...', mockCallback, 'Completed!')).rejects.toThrow(mockError);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockSpinner.fail).toHaveBeenCalledWith(chalk.bgRed('Loading... - Failed'));
  });
});