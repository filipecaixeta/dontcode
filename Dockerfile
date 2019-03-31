FROM library/node:10-alpine as builder

WORKDIR /app

RUN yarn global add @vue/cli

COPY frontend/package.json /app/package.json

RUN yarn

RUN ls

COPY frontend /app

RUN yarn build

# FROM library/node:10-alpine

# COPY --from=builder /app/dist /backend/frontend-dist

WORKDIR /backend

COPY backend/package.json /backend/package.json

RUN yarn

CMD [ "npm", "run", "dev" ]
