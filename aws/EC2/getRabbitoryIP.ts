import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { getEC2Client } from "./getEC2Client";

export const getRabbitoryIP = async (
  instanceId: string
): Promise<string | undefined> => {
  const ec2Client = getEC2Client();

  try {
    const command = new DescribeInstancesCommand({ InstanceIds: [instanceId] });
    const response = await ec2Client.send(command);

    const instance = response.Reservations?.[0]?.Instances?.[0];
    if (!instance || !instance.PublicDnsName) {
      console.warn("Rabbitory EC2 instance does not have a public ip yet.");
      return undefined;
    }

    return instance.PublicIpAddress;
  } catch (error) {
    console.error("Failed to retrieve Rabbitory EC2 instance ip:", error);
    return undefined;
  }
};
