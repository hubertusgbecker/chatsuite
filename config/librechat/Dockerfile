# v0.7.9-rc1

# Base node image
FROM node:20-alpine AS node

# Install jemalloc, Python, pip, and uv for MCP support
RUN apk add --no-cache jemalloc python3 py3-pip

# Install modern Python package manager
RUN pip install --break-system-packages --no-cache-dir uv

# Install MCP-related Python packages globally
RUN pip install --break-system-packages --no-cache-dir \
    mcp \
    mcp-email-server

# Install mcp-proxy via uv for streamable HTTP transport
RUN uvx --help > /dev/null 2>&1 && echo "uvx is ready" || echo "uvx not found"

# Set environment variable to use jemalloc
ENV LD_PRELOAD=/usr/lib/libjemalloc.so.2

RUN mkdir -p /app && chown node:node /app
WORKDIR /app

USER node

COPY --chown=node:node . .

RUN \
    # Allow mounting of these files, which have no default
    touch .env ; \
    # Create directories for the volumes to inherit the correct permissions
    mkdir -p /app/client/public/images /app/api/logs ; \
    npm config set fetch-retry-maxtimeout 600000 ; \
    npm config set fetch-retries 5 ; \
    npm config set fetch-retry-mintimeout 15000 ; \
    npm install --no-audit; \
    # React client build
    NODE_OPTIONS="--max-old-space-size=2048" npm run frontend; \
    npm prune --production; \
    npm cache clean --force

RUN mkdir -p /app/client/public/images /app/api/logs

# Node API setup
EXPOSE 3080
ENV HOST=0.0.0.0
CMD ["npm", "run", "backend"]

# Optional: for client with nginx routing
# FROM nginx:stable-alpine AS nginx-client
# WORKDIR /usr/share/nginx/html
# COPY --from=node /app/client/dist /usr/share/nginx/html
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf
# ENTRYPOINT ["nginx", "-g", "daemon off;"]
