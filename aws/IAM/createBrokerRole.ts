import { 
  IAMClient, 
  CreateRoleCommand, 
  AttachRolePolicyCommand, 
  CreateRoleResponse 
} from "@aws-sdk/client-iam";

const REGION = "us-east-1";
const client = new IAMClient({ region: REGION });

export const ROLE_NAME = "RMQBrokerRole";

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

const createBrokerRole = async (): Promise<string | null> => {
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
    return null;
  }
};

const attachDynamoDBPolicy = async () => {
  try {
    const policyArn = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess";
    
    const command = new AttachRolePolicyCommand({
      RoleName: ROLE_NAME,
      PolicyArn: policyArn,
    });

    await client.send(command);
    console.log(`Policy attached successfully: ${policyArn}`);
  } catch (error) {
    console.error("Error attaching policy:", error);
  }
};

export const setupRoleWithPolicy = async () => {
  const roleArn = await createBrokerRole();
  if (roleArn) {
    await attachDynamoDBPolicy();
  }
};

setupRoleWithPolicy();