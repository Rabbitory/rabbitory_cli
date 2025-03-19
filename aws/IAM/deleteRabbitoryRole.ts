import {
  IAMClient,
  ListAttachedRolePoliciesCommand,
  DetachRolePolicyCommand,
  RemoveRoleFromInstanceProfileCommand,
  DeleteInstanceProfileCommand,
  DeleteRoleCommand,
} from "@aws-sdk/client-iam";

const ROLE_NAME = "RabbitoryRole";
const INSTANCE_PROFILE_NAME = "RabbitoryInstanceProfile";
const REGION = "us-east-1";
const client = new IAMClient({ region: REGION });

const isAwsError = (error: unknown): error is { name: string; message: string } => {
  return typeof error === "object" && error !== null && "name" in error && "message" in error;
};

const detachAllPolicies = async () => {
  try {
    const listCommand = new ListAttachedRolePoliciesCommand({
      RoleName: ROLE_NAME,
    });
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
    if (isAwsError(error)) {
      throw new Error(`Error detaching policies for role ${ROLE_NAME}\n${error.message}`);
    } else {
      throw new Error(`Unknown error detaching policies for role ${ROLE_NAME}\n${String(error)}`);
    } 
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
    if (isAwsError(error) && error.name === "NoSuchEntityException") {
      console.warn(`Role ${ROLE_NAME} is not attached to any instance profile. Skipping.`);
    } else {
      throw new Error(`Error removing role ${ROLE_NAME} from instance profile\n${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

const deleteInstanceProfile = async () => {
  try {
    const deleteProfileCommand = new DeleteInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
    });
    await client.send(deleteProfileCommand);
  } catch (error: unknown) {
    if (isAwsError(error) && error.name === "NoSuchEntityException") {
      console.warn(`Instance profile ${INSTANCE_PROFILE_NAME} does not exist. Skipping deletion.`);
    } else {
      throw new Error(`Error deleting instance profile ${INSTANCE_PROFILE_NAME}\n${error instanceof Error ? error.message : String(error)}`);
    }
  }
};

export const deleteRabbitoryRole = async () => {
  try {
    await removeRoleFromInstanceProfile();
    await deleteInstanceProfile();
    await detachAllPolicies();

    const deleteCommand = new DeleteRoleCommand({ RoleName: ROLE_NAME });
    await client.send(deleteCommand);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error deleting role ${ROLE_NAME}\n${error.message}`);
    } else {
      throw new Error(`Unknown error deleting role ${ROLE_NAME}\n${String(error)}`);
    }
  }
};