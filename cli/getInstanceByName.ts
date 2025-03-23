import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({ region: "us-east-1" });

export const getInstanceByName = async (instanceName: string) => {
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

