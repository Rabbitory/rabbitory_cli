import { AttachRolePolicyCommand, IAMClient } from "@aws-sdk/client-iam";
import { ROLE_NAME } from "./createRabbitoryRole"; // Import role name to ensure consistency

const REGION = 'us-east-1';
const client = new IAMClient({ region: REGION });

// REMINDER: place in order if order matters
const policies = [
  // "arn:aws:iam::aws:policy/AmazonS3FullAccess",
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

export const attachRabbitoryPolicies = async () => {
  try {
    for (const policy of policies) {
      await attachPolicy(policy);
    }
  } catch (error) {
    console.error("Error attaching policies:", error);
  }
};
