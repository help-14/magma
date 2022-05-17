# Getting started

## Install Docker

If you don't have Docker and Docker Compose yet, use the command below to install.

```
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

```
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

## Getting Magma

Create [docker-compose.yml](https://github.com/help-14/magma/blob/main/docker-compose.yml) or download it from Github:

```
services:
  magma:
    container_name: magma
    image: help14/magma
    restart: unless-stopped
    volumes:
      - ./data/:/app/data
    ports:
      - '7001:7001'
  watchtower:
    image: containrrr/watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json
    command: --interval 30
```

Start the container:

```
docker-compose up -d
```

Go to your dashboard `http://localhost:7001` to check if everything go smoothly.

## Update Magma automatically

To get our regular update, you should install watchtower too. We added it to docker compose, but if you already had or don't want to then remove it.