import {
  EC2Client,
  DescribeVpcsCommand,
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";

const REGION = "us-east-2";
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
      console.log(`Found default VPC ID.`);
      return defaultVpc.VpcId;
    }

    console.warn("No default VPC found, using the first available VPC.");
    return response.Vpcs[0].VpcId!;
  } catch (error) {
    console.error("Error retrieving VPC ID:", error);
    throw error;
  }
};

const createBrokerSecurityGroup = async (vpcId: string): Promise<string> => {
  try {
    const securityGroupName = "BrokerSecurityGroup";
    const description = "Security group for RabbitMQ EC2 instance";

    const createSGCommand = new CreateSecurityGroupCommand({
      GroupName: securityGroupName,
      Description: description,
      VpcId: vpcId,
    });

    const createSGResponse = await ec2Client.send(createSGCommand);
    if (!createSGResponse.GroupId)
      throw new Error("Security Group creation failed");

    console.log(`Security Group Created: ${createSGResponse.GroupId}`);
    return createSGResponse.GroupId;
  } catch (error) {
    console.error("Error creating security group:", error);
    throw error;
  }
};

const authorizeIngressTraffic = async (
  securityGroupId: string,
): Promise<void> => {
  try {
    const ingressRules = [
      { IpProtocol: "tcp", FromPort: 5672, ToPort: 5672, CidrIp: "0.0.0.0/0" }, // RabbitMQ
      {
        IpProtocol: "tcp",
        FromPort: 15672,
        ToPort: 15672,
        CidrIp: "0.0.0.0/0",
      }, // RabbitMQ management UI
      { IpProtocol: "tcp", FromPort: 80, ToPort: 80, CidrIp: "0.0.0.0/0" }, // HTTP
      { IpProtocol: "tcp", FromPort: 443, ToPort: 443, CidrIp: "0.0.0.0/0" }, // HTTPS
      { IpProtocol: "tcp", FromPort: 22, ToPort: 22, CidrIp: "0.0.0.0/0" }, // SSH
    ];

    const authorizeIngressCommand = new AuthorizeSecurityGroupIngressCommand({
      GroupId: securityGroupId,
      IpPermissions: ingressRules,
    });

    await ec2Client.send(authorizeIngressCommand);
    console.log("Ingress rules set up successfully for BrokerSecurityGroup");
  } catch (error) {
    console.error("Error authorizing ingress rules:", error);
    throw error;
  }
};

export const setupBrokerSG = async (): Promise<string> => {
  try {
    const vpcId = await getVpcId();
    const securityGroupId = await createBrokerSecurityGroup(vpcId);
    await authorizeIngressTraffic(securityGroupId);
    // await authorizeEgressTraffic(securityGroupId);

    console.log(
      "Security group setup completed successfully for BrokerSecurityGroup.",
    );
    return securityGroupId;
  } catch (err) {
    console.error("Error setting up RabbitMQSecurityGroup:", err);
    throw err;
  }
};
