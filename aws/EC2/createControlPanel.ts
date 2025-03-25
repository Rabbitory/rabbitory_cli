import {
  EC2Client,
  RunInstancesCommand,
  waitUntilInstanceRunning,
} from "@aws-sdk/client-ec2";
import type { RunInstancesCommandInput } from "@aws-sdk/client-ec2";

const NODE_VERSION = "23.9";

const repoUrl = "https://github.com/Rabbitory/rabbitory_control_panel.git";

// const userData = `#!/bin/bash
// sudo apt update
// sudo apt install -y npm
// curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
// export NVM_DIR="/usr/local/nvm"
// [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

// # curl script
// nvm install ${NODE_VERSION}
// nvm use ${NODE_VERSION}

// git clone ${repoUrl}
// cd rabbitory_control_panel
// npm install
// npm run build

// npm install -g pm2
// pm2 start npm --name "rabbitory_control_panel" -- start
// eval "$(pm2 startup | grep 'sudo env')"
// pm2 save
// `;

const userData = `#!/bin/bash
# Redirect all output to a log file for debugging
# exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

# Update and install basic dependencies
apt update -y
apt install -y curl git

# Install Node.js (Node 23.x) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_23.x | bash -
apt install -y nodejs

# Verify Node and npm versions
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"

# Set the home directory as the working directory
cd /home/ubuntu

# Clone your repo
git clone https://github.com/Rabbitory/rabbitory_control_panel.git
echo "git repo 'rabbitory_control_panel' cloned"
cd rabbitory_control_panel || exit 1  # Exit if clone failed

# remove package-lock.json
rm package-lock.json

# Install dependencies and build the app
npm install
echo "installed dependencies with npm!"
sudo npm run build
echo "built next file"

# Install PM2 globally
npm install -g pm2
echo "installed pm2"

# Start the app with PM2
pm2 start npm --name "rabbitory_control_panel" -- start
echo "started pm2"

# Set PM2 to start on system reboot (Ubuntu user)
# pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 start npm --name "rabbitory_control_panel" -- start
eval "$(pm2 startup | grep 'sudo env')"
pm2 save`;

const getImageId = (region: string) => {
  switch (region) {
    case "us-east-1":
      return "ami-084568db4383264d4";
    case "us-east-2":
      return "ami-04f167a56786e4b09";
    case "us-west-1":
      return "ami-04f7a54071e74f488";
    case "us-west-2":
      return "ami-075686beab831bb7f";
    case "ca-central-1":
      return "ami-08355844f8bc94f55";
    case "ap-southeast-1":
      return "ami-01938df366ac2d954";
    case "ap-souteast-2":
      return "ami-0f5d1713c9af4fe30";
    case "ap-northeast-1":
      return "ami-026c39f4021df9abe";
    case "ap-northeast-2":
      return "ami-0d5bb3742db8fc264";
    case "ap-south-1":
      return "ami-0e35ddab05955cf57";
    case "eu-central-1":
      return "ami-03250b0e01c28d196";
    case "eu-north-1":
      return "ami-0c1ac8a41498c1a9c";
    case "eu-west-1":
      return "ami-0df368112825f8d8f";
    case "eu-west-2":
      return "ami-0a94c8e4ca2674d5a";
    case "eu-west-3":
      return "ami-0ae30afba46710143";
    case "sa-east-1":
      return "ami-0d866da98d63e2b42";
    default:
      throw new Error(`Invalid region: ${region}`);
  }
};
export const createControlPanel = async (
  securityGroupId: string,
  region: string
) => {
  const client = new EC2Client({ region: region });

  const encodedUserData = Buffer.from(userData).toString("base64");
  const imageId = getImageId(region);

  const params: RunInstancesCommandInput = {
    ImageId: imageId,
    InstanceType: "t3.small", // t3.small
    MinCount: 1,
    MaxCount: 1,
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [{ Key: "Name", Value: "RabbitoryControlPanel" }],
      },
    ],
    UserData: encodedUserData,
    IamInstanceProfile: { Name: "RabbitoryInstanceProfile" },
    NetworkInterfaces: [
      {
        DeviceIndex: 0,
        AssociatePublicIpAddress: true,
        Groups: [securityGroupId],
      },
    ],
  };

  try {
    const data = await client.send(new RunInstancesCommand(params));
    if (!data.Instances || data.Instances.length === 0) {
      throw new Error("No instances were created");
    }

    const instanceId = data.Instances[0].InstanceId;

    if (typeof instanceId === "string") {
      await waitUntilInstanceRunning(
        { client: client, maxWaitTime: 240 },
        { InstanceIds: [instanceId] }
      );
    }

    return instanceId;
  } catch (err) {
    throw new Error(
      `Error creating instance\n${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
};
