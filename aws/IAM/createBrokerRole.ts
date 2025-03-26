import {
  IAMClient,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  CreateInstanceProfileCommand,
  AddRoleToInstanceProfileCommand,
  CreateRoleResponse,
  IAM,
} from "@aws-sdk/client-iam";

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

const createBrokerRole = async (client: IAMClient): Promise<void> => {
  try {
    const command = new CreateRoleCommand(ROLE_REQUEST);
    const response: CreateRoleResponse = await client.send(command);

    if (!response.Role?.Arn) {
      throw new Error("Role or Role ARN is undefined");
    }
  } catch (error) {
    throw new Error(`Failed to create role\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const attachRMQBrokerPolicies = async (client: IAMClient): Promise<void> => {
  const policies = [
    "arn:aws:iam::aws:policy/AmazonSSMFullAccess",
    "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  ];

  try {
    for (const policyArn of policies) {
      const command = new AttachRolePolicyCommand({
        RoleName: ROLE_NAME,
        PolicyArn: policyArn,
      });
      await client.send(command);
    }
  } catch (error) {
    throw new Error(`Failed to attach one or more policies\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const createInstanceProfile = async (client: IAMClient): Promise<string> => {
  try {
    const command = new CreateInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
    });
    await client.send(command);
    return INSTANCE_PROFILE_NAME;
  } catch (error) {
    throw new Error(`Failed to create instance profile\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const addRoleToInstanceProfile = async (client: IAMClient): Promise<void> => {
  try {
    const command = new AddRoleToInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
      RoleName: ROLE_NAME,
    });
    await client.send(command);
  } catch (error) {
    throw new Error(`Failed to add role to instance profile\n${error instanceof Error ? error.message : String(error)}`);
  }
};

export const createRMQBrokerIAM = async (region: string): Promise<void> => {
  const client = new IAMClient({ region: region });

  try {
    await createBrokerRole(client);
    await attachRMQBrokerPolicies(client);
    await createInstanceProfile(client);
    await addRoleToInstanceProfile(client);
  } catch (error) {
    throw new Error(`Error setting up IAM components\n${error}`);
  }
};
