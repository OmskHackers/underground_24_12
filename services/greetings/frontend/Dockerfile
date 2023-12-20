FROM node:16

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

COPY . /usr/src/nuxt-app/

RUN npm install

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3001

EXPOSE 3001

CMD ["npm", "run", "dev"]
