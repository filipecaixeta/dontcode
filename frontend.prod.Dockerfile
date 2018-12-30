FROM library/node:10-alpine as builder

WORKDIR /app

RUN yarn global add @vue/cli

COPY frontend/package.json /app/package.json

RUN yarn

COPY frontend /app

RUN yarn build

FROM nginx:alpine

COPY --from=builder /app/dist /var/www/public

RUN ls /var/www/public

COPY nginx/nginx.conf /etc/nginx/nginx.conf

RUN chmod 755 -R /var/www/public

EXPOSE 80

ENTRYPOINT [ "nginx" ]

CMD [ "-g", "daemon off;" ]