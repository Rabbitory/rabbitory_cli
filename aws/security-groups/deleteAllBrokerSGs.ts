import { deleteRabbitorySG } from "./deleteRabbitorySG";

export const deleteAllSecurityGroups = async (regions: string[]) => {
  try {
    await Promise.all(
      regions.map(async (region) => {
        try {
          await deleteRabbitorySG();
        } catch (error) {
          throw new Error(`Failed to delete security group in region ${region}: ${error}`);
        }
      })
    );
  } catch (error) {
    throw new Error(`Failed to delete all security groups: ${error}`);
  }
};