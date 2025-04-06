import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { getEC2Client } from "./getEC2Client";


export const getInstanceByName = async (instanceName: string) => {
  const ec2Client = getEC2Client();
  const command = new DescribeInstancesCommand({
    Filters: [
      {
        Name: "tag:Name",
        Values: [instanceName],
      },
    ],
  });

  const data = await ec2Client.send(command);

  const instanceIds = (data.Reservations?.flatMap(reservation =>
    reservation.Instances?.map(instance => instance.InstanceId)
  ) || []).filter((id) => id !== undefined);

  return instanceIds;
};

