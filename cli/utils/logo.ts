import chalk from "chalk";

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

const mediumLogo = "";

const smallLogo = chalk.bold("🐰 Rabbitory");

export function formatLogo(terminalWidth: number): string {
  const hexNumber = '#ffaa80';

  if (terminalWidth >= 100) {
    return chalk.hex(hexNumber)(fullLogo);
;
  } else if (terminalWidth >= 70) {
    return chalk.hex(hexNumber)(mediumLogo);
  } else {
    return chalk.hex(hexNumber)(smallLogo);
  }
}