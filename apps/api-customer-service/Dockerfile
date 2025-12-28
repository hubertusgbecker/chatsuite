FROM node:25-alpine
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

ENV NODE_ENV production

WORKDIR "/app"
COPY --chown=node:node ./dist/ .

RUN apt-get update \
    && apt-get install -y python3 python3-distutils python3-venv make g++ libssl-dev \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Ensure node-gyp finds Python
ENV PYTHON=/usr/bin/python3

EXPOSE 3333

USER node

CMD ["dumb-init", "node", "main.js"]
