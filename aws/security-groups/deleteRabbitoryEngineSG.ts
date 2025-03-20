import {
  EC2Client,
  DescribeSecurityGroupsCommand,
  DeleteSecurityGroupCommand,
} from "@aws-sdk/client-ec2";

const REGION = "us-east-1";
const GROUP_NAME = "RabbitoryEngineSG";
const ec2Client = new EC2Client({ region: REGION });

const isAwsError = (error: unknown): error is { name: string; message: string } => {
  return typeof error === "object" && error !== null && "name" in error && "message" in error;
};

const getSecurityGroupId = async (): Promise<string | null> => {
  try {
    const command = new DescribeSecurityGroupsCommand({ GroupNames: [GROUP_NAME] });
    const response = await ec2Client.send(command);
    return response.SecurityGroups?.[0]?.GroupId ?? null;
  } catch (error: unknown) {
    if (isAwsError(error) && error.name === "InvalidGroup.NotFound") return null; // return if SG does not exist
    throw new Error(`Error retrieving security group ID for ${GROUP_NAME}\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const deleteSecurityGroup = async (groupId: string): Promise<void> => {
  try {
    const command = new DeleteSecurityGroupCommand({ GroupId: groupId });
    await ec2Client.send(command);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error deleting security group ${groupId}\n${error.message}`);
    }
    throw new Error(`Unknown error deleting security group ${groupId}\n${String(error)}`);
  }
};

export const deleteRabbitoryEngineSG = async (): Promise<void> => {
  try {
    const securityGroupId = await getSecurityGroupId();
    if (!securityGroupId) return; // return if no sg exists
    await deleteSecurityGroup(securityGroupId);
  } catch (error: unknown) {
    throw new Error(`Failed to delete RabbitoryEngineSG\n${error instanceof Error ? error.message : String(error)}`);
  }
};