import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export const getInstanceIdsByPublisher = async (
  publisher: string,
  region: string,
) => {
  const ec2Client = new EC2Client({ region: region });
  const command = new DescribeInstancesCommand({
    Filters: [
      {
        Name: "tag:Publisher",
        Values: [publisher],
      },
    ],
  });

  const data = await ec2Client.send(command);
  const reservations = data.Reservations;
  let instanceIds;

  if (reservations !== undefined && reservations.length > 0) {
    instanceIds = reservations.reduce<string[]>((ids, reservation) => {
      if (
        reservation.Instances !== undefined &&
        reservation.Instances.length > 0
      ) {
        const runningInstanceIds = (reservation.Instances || [])
          .map((instance) => instance.InstanceId)
          .filter((id) => id !== undefined);
        return [...ids, ...runningInstanceIds];
      } else {
        return ids;
      }
    }, []);
  }

  return instanceIds;
};
