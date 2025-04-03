import { deleteTable } from "../../aws/dynamoDB/deleteTable";
import { deleteRabbitorySG } from "../../aws/security-groups/deleteRabbitorySG";
import { deleteBrokerRole } from "../../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../../aws/IAM/deleteRabbitoryRole";
import { deleteInstance } from "../../aws/EC2/deleteInstance";
import { getRunningInstanceIdsByName } from "../../aws/EC2/getRunningInstanceIdsByName";
import { getInstanceIdsByPublisher } from "../../aws/EC2/getInstanceIdsByPublisher";
import { runWithSpinner } from "../utils/spinner";
import { getRegion } from "../utils/promptUserForRegion";
import chalk from "chalk";
import { fetchAllRegions } from "../../aws/EC2/getAllEC2Regions";

const deleteAllBrokerInstances = async (regions: string[]) => {
  for (const region of regions) {
    const brokerIds = await getInstanceIdsByPublisher("Rabbitory", region);
    if (brokerIds !== undefined) {
      for (const brokerId of brokerIds) {
        await deleteInstance(brokerId, region);
      }
    }
  }
}

const deleteAllSecurityGroups = async (regions: string[]) => {
  for (const region of regions) {
    await deleteRabbitorySG(region);
  }
}

export const destroy = async () => {
  try {
    const controlPanelName = "RabbitoryControlPanel";
    const primaryRegion: string = await getRegion();

    const regions = await fetchAllRegions();

    if (!regions || regions.length === 0) {
      console.error("Error fetching regions");
      process.exit(1);
    }

    await runWithSpinner(
      "Deleting DynamoDB Table...",
      () => deleteTable(primaryRegion),
      "Deleted DynamoDB Table",
    );

    const instanceIds: string[] | undefined = await getRunningInstanceIdsByName(
      controlPanelName,
      primaryRegion,
    );
    const instanceId: string | undefined =
      instanceIds !== undefined && instanceIds.length > 0
        ? instanceIds[0]
        : undefined;

    if (instanceId !== undefined) {
      await runWithSpinner(
        "Terminating Control Panel EC2 instance...",
        () => deleteInstance(instanceId, primaryRegion),
        "Terminated EC2 instance",
      );
    }

    await runWithSpinner(
      "Deleting RabbitMQ Broker Instances...",
      () => deleteAllBrokerInstances(regions),
      "Deleted RabbitMQ Broker Instances",
    );

    await runWithSpinner(
      "Deleting Rabbitory security group...",
      () => deleteAllSecurityGroups(regions),
      "Deleted Rabbitory security group",
    );

    await runWithSpinner(
      "Deleting RMQ Broker IAM role...",
      () => deleteBrokerRole(primaryRegion),
      "Deleted RMQ Broker IAM role",
    );
    await runWithSpinner(
      "Deleting Rabbitory IAM role...",
      () => deleteRabbitoryRole(primaryRegion),
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
