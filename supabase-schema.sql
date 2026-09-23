-- ============================================================
-- Yeska Essence — esquema de base de datos para Supabase
-- Pega esto en: Supabase → SQL Editor → New query → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. LÍNEAS (categorías): Flores, Botánica, Figuras, Recipientes...
--    Tabla en vez de texto fijo para que el admin pueda agregar
--    una línea nueva sin que nadie toque código.
-- ------------------------------------------------------------
create table lineas (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,        -- 'flores', 'botanica'...
  nombre      text not null,               -- 'Flores', 'Botánica'...
  orden       int  not null default 0,
  creado_en   timestamptz not null default now()
);

insert into lineas (slug, nombre, orden) values
  ('flores', 'Flores', 1),
  ('botanica', 'Botánica', 2),
  ('figuras', 'Figuras', 3),
  ('recipientes', 'Recipientes', 4);

-- ------------------------------------------------------------
-- 2. PRODUCTOS (el catálogo principal)
-- ------------------------------------------------------------
create table productos (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  linea_id       uuid not null references lineas(id) on delete restrict,
  materiales     text not null,             -- descripción de materiales
  precio         integer not null,          -- pesos colombianos, sin decimales
  nota           text,                      -- ej: "Sin cera $35.000"
  imagen_url     text,                      -- URL pública en Supabase Storage
  orden          int not null default 0,    -- para controlar el orden de aparición
  activo         boolean not null default true,  -- "ocultar" sin borrar
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index productos_linea_idx on productos(linea_id);
create index productos_activo_idx on productos(activo);

-- ------------------------------------------------------------
-- 3. RECORDATORIOS (línea de eventos: XV años, bodas, etc.)
--    Cada recordatorio puede tener varias opciones de precio,
--    por eso van en una tabla aparte (1 recordatorio → N opciones).
-- ------------------------------------------------------------
create table recordatorios (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  descripcion    text not null,
  nota           text,                      -- ej: "Acetato adicional: $4.000"
  imagen_url     text,
  orden          int not null default 0,
  activo         boolean not null default true,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table recordatorio_opciones (
  id               uuid primary key default gen_random_uuid(),
  recordatorio_id  uuid not null references recordatorios(id) on delete cascade,
  descripcion      text not null,           -- "Con tapa, orquídea y caja decorativa"
  precio_unidad    integer not null,
  precio_mayor     integer not null,
  orden            int not null default 0
);

create index recordatorio_opciones_rec_idx on recordatorio_opciones(recordatorio_id);

-- ------------------------------------------------------------
-- 4. CONFIGURACIÓN DEL SITIO (opcional, fase 2)
--    Textos y datos de contacto editables sin tocar código:
--    números de WhatsApp, Instagram, frase del héroe, etc.
-- ------------------------------------------------------------
create table configuracion (
  clave  text primary key,
  valor  text not null
);

insert into configuracion (clave, valor) values
  ('whatsapp_principal', '573214034007'),
  ('whatsapp_secundario', '573165252600'),
  ('instagram', 'Yeska_Essence'),
  ('hero_titulo', 'Transformamos la luz en arte y el aroma en recuerdos'),
  ('hero_texto', 'Esculturas en cera de soja —peonías, cactus, rosas en tonos pastel— sobre bases de yeso pulidas a mano.');

-- ------------------------------------------------------------
-- 5. SEGURIDAD (Row Level Security) — tablas
--    Cualquier visitante puede LEER lo activo.
--    Solo un usuario autenticado (el admin) puede escribir.
-- ------------------------------------------------------------
alter table lineas enable row level security;
alter table productos enable row level security;
alter table recordatorios enable row level security;
alter table recordatorio_opciones enable row level security;
alter table configuracion enable row level security;

create policy "lineas: lectura publica" on lineas
  for select using (true);

create policy "productos: lectura publica" on productos
  for select using (activo = true);

create policy "recordatorios: lectura publica" on recordatorios
  for select using (activo = true);

create policy "recordatorio_opciones: lectura publica" on recordatorio_opciones
  for select using (
    exists (select 1 from recordatorios r where r.id = recordatorio_id and r.activo = true)
  );

create policy "configuracion: lectura publica" on configuracion
  for select using (true);

create policy "productos: escritura admin" on productos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "lineas: escritura admin" on lineas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "recordatorios: escritura admin" on recordatorios
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "recordatorio_opciones: escritura admin" on recordatorio_opciones
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "configuracion: escritura admin" on configuracion
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 6. SEGURIDAD — Storage (fotos)
--    Público puede ver las imágenes; solo un admin autenticado
--    puede subir, reemplazar o borrar archivos del bucket "imagenes".
--    (El bucket en sí se crea con `npm run seed` o a mano en el
--    dashboard: Storage → New bucket → "imagenes" → público)
-- ------------------------------------------------------------
create policy "imagenes: lectura publica"
  on storage.objects for select
  using (bucket_id = 'imagenes');

create policy "imagenes: subir admin"
  on storage.objects for insert
  with check (bucket_id = 'imagenes' and auth.role() = 'authenticated');

create policy "imagenes: reemplazar admin"
  on storage.objects for update
  using (bucket_id = 'imagenes' and auth.role() = 'authenticated');

create policy "imagenes: borrar admin"
  on storage.objects for delete
  using (bucket_id = 'imagenes' and auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 7. actualizado_en automático al editar
-- ------------------------------------------------------------
create or replace function set_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

create trigger productos_actualizado
  before update on productos
  for each row execute function set_actualizado_en();

create trigger recordatorios_actualizado
  before update on recordatorios
  for each row execute function set_actualizado_en();

-- ============================================================
-- Después de correr esto:
-- 1. Authentication → Users → Add user (el correo de la dueña).
-- 2. npm install && npm run seed   → sube las 22 fotos y crea
--    los 15 productos + 7 recordatorios que ya tenía el catálogo.
-- 3. npm run dev   → ver el sitio y /admin en local.
-- ============================================================
