FROM node:20.18-bullseye-slim AS app

WORKDIR /var/www/app

RUN npm i -g @nestjs/cli

COPY ./package*.json ./

RUN npm install

COPY .env ./

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start" ]

FROM node:20.18-bullseye-slim AS db-actions-build

WORKDIR /var/www/app

# install only sequelize dependencies
RUN npm i -g sequelize-cli; \
    npm i pg pg-hstore sequelize dotenv

COPY ./database ./

COPY .env ./

COPY ./scripts/database-actions.sh ./

RUN chmod +x ./database-actions.sh
