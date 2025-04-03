import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { getDDBClient } from "./getDDBClient";

const tableName = "RabbitoryInstancesMetadata";

export const deleteTable = async () => {
  const client = getDDBClient();
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
