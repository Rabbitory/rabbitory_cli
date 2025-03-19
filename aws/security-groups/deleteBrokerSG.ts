import { 
  EC2Client, 
  DescribeSecurityGroupsCommand, 
  DeleteSecurityGroupCommand 
} from "@aws-sdk/client-ec2";

const REGION = "us-east-1";
const ec2Client = new EC2Client({ region: REGION });

const getSecurityGroupId = async (groupName: string): Promise<string | null> => {
  try {
    const command = new DescribeSecurityGroupsCommand({ GroupNames: [groupName] });
    const response = await ec2Client.send(command);
    
    if (!response.SecurityGroups || response.SecurityGroups.length === 0) {
      console.log(`No security group found with name: ${groupName}`);
      return null;
    }

    return response.SecurityGroups[0].GroupId ?? null;
  } catch (error: any) {
    if (error.name === "InvalidGroup.NotFound") {
      console.log(`Security group '${groupName}' does not exist.`);
      return null;
    }
    console.error("Error retrieving security group ID:", error);
    throw error;
  }
};

const deleteSecurityGroup = async (groupId: string): Promise<void> => {
  try {
    const command = new DeleteSecurityGroupCommand({ GroupId: groupId });
    await ec2Client.send(command);
    console.log(`Security group ${groupId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting security group:", error);
    throw error;
  }
};

export const deleteBrokerSG = async (): Promise<void> => {
  try {
    const groupName = "BrokerSecurityGroup";
    const securityGroupId = await getSecurityGroupId(groupName);
    
    if (!securityGroupId) {
      console.log("No security group found to delete.");
      return;
    }
    
    await deleteSecurityGroup(securityGroupId);
  } catch (error) {
    console.error("Failed to delete BrokerSecurityGroup:", error);
  }
};
