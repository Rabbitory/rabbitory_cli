import {
  TerminateInstancesCommand,
  waitUntilInstanceTerminated,
} from "@aws-sdk/client-ec2";
import { getAllEC2Regions } from "./getAllEC2Regions";
import { getInstanceIdsByPublisher } from "./getInstanceIdsByPublisher";
import { getEC2Client } from "./getEC2Client";

const deleteInstance = async (instanceId: string, region: string) => {
  const client = getEC2Client();

  try {
    await client.send(new TerminateInstancesCommand({ InstanceIds: [instanceId] }));
    await waitUntilInstanceTerminated(
      { client, maxWaitTime: 240 },
      { InstanceIds: [instanceId] }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to delete instance ${instanceId} in ${region}: ${msg}`);
  }
};

export const deleteAllBrokerInstances = async () => {
  const regions = await getAllEC2Regions();

  for (const region of regions) {
    const brokerIds = await getInstanceIdsByPublisher("Rabbitory");

    if (brokerIds && brokerIds.length > 0) {
      for (const instanceId of brokerIds) {
        await deleteInstance(instanceId, region);
      }
    }
  }
};
