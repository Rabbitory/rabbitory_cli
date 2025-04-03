import { DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import { getEC2Client } from "./getEC2Client";

export const fetchAllRegions = async () => {
  const client = await getEC2Client();

  try {
    const command = new DescribeRegionsCommand({});
    const response = await client.send(command);
    const regions = response.Regions?.map(region => region.RegionName);
    if (regions === undefined) throw new Error("Error fetching regions");
    return regions.filter((region) => region !== undefined);
  } catch (error) {
    console.error("Error fetching regions:", error);
  }
};
