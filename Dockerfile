FROM node:12

WORKDIR /app

ENV PORT=80
ENV API_URL=""
ENV CLIENT_URL=""

COPY package.json ./

RUN npm install

COPY . .

CMD  ["node", "server.js"]