import { getEC2Client } from "../EC2/getEC2Client";
import {
  DescribeSecurityGroupsCommand,
  DeleteSecurityGroupCommand,
} from "@aws-sdk/client-ec2";


export const deleteAllBrokerSGs = async (): Promise<void> => {
  const client = getEC2Client();
  try {
    const command = new DescribeSecurityGroupsCommand({});
    const response = await client.send(command);
    const brokerSGs = response.SecurityGroups?.filter(sg => /^rabbitory-broker-sg-.*/i.test(sg.GroupName || ""));
    
    if (brokerSGs?.length) {
      for (const sg of brokerSGs) {
        if (sg.GroupId) {
          const deleteCommand = new DeleteSecurityGroupCommand({ GroupId: sg.GroupId });
          await client.send(deleteCommand);
        }
      }
    }
  } catch (error: unknown) {
    throw new Error(`Error deleting 'rabbitmq-sg-...' security groups\n${error instanceof Error ? error.message : String(error)}`);
  }
};
