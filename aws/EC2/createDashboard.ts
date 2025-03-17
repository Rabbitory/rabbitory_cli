import { EC2Client, RunInstancesCommand } from "@aws-sdk/client-ec2";

import type { RunInstancesCommandInput } from "@aws-sdk/client-ec2";

const REGION = "us-east-2";
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

const createDashboard = async () => {
  const encodedUserData = Buffer.from(userData).toString("base64");

  const params: RunInstancesCommandInput = {
    ImageId: "ami-0cb91c7de36eed2cb", // Ubuntu 24.04 LTS | Region specific
    InstanceType: "t2.micro",
    MinCount: 1,
    MaxCount: 1,
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [{ Key: "Name", Value: "rabbitory-dashboard" }],
      },
    ],

    UserData: encodedUserData,
    SecurityGroupIds: ["sg-0fbcb7b93398dd715"], // Security group ID must be made earlier in setup
  };

  try {
    const data = await ec2Client.send(new RunInstancesCommand(params));
    if (!data.Instances) throw new Error("No instances found");
    console.log("Dashboard instance created:", data.Instances[0].InstanceId);
    return data;
  } catch (err) {
    console.error("Error creating instance:", err);
  }
};
