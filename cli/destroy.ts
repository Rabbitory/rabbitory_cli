import { deleteTable } from "../aws/dynamoDB/deleteTable";
import { deleteRabbitorySG } from "../aws/security-groups/deleteRabbitorySG";
import { deleteBrokerRole } from "../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../aws/IAM/deleteRabbitoryRole";
import { deleteInstance } from "../aws/EC2/deleteInstance";
import { getRunningInstanceIdsByName } from "./getRunningInstanceIdsByName";
import { getInstanceIdsByPublisher } from "./getInstanceIdsByPublisher";
import { runWithSpinner } from "./spinner";
import { getRegion } from "./getRegion";
import chalk from "chalk";

export const destroy = async () => {
  try {
    const controlPanelName = "RabbitoryControlPanel";
    const region: string = await getRegion();
    const brokerIds = await getInstanceIdsByPublisher("Rabbitory", region);
    const instanceIds: string[] | undefined = await getRunningInstanceIdsByName(
      controlPanelName,
      region,
    );
    const instanceId: string | undefined =
      instanceIds !== undefined && instanceIds.length > 0
        ? instanceIds[0]
        : undefined;

    await runWithSpinner(
      "Deleting DynamoDB Table...",
      () => deleteTable(region),
      "Deleted DynamoDB Table",
    );

    await runWithSpinner(
      "Deleting RabbitMQ Broker Instances...",
      () =>
        Promise.all(brokerIds?.map((id) => deleteInstance(id, region)) || []),
      "Deleted RabbitMQ Broker Instances",
    );

    if (instanceId !== undefined) {
      await runWithSpinner(
        "Terminating Control Panel EC2 instance...",
        () => deleteInstance(instanceId, region),
        "Terminated EC2 instance",
      );
    }

    await runWithSpinner(
      "Deleting Rabbitory security group...",
      () => deleteRabbitorySG(region),
      "Deleted Rabbitory security group",
    );
    await runWithSpinner(
      "Deleting RMQ Broker IAM role...",
      () => deleteBrokerRole(region),
      "Deleted RMQ Broker IAM role",
    );
    await runWithSpinner(
      "Deleting Rabbitory IAM role...",
      () => deleteRabbitoryRole(region),
      "Deleted Rabbitory IAM role",
    );
  } catch (error) {
    console.error(
      chalk.redBright("\nRabbitory destruction failed\n"),
      error,
      "\n",
    );
  }
};
