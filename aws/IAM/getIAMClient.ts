import { getRegion } from "../../cli/utils/region";
import { IAMClient } from "@aws-sdk/client-iam";

let iamClient: IAMClient | null = null;

export const getIAMClient = () => {
  if (!iamClient) {
    const region = getRegion();
    iamClient = new IAMClient({ region });
  }
  
  return iamClient;
};

export const setPrivateIAMClientForTesting = (client: IAMClient | null) => {
  iamClient = client;
};