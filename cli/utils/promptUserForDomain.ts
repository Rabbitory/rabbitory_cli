import { prompt } from "enquirer";

interface DeploymentMethodResponse {
  deploymentMethod: string;
}

interface DomainEmailResponse {
  domainName: string;
  email: string;
}

export const promptUserForCustomDomain =
  async (): Promise<DomainEmailResponse | null> => {
    const customDomain = "Use custom domain (https)";
    const defaultPublicIP = "Use default public IP (http only)";

    const useResponse: DeploymentMethodResponse = await prompt([
      {
        type: "select",
        name: "deploymentMethod",
        message: "Choose a deployment method:",
        choices: [
          customDomain,
          defaultPublicIP,
        ],
      },
    ]);

    if (useResponse.deploymentMethod === defaultPublicIP) {
      console.log("Proceeding with default public IP setup...");
      return null;
    }

    const domainEmailResponse: DomainEmailResponse = await prompt([
      {
        type: "input",
        name: "domainName",
        message: "Enter your domain name (e.g., myapp.com):",
        validate: (input: string) =>
          input.trim() !== "" || "Domain name cannot be empty",
      },
      {
        type: "input",
        name: "email",
        message:
          "Enter your email address (for SSL certificate notifications):",
        validate: (input: string) =>
          input.trim() !== "" || "Email cannot be empty",
      },
    ]);

    return domainEmailResponse;
  };
