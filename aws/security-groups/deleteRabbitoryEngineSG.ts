import {
  EC2Client,
  DescribeSecurityGroupsCommand,
  DeleteSecurityGroupCommand,
  EC2,
} from "@aws-sdk/client-ec2";

const GROUP_NAME = "RabbitoryEngineSG";

const isAwsError = (error: unknown): error is { name: string; message: string } => {
  return typeof error === "object" && error !== null && "name" in error && "message" in error;
};

const getSecurityGroupId = async (client: EC2Client): Promise<string | null> => {
  try {
    const command = new DescribeSecurityGroupsCommand({ GroupNames: [GROUP_NAME] });
    const response = await client.send(command);
    return response.SecurityGroups?.[0]?.GroupId ?? null;
  } catch (error: unknown) {
    if (isAwsError(error) && error.name === "InvalidGroup.NotFound") return null; // return if SG does not exist
    throw new Error(`Error retrieving security group ID for ${GROUP_NAME}\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const deleteSecurityGroup = async (groupId: string, client: EC2Client): Promise<void> => {
  try {
    const command = new DeleteSecurityGroupCommand({ GroupId: groupId });
    await client.send(command);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error deleting security group ${groupId}\n${error.message}`);
    }
    throw new Error(`Unknown error deleting security group ${groupId}\n${String(error)}`);
  }
};

export const deleteRabbitoryEngineSG = async (region: string): Promise<void> => {
  const client = new EC2Client({ region: region });

  try {
    const securityGroupId = await getSecurityGroupId(client);
    if (!securityGroupId) return; // return if no sg exists
    await deleteSecurityGroup(securityGroupId, client);
  } catch (error: unknown) {
    throw new Error(`Failed to delete RabbitoryEngineSG\n${error instanceof Error ? error.message : String(error)}`);
  }
};
