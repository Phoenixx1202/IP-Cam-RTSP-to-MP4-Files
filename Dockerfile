FROM node:20-alpine

WORKDIR /app

RUN apk update && apk add ffmpeg rclone

COPY package*.json ./

RUN npm install

COPY ./ /app

ENV TZ=America/Sao_Paulo

CMD [ "node", "index.js" ]
