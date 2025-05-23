import { createRabbitoryIAM } from "../../aws/IAM/createRabbitoryRole";
import { createRMQBrokerIAM } from "../../aws/IAM/createBrokerRole";
import { createRabbitorySG } from "../../aws/security-groups/createRabbitorySG";
import { createControlPanel } from "../../aws/EC2/createControlPanel";
import { createTable } from "../../aws/dynamoDB/createTable";
import { createRecord } from "../../aws/Route53/createRecord";
import { runWithSpinner } from "../utils/spinner";
import { runNginxCertbotSetup } from "../../aws/EC2/runNginxCertbotSetup";
import { setupAws } from "../utils/setupAws";
import { getRabbitoryIP } from "../../aws/EC2/getRabbitoryIP";
import { handleHostedZoneSetup } from "../../aws/Route53/handleHostedZoneSetup";
import { promptUserForRegionCode } from "../utils/promptUserForAWSRegion";
import { promptUserForCustomDomain } from "../utils/promptUserForDomain";
import { waitForHTTPPropagation } from "../../aws/Route53/waitForHTTPPropagation";
import { destroy } from "./destroy";
import { getReadyRabbitoryUrl } from "../../aws/EC2/getReadyRabbitoryUrl";
import { formatLogo } from "../utils/logo";
import { stdout } from "process";
import chalk from "chalk";
import { getRegion } from "../utils/region";

const TERMINAL_WIDTH = stdout.columns || 80;
const START_MSG = "\nPreparing to setup the Rabbitory Infrastructure...\n";
const RESOURCE_PROVISIONING_MSG = "\nProvisioning AWS Resources for Rabbitory...\n(This usually takes about 2-3 minutes to complete)\n";
const DNS_RECORDS_MSG = "\nCreating DNS Records...\n(This can take between 5 and 30 minutes to complete dependent on DNS record propagation)\n";
const URL_WAIT_MSG = "\nWaiting for Rabbitory Control Panel to be ready...\n(This usually takes about 3-5 minutes to complete)\n";

export const deploy = async () => {
  try {
    setupAws();

    console.log(START_MSG);

    await promptUserForRegionCode();

    const userResponse = await promptUserForCustomDomain();

    console.log(RESOURCE_PROVISIONING_MSG);

    await runWithSpinner(
      "Setting up Rabbitory Contol Panel IAM...",
      () => createRabbitoryIAM(),
      "Created Rabbitory Control Panel IAM role and instance profile"
    );
    await runWithSpinner(
      "Setting up Rabbitmq Broker IAM...",
      () => createRMQBrokerIAM(),
      "Created Rabbitmq Broker IAM role and instance profile"
    );
    await runWithSpinner(
      "Waiting for IAM instance profile to propagate...",
      () => new Promise((resolve) => setTimeout(resolve, 7000)),
      "IAM instance profile propagated"
    );
    const rabbitorySecurityGroupId = await runWithSpinner(
      "Setting up Rabbitory Security Group...",
      () => createRabbitorySG(),
      "Created Rabbitory security group"
    );
    const instanceId = await runWithSpinner(
      "Creating Rabbitory Control Panel EC2 instance...",
      () => createControlPanel(rabbitorySecurityGroupId),
      "Created Rabbitory EC2 instance"
    );
    await runWithSpinner(
      "Creating DynamoDB Table..",
      () => createTable(),
      "Created DynamoDB Table"
    );

    if (userResponse) {
      const { domainName, email } = userResponse;
      const region = getRegion();
      const ip = await getRabbitoryIP(instanceId);
      if (!ip) {
        throw new Error("Rabbitory instance does not have a public IP yet.");
      }
      const zoneResult = await handleHostedZoneSetup(domainName, region);

      console.log(DNS_RECORDS_MSG);

      await runWithSpinner(
        "Creating an A-record for apex domain...",
        () => createRecord(zoneResult.hostedZoneId, domainName, ip, region),
        "Created A-record for apex domain"
      );

      await runWithSpinner(
        "Creating an A-record for www subdomain...",
        () =>
          createRecord(
            zoneResult.hostedZoneId,
            "www." + domainName,
            ip,
            region
          ),
        "Created A-record for www subdomain"
      );

      await runWithSpinner(
        "Waiting for DNS propagation...",
        () => waitForHTTPPropagation(domainName),
        "DNS propagation complete"
      );
      await runWithSpinner(
        "Setting up SSL certificate...",
        () => runNginxCertbotSetup(instanceId, domainName, email),
        "SSL certificate setup complete"
      );
    }

    console.log(URL_WAIT_MSG);

    const rabbitoryUrl = await getReadyRabbitoryUrl(
      instanceId,
      userResponse && `https://${userResponse.domainName}`
    );

    console.log(
      chalk.white(
        `\nThe Rabbitory Control Panel is now available at: ${chalk.cyan(
          rabbitoryUrl
        )}\n`
      )
    );

    console.log(formatLogo(TERMINAL_WIDTH));
  } catch (error) {
    console.error(
      chalk.redBright("\nRabbitory deployment failed\n"),
      error,
      "\n"
    );

    console.log("Rolling back your deployment...");
    await destroy();
    console.log("\nDeployment successfully rolled back.");
    console.log(
      chalk.red(
        "\nPlease check errors to determine reason for deployment failure, and then try running `rabbitory deploy` again.\n"
      )
    );
  }
};
