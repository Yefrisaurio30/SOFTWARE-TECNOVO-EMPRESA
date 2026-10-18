-- Crea el bucket de imagenes en Supabase Storage, con su politica de lectura.
--
-- Se hace por SQL y no por el panel para que sea repetible y quede versionado:
-- el bucket es parte de la infraestructura, no un clic.
--
-- OJO con esto: insertar la fila en storage.buckets NO basta. El panel de
-- Supabase ademas crea la politica RLS de lectura publica sobre
-- storage.objects; si se omite, el bucket queda con public = true pero
-- RLS niega todo y cada foto responde 403. Hay que crear las dos cosas.
--
-- La escritura no necesita politica: la app sube con la llave de servicio,
-- que salta RLS por ser un rol de servidor.

-- El id TIENE que ser igual al nombre. La API de Storage busca por id en la
-- ruta /object/<bucketId>/<clave>, asi que un id con UUID hace que toda subida
-- y toda descarga responded NoSuchBucket aunque la fila exista y el nombre
-- este bien. El panel de Supabase tambien pone id = name.
insert into storage.buckets (id, name, public, file_size_limit, avif_autodetection, type)
values (
  'uploads',
  'uploads',
  true,
  5242880,   -- 5 MB. La app corta en 4 MB; esto es la segunda red.
  true,      -- Supabase sirve AVIF solo cuando el cliente lo acepta.
  'STANDARD'
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      avif_autodetection = excluded.avif_autodetection;

-- storage.buckets tambien tiene RLS activo. Sin esta politica, la API de
-- Storage lee la tabla con un rol que no salta RLS, no encuentra la fila y
-- responde NoSuchBucket aunque el bucket exista. El INSERT de arriba pasa
-- porque lo corre postgres, que si lo salta: por eso el fallo aparece
-- despues, en el primer GET, y no al crear.
drop policy if exists "buckets publicos son visibles" on storage.buckets;

create policy "buckets publicos son visibles"
on storage.buckets
for select
to anon, authenticated, service_role
using (public = true);

-- storage.objects necesita su propia politica para que las descargas anonimas
-- pasen. Sin esta, el bucket queda publico pero cada foto responde 403.
drop policy if exists "uploads lectura publica" on storage.objects;

create policy "uploads lectura publica"
on storage.objects
for select
to anon, authenticated
using (bucket_id = (select id from storage.buckets where name = 'uploads'));

-- Comprobacion: bucket con politica de lectura, y las dos tablas con RLS.
select b.name, b.public, b.file_size_limit,
       (select count(*) from pg_policies p
         where p.schemaname='storage' and p.tablename='buckets')  as politicas_buckets,
       (select count(*) from pg_policies p
         where p.schemaname='storage' and p.tablename='objects')  as politicas_objects
from storage.buckets b
where b.name = 'uploads';