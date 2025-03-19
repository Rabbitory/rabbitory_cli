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
  const reservations = data.Reservations;
  let instanceIds;

  if (reservations !== undefined && reservations.length > 0) {
    instanceIds = (reservations).reduce<string[]>((ids, reservation) => {
      if (reservation.Instances !== undefined && reservation.Instances.length > 0) {
        const runningInstanceIds = (reservation.Instances || [])
          .filter(instance => instance.State?.Name === 'running')
          .map(instance => instance.InstanceId)
          .filter(id => id !== undefined);
        return [...ids, ...runningInstanceIds];
      } else {
        return ids;
      }
    }, [])
  }

  console.log(instanceIds);
  return instanceIds;
};
