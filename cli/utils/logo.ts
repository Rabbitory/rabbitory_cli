import chalk from "chalk";
import { logoHexNum } from "./chalkColors";

const fullLogo = "\n" +
  " ooooooooo.              .o8        .o8        o8o      .                                  \n" +
  " `888   `Y88.           \"888       \"888        `\"'    .o8                                  \n" +
  "  888   .d88'  .oooo.    888oooo.   888oooo.  oooo  .o888oo  .ooooo.  oooo d8b oooo    ooo \n" +
  "  888ooo88P'  `P  )88b   d88' `88b  d88' `88b `888    888   d88' `88b `888\"\"8P  `88.  .8'  \n" +
  "  888`88b.     .oP\"888   888   888  888   888  888    888   888   888  888       `88..8'   \n" +
  "  888  `88b.  d8(  888   888   888  888   888  888    888 . 888   888  888        `888'    \n" +
  " o888o  o888o `Y888\"\"8o  `Y8bod8P'  `Y8bod8P' o888o   \"888\" `Y8bod8P' d888b        .8'     \n" +
  "                                                                                  .o..P'      \n" +
  "                                                                                  `Y8P'       \n";

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
