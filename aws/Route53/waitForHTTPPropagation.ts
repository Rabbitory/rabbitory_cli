export async function waitForHTTPPropagation(
  domain: string,
  timeoutMs: number = 1800000
): Promise<void> {
  const startTime = Date.now();
  const intervalMs = 5000;
  const url = `http://${domain}:3000`;

  let flag = false;
  const DEBUG = false;
  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      const status = response.status;

      if (status >= 200 && status < 600) {
        return;
      }
    } catch (error: unknown) {
      if (!flag) {
        if (error instanceof Error) {
          if (DEBUG) console.error("Error:", error.message);
          flag = true;
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(
    `❌ Site did not become accessible at ${url} within ${timeoutMs}ms`
  );
}
