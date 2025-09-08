# Custom MindsDB Dockerfile
FROM mindsdb/mindsdb:latest

# Copy entrypoint script and config from the build context root
COPY config/mindsdb/docker-entrypoint-mindsdb.sh /usr/local/bin/docker-entrypoint-mindsdb.sh
COPY config/mindsdb/mindsdb_config.json /docker-entrypoint-initdb.d/mindsdb_config.json

RUN chmod +x /usr/local/bin/docker-entrypoint-mindsdb.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint-mindsdb.sh"]
CMD ["mindsdb"]
