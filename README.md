<a name="top"></a>
![rabbitory logo](https://raw.githubusercontent.com/your-username/rabbitory/main/assets/rabbitory-logo.png)

[![npm version](https://img.shields.io/npm/v/rabbitory)](https://www.npmjs.com/package/rabbitory)
~add real npm package here~

# Rabbitory CLI

**Rabbitory CLI** is a command-line interface tool designed to streamline the deployment of the Rabbitory Control Panel infrastructure on AWS. With Rabbitory CLI, you can effortlessly integrate with your AWS environment and automatically provision the resources needed to manage your RabbitMQ instances on the Cloud.

## 🛠 Features

### Seamless AWS Integration

By using your AWS CLI configuration, Rabbitory provisions the Control Panel infrastructure in your preferred AWS user account. Rabbitory CLI also allows you to choose your preferred region for deploying this infrastructure with 20 different regions to choose from.

### Deployment Automation

Rabbitory CLI handles the full deployment lifecycle of your Rabbitory infrastructure — with zero manual setup. It creates the following resources for you:

- ✔️ IAM Roles
- ✔️ IAM Instance Profiles
- ✔️ Security Groups
- ✔️ EC2 (Rabbitory Control Panel)
- ✔️ DynamoDB Tables

All Rabbitory AWS resources follow the principle of least privilege, meaning they are granted the minimum permissions needed to perform their tasks — nothing more.

### Automated Rollback

If any step of the deployment process fails, Rabbitory CLI will automatically rollback all changes to leave your AWS environment clean and consistent.

## 📦 Installation

### Prerequisites

Before installing Rabbitory, ensure that you have the following installed:

- **Node.js**: Version 18 or higher. If you need to install Node.js, you can do so [here](https://nodejs.org/).

- **npm**: Node.js package manager, which comes bundled with Node.js.

- **AWS Command Line Interface (AWS CLI)**: This is essential for authenticating with your AWS account. If you haven't installed it yet, follow the [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html). After installing AWS CLI, please proceed to configure your AWS.

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

After entering this command, you'll be prompted to enter your preferred AWS global region, then your preferred AWS region code.

<p align="left">
  <img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/assets/select-global-region-ex.png" alt="select-global-region" width="60%" />
</p>
<p align="left">
  <img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/assets/select-aws-region-ex.png" alt="select-aws-region" width="60%" />
</p>

Upon deployment, Rabbitory spins up all the necessary AWS infrastructure for you to self-host your personal Rabbitory Control Panel, where you can create, configure, and manage your RabbitMQ instances. Once Rabittory has been successfully deployed, you'll receive a link to your Control Panel.

![Deploy success](https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/assets/rabbitory-deploy-success.png)

### Tearing down Rabbitory

If you need to teardown your Rabbitory Control Panel and all of its associated RabbitMQ instances, you can run the following command:

```
rabbitory destroy
```

Tearing down Rabbitory involves selecting the global region and AWS region code where your Rabbitory Control Panel was initially deployed. Then, all AWS resources that were created will be automatically deleted for you, leaving you with a clean AWS environment.

<p align="left">
  <img src="https://raw.githubusercontent.com/Rabbitory/rabbitory_cli/assets/rabbitory-destroy-success.png" alt="select-aws-region" width="80%" />
</p>

---

🤝 Developed By: Jacqueline Amherst | Zijin Gong | Laren Cozart | Mason Abruzzesse

-->create links for our names to our github overview pages
