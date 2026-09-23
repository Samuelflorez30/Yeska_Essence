// Utilidades del panel administrador (solo navegador).
// Todo lo que comparten Inicio, Productos y Recordatorios vive aquí:
// escritura segura en Supabase, fotos, edición en línea, avisos y confirmación.
import { supabase } from './supabase.js';

const BUCKET = 'imagenes';

// ------------------------------------------------------------------ texto ---
const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escapa texto para meterlo en HTML (contenido o atributos). */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);

/** "$80.000" → 80000. Lanza un Error con mensaje legible si no es un precio válido. */
export function leerPrecio(texto) {
  const limpio = String(texto).replace(/[^\d]/g, '');
  if (!limpio) throw new Error('Escribe el precio solo con números, por ejemplo 45000.');
  const n = parseInt(limpio, 10);
  if (n > 100_000_000) throw new Error('Ese precio es demasiado alto; revisa los ceros.');
  return n;
}

/** Hace unos minutos / hace 3 h / hace 2 días / 12 mar. */
export function haceCuanto(fecha) {
  const min = Math.round((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return d === 1 ? 'ayer' : `hace ${d} días`;
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

// ---------------------------------------------------------------- avisos ---
let pila;
/** Aviso flotante. tipo: 'ok' | 'error'. Los errores duran más y se anuncian de inmediato. */
export function toast(mensaje, tipo = 'ok') {
  pila ??= document.getElementById('toastStack');
  if (!pila) { console[tipo === 'error' ? 'error' : 'log'](mensaje); return; }
  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  if (tipo === 'error') el.setAttribute('role', 'alert');
  el.innerHTML = tipo === 'error'
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  el.append(document.createTextNode(mensaje));
  pila.append(el);
  setTimeout(() => {
    el.classList.add('saliendo');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);   // por si no hay animación (movimiento reducido)
  }, tipo === 'error' ? 6000 : 2800);
}

/** Convierte cualquier error de Supabase o de red en una frase para la dueña. */
export function mensajeError(err) {
  const m = String(err?.message ?? err ?? '');
  if (err instanceof SesionExpirada) return m;
  if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.';
  if (/jwt|token|not authorized|permission denied|row-level security/i.test(m)) return 'Tu sesión no tiene permiso para esto. Vuelve a ingresar.';
  if (/payload too large|maximum allowed size/i.test(m)) return 'La foto es demasiado grande.';
  return m || 'Algo salió mal. Inténtalo de nuevo.';
}

// ---------------------------------------------------------------- sesión ---
export class SesionExpirada extends Error {}

export function irAlLogin() {
  const volver = encodeURIComponent(location.pathname + location.search);
  location.replace(`/admin/login?volver=${volver}`);
}

// Con RLS, una escritura sin permiso NO devuelve error: simplemente afecta
// 0 filas. Por eso toda escritura pide las filas afectadas y, si no vuelve
// ninguna, averigua si fue la sesión o que el registro ya no existe.
async function exigirFilas({ data, error }) {
  if (error) throw error;
  if (Array.isArray(data) && data.length) return data;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    setTimeout(irAlLogin, 1800);
    throw new SesionExpirada('Tu sesión expiró y el cambio no se guardó. Te llevamos a ingresar de nuevo…');
  }
  throw new Error('Ese registro ya no existe. Recarga la página.');
}

export async function actualizar(tabla, id, cambios) {
  const [fila] = await exigirFilas(await supabase.from(tabla).update(cambios).eq('id', id).select());
  return fila;
}

export async function eliminar(tabla, id) {
  await exigirFilas(await supabase.from(tabla).delete().eq('id', id).select('id'));
}

export async function insertar(tabla, fila) {
  const [nueva] = await exigirFilas(await supabase.from(tabla).insert(fila).select());
  return nueva;
}

// ----------------------------------------------------------------- fotos ---
const LADO_MAX = 1600;          // de sobra para la tarjeta más grande del sitio
const PESO_MAX = 8 * 1024 * 1024;

// Una foto de celular pesa 4–12 MB y el sitio público la serviría tal cual.
// Se reduce a 1600 px y WebP en el navegador antes de subirla: suele quedar
// en 150–400 KB sin pérdida visible. Si algo falla, se sube la original.
async function prepararFoto(archivo) {
  if (!archivo.type.startsWith('image/')) throw new Error('Ese archivo no es una imagen.');
  if (/gif|svg/.test(archivo.type)) return archivo;
  try {
    const bmp = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    const escala = Math.min(1, LADO_MAX / Math.max(bmp.width, bmp.height));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(bmp.width * escala);
    lienzo.height = Math.round(bmp.height * escala);
    lienzo.getContext('2d').drawImage(bmp, 0, 0, lienzo.width, lienzo.height);
    bmp.close();
    const blob = await new Promise((ok) => lienzo.toBlob(ok, 'image/webp', 0.85));
    // Safari antiguo devuelve PNG al pedir WebP: en ese caso no hay ganancia.
    if (!blob || blob.type !== 'image/webp' || blob.size >= archivo.size) return archivo;
    return new File([blob], archivo.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return archivo;
  }
}

/** Sube una foto a Storage (carpeta: 'productos' | 'recordatorios') y devuelve su URL pública. */
export async function subirFoto(carpeta, archivo) {
  const foto = await prepararFoto(archivo);
  if (foto.size > PESO_MAX) throw new Error('La foto pesa más de 8 MB incluso comprimida. Usa una más liviana.');
  const ext = { 'image/webp': 'webp', 'image/png': 'png', 'image/gif': 'gif', 'image/svg+xml': 'svg' }[foto.type] ?? 'jpg';
  const ruta = `${carpeta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(ruta, foto, {
    contentType: foto.type, cacheControl: '31536000', upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

/**
 * Borra de Storage una foto que ya nadie usa. Nunca lanza: si falla, la foto
 * queda huérfana pero el cambio principal ya está hecho.
 * Solo toca archivos de nuestro bucket y solo si ningún producto ni
 * recordatorio sigue apuntando a esa URL.
 */
export async function borrarFoto(url) {
  if (!url) return;
  const marca = `/storage/v1/object/public/${BUCKET}/`;
  const i = url.indexOf(marca);
  if (i === -1) return;
  const ruta = decodeURIComponent(url.slice(i + marca.length).split('?')[0]);
  try {
    const [p, r] = await Promise.all([
      supabase.from('productos').select('id', { count: 'exact', head: true }).eq('imagen_url', url),
      supabase.from('recordatorios').select('id', { count: 'exact', head: true }).eq('imagen_url', url),
    ]);
    if (p.error || r.error || (p.count ?? 0) + (r.count ?? 0) > 0) return;
    await supabase.storage.from(BUCKET).remove([ruta]);
  } catch { /* huérfana: no bloquea nada */ }
}

/**
 * Zona de foto del formulario de alta: clic o arrastrar y soltar, con vista previa.
 * Devuelve { archivo(), limpiar() }.
 */
export function selectorDeFoto(zona) {
  const input = zona.querySelector('input[type="file"]');
  const vista = zona.querySelector('img');
  const texto = zona.querySelector('[data-texto]');
  const inicial = texto.textContent;
  let actual = null;

  const usar = (archivo) => {
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) { toast('Ese archivo no es una imagen.', 'error'); return; }
    actual = archivo;
    if (vista.src.startsWith('blob:')) URL.revokeObjectURL(vista.src);
    vista.src = URL.createObjectURL(archivo);
    zona.classList.add('con-foto');
    texto.textContent = archivo.name;
  };
  input.addEventListener('change', () => usar(input.files?.[0]));
  zona.addEventListener('dragover', (e) => { e.preventDefault(); zona.classList.add('arrastrando'); });
  zona.addEventListener('dragleave', () => zona.classList.remove('arrastrando'));
  zona.addEventListener('drop', (e) => {
    e.preventDefault(); zona.classList.remove('arrastrando');
    usar(e.dataTransfer?.files?.[0]);
  });

  return {
    archivo: () => actual,
    limpiar() {
      actual = null; input.value = '';
      if (vista.src.startsWith('blob:')) URL.revokeObjectURL(vista.src);
      vista.removeAttribute('src');
      zona.classList.remove('con-foto');
      texto.textContent = inicial;
    },
  };
}

/** Abre el selector de archivos del sistema y devuelve la imagen elegida (o null). */
export function elegirArchivo() {
  return new Promise((resolver) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.addEventListener('change', () => resolver(input.files?.[0] ?? null), { once: true });
    input.addEventListener('cancel', () => resolver(null), { once: true });
    input.click();
  });
}

// ------------------------------------------------------- edición en línea ---
function hacerEditable(el) {
  // plaintext-only: el pegado llega sin formato. Donde no existe, se emula.
  try { el.contentEditable = 'plaintext-only'; } catch { /* navegador antiguo */ }
  if (el.contentEditable !== 'plaintext-only') {
    el.contentEditable = 'true';
    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const texto = e.clipboardData?.getData('text/plain') ?? '';
      const sel = getSelection();
      if (!sel?.rangeCount) return;
      const rango = sel.getRangeAt(0);
      rango.deleteContents();
      rango.insertNode(document.createTextNode(texto));
      rango.collapse(false);
    });
  }
  el.setAttribute('role', 'textbox');
  el.spellcheck = true;
}

export function destello(el, tipo = 'ok') {
  el.classList.remove('guardado', 'fallido');
  void el.offsetWidth;   // reinicia la animación
  el.classList.add(tipo === 'ok' ? 'guardado' : 'fallido');
}

/**
 * Convierte un elemento en un campo que se edita en el sitio y guarda al salir.
 *   valor    → valor actual (tal como está en la base de datos)
 *   mostrar  → texto visible en reposo      (por defecto, el valor)
 *   editar   → texto mientras se escribe    (por defecto, lo mismo que mostrar)
 *   leer     → texto escrito → valor a guardar; lanza Error para rechazarlo
 *   guardar  → async (valor) => void; si lanza, se restaura el valor anterior
 * Enter guarda (Mayús+Enter hace salto de línea si el campo es multilínea);
 * Escape descarta.
 */
export function editarEnLinea(el, { valor, mostrar = (v) => v ?? '', editar = mostrar, leer = (t) => t, guardar }) {
  let actual = valor;
  let descartar = false;
  hacerEditable(el);
  el.textContent = mostrar(actual);

  el.addEventListener('focus', () => { descartar = false; el.textContent = editar(actual); });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !(e.shiftKey && el.hasAttribute('data-multilinea'))) { e.preventDefault(); el.blur(); }
    if (e.key === 'Escape') { e.preventDefault(); descartar = true; el.blur(); }
  });
  el.addEventListener('blur', async () => {
    if (descartar) { el.textContent = mostrar(actual); return; }
    let nuevo;
    try { nuevo = leer(el.textContent.trim()); }
    catch (err) { el.textContent = mostrar(actual); destello(el, 'error'); toast(err.message, 'error'); return; }
    if (nuevo === actual) { el.textContent = mostrar(actual); return; }

    el.textContent = mostrar(nuevo);
    el.setAttribute('aria-busy', 'true');
    try {
      await guardar(nuevo);
      actual = nuevo;
      destello(el, 'ok');
    } catch (err) {
      el.textContent = mostrar(actual);
      destello(el, 'error');
      toast(mensajeError(err), 'error');
    } finally {
      el.removeAttribute('aria-busy');
    }
  });
}

/** Campo de texto obligatorio: rechaza vacío y recorta a `max` caracteres. */
export const texto = (nombreCampo, max = 500) => (t) => {
  if (!t) throw new Error(`${nombreCampo} no puede quedar vacío.`);
  return t.slice(0, max);
};
/** Campo opcional: vacío se guarda como null (no como ""). */
export const opcional = (max = 200) => (t) => (t ? t.slice(0, max) : null);

// ----------------------------------------------------------- confirmación ---
/**
 * Diálogo de confirmación con el diseño del panel (reemplaza a confirm()).
 * Resuelve true si la dueña confirma. El foco arranca en "Cancelar":
 * en una acción destructiva, Enter por accidente no borra nada.
 */
export function confirmar({ titulo, mensaje, accion = 'Eliminar' }) {
  const dlg = document.getElementById('confirmDialog');
  if (!dlg) return Promise.resolve(window.confirm(`${titulo}\n\n${mensaje}`));
  dlg.querySelector('[data-titulo]').textContent = titulo;
  dlg.querySelector('[data-mensaje]').textContent = mensaje;
  dlg.querySelector('[data-accion]').textContent = accion;
  dlg.returnValue = '';
  dlg.showModal();
  return new Promise((resolver) => {
    dlg.addEventListener('close', () => resolver(dlg.returnValue === 'ok'), { once: true });
  });
}

// ------------------------------------------------------------ formularios ---
/** Marca o limpia el error de un campo (borde, aria-invalid y mensaje enlazado). */
export function errorDeCampo(input, mensaje) {
  const msg = document.getElementById(`${input.id}-error`);
  const campo = input.closest('.field');
  if (mensaje) {
    input.setAttribute('aria-invalid', 'true');
    campo?.classList.add('error');
    if (msg) { msg.textContent = mensaje; msg.hidden = false; }
  } else {
    input.removeAttribute('aria-invalid');
    campo?.classList.remove('error');
    if (msg) { msg.textContent = ''; msg.hidden = true; }
  }
  return !mensaje;
}
