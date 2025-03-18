import {
  IAMClient,
  ListAttachedRolePoliciesCommand,
  DetachRolePolicyCommand,
  RemoveRoleFromInstanceProfileCommand,
  DeleteInstanceProfileCommand,
  DeleteRoleCommand,
} from "@aws-sdk/client-iam";
import { ROLE_NAME, INSTANCE_PROFILE_NAME } from "./createRabbitoryRole";

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
          console.log(`Detached policy: ${policy.PolicyArn}`);
        }
      }
    }
  } catch (error: unknown) {
    console.error("Error detaching policies:", error);
    throw error;
  }
};

const removeRoleFromInstanceProfile = async () => {
  try {
    const removeRoleCommand = new RemoveRoleFromInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
      RoleName: ROLE_NAME,
    });
    await client.send(removeRoleCommand);
    console.log(`Role ${ROLE_NAME} removed from instance profile.`);
  } catch (error: unknown) {
    if (isAwsError(error) && error.name === "NoSuchEntityException") {
      console.warn("Role is not attached to any instance profile. Skipping.");
    } else {
      console.error("Error removing role from instance profile:", error);
      throw error;
    }
  }
};

const deleteInstanceProfile = async () => {
  try {
    const deleteProfileCommand = new DeleteInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
    });
    await client.send(deleteProfileCommand);
    console.log(`Instance profile ${INSTANCE_PROFILE_NAME} deleted successfully.`);
  } catch (error: unknown) {
    if (isAwsError(error) && error.name === "NoSuchEntityException") {
      console.warn("Instance profile does not exist. Skipping deletion.");
    } else {
      console.error("Error deleting instance profile:", error);
      throw error;
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
    console.log(`Role ${ROLE_NAME} deleted successfully.`);
  } catch (error: unknown) {
    console.error("Error deleting role:", error);
  }
};