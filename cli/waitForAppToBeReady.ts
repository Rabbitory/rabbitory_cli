import { getRabbitoryEndpoint } from "../aws/EC2/getRabbitoryEndpoint";

const MAX_WAIT_TIME_MS = 10 * 60 * 1000; // 10 minutes
const POLL_INTERVAL_MS = 15000; // 15 seconds

export const waitForAppToBeReady = async (instanceId: string, region: string): Promise<string> => {
  const endpoint: string | null = await getRabbitoryEndpoint(instanceId, region);

  if (!endpoint) {
    throw new Error(`Failed to retrieve endpoint for instance ${instanceId} in region ${region}`);
  }

  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME_MS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout request after 5 seconds

      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return endpoint;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("Request timed out, retrying...");
        } else {
          console.log(`App not ready yet, retrying in ${POLL_INTERVAL_MS / 1000} seconds...`);
        }
      } else {
        console.log("An unknown error occurred while checking the app status.");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Application at ${endpoint} did not become ready within ${MAX_WAIT_TIME_MS / 60000} minutes`);
};