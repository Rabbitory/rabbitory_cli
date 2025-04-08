import { prompt } from "enquirer";

interface UseCustomDomainResponse {
  useCustomDomain: boolean;
}

interface DomainEmailResponse {
  domainName: string;
  email: string;
}

export const promptUserForCustomDomain =
  async (): Promise<DomainEmailResponse | null> => {
    const useResponse: UseCustomDomainResponse = await prompt([
      {
        type: "confirm",
        name: "useCustomDomain",
        message:
          "Do you want to use a custom domain from Route53 for your app?",
        initial: true,
      },
    ]);

    if (!useResponse.useCustomDomain) {
      console.log("Proceeding with default public IP setup...");
      return null;
    }

    const domainEmailResponse: DomainEmailResponse = await prompt([
      {
        type: "input",
        name: "domainName",
        message: "Enter your Route53 domain (e.g., myapp.com):",
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
