// import {
//   EC2Client,
//   DescribeSecurityGroupsCommand,
//   DeleteSecurityGroupCommand,
// } from "@aws-sdk/client-ec2";
//
// const GROUP_NAME = "RabbitorySG";
//
// const isAwsError = (error: unknown): error is { name: string; message: string } => {
//   return typeof error === "object" && error !== null && "name" in error && "message" in error;
// };
//
// const getSecurityGroupId = async (client: EC2Client): Promise<string | null> => {
//   try {
//     const command = new DescribeSecurityGroupsCommand({});
//     const response = await client.send(command);
//     return response.SecurityGroups?.[0]?.GroupId ?? null;
//   } catch (error: unknown) {
//     if (isAwsError(error) && error.name === "InvalidGroup.NotFound") return null; // return if SG does not exist
//     throw new Error(`Error retrieving security group ID for ${GROUP_NAME}\n${error instanceof Error ? error.message : String(error)}`);
//   }
// };
//
// const getSecurityGroupNames = async (client: EC2Client): Promise<string[]> => {
//   try {
//     const command = new DescribeSecurityGroupsCommand({});
//     const response = await client.send(command);
//     return response.SecurityGroups?.map(sg => sg.GroupName ?? '').filter(name => name !== '') ?? [];
//   } catch (error: unknown) {
//     throw new Error(`Error retrieving security group names\n${error instanceof Error ? error.message : String(error)}`);
//   }
// };
//
// const deleteSecurityGroup = async (groupId: string, client: EC2Client): Promise<void> => {
//   try {
//     const command = new DeleteSecurityGroupCommand({ GroupId: groupId });
//     await client.send(command);
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       throw new Error(`Error deleting security group ${groupId}\n${error.message}`);
//     }
//     throw new Error(`Unknown error deleting security group ${groupId}\n${String(error)}`);
//   }
// };
//
// export const deleteRabbitorySG = async (region: string): Promise<void> => {
//   const client = new EC2Client({ region: region });
//
//   try {
//     const securityGroupId = await getSecurityGroupId(client);
//     if (!securityGroupId) return; // return if no sg exists
//     await deleteSecurityGroup(securityGroupId, client);
//   } catch (error: unknown) {
//     throw new Error(`Failed to delete RabbitorySG\n${error instanceof Error ? error.message : String(error)}`);
//   }
// };


import {
  EC2Client,
  DescribeSecurityGroupsCommand,
  DeleteSecurityGroupCommand,
} from "@aws-sdk/client-ec2";

const getRabbitorySGIds = async (client: EC2Client): Promise<string[]> => {
  try {
    const command = new DescribeSecurityGroupsCommand({});
    const response = await client.send(command);
    return response.SecurityGroups?.reduce<string[]>((ids, sg) => {
      if (sg.GroupId && sg.GroupName?.toLowerCase().includes('rabbit')) {
        ids.push(sg.GroupId);
      }
      return ids;
    }, []) ?? [];
  } catch (error: unknown) {
    throw new Error(`Error retrieving Rabbitory security groups\n${error instanceof Error ? error.message : String(error)}`);
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

export const deleteRabbitorySG = async (region: string): Promise<void> => {
  const client = new EC2Client({ region: region });

  try {
    const securityGroupIds = await getRabbitorySGIds(client);
    for (const sgId of securityGroupIds) {
      await deleteSecurityGroup(sgId, client);
    }
  } catch (error: unknown) {
    throw new Error(`Failed to delete Rabbitory security groups\n${error instanceof Error ? error.message : String(error)}`);
  }
};
