FROM node:latest

WORKDIR /usr/app

COPY app/package.json .

RUN npm install -g node-dev
RUN npm install --quiet
COPY app/ .
