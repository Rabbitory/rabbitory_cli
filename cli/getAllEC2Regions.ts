import { EC2Client, DescribeRegionsCommand } from "@aws-sdk/client-ec2";

export const fetchAllRegions = async () => {
  const client = new EC2Client({ region: "us-east-1" });

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
