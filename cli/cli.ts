import { Command } from "commander";
import { setupRabbitoryRoleWithPolicy } from "../aws/IAM/createRabbitoryRole";
import { setupBrokerRoleWithPolicy } from "../aws/IAM/createBrokerRole";
import { createDashboard } from "../aws/EC2/createDashboard";
import { createTable } from "../aws/dynamoDB/createTable";
import { create } from "domain";

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
    await setupRabbitoryRoleWithPolicy();
    // Run EC2 script
    await createDashboard();
    // Run database script
    await createTable();
  });

program.parse();
