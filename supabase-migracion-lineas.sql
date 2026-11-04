-- ============================================================
-- Yeska Essence — migración: líneas con ambientación y visibilidad
-- Pega esto en: Supabase → SQL Editor → New query → Run
-- Se corre UNA vez. Es seguro repetirlo: no duplica ni borra nada.
-- (Las instalaciones nuevas ya lo traen en supabase-schema.sql.)
-- ============================================================

-- Ambientación de temporada de la línea.
--   null       → estilo de siempre
--   'navidad'  → nieve, luces y esferas en la colección cuando el
--                cliente elige esa línea en el sitio
-- Los valores válidos viven en src/lib/temas.js.
alter table lineas add column if not exists tema text;

-- Ocultar una línea de temporada sin borrarla (p. ej. Navidad en enero):
-- su botón de filtro y todos sus productos dejan de verse en el sitio.
alter table lineas add column if not exists activo boolean not null default true;

-- Las políticas de seguridad no cambian: "lineas: lectura publica" y
-- "lineas: escritura admin" ya cubren las columnas nuevas.
