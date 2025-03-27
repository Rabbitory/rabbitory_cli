import { execSync } from "child_process";

const checkAwsCli = () => {
  try {
    execSync('aws --version', { stdio: 'ignore' })
    console.log('AWS CLI is installed!');
  } catch {
    console.error(
      'AWS CLI is not installed. Follow the instructions here and try again: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html'
    );
    process.exit(1);
  }
};

const checkAwsAuth = () => {
  try {
    const output = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
    console.log('AWS authentication successful:', output);
  } catch {
    console.error('You are not logged in to the AWS CLI. Run `aws configure` to log in and try again.');
    process.exit(1);
  }
}

export const setupAws = () => {
  checkAwsCli();
  checkAwsAuth();
}
