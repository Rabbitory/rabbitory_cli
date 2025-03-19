import { EC2Client, TerminateInstancesCommand, waitUntilInstanceTerminated } from "@aws-sdk/client-ec2";

const REGION = "us-east-1";
const ec2Client = new EC2Client({ region: REGION });

export const deleteInstance = async (id: string) => {
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
