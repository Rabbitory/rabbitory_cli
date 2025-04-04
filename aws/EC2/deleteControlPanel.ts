import { TerminateInstancesCommand, waitUntilInstanceTerminated } from "@aws-sdk/client-ec2";
import { getEC2Client } from "./getEC2Client";
import { getRunningInstanceIdsByName } from "./getRunningInstanceIdsByName";

export const deleteControlPanel = async () => {
  const ec2Client = getEC2Client();

  try {
    const instanceIds = await getRunningInstanceIdsByName("rabbitory-control-panel");
    const instanceId = instanceIds?.[0];

    if (!instanceId) {
      throw new Error("No running Rabbitory Control Panel instance found.");
    }

    await ec2Client.send(
      new TerminateInstancesCommand({
        InstanceIds: [instanceId],
      }),
    );

    await waitUntilInstanceTerminated(
      { client: ec2Client, maxWaitTime: 240 },
      { InstanceIds: [instanceId] }
    );
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error deleting Rabbitory Control Panel EC2\n${err.message}`);
    } else {
      throw new Error(`Unknown error deleting Rabbitory Control Panel EC2\n${String(err)}`);
    }
  }
};
