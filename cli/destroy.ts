import { deleteTable } from "../aws/dynamoDB/deleteTable";
import { deleteRabbitoryEngineSG } from "../aws/security-groups/deleteRabbitoryEngineSG";
import { deleteBrokerRole } from "../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../aws/IAM/deleteRabbitoryRole";
import { deleteInstance } from "../aws/EC2/deleteInstance";
import { getRunningInstanceIdsByName } from "./getRunningInstanceIdsByName";
import { runWithSpinner } from "./spinner";
import chalk from "chalk";

export const destroy = async () => {
  try {
    const instanceName = "RabbitoryDashboard";
    const instanceIds: string[] | undefined = await getRunningInstanceIdsByName(instanceName);

    await runWithSpinner('Deleting DynamoDB Table...', deleteTable, 'Deleted DynamoDB Table');

    if (instanceIds !== undefined && instanceIds.length > 0) {
      await runWithSpinner('Terminating EC2 instance...', () => deleteInstance(instanceIds[0]), 'Terminated EC2 instance');
    }

    await runWithSpinner('Deleting Rabbitory Engine Security Group...', deleteRabbitoryEngineSG, 'Deleted Rabbitory Engine Security Group');
    await runWithSpinner('Deleting RMQ Broker IAM role...', deleteBrokerRole, 'Deleted RMQ Broker IAM role');
    await runWithSpinner('Deleting Rabbitory Engine IAM role...', deleteRabbitoryRole, 'Deleted Rabbitory Engine IAM role');

  } catch (error) {
    console.error(chalk.redBright("\nRabbitory destruction failed\n"), error, "\n");
  }
};
