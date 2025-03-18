import { 
  CreateRoleCommand, 
  AttachRolePolicyCommand, 
  CreateInstanceProfileCommand,
  AddRoleToInstanceProfileCommand,
  IAMClient, 
  CreateRoleResponse 
} from "@aws-sdk/client-iam";

const REGION = 'us-east-1';
const client = new IAMClient({ region: REGION });

export const ROLE_NAME = "RabbitoryRole";
export const INSTANCE_PROFILE_NAME = "RabbitoryInstanceProfile";

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

const attachRabbitoryPolicies = async () => {
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
  
  try {
    for (const policy of policies) {
      await attachPolicy(policy);
    }
  } catch (error) {
    console.error("Error attaching policies:", error);
  }
};

const createInstanceProfile = async (): Promise<string | null> => {
  try {
    const createProfileCommand = new CreateInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
    });
    await client.send(createProfileCommand);
    console.log(`Instance profile ${INSTANCE_PROFILE_NAME} created successfully`);
    return INSTANCE_PROFILE_NAME;
  } catch (error) {
    console.error("Error creating instance profile:", error);
    return null;
  }
};

const addRoleToInstanceProfile = async (): Promise<boolean> => {
  try {
    const addRoleCommand = new AddRoleToInstanceProfileCommand({
      InstanceProfileName: INSTANCE_PROFILE_NAME,
      RoleName: ROLE_NAME,
    });
    await client.send(addRoleCommand);
    console.log(`Role ${ROLE_NAME} added to instance profile ${INSTANCE_PROFILE_NAME}`);
    return true;
  } catch (error) {
    console.error("Error adding role to instance profile:", error);
    return false;
  }
};

export const createRabbitoryEngineIAM = async (): Promise<string> => {
  try {
    const roleArn = await createRabbitoryRole();
    if (!roleArn) throw new Error("Role creation failed");

    await attachRabbitoryPolicies();
    
    const instanceProfile = await createInstanceProfile();
    if (!instanceProfile) throw new Error("Instance profile creation failed");

    const roleAdded = await addRoleToInstanceProfile();
    if (!roleAdded) throw new Error("Failed to add role to instance profile");

    return instanceProfile;
  } catch (error) {
    console.error("Error in setting up role, policies, or instance profile:", error);
    throw error;
  }
};