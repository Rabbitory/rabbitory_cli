import { createRabbitoryIAM } from "../aws/IAM/createRabbitoryRole";
import { createRMQBrokerIAM } from "../aws/IAM/createBrokerRole";
import { createRabbitorySG } from "../aws/security-groups/createRabbitorySG";
import { createControlPanel } from "../aws/EC2/createControlPanel";
import { getRabbitoryEndpoint } from "../aws/EC2/getRabbitoryEndpoint";
import { createTable } from "../aws/dynamoDB/createTable";
import { runWithSpinner } from "./spinner";
import { getRegion } from "./getRegion";
import { logo } from "./logo";
import chalk from "chalk";
import { destroy } from "./destroy";


export const deploy = async () => {
  try {
    const region = await getRegion();
    await runWithSpinner('Setting up Rabbitory IAM...', () => createRabbitoryIAM(region), 'Created Rabbitory IAM role and instance profile');
    await runWithSpinner('Setting up RMQ Broker IAM...', () => createRMQBrokerIAM(region), 'Created RMQBroker IAM role and instance profile');
    await runWithSpinner('Waiting for IAM instance profile to propagate...', () => new Promise((resolve) => setTimeout(resolve, 7000)), 'IAM instance profile propagated');
    const rabbitorySecurityGroupId = await runWithSpinner('Setting up Rabbitory Security Group...', () => createRabbitorySG(region), 'Created Rabbitory security group');
    const instanceId = await runWithSpinner(
      'Creating Rabbitory Control Panel EC2 instance...',
      () => createControlPanel(rabbitorySecurityGroupId, region),
      'Created Rabbitory EC2 instance'
    );
    await runWithSpinner('Creating DynamoDB Table..', () => createTable(region), 'Created DynamoDB Table');
    // Get the public endpoint
    const dashboardUrl = await getRabbitoryEndpoint(instanceId, region);
    if (dashboardUrl) {
      console.log(chalk.green(`\nRabbitory dashboard is available at: ${dashboardUrl}\n`));
    } else {
      console.log(chalk.yellow("\nRabbitory dashboard is not yet available. Please check the instance later.\n"));
    }
    
    console.log(chalk.red(logo));
  } catch (error) {
    console.error(chalk.redBright("\nRabbitory deployment failed\n"), error, "\n");
    console.log('Rolling back your deployment...');
    await destroy();
    console.log('\nDeployment successfully rolled back.');
    console.log(chalk.red('\nPlease check errors to determine reason for deployment failure, and then try running `rabbitory deploy` again.\n'));
  }
};
