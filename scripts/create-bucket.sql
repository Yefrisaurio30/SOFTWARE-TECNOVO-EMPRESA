-- Crea el bucket de imagenes en Supabase Storage.
--
-- Se hace por SQL y no por el panel para que sea repetible y quede versionado:
-- el bucket es parte de la infraestructura, no un clic. Supabase soporta este
-- INSERT (es lo que hacen sus propias migraciones) y el Storage API lee de
-- esta tabla en cada peticion.
--
-- Ejecutar con el session pooler (puerto 5432), nunca con el de transaccion.

insert into storage.buckets (id, name, public, file_size_limit, avif_autodetection, type)
values (
  gen_random_uuid(),
  'uploads',
  true,
  5242880,   -- 5 MB. La app corta en 4 MB; esto es la segunda red.
  true,      -- Supabase sirve AVIF solo cuando el cliente lo acepta.
  'STANDARD'
)
on conflict (name) do nothing;

select name, public, file_size_limit, avif_autodetection, type
from storage.buckets
where name = 'uploads';