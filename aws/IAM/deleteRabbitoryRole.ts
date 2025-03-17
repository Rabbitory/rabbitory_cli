import { IAMClient, DeleteRoleCommand } from "@aws-sdk/client-iam";

const REGION = 'us-east-1';
const client = new IAMClient({ region: REGION });

export const ROLE_NAME = "RabbitoryRole";

export const deleteRabbitoryRole = async (): Promise<void> => {
  try {
    const command = new DeleteRoleCommand({
      RoleName: ROLE_NAME,
    });
    await client.send(command);
    console.log(`Role ${ROLE_NAME} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting role ${ROLE_NAME}:`, error);
  }
};