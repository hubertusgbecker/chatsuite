# MindsDB Docker Integration for ChatSuite

This directory contains configuration and documentation for running MindsDB as a Docker container in the ChatSuite monorepo.

## Usage

- The MindsDB container is managed via `docker-compose.yaml` at the project root.
- Data is persisted in the `mdb_data` Docker volume.
- Default ports exposed: 47334 (HTTP), 47335 (MySQL), 47337, 47338.
- To override the default MindsDB configuration, place a `mindsdb_config.json` file in this directory and uncomment the config mount in `docker-compose.yaml`.

## Start MindsDB

```sh
docker compose up -d chatsuite-mindsdb
```

## Stop MindsDB

```sh
docker compose stop chatsuite-mindsdb
```

## Access MindsDB Editor

Open http://127.0.0.1:47334 in your browser.

## Persistent Storage

All MindsDB data is stored in the `mdb_data` Docker volume and will persist across restarts.

## Custom Configuration (Optional)

To override MindsDB's default config, edit `mindsdb_config.json` and uncomment the config mount in `docker-compose.yaml`.

## Reference

- [MindsDB Docker Documentation](https://docs.mindsdb.com/installation/docker)
