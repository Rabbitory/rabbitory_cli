import { RunInstancesCommand, waitUntilInstanceRunning } from "@aws-sdk/client-ec2";
import type { RunInstancesCommandInput } from "@aws-sdk/client-ec2";
import { getEC2Client  } from "./getEC2Client";
import { getRegion } from "../../cli/utils/region";


// const getImageId = () => {
//   const region = getRegion();

//   switch (region) {
//     case "us-east-1":
//       return "ami-084568db4383264d4";
//     case "us-east-2":
//       return "ami-04f167a56786e4b09";
//     case "us-west-1":
//       return "ami-04f7a54071e74f488";
//     case "us-west-2":
//       return "ami-075686beab831bb7f";
//     case "ca-central-1":
//       return "ami-08355844f8bc94f55";
//     case "ap-southeast-1":
//       return "ami-01938df366ac2d954";
//     case "ap-southeast-2":
//       return "ami-0f5d1713c9af4fe30";
//     case "ap-northeast-1":
//       return "ami-026c39f4021df9abe";
//     case "ap-northeast-2":
//       return "ami-0d5bb3742db8fc264";
//     case "ap-south-1":
//       return "ami-0e35ddab05955cf57";
//     case "ap-east-1":
//       return "ami-052c08d70def0ac62"; // Found for ap-east-1 (Hong Kong)
//     case "eu-central-1":
//       return "ami-03250b0e01c28d196";
//     case "eu-north-1":
//       return "ami-0c1ac8a41498c1a9c";
//     case "eu-west-1":
//       return "ami-0df368112825f8d8f";
//     case "eu-west-2":
//       return "ami-0a94c8e4ca2674d5a";
//     case "eu-west-3":
//       return "ami-0ae30afba46710143";
//     case "sa-east-1":
//       return "ami-0d866da98d63e2b42";
//     case "me-south-1":
//       return "ami-0e748500f1b6d4492"; // Found for me-south-1
//     case "me-central-1":
//       return "ami-0e1e1d1535af076a2"; // Found for me-central-1
//     case "af-south-1":
//       return "ami-0aeeebd8b2d3e0b75"; // Found for af-south-1 (Cape Town)
//     default:
//       throw new Error(`Invalid region: ${region}`);
//   }
// };

const getImageId = () => {
  const region = getRegion();

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
  securityGroupId: string
): Promise<string> => {
  const client = getEC2Client();
  const region = getRegion();
  const userData = `#!/bin/bash
  # --- Root-level commands ---
  apt-get update -y
  apt-get install -y curl git

  # Create a minimal .bashrc for the ubuntu user if it doesn't exist
  if [ ! -f /home/ubuntu/.bashrc ]; then
    touch /home/ubuntu/.bashrc
  fi

  # Switch to the ubuntu user to install nvm and Node.js
  su - ubuntu -c '
  export HOME=/home/ubuntu
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
  export NVM_DIR="/home/ubuntu/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 23
  nvm use 23
  echo "Node version: $(node -v)"
  echo "npm version: $(npm -v)"
  '

  # --- Repository Setup (as root) ---
  cd /home/ubuntu
  if [ ! -d "rabbitory_control_panel" ]; then
    su - ubuntu -c 'git clone https://github.com/Rabbitory/rabbitory_control_panel.git'
    echo "git repo 'rabbitory_control_panel' cloned"
  fi

  cd rabbitory_control_panel || exit 1
  rm -f package-lock.json

  cat <<EOF > .env
  REGION=${region}
  EOF

  chown -R ubuntu:ubuntu /home/ubuntu/rabbitory_control_panel

  # --- Switch to ubuntu for App Build and PM2 Setup ---
  su - ubuntu -c '
  export NVM_DIR="/home/ubuntu/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  cd /home/ubuntu/rabbitory_control_panel &&
  npm install &&
  echo "Installed dependencies with npm!" &&
  npm run build &&
  echo "Built Next.js app" &&
  npm install -g pm2 &&
  echo "Installed PM2" &&
  pm2 start npm --name "rabbitory_control_panel" -- start &&
  echo "Started PM2" &&
  pm2 save
  '

  # --- Configure PM2 to start on reboot ---
  # Compute the Node.js binary directory as the ubuntu user by sourcing nvm
  NODE_DIR=$(sudo -u ubuntu bash -c 'export NVM_DIR="/home/ubuntu/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; command -v node | xargs dirname')
  sudo env PATH=$PATH:$NODE_DIR pm2 startup systemd -u ubuntu --hp /home/ubuntu
  `.replace(/^\s+/gm, "");

  const encodedUserData = Buffer.from(userData).toString("base64");
  const imageId = getImageId();

  const params: RunInstancesCommandInput = {
    ImageId: imageId,
    InstanceType: "t3.small",

    MinCount: 1,
    MaxCount: 1,
    TagSpecifications: [
      {
        ResourceType: "instance",
        Tags: [{ Key: "Name", Value: "rabbitory-control-panel" }],
      },
    ],
    UserData: encodedUserData,
    IamInstanceProfile: { Name: "rabbitory-control-panel-instance-profile" },
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

    if (!data.Instances?.length || !data.Instances[0].InstanceId) {
      throw new Error("No instances were created or instance ID is missing");
    }

    const instanceId: string = data.Instances[0].InstanceId;

    await waitUntilInstanceRunning(
      { client, maxWaitTime: 240 },
      { InstanceIds: [instanceId] },
    );

    return instanceId;
  } catch (err) {
    throw new Error(
      `Error creating instance\n${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
};
