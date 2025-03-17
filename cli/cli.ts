import { Command } from "commander";
import { setupRabbitoryRoleWithPolicy } from "../aws/IAM/createRabbitoryRole";
import { setupBrokerRoleWithPolicy } from "../aws/IAM/createBrokerRole";
import { setupRabbitorySG } from "../aws/security-groups/createRabbitoryEngineSG";
import { setupBrokerSG } from "../aws/security-groups/createBrokerSG";
import { createDashboard } from "../aws/EC2/createDashboard";
import { createTable } from "../aws/dynamoDB/createTable";

const program = new Command();

program
  .name("rabbitory")
  .description("A RabbitMQ Management System")
  .version("0.0.1");

program
  .command("deploy")
  .description("deploy Rabbitory to AWS")
  .action(async () => {
    // Confirm that AWS CLI is installed
    // Confirm that user account is linked to AWS
    // Run IAM script
    const rabbitoryRoleArn = await setupRabbitoryRoleWithPolicy();
    if (!rabbitoryRoleArn) {
      console.error("Failed to create Rabbitory role");
      process.exit(1);
    }

    const brokerRoleArn = await setupBrokerRoleWithPolicy();
    // set up security group
    const rabbitorySecurityGroupId = await setupRabbitorySG();
    const brokerSecurityGroupId = await setupBrokerSG();
    // Run EC2 script
    await createDashboard(rabbitorySecurityGroupId, rabbitoryRoleArn);
    // Run database script
    await createTable();
  });

program.parse();
