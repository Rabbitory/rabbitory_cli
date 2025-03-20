import { DynamoDBClient, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const tableName = "RabbitoryTable";

export const deleteTable = async () => {
  try {
    const command = new DeleteTableCommand({ TableName: tableName });
    await client.send(command);
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "ResourceNotFoundException") {
        console.log(`Table "${tableName}" does not exist.`);
      } else {
        throw new Error(`Error deleting table\n${err.message}`);
      }
    } else {
      throw new Error(`Unknown error deleting table\n${String(err)}`);
    }
  }
};