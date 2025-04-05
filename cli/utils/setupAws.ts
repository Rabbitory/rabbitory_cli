import { execSync } from "child_process";

const checkAwsCli = () => {
  try {
    execSync('aws --version', { stdio: 'ignore' })
  } catch {
    console.error(
      'AWS CLI is not installed. Follow the instructions here and try again: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html'
    );
    process.exit(1);
  }
};

const checkAwsAuth = () => {
  try {
    execSync('aws sts get-caller-identity', { encoding: 'utf8' });
  } catch {
    console.error('You are not logged in to the AWS CLI. Run `aws configure` to log in and try again.');
    process.exit(1);
  }
}

export const setupAws = () => {
  checkAwsCli();
  checkAwsAuth();
}
