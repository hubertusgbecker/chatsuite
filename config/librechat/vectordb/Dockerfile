FROM postgres:16

# Install pgvector extension
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    postgresql-server-dev-16 \
    git \
    ca-certificates \
    rsync && \
    git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git /tmp/pgvector && \
    cd /tmp/pgvector && \
    make && \
    make install && \
    rm -rf /tmp/pgvector && \
    apt-get remove -y build-essential postgresql-server-dev-16 git && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

COPY docker-entrypoint-librechat-vectordb.sh /usr/local/bin/docker-entrypoint-librechat-vectordb.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-librechat-vectordb.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-librechat-vectordb.sh"]
CMD ["postgres"]
