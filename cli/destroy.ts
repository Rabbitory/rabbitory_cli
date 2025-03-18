import { deleteTable } from "../aws/dynamoDB/removeTable";

export const destroy = async () => {
  const tableName = "RabbitoryTable";

  await deleteTable(tableName);
}
