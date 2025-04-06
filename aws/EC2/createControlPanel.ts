import { RunInstancesCommand, waitUntilInstanceRunning } from "@aws-sdk/client-ec2";
import type { RunInstancesCommandInput } from "@aws-sdk/client-ec2";
import { getEC2Client  } from "./getEC2Client";
import { getRegion } from "../../cli/utils/region";
import { getUbuntuAmiId } from "../AMI/getUbuntuAmiId";


export const createControlPanel = async (
  securityGroupId: string
): Promise<string> => {

  const client = getEC2Client();
  const region = getRegion();
  const imageId = await getUbuntuAmiId(region);

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
