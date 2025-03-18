import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { deleteTable } from "../aws/dynamoDB/removeTable";
import { deleteBrokerSG } from "../aws/security-groups/deleteBrokerSG";
import { deleteRabbitoryEngineSG } from "../aws/security-groups/deleteRabbitoryEngineSG";
import { deleteBrokerRole } from "../aws/IAM/deleteBrokerRole";
import { deleteRabbitoryRole } from "../aws/IAM/deleteRabbitoryRole";
import { deleteInstance } from "../aws/EC2/deleteInstance";
import { getInstanceByName } from "./getInstanceByName";

const waitForInstanceTermination = async (instanceId: string) => {
  const ec2 = new EC2Client();

  while (true) {
    const { Reservations } = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
    const state = Reservations?.[0].Instances?.[0]?.State?.Name;

    if (state === "terminated") {
      console.log(`Instance "${instanceId}" terminated.`);
      break;
    }

    console.log(`Waiting for instance "${instanceId} to terminate...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

export const destroy = async () => {
  const tableName = "RabbitoryTable";
  const instanceName = "RabbitoryDashboard";
  const instanceIds: string[] | undefined = await getInstanceByName(instanceName);

  await deleteTable(tableName);

  if (instanceIds !== undefined && instanceIds.length > 0) {
    await deleteInstance(instanceIds[0]);
    await waitForInstanceTermination(instanceIds[0]);
  } else {
    console.log(`No EC2 instance with name "${instanceName} exists`);
  }

  await deleteBrokerSG();
  await deleteRabbitoryEngineSG();
  await deleteBrokerRole();
  await deleteRabbitoryRole();
}
