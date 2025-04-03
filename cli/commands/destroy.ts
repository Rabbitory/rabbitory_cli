import { deleteTable } from "../../aws/dynamoDB/deleteTable";
import { deleteRabbitorySG } from "../../aws/security-groups/deleteRabbitorySG";
import { deleteBrokerRole } from "../../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../../aws/IAM/deleteRabbitoryRole";
import { deleteControlPanel } from "../../aws/EC2/deleteControlPanel";
import { getRunningInstanceIdsByName } from "../../aws/EC2/getRunningInstanceIdsByName";
import { getInstanceIdsByPublisher } from "../../aws/EC2/getInstanceIdsByPublisher";
import { runWithSpinner } from "../utils/spinner";
import { promptUserForRegion } from "../utils/promptUserForRegion";
import { getAllEC2Regions } from "../../aws/EC2/getAllEC2Regions";
import chalk from "chalk";


const deleteAllBrokerInstances = async (regions: string[]) => {
  try {
    await Promise.all(
      regions.map(async (_region) => {
        try {
          const brokerIds = await getInstanceIdsByPublisher("Rabbitory");
          if (brokerIds?.length) {
            await Promise.all(
              brokerIds.map(async (brokerId) => {
                try {
                  await deleteControlPanel(brokerId);
                } catch (error) {
                  throw new Error(`Failed to delete broker instance ${brokerId}: ${error}`);
                }
              })
            );
          }
        } catch (error) {
          throw new Error(`Failed to fetch broker instances in region ${_region}: ${error}`);
        }
      })
    );
  } catch (error) {
    throw new Error(`Failed to delete all broker instances: ${error}`);
  }
};

const deleteAllSecurityGroups = async (regions: string[]) => {
  try {
    await Promise.all(
      regions.map(async (region) => {
        try {
          await deleteRabbitorySG();
        } catch (error) {
          throw new Error(`Failed to delete security group in region ${region}: ${error}`);
        }
      })
    );
  } catch (error) {
    throw new Error(`Failed to delete all security groups: ${error}`);
  }
};

export const destroy = async () => {
  try {
    await promptUserForRegion();
    const controlPanelName = "RabbitoryControlPanel";
    const regions: string[] = await getAllEC2Regions();
    if (!regions?.length) throw new Error("No regions found");

    await runWithSpinner("Deleting DynamoDB Table...", () => deleteTable(), "Deleted DynamoDB Table"
    );

    let instanceId: string | undefined;
    try {
      const instanceIds = await getRunningInstanceIdsByName(controlPanelName);
      instanceId = instanceIds?.[0];
    } catch (error) {
      throw new Error(`Failed to fetch running instances: ${error}`);
    }

    if (instanceId) {
      await runWithSpinner(
        "Terminating Control Panel EC2 instance...",
        async () => {
          try {
            await deleteControlPanel(instanceId);
          } catch (error) {
            throw new Error(`Failed to delete EC2 instance ${instanceId}: ${error}`);
          }
        },
        "Terminated EC2 instance"
      );
    }

    await Promise.all([
      runWithSpinner(
        "Deleting RabbitMQ Broker Instances...",
        () => deleteAllBrokerInstances(regions),
        "Deleted RabbitMQ Broker Instances"
      ),
      runWithSpinner(
        "Deleting Rabbitory security group...",
        () => deleteAllSecurityGroups(regions),
        "Deleted Rabbitory security group"
      ),
      runWithSpinner(
        "Deleting RMQ Broker IAM role...",
        async () => {
          try {
            await deleteBrokerRole();
          } catch (error) {
            throw new Error(`Failed to delete RMQ Broker IAM role: ${error}`);
          }
        },
        "Deleted RMQ Broker IAM role"
      ),
      runWithSpinner(
        "Deleting Rabbitory IAM role...",
        async () => {
          try {
            await deleteRabbitoryRole();
          } catch (error) {
            throw new Error(`Failed to delete Rabbitory IAM role: ${error}`);
          }
        },
        "Deleted Rabbitory IAM role"
      ),
    ]);
  } catch (error) {
    console.error(chalk.redBright("\nRabbitory destruction failed\n"), error, "\n");
  }
};
