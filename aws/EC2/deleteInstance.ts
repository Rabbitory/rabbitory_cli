import { TerminateInstancesCommand, waitUntilInstanceTerminated } from "@aws-sdk/client-ec2";
import { getEC2Client } from "./getEC2Client";

export const deleteInstance = async (id: string) => {
  const ec2Client = getEC2Client();

  try {
    await ec2Client.send(
      new TerminateInstancesCommand({
        InstanceIds: [id],
      }),
    );

    await waitUntilInstanceTerminated(
      { client: ec2Client, maxWaitTime: 240 },
      { InstanceIds: [id] }
    );
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error deleting instance ${id}\n${err.message}`);
    } else {
      throw new Error(`Unknown error deleting instance ${id}\n${String(err)}`);
    }
  }
};
