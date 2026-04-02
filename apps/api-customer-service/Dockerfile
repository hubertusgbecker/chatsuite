FROM node:24-alpine
RUN apk add --no-cache dumb-init

ENV NODE_ENV production

WORKDIR "/app"
COPY --chown=node:node ./dist/ .

EXPOSE 3333

USER node

CMD ["dumb-init", "node", "main.js"]
