# kasir-toko

Monorepo for:
- `frontend/` (Next.js)
- `backend/` (Spring Boot)

## Auto Deploy (GitHub Actions + Self-Hosted Runner)

Deployment runs from `.github/workflows/deploy.yml` on every push to `main`.

The workflow:
1. Builds `hazdik-kasir-toko-frontend:latest` from `frontend/`
2. Builds `hazdik-kasir-toko-backend:latest` from `backend/`
3. Runs `docker compose --env-file ~/playground/kasir-toko/.env up -d --force-recreate`
4. Prunes dangling Docker images

### Server prerequisites

- Docker and Docker Compose installed on the same machine as the GitHub self-hosted runner
- External Docker network already created:
  ```bash
  docker network create proxy_net
  ```
- Reverse proxy configured to route:
  - `/` to frontend container port `3010` (host) / `3000` (container)
  - `/api/*` to backend container port `8080` (internal only, no public backend port)

### Required env file

Create `~/playground/kasir-toko/.env` on the server. Use `.env.example` as template.

Required keys:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`
- `NEXT_PUBLIC_API_BASE_URL`

Optional keys:
- `SPRING_JPA_HIBERNATE_DDL_AUTO`
- `SPRING_JPA_SHOW_SQL`
