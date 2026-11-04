-- ============================================================
-- Yeska Essence — crear la línea "Navidad" y pasarle las piezas navideñas
-- Pega TODO esto en: Supabase → SQL Editor → New query → Run
--
-- IMPORTANTE: córrelo DESPUÉS de publicar el código nuevo en Vercel.
-- El sitio viejo tenía los botones de línea fijos en el código: una línea
-- nueva le saldría sin botón y con la etiqueta "undefined".
--
-- Es seguro repetirlo: no duplica la línea ni borra nada.
-- ============================================================

begin;

-- 1. Migración (la misma de supabase-migracion-lineas.sql)
alter table lineas add column if not exists tema text;
alter table lineas add column if not exists activo boolean not null default true;

-- 2. La línea, con la ambientación navideña. orden 0 = su botón sale
--    primero, justo después de "Todas" (se cambia luego en Panel → Líneas).
insert into lineas (slug, nombre, orden, tema, activo)
values ('navidad', 'Navidad', 0, 'navidad', true)
on conflict (slug) do update
  set nombre = excluded.nombre, tema = excluded.tema, activo = true;

-- 3. Las piezas navideñas que hoy están en "Figuras". Si alguna no va,
--    borra su renglón de la lista antes de correr esto.
update productos
set linea_id = (select id from lineas where slug = 'navidad')
where trim(nombre) in (
  'Dúo Bosque Mágico',
  'Kit Dulce Navidad',
  'Estrella de Navidad',
  'Reno Mágico Cofre',
  'Kit Esfera Navideña',
  'Bosque Encantado',
  'Pino Mágico - Edición Regalo',
  'Magia de Nochebuena',
  'Cúpula Mágica Navideña',
  'Pequeños Deseos Navideños',
  'Vela Papa Noel'
);

commit;

-- 4. Comprobación: lo que quedó en Navidad (debe listar las piezas de arriba)
select p.nombre, p.precio, p.activo as visible
from productos p
join lineas l on l.id = p.linea_id
where l.slug = 'navidad'
order by p.orden;
