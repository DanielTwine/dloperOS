# Dloper OS EDU

Includes ClassConnect backend/frontend and first-boot school setup wizard.

## First boot
1. Bring up the stack: `docker compose -f docker-compose/docker-compose.yml up --build`
2. Visit `http://dloper.local/wizard/` or `http://localhost/wizard/`.
3. Submit school name + admin credentials; this calls ClassConnect `/setup/school`.

ClassConnect containers start automatically (compose). Panel available at `/panel`.
