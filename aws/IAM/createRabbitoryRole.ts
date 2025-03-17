import { CreateRoleCommand, IAMClient } from "@aws-sdk/client-iam";

const REGION = 'us-east-1';
const ROLE_NAME = "RabbitoryRole";
const ROLE_REQUEST = {
  AssumeRolePolicyDocument: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "ec2.amazonaws.com", // we are placing backend in EC2 to start!
        },
        Action: "sts:AssumeRole",
      },
    ],
  }),
  RoleName: ROLE_NAME,
};

const client = new IAMClient({ region: REGION }); 

export const createRole = async (roleName: string) => {
  try {
    const command = new CreateRoleCommand(ROLE_REQUEST);
    const response = await client.send(command);
    console.log("Role created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating role:", error);
  }
  
}

// createRole(ROLE_NAME);

// Response from client.send() will look like this:

// { // CreateRoleResponse
//   Role: { // Role
//     Path: "STRING_VALUE", // required
//     RoleName: "STRING_VALUE", // required
//     RoleId: "STRING_VALUE", // required
//     Arn: "STRING_VALUE", // required
//     CreateDate: new Date("TIMESTAMP"), // required
//     AssumeRolePolicyDocument: "STRING_VALUE",
//     Description: "STRING_VALUE",
//     MaxSessionDuration: Number("int"),
//     PermissionsBoundary: { // AttachedPermissionsBoundary
//       PermissionsBoundaryType: "PermissionsBoundaryPolicy",
//       PermissionsBoundaryArn: "STRING_VALUE",
//     },
//     Tags: [ // tagListType
//       { // Tag
//         Key: "STRING_VALUE", // required
//         Value: "STRING_VALUE", // required
//       },
//     ],
//     RoleLastUsed: { // RoleLastUsed
//       LastUsedDate: new Date("TIMESTAMP"),
//       Region: "STRING_VALUE",
//     },
//   },
// };CreateRoleCommand, IAMClient, 