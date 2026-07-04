FROM node:24.12.0-alpine

WORKDIR /devtinder-be

COPY package*.json .

RUN npm ci 

COPY . .

EXPOSE 3000

CMD [ "node", "src/app.js" ]


