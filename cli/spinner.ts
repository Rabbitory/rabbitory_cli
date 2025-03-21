import ora from 'ora';
import chalk from 'chalk';

export const runWithSpinner = async (
  waitingMsg: string, 
  callbackFn: () => Promise<any>, 
  successMsg: string
) => {
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