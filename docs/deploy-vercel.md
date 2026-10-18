# Despliegue temporal: Vercel Hobby + Supabase Free

Guía paso a paso para publicar la tienda mientras se consigue el hosting real.

> **Este despliegue es provisional.** Vercel Hobby es de uso personal y no
> comercial, así que no es el sitio final de una tienda que vende. Sirve para
> tener la tienda en línea y probar pagos de verdad. Cuando llegue el VPS, se
> sigue el checklist de la sección 10.

---

## 1. Qué es y qué no es

| Pieza | Dónde vive | Por qué |
|---|---|---|
| Código Next.js | Vercel Hobby | Despliegue con el CLI, sin automático |
| Base de datos | Supabase Free (Oregon) | Solo PostgreSQL; no se usa Supabase Auth |
| Imágenes subidas | Supabase Storage, bucket `uploads` | Vercel no tiene disco escribible |
| Fotos del catálogo (`/motos/...`) | En el repo, `public/` | Son archivos estáticos, viajan con el código |
| Llaves de Wompi | Secretos de Vercel | Sandbox hasta que se abra producción |

**El login no se toca.** La tienda usa Auth.js v5 con credenciales contra su
propia tabla `User`. Supabase entra solo como Postgres y como almacenador de
archivos.

**Nota sobre el plan de Vercel:** Hobby es de uso personal, no comercial. Se
usa igual porque es el punto de partida, pero vender con él va contra los
términos. En la práctica: el sitio funciona, pero si Vercel lo revisa puede
cortarlo. El VPS lo resuelve.

---

## 2. Datos del proyecto

| Dato | Valor |
|---|---|
| Referencia de Supabase | `nbexwuloacrpttqibnsb` |
| Región de Supabase | `us-west-2` (Oregon) |
| Región de Vercel | **`pdx1`** (Portland, la más cercana a Oregon) |
| Bucket de imágenes | `uploads`, público |

Las dos URLs de conexión, con la contraseña **fuera** del archivo:

```
# Runtime: pooler de transacción (puerto 6543)
postgresql://postgres.Nbexwuloacrpttqibnsb:<PASS>@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require

# Migraciones: session pooler (puerto 5432)
postgresql://postgres.Nbexwuloacrpttqibnsb:<PASS>@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
```

Los tres parámetros de la primera no son opcionales:

| Parámetro | Qué pasa si falta |
|---|---|
| `pgbouncer=true` | Prisma no sabe que la conexión se corta entre transacciones. Se come el pool y **la web se cae a los 15 minutos** |
| `connection_limit=1` | Cada función abre varias conexiones y se agota el cupo de Supabase |
| `sslmode=require` | Supabase rechaza la conexión |

Se usa el pooler y **no** `db.<ref>.supabase.co` a propósito: la conexión
directa es IPv6-only en el plan gratis y falla desde Windows.

---

## 3. Lo que hay que hacer una vez (en los paneles)

Esto **no se puede automatizar**. Son 5 pasos manuales.

### 3.1 Rotar la contraseña de la base de datos

La contraseña original quedó escrita en un registro de conversación. Hay que
cambiarla en **Supabase → Project Settings → Database**.

### 3.2 Crear el bucket

El bucket es parte de la infraestructura, no un clic, así que se crea por SQL
para que quede versionado y repetible:

```powershell
Get-Content scripts\create-bucket.sql | docker run --rm -i `
  -e PGPASSWORD=<la nueva> postgres:16-alpine `
  psql -v ON_ERROR_STOP=1 `
    -h aws-0-us-west-2.pooler.supabase.com -p 5432 `
    -U postgres.nbexwuloacrpttqibnsb -d postgres
```

Deja el bucket `uploads` público, con tope de 5 MB y conversión a AVIF
automática. Es equivalente a hacerlo en **Storage → New bucket** del panel, pero
repetible.

> El usuario del pooler **no** es `postgres`: es `postgres.nbexwuloacrpttqibnsb`.
> Con el usuario pelado, Supavisor responde `no tenant identifier provided`.

