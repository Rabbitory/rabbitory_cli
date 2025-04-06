import ora from 'ora';
import chalk from 'chalk';
import { successHexNum } from './chalkColors';

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
    spinner.succeed(chalk.hex(successHexNum)(successMsg));
    return result;
  } catch (error) {
    spinner.fail(chalk.bgRed(`${waitingMsg} - Failed`));
    throw error;
  }
};
