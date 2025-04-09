import chalk from "chalk";
import { logoHexNum } from "./chalkColors";

const smallLogo = chalk.bold("🐰 Rabbitory");

const logo = "    ____  ___    ____  ____  ______________  ______  __\n" +
  "   / __ \\/   |  / __ )/ __ )/  _/_  __/ __ \\/ __ \\ \\/ /\n" +
  "  / /_/ / /| | / __  / __  |/ /  / / / / / / /_/ /\\  / \n" +
  " / _, _/ ___ |/ /_/ / /_/ // /  / / / /_/ / _, _/ / /  \n" +
  "/_/ |_/_/  |_/_____/_____/___/ /_/  \\____/_/ |_| /_/   "

export function formatLogo(terminalWidth: number): string {
  if (terminalWidth >= 56) {
    return chalk.hex(logoHexNum)(logo);
  } else {
    return chalk.hex(logoHexNum)(smallLogo);
  }
}
