import { deleteTable } from "../aws/dynamoDB/removeTable";
import { deleteRabbitoryEngineSG } from "../aws/security-groups/deleteRabbitoryEngineSG";
import { deleteBrokerRole } from "../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../aws/IAM/deleteRabbitoryRole";
import { deleteInstance } from "../aws/EC2/deleteInstance";
import { getInstanceByName } from "./getInstanceByName";

export const destroy = async () => {
  const tableName = "RabbitoryTable";
  const instanceName = "RabbitoryDashboard";
  const instanceIds: string[] = await getInstanceByName(instanceName);

  await deleteTable(tableName);

  if (instanceIds.length > 0) {
    await deleteInstance(instanceIds[instanceIds.length - 1]);
  } else {
    console.log(`No EC2 instance with name "${instanceName} exists`);
  }

  await deleteRabbitoryEngineSG();
  await deleteBrokerRole();
  await deleteRabbitoryRole();
}