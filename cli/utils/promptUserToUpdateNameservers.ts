import { prompt } from "enquirer";

export async function promptUserToUpdateNameservers(
  nameServers: string[]
): Promise<void> {
  console.log(
    "\nPlease update your domain registrar's nameservers to the following Route53 nameservers:"
  );
  nameServers.forEach((ns) => console.log(`- ${ns}`));
  console.log(
    "\nAfter updating the nameservers and allowing time for DNS propagation, press Enter to continue."
  );
  await prompt({
    type: "input",
    name: "continue",
    message: "Press Enter to continue...",
  });
}
