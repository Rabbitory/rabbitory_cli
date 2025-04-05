import { EC2Client, DescribeRegionsCommand, DescribeRegionsCommandOutput } from "@aws-sdk/client-ec2";
import { getEC2Client } from "./getEC2Client";


export const getAllEC2Regions = async (): Promise<string[]> => {
  const client: EC2Client = getEC2Client();
  const command = new DescribeRegionsCommand({});
  const response: DescribeRegionsCommandOutput = await client.send(command);
  const regions = response.Regions?.map((region) => region.RegionName);

  if (!regions) {
    throw new Error("Error fetching regions");
  }

  return regions.filter((region): region is string => region !== undefined);
};
