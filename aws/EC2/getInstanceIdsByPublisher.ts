import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { getEC2Client } from "./getEC2Client";

export const getInstanceIdsByPublisher = async (publisher: string) => {
  const ec2Client = getEC2Client();
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
