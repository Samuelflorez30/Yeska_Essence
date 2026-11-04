// Ambientaciones de temporada para las líneas del catálogo.
// Lo comparten el sitio público (index.astro, servidor) y el panel (lineas.astro).
//
// Una línea con `tema` cambia el look de la colección solo mientras el cliente
// la tiene elegida en los filtros. El decorado vive en styles/tema-<clave>.css
// y el texto de la cabecera, aquí. Para sumar otra (San Pedro, Amor y Amistad…)
// se agrega su entrada en TEMAS y su hoja de estilos.

export const TEMAS = {
  navidad: {
    nombre: 'Navidad',
    resumen: 'Nieve, luces y esferas en la colección cuando el cliente abre esta línea.',
    eyebrow: 'Edición de temporada',
    titulo: 'Una Navidad que',
    destacado: 'perfuma',
    texto: 'Velas de temporada hechas a mano para regalar, vestir la mesa y llenar la casa de aroma. Cada pieza se hace por encargo.',
  },
};

const sinTildes = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** "Línea Navideña" → "linea-navidena". Es lo que va en el enlace /?linea=… */
export function slugDe(nombre) {
  return sinTildes(nombre).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'linea';
}

/** "Navidad" y "navidad " son la misma línea: se compara por su slug. */
export const mismoNombre = (a, b) => slugDe(a) === slugDe(b);

/**
 * Tema de una fila de `lineas`. Si la base de datos todavía no tiene la
 * columna `tema` (falta correr supabase-migracion-lineas.sql), una línea
 * llamada "Navidad"/"Navideña" recibe igual su ambientación.
 */
export function temaDeLinea(linea) {
  if (!linea) return null;
  if ('tema' in linea) return linea.tema && TEMAS[linea.tema] ? linea.tema : null;
  return /navid/.test(slugDe(`${linea.slug} ${linea.nombre}`)) ? 'navidad' : null;
}
