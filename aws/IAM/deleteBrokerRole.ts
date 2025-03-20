import { 
  IAMClient, 
  ListAttachedRolePoliciesCommand, 
  DetachRolePolicyCommand, 
  DeleteRoleCommand,
  DeleteInstanceProfileCommand,
  RemoveRoleFromInstanceProfileCommand
} from "@aws-sdk/client-iam";

const ROLE_NAME = "RMQBrokerRole";
const INSTANCE_PROFILE_NAME = "RMQBrokerInstanceProfile";
const REGION = "us-east-1";
const client = new IAMClient({ region: REGION });

const isAwsError = (error: unknown): error is { name: string; message: string } => {
  return typeof error === "object" && error !== null && "name" in error && "message" in error;
};
const isNotFoundError = (error: unknown) => isAwsError(error) && error.name === "NoSuchEntityException";

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
        }
      }
    }
  } catch (error: unknown) {
    if (isNotFoundError(error)) return; // Role does not exist, nothing to detach
    throw new Error(`Error detaching policies for role ${ROLE_NAME}\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const removeRoleFromInstanceProfile = async () => {
  try {
    const removeRoleCommand = new RemoveRoleFromInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
      RoleName: ROLE_NAME,
    });
    await client.send(removeRoleCommand);
  } catch (error: unknown) {
    if (isNotFoundError(error)) return; // Role is not attached, nothing to remove
    throw new Error(`Error removing role ${ROLE_NAME} from instance profile\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const deleteInstanceProfile = async () => {
  try {
    const deleteProfileCommand = new DeleteInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
    });
    await client.send(deleteProfileCommand);
  } catch (error: unknown) {
    if (isNotFoundError(error)) return; // Instance profile does not exist, nothing to delete
    throw new Error(`Error deleting instance profile ${INSTANCE_PROFILE_NAME}\n${error instanceof Error ? error.message : String(error)}`);
  }
};

export const deleteBrokerRole = async () => {
  try {
    await removeRoleFromInstanceProfile();
    await deleteInstanceProfile();
    await detachAllPolicies();

    try {
      await client.send(new DeleteRoleCommand({ RoleName: ROLE_NAME }));
    } catch (error: unknown) {
      if (isNotFoundError(error)) return; // Role does not exist, nothing to delete
      throw error; // Re-throw other errors
    }
  } catch (error: unknown) {
    throw new Error(`Error deleting role ${ROLE_NAME}\n${error instanceof Error ? error.message : String(error)}`);
  }
};