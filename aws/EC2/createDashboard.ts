import { EC2Client, RunInstancesCommand } from "@aws-sdk/client-ec2";
import type { RunInstancesCommandInput } from "@aws-sdk/client-ec2";

const REGION = "us-east-1";
const NODE_VERSION = "23.9";

const ec2Client = new EC2Client({ region: REGION });

const repoUrl = "https://github.com/Rabbitory/rabbitory_dashboard.git";

const userData = `#!/bin/bash
sudo apt update
sudo apt install -y npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
export NVM_DIR="/usr/local/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install ${NODE_VERSION}
nvm use ${NODE_VERSION}

git clone ${repoUrl}
cd rabbitory_dashboard
npm install
npm run build

npm install -g pm2
pm2 start npm --name "rabbitory_dashboard" -- start
eval "$(pm2 startup | grep 'sudo env')"
pm2 save
`;

export const createDashboard = async (
  securityGroupId: string,
  IPN: string,
) => {
  const encodedUserData = Buffer.from(userData).toString("base64");

  const params: RunInstancesCommandInput = {
    ImageId: "ami-084568db4383264d4", // Ubuntu 24.04 LTS | Region specific
    InstanceType: "t2.micro",
    MinCount: 1,
    MaxCount: 1,
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [{ Key: "Name", Value: "RabbitoryDashboard" }],
      },
    ],

    UserData: encodedUserData,
    SecurityGroupIds: [securityGroupId],
    IamInstanceProfile: {
      Name: IPN,
    },
  };

  try {
    const data = await ec2Client.send(new RunInstancesCommand(params));
    if (!data.Instances || data.Instances.length === 0) {
      throw new Error("No instances were created");
    }
    return data;
  } catch (err) {
    throw new Error(`Error creating instance: ${err instanceof Error ? err.message : String(err)}`);
  }
};
