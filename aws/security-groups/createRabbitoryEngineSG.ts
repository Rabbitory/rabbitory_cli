import { 
  EC2Client, 
  DescribeVpcsCommand, 
  CreateSecurityGroupCommand, 
  AuthorizeSecurityGroupIngressCommand
} from "@aws-sdk/client-ec2";

const REGION = "us-east-1";
const ec2Client = new EC2Client({ region: REGION });

const getVpcId = async (): Promise<string> => {
  try {
    const command = new DescribeVpcsCommand({});
    const response = await ec2Client.send(command);

    if (!response.Vpcs || response.Vpcs.length === 0) {
      throw new Error("No VPCs found in the region.");
    }

    const defaultVpc = response.Vpcs.find((vpc) => vpc.IsDefault);
    if (defaultVpc?.VpcId) {
       // Get the default VPC if available
      return defaultVpc.VpcId;
    } else if (!response.Vpcs[0].VpcId) {
      // Check if there is a first available VPC, if not throw error
      throw new Error("No VPC ID found in the first available VPC.");
    } else {
      // Fallback: Return the first available VPC
      console.warn("No default VPC found, using the first available VPC.");
      return response.Vpcs[0].VpcId;
    }
  } catch (error) {
    throw new Error(`Failed to retrieve VPC ID: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const createRabbitoryEngineSG = async (vpcId: string): Promise<string> => {
  try {
    const securityGroupName = "RabbitoryEngineSG";
    const description = "Security group for Rabbitory Engine EC2";

    const createSGCommand = new CreateSecurityGroupCommand({
      GroupName: securityGroupName,
      Description: description,
      VpcId: vpcId,
    });

    const createSGResponse = await ec2Client.send(createSGCommand);
    if (!createSGResponse.GroupId) throw new Error("Security Group creation failed");
    return createSGResponse.GroupId;
  } catch (error) {
    throw new Error(`Failed to create security group: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const authorizeIngressTraffic = async (securityGroupId: string): Promise<void> => {
  try {
    const ingressRules = [
      { IpProtocol: "tcp", FromPort: 22, ToPort: 22, CidrIp: "0.0.0.0/0" }, // SSH
      { IpProtocol: "tcp", FromPort: 80, ToPort: 80, CidrIp: "0.0.0.0/0" }, // HTTP
      { IpProtocol: "tcp", FromPort: 443, ToPort: 443, CidrIp: "0.0.0.0/0" }, // HTTPS
      { IpProtocol: "tcp", FromPort: 3000, ToPort: 3000, CidrIp: "0.0.0.0/0" }, // Next.js app on port 3000
    ];

    const authorizeIngressCommand = new AuthorizeSecurityGroupIngressCommand({
      GroupId: securityGroupId,
      IpPermissions: ingressRules,
    });

    await ec2Client.send(authorizeIngressCommand);
  } catch (error) {
    throw new Error(`Failed to authorize ingress traffic: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const setupRabbitorySG = async (): Promise<string> => {
  try {
    const vpcId = await getVpcId();
    const securityGroupId = await createRabbitoryEngineSG(vpcId);
    await authorizeIngressTraffic(securityGroupId);
    return securityGroupId;
  } catch (err) {
    throw new Error(`Error setting up RabbitoryEngineSG: ${err instanceof Error ? err.message : String(err)}`);
  }
};