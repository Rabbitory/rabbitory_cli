import { createRabbitoryEngineIAM } from "../aws/IAM/createRabbitoryRole";
import { createRMQBrokerIAM } from "../aws/IAM/createBrokerRole";
import { setupRabbitorySG } from "../aws/security-groups/createRabbitoryEngineSG";
import { createDashboard } from "../aws/EC2/createDashboard";
import { createTable } from "../aws/dynamoDB/createTable";
import { runWithSpinner } from "./spinner";
import { getRegion } from "./getRegion";
import { logo } from "./logo";
import chalk from "chalk";
import { destroy } from "./destroy";

export const deploy = async () => {
  try {
    const region = await getRegion();
    await runWithSpinner('Setting up Rabbitory Engine IAM...', () => createRabbitoryEngineIAM(region), 'Created Rabbitory Engine IAM role and instance profile');
    await runWithSpinner('Setting up RMQ Broker IAM...', () => createRMQBrokerIAM(region), 'Created RMQBroker IAM role and instance profile');
    await runWithSpinner('Waiting for IAM instance profile to propagate...', () => new Promise((resolve) => setTimeout(resolve, 5000)), 'IAM instance profile propagated');
    const rabbitorySecurityGroupId = await runWithSpinner('Setting up Rabbitory Engine Security Group...', () => setupRabbitorySG(region), 'Created Rabbitory Engine security group');
    await runWithSpinner('Creating Rabbitory Engine EC2 instance...', () => createDashboard(rabbitorySecurityGroupId, region), 'Created Rabbitory Engine EC2 instance');
    await runWithSpinner('Creating DynamoDB Table..', () => createTable(region), 'Created DynamoDB Table');

    console.log(chalk.red(logo));
  } catch (error) {
    console.error(chalk.redBright("\nRabbitory deployment failed\n"), error, "\n");
    console.log('Rolling back your deployment...');
    await destroy();
    console.log('\nDeployment successfully rolled back.');
    console.log(chalk.red('\nPlease check errors to determine reason for deployment failure, and then try running `rabbitory deploy` again.\n'));
  }
};
