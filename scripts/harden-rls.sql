-- Activa RLS en todas las tablas de public, sin crear ninguna politica.
--
-- POR QUE ES SEGURO PARA LA APP
-- Prisma conecta con el rol postgres, que tiene BYPASSRLS (rolbypassrls = t).
-- RLS no le afecta. El unico cliente de la base es Prisma, asi que la app
-- sigue funcionando igual.
--
-- POR QUE HACE FALTA
-- Supabase deja la Data API (PostgREST) activa de serie en /rest/v1. Con RLS
-- apagado, cualquiera con la llave anon puede leer las tablas de public. Y la
-- llave anon esta hecha para ser publica: viaja en el codigo del navegador.
-- Sin RLS, esa llave descarga:
--   User: correos de clientes y passwordHash (bcrypt, atacable con diccionario)
--   Order: datos personales y de entrega
--   Consent: evidencia de consentimiento con IP, que es archivo legal
--
-- SIN POLITICAS A PROPOSITO: es el estado "negar por defecto". El backend entra
-- por postgres y salta RLS; anon y authenticated se quedan sin ver nada. Las
-- tablas de storage (storage.buckets, storage.objects) son otro esquema y ya
-- tienen sus propias politicas de lectura para las fotos.

alter table "public"."Account"            enable row level security;
alter table "public"."AuditLog"           enable row level security;
alter table "public"."Consent"            enable row level security;
alter table "public"."Course"             enable row level security;
alter table "public"."DistributorProfile" enable row level security;
alter table "public"."HeroSlide"          enable row level security;
alter table "public"."Order"              enable row level security;
alter table "public"."OrderItem"          enable row level security;
alter table "public"."Product"            enable row level security;
alter table "public"."Service"            enable row level security;
alter table "public"."Session"            enable row level security;
alter table "public"."SiteSetting"        enable row level security;
alter table "public"."User"               enable row level security;
alter table "public"."VerificationToken"  enable row level security;
alter table "public"."_prisma_migrations" enable row level security;

-- Comprobacion: las 14 activas y cero politicas en public.
select count(*) filter (where c.relrowsecurity) as con_rls,
       count(*) filter (where not c.relrowsecurity) as sin_rls,
       (select count(*) from pg_policies where schemaname = 'public') as politicas_public
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r';