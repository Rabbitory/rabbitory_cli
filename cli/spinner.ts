import ora from 'ora';
import chalk from 'chalk';

export const runWithSpinner = async <T>(
  waitingMsg: string, 
  callbackFn: () => Promise<T>, 
  successMsg: string
): Promise<T> => {
  const spinner = ora({
    text: chalk.white(waitingMsg),
    color: 'white',
    spinner: 'dots',
  }).start();

  try {
    const result = await callbackFn();
    spinner.succeed(chalk.green(successMsg));
    return result;
  } catch (error) {
    spinner.fail(chalk.bgRed(`${waitingMsg} - Failed`));
    throw error;
  }
};
