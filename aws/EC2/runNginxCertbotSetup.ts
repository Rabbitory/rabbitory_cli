import { SSMClient, SendCommandCommand } from "@aws-sdk/client-ssm";
import { getRegion } from "../../cli/utils/region";

export async function runNginxCertbotSetup(
  instanceId: string,
  domain: string,
  email: string
): Promise<void> {
  const region = getRegion();
  const ssmClient = new SSMClient({ region });

  const commands = [
    "sudo apt-get update -y",
    "sudo apt-get install -y nginx snapd",
    "sudo snap install core",
    "sudo snap refresh core",
    "sudo snap install --classic certbot",
    "sudo ln -s /snap/bin/certbot /usr/bin/certbot",
    "sudo systemctl start nginx",
    "sudo systemctl enable nginx",

    `sudo bash -c 'cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name ${domain} www.${domain};

    location / {
        root /var/www/html;
        index index.html;
    }
}
EOF'`,
    "sudo systemctl reload nginx",

    `sudo certbot certonly --webroot -w /var/www/html --non-interactive --agree-tos --email ${email} -d ${domain} -d www.${domain}`,

    `sudo bash -c 'cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name ${domain} www.${domain};
    return 301 https://\\$host\\$request_uri;
}

server {
    listen 443 ssl;
    server_name ${domain} www.${domain};

    ssl_certificate "/etc/letsencrypt/live/${domain}/fullchain.pem";
    ssl_certificate_key "/etc/letsencrypt/live/${domain}/privkey.pem";
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }
}
EOF'`,

    "sudo systemctl reload nginx",
  ];

  const commandObj = new SendCommandCommand({
    InstanceIds: [instanceId],
    DocumentName: "AWS-RunShellScript",
    Parameters: {
      commands,
    },
  });

  await ssmClient.send(commandObj);
}
