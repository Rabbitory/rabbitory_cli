import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getRegion } from "../../cli/utils/region";

let ddbClient: DynamoDBClient | null = null;

export const getDDBClient = () => {
  if (!ddbClient) {
    const region = getRegion();
    ddbClient = new DynamoDBClient({ region });
  }
  
  return ddbClient;
};

export const setPrivateDDBClientForTesting = (client: DynamoDBClient | null) => {
  ddbClient = client;
};