// spinner.ts
import ora from 'ora';
import chalk from 'chalk';

/**
 * Runs an async function with a spinner to show loading state.
 * @param {string} message - Message to display while loading.
 * @param {function} fn - Async function to execute.
 * @param {string} successMessage - Message to log after success.
 * @returns The result of the function call.
 */
export const runWithSpinner = async (message: string, fn: () => Promise<any>, successMessage: string) => {
  const spinner = ora({
    text: chalk.red(message),
    color: 'red',
  }).start();

  try {
    const result = await fn();  // Run the async function passed as an argument.
    spinner.succeed(chalk.green(successMessage));
    return result;
  } catch (error) {
    spinner.fail(chalk.red(`${message} - Failed`));
    console.error(chalk.red(error));
    throw error;
  }
};