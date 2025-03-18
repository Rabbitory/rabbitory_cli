import { EC2Client, TerminateInstancesCommand } from "@aws-sdk/client-ec2";

const REGION = "us-east-1";

const ec2Client = new EC2Client({ region: REGION });

export const deleteInstance = async (id: string) => {
  try {
    const data = await ec2Client.send(
      new TerminateInstancesCommand({
        InstanceIds: [id],
      }),
    );
    console.log("Instance deleted:", id);
    return data;
  } catch (err) {
    console.error("Error deleting instance:", err);
  }
};
