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
3. **Importante:** al construir la imagen pasa la URL de tu base para que se creen las tablas:
   ```
   docker build --build-arg DATABASE_URL='postgresql://u_9c18a851:...@...:5432/db_cd253a94' -t ecomerca .
   ```
   El build ejecutará `prisma db push` automáticamente (crea las tablas `public.Usuario`, `public.Producto`, etc.). Necesita construir **dentro de la red de Nexode** o donde tu base sea alcanzable.
4. Expón el puerto **3000** (el contenedor escucha en `0.0.0.0:3000`).
5. Inyecta las variables de entorno de `.env.production.example`, completando:
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=<cadena del Paso 1>`
   - `AUTH_SECRET=<secreto robusto>`
   - `WAZEND_*` (tus credenciales de Wazend de producción)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL=<url final>`

> Si el `db push` ya se hizo y quieres reconstruir sin reintentarlo, omite el `--build-arg`.

> El **build** crea las tablas (`prisma db push`) y el **admin del panel** (`prisma/_seed-admin.ts`) automáticamente al pasar `--build-arg DATABASE_URL`. Solo es necesario una vez; para reconstruir sin reintentarlo, omite el `--build-arg`.

## Paso 3: (Opcional) Aplicar esquema o cargar datos manualmente
Si no usaste el `--build-arg` o quieres acciones manuales, desde un entorno que alcance la BD (el servidor Nexode o un túnel):

```bash
# Crea las tablas en la BD de produccion
DATABASE_PROVIDER=postgresql \
DATABASE_URL='<cadena del Paso 1>' \
npx prisma db push --schema prisma/schema.postgres.prisma

# Solo asegura el admin del panel (sin datos demo)
DATABASE_PROVIDER=postgresql \
DATABASE_URL='<cadena del Paso 1>' \
npx tsx prisma/_seed-admin.ts

# (Opcional) Cargar admin + vendedor + comprador + productos demo
DATABASE_PROVIDER=postgresql \
DATABASE_URL='<cadena del Paso 1>' \
npm run db:seed
```

> `db push` crea las tablas desde el esquema (los modelos son idénticos en SQLite/Postgres). Si prefieres migraciones versionadas, usa `prisma migrate deploy`.

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
