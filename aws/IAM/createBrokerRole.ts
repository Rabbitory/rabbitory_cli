import {
  IAMClient,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  CreateInstanceProfileCommand,
  AddRoleToInstanceProfileCommand,
  CreateRoleResponse,
} from "@aws-sdk/client-iam";

const REGION = "us-east-1";
const client = new IAMClient({ region: REGION });

export const ROLE_NAME = "RMQBrokerRole";
export const INSTANCE_PROFILE_NAME = "RMQBrokerInstanceProfile";

const ROLE_REQUEST = {
  AssumeRolePolicyDocument: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "ec2.amazonaws.com",
        },
        Action: "sts:AssumeRole",
      },
    ],
  }),
  RoleName: ROLE_NAME,
};

const createBrokerRole = async (): Promise<void> => {
  try {
    const command = new CreateRoleCommand(ROLE_REQUEST);
    const response: CreateRoleResponse = await client.send(command);

    if (!response.Role?.Arn) {
      throw new Error("Role or Role ARN is undefined");
    }
  } catch (error) {
    throw new Error(`Failed to create role: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const attachDynamoDBPolicy = async () => {
  try {
    const command = new AttachRolePolicyCommand({
      RoleName: ROLE_NAME,
      PolicyArn: "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
    });
    await client.send(command);
  } catch (error) {
    throw new Error(`Failed to attach one or more policies: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const createInstanceProfile = async (): Promise<string> => {
  try {
    const command = new CreateInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
    });
    await client.send(command);
    return INSTANCE_PROFILE_NAME;
  } catch (error) {
    throw new Error(`Failed to create instance profile: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const addRoleToInstanceProfile = async (): Promise<void> => {
  try {
    const command = new AddRoleToInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
      RoleName: ROLE_NAME,
    });
    await client.send(command);
  } catch (error) {
    throw new Error(`Failed to add role to instance profile: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const createRMQBrokerIAM = async (): Promise<string> => {
  try {
    await createBrokerRole();
    await attachDynamoDBPolicy();
    const instanceProfile = await createInstanceProfile();
    await addRoleToInstanceProfile();
    return instanceProfile;
  } catch (error) {
    throw new Error(`Error setting up IAM components: ${error}`);
  }
};