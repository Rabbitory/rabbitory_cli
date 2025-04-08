import { createHostedZone, HostedZoneResult } from "./createHostedZone";
import { promptUserToUpdateNameservers } from "../../cli/utils/promptUserToUpdateNameservers";

export const handleHostedZoneSetup = async (
  customDomain: string,
  region: string
): Promise<HostedZoneResult> => {
  const zoneResult: HostedZoneResult = await createHostedZone(
    customDomain,
    region
  );

  if (zoneResult.isNew && zoneResult.nameServers) {
    await promptUserToUpdateNameservers(zoneResult.nameServers);
  } else {
    console.log(`Using existing hosted zone for ${customDomain}.`);
  }
  return zoneResult;
};
