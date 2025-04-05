# 🐇 Rabbitory CLI

**Rabbitory** is a command-line interface (CLI) tool designed to streamline the deployment and management of RabbitMQ infrastructure on AWS. With Rabbitory, you can effortlessly set up, configure, and manage RabbitMQ instances, security groups, and related resources.

## 📦 Installation

### Prerequisites

Before installing Rabbitory, ensure that you have the following installed:

- **Node.js**: Version 18 or higher. [Download Node.js](https://nodejs.org/)

- **npm**: Node.js package manager, which comes bundled with Node.js.

- **AWS Command Line Interface (AWS CLI)**: This is essential for authenticating with your AWS account. If you haven't installed it yet, follow the [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html).

### Configuring AWS Credentials

Rabbitory interacts with your AWS account to deploy resources. Therefore, it's crucial to configure your AWS credentials. Here's how:

1. **Obtain AWS Access Keys**:

   - Navigate to the AWS Management Console.

   - Go to the **IAM (Identity and Access Management)** section.

   - Create a new user with programmatic access or use an existing user.

   - Attach the necessary policies to grant permissions for EC2, DynamoDB, and Security Groups.

   - Generate an **Access Key ID** and **Secret Access Key**.

2. **Configure AWS CLI**:

   Open your terminal and run:

   ```bash
   aws configure
   ```
