FROM node:22

COPY . /app
COPY .docker/config.js /app/lib/config.js
WORKDIR /app
RUN yarn install --production

ENTRYPOINT node .
