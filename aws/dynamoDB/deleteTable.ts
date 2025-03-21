import { DynamoDBClient, DeleteTableCommand } from "@aws-sdk/client-dynamodb";

const tableName = "RabbitoryTable";

export const deleteTable = async (region: string) => {
  const client = new DynamoDBClient({ region: region });
  try {
    const command = new DeleteTableCommand({ TableName: tableName });
    await client.send(command);
  } catch (err) {
    if (err instanceof Error && err.name === "ResourceNotFoundException") {
      return; // Table does not exist, nothing to delete
    }
    throw new Error(`Error deleting table\n${err instanceof Error ? err.message : String(err)}`);
  }
};
