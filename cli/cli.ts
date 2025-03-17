import { Command } from "commander";
import { setupRabbitoryRoleWithPolicy } from "../aws/IAM/createRabbitoryRole";
import { setupBrokerRoleWithPolicy } from "../aws/IAM/createBrokerRole";
import { setupRabbitorySG } from "../aws/security-groups/createRabbitoryEngineSG";
import { createDashboard } from "../aws/EC2/createDashboard";
import { createTable } from "../aws/dynamoDB/createTable";

const program = new Command();

program
  .name('rabbitory')
  .description('A RabbitMQ Management System')
  .version('0.0.1');

program
  .command('deploy')
  .description('deploy Rabbitory to AWS')
  .action(async () => {
    // Confirm that AWS CLI is installed
    // Confirm that user account is linked to AWS
    // Run IAM script
    await setupRabbitoryRoleWithPolicy();
    await setupBrokerRoleWithPolicy();
    // set up security group
    const securityGroupId = await setupRabbitorySG();
    // Run EC2 script
    await createDashboard();
    // Run database script
    await createTable();
  });

program.parse();
