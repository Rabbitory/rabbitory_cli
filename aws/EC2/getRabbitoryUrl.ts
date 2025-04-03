import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export const getRabbitoryUrl = async (instanceId: string, region: string): Promise<string | null> => {
  const ec2Client = new EC2Client({ region });
  
  try {
    const command = new DescribeInstancesCommand({ InstanceIds: [instanceId] });
    const response = await ec2Client.send(command);
    
    const instance = response.Reservations?.[0]?.Instances?.[0];
    if (!instance || !instance.PublicDnsName) {
      console.warn("Rabbitory EC2 instance does not have a public endpoint yet.");
      return null;
    }
    
    return `http://${instance.PublicDnsName}:3000`; // Adjust port if needed
  } catch (error) {
    console.error("Failed to retrieve Rabbitory EC2 instance endpoint:", error);
    return null;
  }
};