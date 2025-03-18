import { Command } from "commander";
import { deploy } from "./deploy";
import { destroy } from "./destroy";

const program = new Command();

program
  .name("rabbitory")
  .description("A RabbitMQ Management System")
  .version("0.0.1");

program
  .command("deploy")
  .description("deploy Rabbitory to AWS")
  .action(async () => deploy());

program
  .command("destroy")
  .description("destroy Rabbitory architecture")
  .action(async () => destroy());

program.parse();