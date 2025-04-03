import { getRabbitoryUrl } from "./getRabbitoryUrl";
import cliProgress from 'cli-progress';
import chalk from 'chalk';

const MAX_WAIT_TIME_MS = 6 * 60 * 1000; // 6 minutes
const POLL_INTERVAL_MS = 15000; // 15 seconds

export const getReadyRabbitoryUrl = async (instanceId: string, region: string): Promise<string> => {
  const endpoint: string | null = await getRabbitoryUrl(instanceId, region);
  if (!endpoint) {
    throw new Error(`Failed to retrieve endpoint for instance ${instanceId} in region ${region}`);
  }
  
  const progressBar = new cliProgress.SingleBar({
    format: `${chalk.green('Waiting for application to be ready...')} [{bar}] {percentage}% | ETA: {eta_formatted}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  
  const totalIterations = Math.ceil(MAX_WAIT_TIME_MS / POLL_INTERVAL_MS);
  progressBar.start(totalIterations, 0);

  const startTime = Date.now();
  let iteration = 0;

  const DEBUG = false; // Change to true for debugging
  
  while (Date.now() - startTime < MAX_WAIT_TIME_MS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout each fetch after 5 seconds
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        progressBar.update(totalIterations);
        progressBar.stop();
        return endpoint;
      }
    } catch (error) {
      if (DEBUG) console.error("Error checking app status:", error);
    }
    
    iteration++;
    progressBar.update(iteration);
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  
  progressBar.stop();
  throw new Error(`Application at ${endpoint} did not become ready within ${MAX_WAIT_TIME_MS / 60000} minutes`);
};