### 3.3 Copiar la llave de servicio

**Project Settings → API Keys → `service_role`** (no `anon`).

Va a `.env.production.local`. Se puede revisar y rotar cuando quieras sin
tocar código.

### 3.4 Instalar y autenticar el CLI

```powershell
npm i -g vercel
vercel login
vercel link
```

`vercel login` abre el navegador. El token queda en tu disco, nunca en el chat.

> **No pongas el token en el chat.** Ese token puede leer todas las variables de
> entorno del proyecto, o sea que filtraría la contraseña de la base y las
> llaves de Wompi.

### 3.5 Crear el archivo local de secretos

Copia `.env.example` a `.env.production.local` y llénalo. Está en
`.gitignore` y en `.vercelignore`, así que nunca se sube.

Además de las variables de la sección 4, el script de transferencia necesita:

```
SUPABASE_POOLER_HOST=aws-0-us-west-2.pooler.supabase.com
SUPABASE_DB_PASSWORD=<la nueva>
SUPABASE_DB_USER=postgres
SUPABASE_DB_NAME=postgres
```

---

## 4. Variables de entorno para Vercel

| Variable | Tipo | Valor |
|---|---|---|
| `DATABASE_URL` | secret | pooler 6543 con `pgbouncer=true&connection_limit=1&sslmode=require` |
| `DIRECT_URL` | secret | session pooler 5432 |
| `AUTH_SECRET` | secret | `openssl rand -base64 32`, distinto al local |
| `AUTH_URL` | secret | `https://<proyecto>.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | config | `https://<proyecto>.vercel.app` |
| `NEXT_PUBLIC_WHATSAPP` | config | `573122779324` |
| `NEXT_PUBLIC_SUPABASE_URL` | config | `https://nbexwuloacrpttqibnsb.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | secret | el `service_role` del punto 3.3 |
| `STORAGE_DRIVER` | config | `supabase` |
| `WOMPI_PUBLIC_KEY` | secret | llave pública de **sandbox** |
| `WOMPI_INTEGRITY_SECRET` | secret | secreto de integridad de sandbox |
| `WOMPI_EVENTS_SECRET` | secret | secreto de eventos de sandbox |
| `CRON_SECRET` | secret | cualquier cadena larga, para el cron |

> `WOMPI_ENV` está en `.env.example` pero **ningún archivo lo lee**. El ambiente
> lo deciden las llaves que pegues.

Las suben todas con un comando, sin que los valores pasen por ninguna
conversación:

```powershell
node scripts/vercel-env-sync.mjs --dry-run   # revisa qué encuentra
node scripts/vercel-env-sync.mjs             # sube
```

---

## 5. Desplegar

```powershell
npm run typecheck
npm run lint
npx vitest run
npm run build

vercel --prod
```

La primera vez, revisá el log del build: la primera compilación en Vercel tarda
varios minutos.

El repositorio de GitHub **sí está conectado**: un push a `main` despliega solo.

Como en Hobby las variables de Preview y Production son las mismas, un preview
recibiría el `DATABASE_URL` de la base real. Eso no se resuelve con el *Ignored
Build Step* —medido en producción, ese comando **cancela el despliegue tanto si
sale con 0 como si sale con 1**, así que tampoco sirve para dejar pasar `main*.

La protección está en `middleware.ts`: en un despliegue de preview, toda
petición que no sea `GET` o `HEAD` responde **503**. Los previews siguen leyendo
—que es lo que sirve para revisar la interfaz— pero no pueden crear pedidos,
borradores ni subir fotos a producción. En local no hay `VERCEL_ENV`, así que
`npm run dev` escribe normal.

> Un preview **sí lee la base de producción**. No compartas esas URLs: en un
> preview se ven pedidos y datos de clientes reales. Si eso molesta, la
> solución limpia es un segundo proyecto de Supabase solo para previews.

Región y ajustes que no expone el CLI:

