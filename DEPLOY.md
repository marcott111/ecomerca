# Despliegue de ECOMERCA en Nexode (cloud.nexode.app)

El proyecto ya está preparado para producción:
- `next.config.ts` → `output: "standalone"` (imagen Docker ligera)
- `Dockerfile` multi-stage (Node 20 + Prisma Postgres)
- `.dockerignore`
- `.env.production.example` (lista de variables de entorno requeridas)

## Paso 1: Crear la base de datos PostgreSQL en Nexode
1. En cloud.nexode.app ve a **Databases → Crear**.
2. Elige PostgreSQL y asigna un nombre (ej. `ecomerca`).
3. Una vez creada, copia la cadena de conexión `postgresql://...` → será tu `DATABASE_URL`.

## Paso 2: Crear el servidor de la app (Compute)
1. En cloud.nexode.app ve a **Compute → Crear**.
2. Sube / referencia la imagen Docker del proyecto (o ejecuta el contenedor desde el repo con el `Dockerfile` en la raíz).
3. Expón el puerto **3000** (el contenedor escucha en `0.0.0.0:3000`).
4. Inyecta las variables de entorno de `.env.production.example`, completando:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=<cadena del Paso 1>`
   - `AUTH_SECRET=<secreto robusto>`
   - `WAZEND_*` (tus credenciales de Wazend de producción)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL=<url final>`

## Paso 3: Aplicar el esquema de la base de datos
Ejecuta una vez contra la BD de producción (desde tu máquina o un job en el servidor):

```bash
# Genera el cliente con el esquema Postgres de produccion
npx prisma generate --schema prisma/schema.postgres.prisma

# Aplica las migraciones al esquema (sin servidor dev)
DATABASE_PROVIDER=postgresql \
DATABASE_URL='<cadena del Paso 1>' \
npx prisma db push --schema prisma/schema.postgres.prisma

# Crea el admin y datos demo
DATABASE_PROVIDER=postgresql \
DATABASE_URL='<cadena del Paso 1>' \
npm run db:seed
```

> `db push` crea las tablas desde el esquema. Si prefieres migraciones versionadas, usa `prisma migrate deploy`.

## Paso 4: Dominio / subdominio
1. En Nexode → **Domains → Registrar** un subdominio (ej. `ecomerca.<tu-sub>.<base>.nexode.app`).
2. Apúntalo al servidor compute (proxy al puerto 3000).
3. Actualiza `NEXT_PUBLIC_APP_URL` con el subdominio final y reinicia el contenedor.

## Paso 5: Verificar
- Abre el subdominio → debe cargar el catálogo.
- Prueba `/admin` con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Prueba registro por WhatsApp (OTP vía Wazend) y detalle de producto (botón wa.me).

## Notas
- El registro por email quedará en **modo demo** (devuelve el código) si `SMTP_*` está vacío en producción.
- La sesión Wazend de producción debe estar vinculada a tu número real.
