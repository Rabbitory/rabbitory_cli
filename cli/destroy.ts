import { deleteTable } from "../aws/dynamoDB/removeTable";
import { deleteBrokerSG } from "../aws/security-groups/deleteBrokerSG";
import { deleteRabbitoryEngineSG } from "../aws/security-groups/deleteRabbitoryEngineSG";
import { deleteBrokerRole } from "../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../aws/IAM/deleteRabbitoryRole";
import { deleteInstance } from "../aws/EC2/deleteInstance";
import { getInstanceByName } from "./getInstanceByName";

export const destroy = async () => {
  const tableName = "RabbitoryTable";
  const instanceName = "RabbitoryDashboard";
  const instanceIds: string[] | undefined = await getInstanceByName(instanceName);

  await deleteTable(tableName);

  if (instanceIds !== undefined && instanceIds.length > 0) {
    await deleteInstance(instanceIds[0]);
  } else {
    console.log(`No EC2 instance with name "${instanceName} exists`);
  }

  await deleteBrokerSG();
  await deleteRabbitoryEngineSG();
  await deleteBrokerRole();
  await deleteRabbitoryRole();
}
