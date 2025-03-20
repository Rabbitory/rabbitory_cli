import { createRabbitoryEngineIAM } from "../aws/IAM/createRabbitoryRole";
import { createRMQBrokerIAM } from "../aws/IAM/createBrokerRole";
import { setupRabbitorySG } from "../aws/security-groups/createRabbitoryEngineSG";
import { createDashboard } from "../aws/EC2/createDashboard";
import { createTable } from "../aws/dynamoDB/createTable";
import { runWithSpinner } from "./spinner";
import { logo } from "./logo";
import chalk from "chalk";

export const deploy = async () => {
  try {
    await runWithSpinner('Setting up Rabbitory Engine IAM...', createRabbitoryEngineIAM, 'Created Rabbitory Engine IAM role and instance profile');
    await runWithSpinner('Setting up RMQ Broker IAM...', createRMQBrokerIAM, 'Created RMQBroker IAM role and instance profile');
    await runWithSpinner('Waiting for IAM instance profile to propagate...', () => new Promise((resolve) => setTimeout(resolve, 5000)), 'IAM instance profile propagated');
    const rabbitorySecurityGroupId = await runWithSpinner('Setting up Rabbitory Engine Security Group...', setupRabbitorySG, 'Created Rabbitory Engine security group');
    await runWithSpinner('Creating Rabbitory Engine EC2 instance...', () => createDashboard(rabbitorySecurityGroupId), 'Created Rabbitory Engine EC2 instance');
    await runWithSpinner('Creating DynamoDB Table..', createTable, 'Created DynamoDB Table');

    console.log(logo);
  } catch (error) {
    console.error(chalk.redBright("\nRabbitory deployment failed\n"), error, "\n");
  }
};
