import { Command } from "commander";
import { deploy } from "./deploy";

const program = new Command();

program
  .name("rabbitory")
  .description("A RabbitMQ Management System")
  .version("0.0.1");

program
  .command("deploy")
  .description("deploy Rabbitory to AWS")
  .action(async () => deploy());

program.parse();
