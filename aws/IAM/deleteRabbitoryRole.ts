import { 
  IAMClient, 
  ListAttachedRolePoliciesCommand, 
  DetachRolePolicyCommand, 
  DeleteRoleCommand 
} from "@aws-sdk/client-iam";
import { ROLE_NAME } from "./createRabbitoryRole";

const REGION = "us-east-1";
const client = new IAMClient({ region: REGION });

const detachAllPolicies = async () => {
  try {
    const listCommand = new ListAttachedRolePoliciesCommand({ RoleName: ROLE_NAME });
    const response = await client.send(listCommand);

    if (response.AttachedPolicies) {
      for (const policy of response.AttachedPolicies) {
        if (policy.PolicyArn) {
          const detachCommand = new DetachRolePolicyCommand({
            RoleName: ROLE_NAME,
            PolicyArn: policy.PolicyArn,
          });
          await client.send(detachCommand);
          console.log(`Detached policy: ${policy.PolicyArn}`);
        }
      }
    }
  } catch (error) {
    console.error("Error detaching policies:", error);
    throw error;
  }
};

export const deleteRabbitoryRole = async () => {
  try {
    await detachAllPolicies();
    const deleteCommand = new DeleteRoleCommand({ RoleName: ROLE_NAME });
    await client.send(deleteCommand);
    console.log(`Role ${ROLE_NAME} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting role:", error);
  }
};

deleteRabbitoryRole();