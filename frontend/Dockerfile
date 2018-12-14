FROM library/node:10-alpine

WORKDIR /app

RUN yarn global add vue-cli

COPY package.json /app

RUN yarn

RUN pwd && ls .

CMD [ "npm", "run", "dev" ]
