import { Command } from "commander";
import { createRabbitoryEngineIAM } from "../aws/IAM/createRabbitoryRole";
import { createRMQBrokerIAM } from "../aws/IAM/createBrokerRole";
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


    try {
      // CREATE IAM ROLES 
      const rabbitoryIPN = await createRabbitoryEngineIAM();
      console.log(" --- Successfully created Rabbitory Engine IAM role and instance profile:", rabbitoryIPN);

      const brokerIPN = await createRMQBrokerIAM();
      console.log(" --- Successfully created RMQBroker IAM role and instance profile:", brokerIPN);
  
      // CREATE SECURITY GROUPS
      const rabbitorySecurityGroupId = await setupRabbitorySG();
      const brokerSecurityGroupId = await setupBrokerSG();

      // WAIT FOR IPNs TO BE PROPAGATED TO AWS
      console.log("Waiting 5 seconds for IAM instance profile to propagate...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay

      // CREATE RABBITORY EC2
      await createDashboard(rabbitorySecurityGroupId, rabbitoryIPN);
      
      // CREATE DYNAMODB + TABLE
      await createTable();

    } catch (error) {
      console.error("Rabbitory deployment faild:", error);
      // process.exit(1);
    }
  });

program.parse();