```powershell
node scripts/vercel-project.mjs         # ver region, ignored build step, git
node scripts/vercel-project.mjs region  # poner pdx1
```

---

## 6. Llevar la base de datos

```powershell
.\scripts\transfer-db.ps1
```

Hace el `pg_dump` de la base local de Docker y lo restaura en Supabase. Dos
detalles que el script resuelve solo:

- El dump se escribe **dentro del contenedor** y se copia. Un
  `pg_dump > archivo.sql` en PowerShell 5.1 mete BOM y rompe el archivo.
- La contraseña va por `PGPASSWORD`, no en la URL. Así los caracteres
  especiales no hay que escaparlos a mano.

Si el proyecto de Supabase está pausado, reactívalo **antes**: el restore falla
contra una base pausada.

### Datos que viajan

La base local tiene 45 productos, 2 usuarios y 1 pedido. Después del restore hay
que revisar dos cosas:

1. **Contraseña del admin.** El dump arrastra el hash anterior. Se cambia con
   el script dedicado, **no** con `npm run db:seed`:
   ```powershell
   $env:ADMIN_EMAIL = "jefe@tecnovo.com"
   $env:ADMIN_PASSWORD = "<la nueva>"
   node scripts/set-admin-password.mjs
   ```
   El script solo hace un UPDATE sobre `User`. El seed borra las motos nuevas
   sin pedidos (`prisma/seed.ts:77`) y reescribe el catálogo entero, así que
   usarlo para cambiar una contraseña hace mucho más de lo pedido.
   Las llaves van por variable de entorno, nunca pegadas en el comando.

2. **Datos de prueba.** El usuario `infantegaleanoyefrisantiago@gmail.com` y el
   pedido #1 son de pruebas. Conviene borrarlos antes del dump si no se quiere
   que aparezcan en producción.

---

## 7. Las cuatro fotos de "TEC-PRO - SEGUNDA"

Hay un anuncio aprobado con cuatro fotos que apuntan a `/uploads/listing/...`.
Esos archivos están en `.gitignore`, así que **no viajan a Vercel**. Sin este
paso, la moto aparece con cuatro imágenes rotas.

```powershell
node scripts/storage-sync.mjs upload --prefix listing public/uploads/listing/*.png
```

El script sube los archivos e imprime el mapeo `clave → URL pública`. Después
hay que actualizar la fila:

```sql
UPDATE "Product"
SET images = ARRAY[
  'https://nbexwuloacrpttqibnsb.supabase.co/storage/v1/object/public/uploads/listing/....png',
  'https://nbexwuloacrpttqibnsb.supabase.co/storage/v1/object/public/uploads/listing/....png',
  'https://nbexwuloacrpttqibnsb.supabase.co/storage/v1/object/public/uploads/listing/....png',
  'https://nbexwuloacrpttqibnsb.supabase.co/storage/v1/object/public/uploads/listing/....png'
]
WHERE id = 'cmvbycken0001ype8tj6hzczw';
```

Las URL salen en la salida del script, copiadas de ahí.

---

## 8. Wompi

El código de pagos **no se toca**. Solo hay que registrar la URL del webhook:

**Wompi → Desarrolladores → Eventos**, ambiente de pruebas:
`https://<proyecto>.vercel.app/api/wompi/events`

Esa URL queda guardada en el panel de Wompi. Si más adelante cambia el dominio,
hay que actualizarla ahí o los pagos dejan de llegar aunque la ruta exista.

Sandbox primero. Las llaves de producción se cambian al final, cuando el
cliente abra su cuenta real.

---

## 9. Verificación

| # | Prueba | Qué mira |
|---|---|---|
| 1 | `/` y `/motos-electricas` con productos | La base responde y las fotos cargan |
| 2 | Login del admin y entrar a `/admin` | Middleware y Auth.js |
| 3 | Crear un producto subiendo dos fotos | Storage y el límite de 4 MB |
| 4 | Catálogo → carrito → checkout de Wompi | Firma de integridad |
| 5 | El webhook marca el pedido como pagado | Checksum e idempotencia |
| 6 | Publicar una moto usada con cinco fotos | El flujo de anuncios, el más frágil |
| 7 | Registrar un distribuidor y aprobarlo | Aprobación de perfil |
| 8 | Exportar pedidos y auditoría legal a CSV | Las dos rutas de exportación |

