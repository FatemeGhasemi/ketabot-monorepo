## Ketabot

### Installation
There are two projects in this repository for run the project you should 
build two projects and then run `docker-compose-production.yml`

### SERVER (API)
* `cd ./server`
* `npm i`
* `npm run build`

### BOT (TELEGRAM)
* `cd ./bot`
* `npm i `
* `npm run build`

### RUN
* Create a config file for server based on [Local .env](./server/.env.docker.local) with name `./server/.env.docker.production`
* Create a config file for bot based on [Local .env](./bot/.env.docker.local) with name `./bot/.env.docker.production`
* `docker-compose -f docker-compose-production.yml up`

### EXAMPLE
* You can see the bot in this address `https://t.me/ketaabot`
