pgAdmin on NAS mounts

If your host filesystem (for example SMB/CIFS mounts on Synology) does not support changing ownership from inside the container, you can run the pgAdmin process in the container with the host UID/GID that owns the mounted directory.

Steps:
1. Inspect numeric owner of the mount on the host: `stat -c '%u:%g %n' ./data/pgadmin` or `ls -n ./data | grep pgadmin`.
2. Copy root `.env.example` to `.env` at the repo root and set `HOST_UID` and `HOST_GID`:
   HOST_UID=1026
   HOST_GID=100
3. Recreate the pgAdmin container so it runs with that uid/gid:
   `docker compose up -d --no-deps --build chatsuite_pgadmin`

Notes and warnings:
- Running pgAdmin as a non-root uid may change the behavior of some initialization scripts; verify startup logs.
- Prefer remounting the share with proper uid/gid mapping or using NFS with Unix permissions if possible.
- Always keep a backup of `./data/pgadmin` before changing ownership or remounting.
