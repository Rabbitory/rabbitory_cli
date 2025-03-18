# rabbitory_cli

Command Line Interface for Rabbitory

Commands for running this code - as of 3/18/25

`npm run build`: builds the ts files into dist folder
`node dist/cli/cli.js deploy`: runs the deploy cli command and builds infrastructure

NOTE: `deploy` command will not complete successfully if ran too quickly after `destroy` — the EC2 instance will take some time to terminate, causing an issue with the security groups. Specifically, since an EC2 instance with the given security groups still technically exists, another EC2 instance will not be created.
Error looks like: `Error creating security group: InvalidGroup.Duplicate: The security group 'RabbitoryEngineSG' already exists for VPC 'vpc-066725293e8553864'`
