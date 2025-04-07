import {
  Route53Client,
  CreateHostedZoneCommand,
  ListHostedZonesByNameCommand,
} from "@aws-sdk/client-route-53";

export interface HostedZoneResult {
  hostedZoneId: string;
  isNew: boolean;
  nameServers?: string[];
}

export async function createHostedZone(
  domain: string,
  region: string
): Promise<HostedZoneResult> {
  const client = new Route53Client({ region });

  const listCommand = new ListHostedZonesByNameCommand({
    DNSName: domain,
    MaxItems: 1,
  });
  const listResponse = await client.send(listCommand);

  const hostedZone = listResponse.HostedZones?.[0];
  if (hostedZone && hostedZone.Name && hostedZone.Id) {
    const zoneName = hostedZone.Name.endsWith(".")
      ? hostedZone.Name.slice(0, -1)
      : hostedZone.Name;
    if (zoneName === domain) {
      return { hostedZoneId: hostedZone.Id, isNew: false };
    }
  }

  const params = {
    Name: domain,
    CallerReference: Date.now().toString(),
    HostedZoneConfig: {
      Comment: "Hosted zone created by CLI for custom domain",
      PrivateZone: false,
    },
  };

  const createCommand = new CreateHostedZoneCommand(params);
  const createResponse = await client.send(createCommand);
  const hostedZoneId = createResponse.HostedZone?.Id;

  if (!hostedZoneId) {
    throw new Error("Failed to create hosted zone");
  }
  const nameServers = createResponse.DelegationSet?.NameServers;
  return { hostedZoneId: hostedZoneId, isNew: true, nameServers };
}
