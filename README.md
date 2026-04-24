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
  - `/api/*` to backend container port `8080` on `proxy_net` only

### Required env file

Create `~/playground/kasir-toko/.env` on the server. Use `.env.example` as template.

Required keys:
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `APP_CORS_ALLOWED_ORIGINS`
- `NEXT_PUBLIC_API_BASE_URL`
- `APP_SECURITY_USERNAME`
- `APP_SECURITY_PASSWORD_HASH`

Optional keys:
- `APP_SECURITY_PASSWORD` for local development only when no hash is set
- `APP_SESSION_COOKIE_SECURE`
- `SPRING_JPA_HIBERNATE_DDL_AUTO`
- `SPRING_JPA_SHOW_SQL`

Security notes:
- Set `APP_CORS_ALLOWED_ORIGINS` to the exact HTTPS site origin, for example `https://kasir.example.com`.
- Keep `APP_SESSION_COOKIE_SECURE=true` in production.
- Generate `APP_SECURITY_PASSWORD_HASH` with BCrypt and leave `APP_SECURITY_PASSWORD` empty in production.
- The backend service is intentionally not published with a host port in Docker Compose; expose it only through the reverse proxy.
