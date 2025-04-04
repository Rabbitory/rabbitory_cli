import { runWithSpinner } from '../utils/spinner';
import ora from 'ora';

interface MockSpinner {
  start: jest.Mock<MockSpinner, []>;
  succeed: jest.Mock<void, [string]>;
  fail: jest.Mock<void, [string]>;
}

jest.mock('ora', () => {
  return jest.fn().mockImplementation(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn(),
    fail: jest.fn(),
  }));
});

jest.mock('chalk', () => ({
  white: jest.fn().mockImplementation((msg: string) => msg),
  green: jest.fn().mockImplementation((msg: string) => `green ${msg}`),
  bgRed: jest.fn().mockImplementation((msg: string) => `bgRed ${msg}`),
  hex: jest.fn().mockImplementation(() => (msg: string) => `hex ${msg}`),
}));


beforeEach(() => {
  jest.clearAllMocks();
});

it('should call the callback function and return its result', async () => {
  const mockCallback = jest.fn().mockResolvedValue('Success Result');
  const result = await runWithSpinner('Loading...', mockCallback, 'Completed!');

  const oraMock = ora as jest.MockedFunction<typeof ora>;
  const spinner = oraMock.mock.results[0].value as MockSpinner;

  expect(mockCallback).toHaveBeenCalledTimes(1);
  expect(spinner.succeed).toHaveBeenCalledWith('hex Completed!');
  expect(result).toBe('Success Result');
});


it('should handle errors and fail the spinner', async () => {
  const mockError = new Error('Something went wrong');
  const mockCallback = jest.fn().mockRejectedValue(mockError);

  await expect(
    runWithSpinner('Loading...', mockCallback, 'Completed!')
  ).rejects.toThrow(mockError);

  const oraMock = ora as jest.MockedFunction<typeof ora>;
  const spinnerInstance = oraMock.mock.results[0].value as MockSpinner;

  expect(spinnerInstance.fail).toHaveBeenCalledWith('bgRed Loading... - Failed');
});
