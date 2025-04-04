import { getEC2Client } from "../EC2/getEC2Client";
import {
  DescribeSecurityGroupsCommand,
  DeleteSecurityGroupCommand,
} from "@aws-sdk/client-ec2";


export const deleteRabbitorySG = async (): Promise<void> => {
  const client = getEC2Client();
  try {
    const command = new DescribeSecurityGroupsCommand({});
    const response = await client.send(command);
    const rabbitorySG = response.SecurityGroups?.find(sg => sg.GroupName === "rabbitory-sg");
    
    if (rabbitorySG?.GroupId) {
      const deleteCommand = new DeleteSecurityGroupCommand({ GroupId: rabbitorySG.GroupId });
      await client.send(deleteCommand);
    }
  } catch (error: unknown) {
    throw new Error(`Error deleting 'rabbitory-sg' security group\n${error instanceof Error ? error.message : String(error)}`);
  }
};
