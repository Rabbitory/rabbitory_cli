import { EC2Client } from "@aws-sdk/client-ec2";
import { getRegion } from "../../cli/utils/region";

let ec2Client: EC2Client | null = null;

export const getEC2Client = () => {
  if (!ec2Client) {
    const region = getRegion();
    ec2Client = new EC2Client({ region });
  }
  
  return ec2Client;
};

export const setPrivateEC2ClientForTesting = (client: EC2Client | null) => {
  ec2Client = client;
};