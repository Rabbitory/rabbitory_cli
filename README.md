<a name="top"></a>
![rabbitory logo](https://raw.githubusercontent.com/your-username/rabbitory/main/assets/rabbitory-logo.png)

[![npm version](https://img.shields.io/npm/v/rabbitory)](https://www.npmjs.com/package/rabbitory)
~add real npm package here~

# Rabbitory CLI

**Rabbitory CLI** is a command-line interface tool designed to streamline the deployment of the Rabbitory Control Panel infrastructure on AWS. With Rabbitory CLI, you can effortlessly integrate with your AWS environment and automatically provision the resources needed to manage your Rabbitmq instances on the Cloud.

## 📦 Installation

### Prerequisites

Before installing Rabbitory, ensure that you have the following installed:

- **Node.js**: Version 18 or higher. [Download Node.js](https://nodejs.org/)

- **npm**: Node.js package manager, which comes bundled with Node.js.

- **AWS Command Line Interface (AWS CLI)**: This is essential for authenticating with your AWS account. If you haven't installed it yet, follow the [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html). After installing AWS CLI, please proceed to configure your AWS

### Installing Rabittory CLI

Once your AWS credentials are set up, you can install the Rabbitory CLI by running the following command:

```
npm install -g rabbitory
```

---

## 🐰 Usage

### Deploying Rabbitory

Deploying your self-hosted Rabbitory Control Panel is as easy as running the following command:

```
rabbitory deploy
```

After entering this command, you'll be prompted to enter your preferred AWS global region, then the region associated with your desired availability zone.

<p align="left">
  <img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/laren/cli-readme/assets/select-global-region-ex.png" alt="select-global-region" width="60%" />
</p>
<p align="cenleftter">
  <img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/laren/cli-readme/assets/select-aws-region-ex.png" alt="select-aws-region" width="60%" />
</p>

Upon deployment, Rabbitory spins up all the necessary AWS infrastructure for you to self-host your control panel, where you can create, configure, and manage your Rabbitmq instances. Rabbitory CLI creates the following resources for you:

- ✔️ IAM Roles
- ✔️ IAM Instance Profiles
- ✔️ Security Groups
- ✔️ EC2 (Rabbitory Control Panel)
- ✔️ DynamoDB Tables

Once Rabittory has been successfully deployed, you'll receive a link to your

![Deploy success](https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/laren/cli-readme/assets/rabbitory-deploy-success.png)

### Tearing down Rabbitory

If you need to teardown your Rabbitory Control Panel and all of its associated Rabbitmq instances, you can run:

```
rabbitory destroy
```

Tearing down Rabbitory involves selecting the global region and aws availability zone where your Rabbitory Control Panel was initially deployed. Then, all AWS resources that were created will be automatically deleted for you, leaving you with a clean AWS environment.

![Destroy success](https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/laren/cli-readme/assets/rabbitory-destroy-success.png)

## 🛠 Features

### Seamless AWS Integration & Deployment Automation

Rabbitory CLI handles the full deployment lifecycle of your RabbitMQ environment, including IAM, EC2, DynamoDB, and security groups — with zero manual setup.

### Automatic Deployment Rollback

If any step of the deployment process fails, Rabbitory CLI will automatically roll back all changes to leave your AWS environment clean and consistent.
🤝 Developed By: Jacqueline Amherst | Zijin Gong | Laren Cozart | Mason Abruzzesse

-->create links for our names to our github overview pages
