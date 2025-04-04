import { createRabbitoryIAM } from "../../aws/IAM/createRabbitoryRole";
import { createRMQBrokerIAM } from "../../aws/IAM/createBrokerRole";
import { createRabbitorySG } from "../../aws/security-groups/createRabbitorySG";
import { createControlPanel } from "../../aws/EC2/createControlPanel";
import { createTable } from "../../aws/dynamoDB/createTable";
import { runWithSpinner } from "../utils/spinner";
import { setupAws } from "../utils/setupAws";
import { promptUserForAWSRegion } from "../utils/promptUserForAWSRegion";
import { destroy } from "./destroy";
import { getReadyRabbitoryUrl } from "../../aws/EC2/getReadyRabbitoryUrl";
import { formatLogo } from "../utils/logo";
import { stdout } from "process";
import { successHexNum } from "../utils/chalkColors";
import chalk from "chalk";

const TERMINAL_WIDTH = stdout.columns || 80;
const START_MSG = "\nPreparing to setup the Rabbitory Infrastructure...\n"

export const deploy = async () => {
  try {
    setupAws();

    console.log(START_MSG);

    await promptUserForAWSRegion();

    await runWithSpinner('Setting up Rabbitory Contol Panel IAM...', () => createRabbitoryIAM(), 'Created Rabbitory Control Panel IAM role and instance profile');
    await runWithSpinner('Setting up Rabbitmq Broker IAM...', () => createRMQBrokerIAM(), 'Created Rabbitmq Broker IAM role and instance profile');
    await runWithSpinner('Waiting for IAM instance profile to propagate...', () => new Promise((resolve) => setTimeout(resolve, 7000)), 'IAM instance profile propagated');
    const rabbitorySecurityGroupId = await runWithSpinner('Setting up Rabbitory Security Group...', () => createRabbitorySG(), 'Created Rabbitory security group');
    const instanceId = await runWithSpinner('Creating Rabbitory Control Panel EC2 instance...', () => createControlPanel(rabbitorySecurityGroupId), 'Created Rabbitory EC2 instance');
    await runWithSpinner('Creating DynamoDB Table..', () => createTable(), 'Created DynamoDB Table');
    console.log('\n');

    const rabbitoryUrl = await getReadyRabbitoryUrl(instanceId);
    console.log(chalk.hex(successHexNum)('\n✔ Application is ready'));

    console.log(chalk.white(`\nThe Rabbitory Control Panel is available at: ${chalk.cyan(rabbitoryUrl)}\n`));
    console.log(formatLogo(TERMINAL_WIDTH));
  } catch (error) {
    console.error(chalk.redBright("\nRabbitory deployment failed\n"), error, "\n");
    console.log('Rolling back your deployment...');
    await destroy();
    console.log('\nDeployment successfully rolled back.');
    console.log(chalk.red('\nPlease check errors to determine reason for deployment failure, and then try running `rabbitory deploy` again.\n'));
  }
};
