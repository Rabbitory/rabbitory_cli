import { 
  EC2Client, 
  DescribeVpcsCommand, 
  CreateSecurityGroupCommand, 
  AuthorizeSecurityGroupIngressCommand, 
  AuthorizeSecurityGroupEgressCommand 
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

    // Get the default VPC if available
    const defaultVpc = response.Vpcs.find((vpc) => vpc.IsDefault);
    if (defaultVpc?.VpcId) {
      console.log(`Found default VPC ID.`);
      return defaultVpc.VpcId;
    }

    // Fallback: Return the first available VPC
    console.warn("No default VPC found, using the first available VPC.");
    return response.Vpcs[0].VpcId!;
  } catch (error) {
    console.error("Error retrieving VPC ID:", error);
    throw error;
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

    console.log(`Security Group Created: ${createSGResponse.GroupId}`);
    return createSGResponse.GroupId;
  } catch (error) {
    console.error("Error creating security group:", error);
    throw error;
  }
};

const authorizeIngressTraffic = async (securityGroupId: string): Promise<void> => {
  try {
    const ingressRules = [
      { IpProtocol: "tcp", FromPort: 22, ToPort: 22, IpRanges: [{ CidrIp: "0.0.0.0/0" }] }, // SSH
      { IpProtocol: "tcp", FromPort: 80, ToPort: 80, IpRanges: [{ CidrIp: "0.0.0.0/0" }] }, // HTTP
      { IpProtocol: "tcp", FromPort: 443, ToPort: 443, IpRanges: [{ CidrIp: "0.0.0.0/0" }] }, // HTTPS
      { IpProtocol: "tcp", FromPort: 3000, ToPort: 3000, IpRanges: [{ CidrIp: "0.0.0.0/0" }] }, // Next.js app on port 3000
    ];

    const authorizeIngressCommand = new AuthorizeSecurityGroupIngressCommand({
      GroupId: securityGroupId,
      IpPermissions: ingressRules,
    });

    await ec2Client.send(authorizeIngressCommand);
    console.log("Ingress rules set up successfully for RabbitoryEngineSG");
  } catch (error) {
    console.error("Error authorizing ingress rules:", error);
    throw error;
  }
};

export const setupRabbitorySG = async (): Promise<string> => {
  try {
    const vpcId = await getVpcId();
    const securityGroupId = await createRabbitoryEngineSG(vpcId);
    await authorizeIngressTraffic(securityGroupId);
    
    console.log("Security group setup completed successfully for RabbitoryEngineSG.");
    return securityGroupId;
  } catch (err) {
    console.error("Error setting up RabbitoryEngineSG:", err);
    throw err;
  }
};