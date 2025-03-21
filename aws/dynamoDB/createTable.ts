import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";

// might want to extract to own file if needed elsewhere
const tableExists = async (tableName: string, client: DynamoDBClient): Promise<boolean> => {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true; // Table exists
  } catch (err) {
    if (err instanceof Error && err.name !== "ResourceNotFoundException") {
      throw new Error(`Error checking table existence\n${err.message}`);
    }
    return false; // Table does not exist
  }
};

export const createTable = async (region: string) => {
  const client = new DynamoDBClient({ region: region });

  const tableName = "RabbitoryTable";

  const exists = await tableExists(tableName, client);
  if (exists) return;

  const command = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [
      { AttributeName: "MessageType", KeyType: "HASH" },
      { AttributeName: "MessageID", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "MessageType", AttributeType: "S" },
      { AttributeName: "MessageID", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  });

  try {
    await client.send(command);
  } catch (err) {
    throw new Error(`Error creating table\n${err instanceof Error ? err.message : String(err)}`);
  }
};
