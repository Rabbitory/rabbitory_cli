import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const REGION = 'us-east-1';
const client = new DynamoDBClient({ region: REGION });

// might want to extract to own file if needed elsewhere
const tableExists = async (tableName: string) => {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`Table "${tableName}" already exists.`);
    return true;
  } catch (err) {
    if (err.name !== 'ResourceNotFoundException') {
      console.error('Error checking table existence:', err);
    } else {
      return false;
    }
  }
}

export const createTable = async () => {
  const tableName = 'RabbitoryTable';

  if (await tableExists(tableName)) return;

  const command = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [
      { AttributeName: 'MessageType', KeyType: 'HASH' },
      { AttributeName: 'MessageID', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'MessageType', AttributeType: 'S' },
      { AttributeName: 'MessageID', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  });

  try {
    const result = await client.send(command);
    console.log('Table created:', result);
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

createTable();
