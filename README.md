# TECNOVO — Tienda virtual de motos, repuestos y accesorios

F0 Setup en curso. Ver `PLAN.md`.

```bash
cp .env.example .env
docker compose up db -d
npm install
npx prisma migrate dev
npm run dev
```
