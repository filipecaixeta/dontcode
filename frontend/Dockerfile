FROM library/node:10-alpine

WORKDIR /frontend

RUN yarn global add @vue/cli@3.6.3 typescript@3.4.4

COPY package.json /frontend/package.json

RUN yarn

CMD yarn serve