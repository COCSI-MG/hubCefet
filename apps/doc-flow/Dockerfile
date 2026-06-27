FROM node:20.18-bullseye-slim AS app

WORKDIR /var/www/app

# System libraries required by the Puppeteer/Chrome headless browser used for PDF generation
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

RUN npm i -g @nestjs/cli

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start" ]

FROM node:20.18-bullseye-slim AS db-actions-build

WORKDIR /var/www/app

# install only sequelize dependencies
RUN npm i -g sequelize-cli; \
    npm i pg pg-hstore sequelize dotenv

COPY ./database ./

COPY ./scripts/database-actions.sh ./

RUN chmod +x ./database-actions.sh