**Límite de subida:** una foto por petición y 4 MB por foto. No es un capricho:
Vercel corta el body en 4.5 MB y responde `413`. Los clientes ya envían de a
una.

---

## 10. Cuando llegue el VPS

Nada de lo hecho se tira. La base y las imágenes se quedan en Supabase hasta
que se quiera mover todo.

| Paso | Cómo |
|---|---|
| 1. Bajar las imágenes | `node scripts/storage-sync.mjs download --prefix listing` |
| 2. Cambiar el driver | `STORAGE_DRIVER=disk` |
| 3. Reescribir URLs | Las filas con URL de Supabase pasan a `/uploads/...` (UPDATE en la base) |
| 4. Apuntar el dominio | DNS a la IP del VPS, Caddy con el `.com` |
| 5. Actualizar Wompi | La URL del webhook en el panel |
| 6. Apagar Vercel | Borrar el proyecto |

El `Dockerfile` y el `docker-compose.yml` ya están listos y siguen funcionando:
el adaptador de storage tiene los dos drivers, así que la app en el VPS usa
disco sin tocar código.

---

## 11. Problemas conocidos

| Síntoma | Causa | Se arregla con |
|---|---|---|
| La web da 500 después de unos días | Supabase pausó el proyecto | Dashboard → Resume. El cron evita la mayoría, pero no es garantía |
| `413` al subir una foto | La foto pasa de 4 MB | Comprimirla |
| `Can't reach database server` | Falta `pgbouncer=true` en la URL | Corregir `DATABASE_URL` y redesplegar |
| `no tenant identifier provided` | Se usó el usuario `postgres` pelado | El pooler exige `postgres.<referencia>` |
| `NoSuchBucket` en toda subida o descarga | El `id` del bucket no es igual al nombre | `scripts/create-bucket.sql`, que lo deja en `id = name` |
| Imágenes que no cargan | El bucket no es público | Storage → el bucket `uploads` → Public |
| `body must have required property 'prefix'` | Se listó sin `prefix` | Pasarlo siempre; con `""` solo sale la raíz, no los archivos |
| Deploy rechazado: *Edge Function exceeds size limit* | `middleware.ts` volvió a Edge | Dejar `export const runtime = "nodejs"` |
| `500` en `/api/cron/keep-alive` con 404 | Falta `CRON_SECRET` | Agregarla en Vercel |
| Sesión se pierde al navegar | `AUTH_SECRET` cambió entre despliegues | No cambiarla; si hay que rotarla, avisar al cliente |

---

## 12. Tres cosas que no hay que deshacer

**1. `export const runtime = "nodejs"` en `middleware.ts`.** En Edge, `NextAuth`
arrastra `next-auth`, `@auth/core` y `zod` al bundle: 1.03 MB contra el tope de
1 MB del plan Hobby, y el despliegue se rechaza. En Node el tope es de 250 MB.

**2. El `id` del bucket debe ser igual al nombre.** La API de Storage busca por
`id` en la ruta `/object/<id>/<clave>`. Con un UUID en el `id` toda subida y toda
descarga responden `NoSuchBucket`.

**3. RLS activado en `public`, sin políticas.** Es el estado *negar por defecto*
y no le hace nada a la app: Prisma conecta como `postgres`, que tiene
`BYPASSRLS`. Lo que evita es que la llave `anon` —que está hecha para ser
pública— descargue correos, hashes de contraseña y pedidos desde `/rest/v1`.

Si alguna vez hay que dar de alta un bucket o una tabla, que sea por los scripts
de `scripts/`, no a mano en el panel: los tres dejan lo que hace falta y el
panel solo deja la mitad.