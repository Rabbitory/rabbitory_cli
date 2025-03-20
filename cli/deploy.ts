import { createRabbitoryEngineIAM } from "../aws/IAM/createRabbitoryRole";
import { createRMQBrokerIAM } from "../aws/IAM/createBrokerRole";
import { setupRabbitorySG } from "../aws/security-groups/createRabbitoryEngineSG";
import { setupBrokerSG } from "../aws/security-groups/createBrokerSG";
import { createDashboard } from "../aws/EC2/createDashboard";
import { createTable } from "../aws/dynamoDB/createTable";
import { setupAws } from "./setupAws";

export const deploy = async () => {
  // Confirm that AWS CLI is installed
  // Confirm that user account is linked to AWS
  // Run IAM script


  try {
    // CREATE IAM ROLES 
    setupAws();

    const rabbitoryIPN = await createRabbitoryEngineIAM();
    console.log(" --- Successfully created Rabbitory Engine IAM role and instance profile:", rabbitoryIPN);

    const brokerIPN = await createRMQBrokerIAM();
    console.log(" --- Successfully created RMQBroker IAM role and instance profile:", brokerIPN);

    // CREATE SECURITY GROUPS
    const brokerSecurityGroupId = await setupBrokerSG();
    const rabbitorySecurityGroupId = await setupRabbitorySG();

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
}
