import { deleteTable } from "../../aws/dynamoDB/deleteTable";
import { deleteControlPanel } from "../../aws/EC2/deleteControlPanel";
import { deleteAllBrokerInstances } from "../../aws/EC2/deleteAllBrokerInstances";
import { deleteRabbitorySG } from "../../aws/security-groups/deleteRabbitorySG";
import { deleteAllBrokerSGs } from "../../aws/security-groups/deleteAllBrokerSGs";
import { deleteBrokerRole } from "../../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../../aws/IAM/deleteRabbitoryRole";
import { runWithSpinner } from "../utils/spinner";
import { promptUserForAWSRegion } from "../utils/promptUserForAWSRegion";
import chalk from "chalk";


export const destroy = async () => {
  try {
    await promptUserForAWSRegion();
    console.log('\n');
    
    await runWithSpinner("Deleting DynamoDB Table...", () => deleteTable(), "Deleted DynamoDB Table");
    await runWithSpinner("Terminating Control Panel EC2 instance...", () => deleteControlPanel(), "Terminated EC2 instance");
    await runWithSpinner("Deleting RabbitMQ Broker Instances...", () => deleteAllBrokerInstances(), "Deleted RabbitMQ Broker Instances");
    await runWithSpinner("Deleting Rabbitory Control Panel security group...", () => deleteRabbitorySG(), "Deleted Rabbitory Control Panel security group");
    await runWithSpinner("Deleting Rabbitory security group...", () => deleteAllBrokerSGs(), "Deleted Rabbitory security group");
    await runWithSpinner("Deleting RMQ Broker IAM role...", () => deleteBrokerRole(), "Deleted RMQ Broker IAM role");
    await runWithSpinner("Deleting Rabbitory IAM role...", () => deleteRabbitoryRole(), "Deleted Rabbitory IAM role");

    console.log('\nSuccYour Rabbitory Control Panel, Rabbitmq Instances, and assoicated AWS resources \n')
  } catch (error) {
    console.error(chalk.redBright("\nRabbitory destruction failed\n"), error, "\n");
  }
};
