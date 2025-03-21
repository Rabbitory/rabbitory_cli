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
    const region = "ca-central-1";
    const instanceIds: string[] | undefined = await getRunningInstanceIdsByName(instanceName, region);
    const instanceId: string | undefined = (instanceIds !== undefined && instanceIds.length > 0) ? instanceIds[0] : undefined;

    await runWithSpinner('Deleting DynamoDB Table...', () => deleteTable(region), 'Deleted DynamoDB Table');

    if (instanceId !== undefined) {
      await runWithSpinner('Terminating EC2 instance...', () => deleteInstance(instanceId, region), 'Terminated EC2 instance');
    }

    await runWithSpinner('Deleting Rabbitory Engine Security Group...', () => deleteRabbitoryEngineSG(region), 'Deleted Rabbitory Engine Security Group');
    await runWithSpinner('Deleting RMQ Broker IAM role...', () => deleteBrokerRole(region), 'Deleted RMQ Broker IAM role');
    await runWithSpinner('Deleting Rabbitory Engine IAM role...', () => deleteRabbitoryRole(region), 'Deleted Rabbitory Engine IAM role');

  } catch (error) {
    console.error(chalk.redBright("\nRabbitory destruction failed\n"), error, "\n");
  }
};
