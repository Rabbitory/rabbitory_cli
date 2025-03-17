import { Command } from "commander";

const program = new Command();

program
  .name('rabbitory')
  .description('A RabbitMQ Management System')
  .version('0.0.1');

program
  .command('deploy')
  .description('deploy Rabbitory to AWS')
  .action(async () => {
    // Confirm that AWS CLI is installed
    // Confirm that user account is linked to AWS
    // Run IAM script
    // Run EC2 script
    // Run database script
  });

program.parse();
