# NocoDB Docker Integration

This directory stores configuration files for running [NocoDB](https://github.com/nocodb/nocodb) in the ChatSuite monorepo.

## Features

- Uses the official `nocodb/nocodb` Docker image
- Persists project files in `./data/nocodb`
- Connects to the shared PostgreSQL service using the `NC_DB` variable
- Accessible through the nginx reverse proxy at `https://localhost:10443/nocodb`

## Auto-upstall

NocoDB provides an **Auto-upstall** script that installs all prerequisites and generates a production ready compose setup. You can run it with:

```bash
bash <(curl -sSL http://install.nocodb.com/noco.sh) <(mktemp)
```

The script automatically upgrades NocoDB when re-run and sets up SSL certificates. See the [official documentation](https://github.com/nocodb/nocodb/tree/develop/docker-compose/1_Auto_Upstall) for details.
