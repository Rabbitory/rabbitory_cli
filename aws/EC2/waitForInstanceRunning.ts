import { EC2Client, waitUntilInstanceRunning } from "@aws-sdk/client-ec2";

export const waitForInstanceRunning = async (instanceId: string, region: string) => {
  const ec2Client = new EC2Client({ region });

  try {
    await waitUntilInstanceRunning(
      { client: ec2Client, maxWaitTime: 300, minDelay: 15 }, // Wait up to 5 minutes, polling every 15 seconds
      { InstanceIds: [instanceId] }
    );
  } catch (error) {
    throw new Error(`EC2 instance ${instanceId} failed to reach running state: ${error}`);
  }
};