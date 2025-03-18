import { DynamoDBClient, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const tableName = "RabbitoryTable";

export const deleteTable = async (tableName: string) => {
  try {
    const command = new DeleteTableCommand({ TableName: tableName });
    const result = await client.send(command);
    console.log(`Table "${tableName}" deleted successfully.`, result);
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "ResourceNotFoundException") {
        console.log(`Table "${tableName}" does not exist.`);
      } else {
        console.error("Error deleting table:", err);
      }
    } else {
      console.log("Unknown error:", err);
    }
  }
};
