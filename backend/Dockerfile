FROM library/node:10-alpine

WORKDIR /app

COPY package.json /app

RUN yarn

CMD [ "yarn", "dev" ]
