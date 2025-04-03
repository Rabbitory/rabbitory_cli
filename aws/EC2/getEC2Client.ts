import { EC2Client } from "@aws-sdk/client-ec2";
import { promptUserForRegion } from "../../cli/utils/promptUserForRegion";

let ec2Client: EC2Client | null = null;

export const getEC2Client = async () => {
  if (!ec2Client) {
    const region = await promptUserForRegion();
    ec2Client = new EC2Client({ region });
  }
  return ec2Client;
};
