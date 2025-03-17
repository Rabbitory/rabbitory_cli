import { CreateRoleCommand, AttachRolePolicyCommand, IAMClient, CreateRoleResponse } from "@aws-sdk/client-iam";

const REGION = 'us-east-1';
const client = new IAMClient({ region: REGION });

export const ROLE_NAME = "RabbitoryRole";

// Role creation request
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

const createRabbitoryRole = async (): Promise<string | null> => {
  try {
    const command = new CreateRoleCommand(ROLE_REQUEST);
    const response: CreateRoleResponse = await client.send(command);

    if (response.Role && response.Role.Arn) {
      console.log("Role created successfully:", response.Role.Arn);
      return response.Role.Arn; // Return the ARN
    } else {
      console.error("Error: Role or Role ARN is undefined");
      return null;
    }
  } catch (error) {
    console.error("Error creating role:", error);
    return null; // Return null in case of error
  }
};

const policies = [
  "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess",
  "arn:aws:iam::aws:policy/AmazonEC2FullAccess",
];

const attachPolicy = async (policyArn: string) => {
  try {
    const command = new AttachRolePolicyCommand({
      RoleName: ROLE_NAME,
      PolicyArn: policyArn,
    });
    await client.send(command);
    console.log(`Policy ${policyArn} attached successfully`);
  } catch (error) {
    console.error(`Error attaching policy ${policyArn}:`, error);
  }
};

const attachRabbitoryPolicies = async () => {
  try {
    for (const policy of policies) {
      await attachPolicy(policy);
    }
  } catch (error) {
    console.error("Error attaching policies:", error);
  }
};

export const setupRabbitoryRoleWithPolicy = async () => {
  try {
    const roleArn = await createRabbitoryRole();
    if (roleArn) {
      await attachRabbitoryPolicies();
    } else {
      console.error("Role creation failed, policies not attached.");
    }
  } catch (error) {
    console.error("Error in creating role and attaching policies:", error);
  }
};

// setupRabbitoryRoleWithPolicy();