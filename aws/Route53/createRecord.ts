import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";

export async function createRecord(
  hostedZoneId: string,
  domainName: string,
  ipAddress: string,
  region: string
): Promise<void> {
  const route53 = new Route53Client({ region });

  const command = new ChangeResourceRecordSetsCommand({
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: domainName,
            Type: "A",
            TTL: 60, // Lower TTL for testing faster propagation
            ResourceRecords: [{ Value: ipAddress }],
          },
        },
      ],
    },
  });

  await route53.send(command);
}
