// Siembra inicial: sube las fotos de scripts/seed-images/ a Supabase Storage
// e inserta los 16 productos y 7 recordatorios del catálogo oficial.
//
// Se corre UNA sola vez (o cuando quieras reimportar desde cero).
// Usa la "service_role key" (no la anon) porque inserta muchas filas de
// una vez sin pasar por un login — por eso NUNCA debe ir en el código del
// sitio ni en el navegador, solo aquí, en tu máquina.
//
// Uso:
//   1. Ya debes tener .env con PUBLIC_SUPABASE_URL (este script lo lee solo).
//   2. En Supabase → Project Settings → API → copia la "service_role" key.
//   3. Ponla SOLO en la terminal (nunca en un archivo), y en la misma
//      terminal corre "npm run seed" — ver los 3 comandos exactos según tu
//      terminal en el bloque de abajo.
//
//   PowerShell:
//     $env:SUPABASE_SERVICE_ROLE_KEY="tu-key-aqui"
//     npm run seed
//
//   cmd.exe:
//     set SUPABASE_SERVICE_ROLE_KEY=tu-key-aqui
//     npm run seed
//
//   Git Bash / macOS / Linux:
//     export SUPABASE_SERVICE_ROLE_KEY=tu-key-aqui
//     npm run seed
//
//   (o todo en una sola línea: SUPABASE_SERVICE_ROLE_KEY=tu-key npm run seed)

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, 'seed-images');

// Node no carga .env solo (eso lo hace Astro únicamente para el sitio) —
// aquí leemos el .env del proyecto a mano, sin depender de ningún paquete.
// Solo rellena lo que falte: si ya exportaste algo en la terminal, eso manda.
function cargarEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  for (const linea of readFileSync(envPath, 'utf-8').split('\n')) {
    const l = linea.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i === -1) continue;
    const clave = l.slice(0, i).trim();
    const valor = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!(clave in process.env)) process.env[clave] = valor;
  }
}
cargarEnvLocal();

// Normaliza: quita espacios sueltos y la barra final, que rompe las
// rutas que arma el SDK ("https://x.supabase.co/" + "/storage/v1/..." = doble "/").
let SUPABASE_URL = (process.env.PUBLIC_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    '\nFaltan variables de entorno.\n' +
    'Necesitas PUBLIC_SUPABASE_URL (puede venir de tu .env) y SUPABASE_SERVICE_ROLE_KEY\n' +
    '(esta última la pones solo en la terminal, nunca en un archivo .env).\n'
  );
  process.exit(1);
}

// Valida el formato ANTES de llamar a Supabase, para dar un error legible
// en vez del "Invalid path specified in request URL" que tira el SDK.
try {
  const u = new URL(SUPABASE_URL);
  if (!/^https?:$/.test(u.protocol) || !u.hostname) throw new Error('sin protocolo/host');
  // Error típico: pegar el endpoint de "Data API" (.../rest/v1) en vez de
  // la "Project URL" — el cliente de Supabase ya agrega esa parte solo.
  if (u.pathname && u.pathname !== '/') {
    console.warn(
      `Nota: quité "${u.pathname}" de PUBLIC_SUPABASE_URL — solo va la URL base del proyecto.`
    );
    SUPABASE_URL = `${u.protocol}//${u.host}`;
  }
} catch {
  console.error(
    `\nPUBLIC_SUPABASE_URL no es una URL válida: "${SUPABASE_URL}"\n` +
    'Debe verse exactamente así (Project Settings → API → "Project URL"):\n' +
    '  PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co\n' +
    '(sin comillas, sin espacios, sin "/rest/v1" ni "/" al final).\n'
  );
  process.exit(1);
}
if (SUPABASE_URL.includes('tu-proyecto')) {
  console.error(
    '\nPUBLIC_SUPABASE_URL todavía tiene el valor de ejemplo ("tu-proyecto").\n' +
    'Ábrelo en .env y pega la URL real de tu proyecto (Project Settings → API).\n'
  );
  process.exit(1);
}

console.log(`Conectando a ${SUPABASE_URL} …`);
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const LINEAS = ['flores', 'botanica', 'figuras', 'recipientes'];

const PRODUCTOS = [
  { id: 'bouquet-colorido', n: 'Bouquet Colorido', line: 'flores', mat: 'Flores en cera de soja con fragancia · Vasija en yeso', p: 80000 },
  { id: 'abrazo-aromatico', n: 'Abrazo Aromático', line: 'figuras', mat: 'Osito y rosas en cera de soja con fragancia · Lazo', p: 100000 },
  { id: 'centro-de-mesa', n: 'Centro de Mesa · Cuenco Floral', line: 'flores', mat: 'Vasija en yeso · Flores aromatizadas en cera de soja · Caja de acetato con lazo', p: 50000 },
  { id: 'centro-mesa-trio', n: 'Centro de Mesa · Trío de Jarrones', line: 'flores',
    mat: 'Jarrones y bandeja en yeso acanalado · Flores secas · Mariposas de cera', p: 50000 },
  { id: 'trio-de-calma', n: 'Trío de Calma', line: 'recipientes', mat: 'Vasija con tapa y base en yeso artesanal · Cera de soja 100 % con fragancia', p: 32000 },
  { id: 'esencia-acanalada', n: 'Esencia Acanalada', line: 'flores', mat: 'Mini bouquet · Vasija en yeso, flores en cera de soja con fragancia', p: 45000, note: 'Sin cera $35.000' },
  { id: 'cupula-de-seda', n: 'Cúpula de Seda', line: 'recipientes', mat: 'Vasija en yeso con tapa · Cera de soja con fragancia', p: 28000 },
  { id: 'capricho-chantilly', n: 'Capricho de Chantilly', line: 'flores', mat: 'Velas tipo chantilly en cera de soja con fragancia', p: 80000 },
  { id: 'loto-devocion', n: 'Loto de Devoción', line: 'figuras', mat: 'Vasija en yeso artesanal · Virgen en cera de soja con fragancia', p: 40000 },
  { id: 'idilio-felino', n: 'Idilio Felino', line: 'figuras', mat: 'Base en yeso · Peonía y gatos en cera de soja con fragancia', p: 42000 },
  { id: 'nido-de-oro', n: 'Nido de Oro', line: 'recipientes', mat: 'Vasija en yeso · Cera de soja con fragancia', p: 42000 },
  { id: 'tulipan', n: 'Tulipán', line: 'flores', mat: 'Vasija en cristal · Tulipán en cera de soja con fragancia', p: 40000 },
  { id: 'terraza-inmortal', n: 'Terraza Inmortal', line: 'botanica', mat: 'Vasija en yeso · Cactus en cera de soja con fragancia', p: 55000 },
  { id: 'esencia-desierto', n: 'Esencia del Desierto', line: 'botanica', mat: 'Base de yeso con tres cactus en cera de soja · Varias fragancias', p: 40000 },
  { id: 'set-armonia', n: 'Set Armonía', line: 'flores', mat: 'Jarrón y base en yeso · Ramillete y peonía en cera de soja', p: 35000 },
  { id: 'burbuja-amor', n: 'Burbuja de Amor', line: 'flores', mat: 'Recipiente en yeso · Rosas en cera de soja · Acetato opcional', p: 28000, note: 'Al mayor $26.500' },
];

const RECORDATORIOS = [
  { id: 'rocio-flores', n: 'Rocío de Flores', d: 'Recipiente acanalado en yeso artesanal, cera de soja con fragancia y lazo de fique. Mecha de madera en la opción 1.',
    rows: [['Flores artificiales, sin tapa', 19500, 19000], ['Orquídea en cera, sin tapa', 23500, 23000], ['Con tapa, orquídea y caja decorativa', 29000, 28500]] },
  { id: 'mariposa-invierno', n: 'Mariposa de Invierno', d: 'Recipiente acrílico transparente con mariposa en cera de soja y fragancia. Caja en acetato, cinta y flores artificiales.',
    rows: [['Unidad completa', 12000, 11500]] },
  { id: 'esencia-octagonal', n: 'Esencia Octagonal', d: 'Recipiente octagonal en yeso blanco o de color, lazo de fique y mensaje de la quinceañera.',
    rows: [['Con mariposa en cera de soja', 10000, 9500], ['Con flores artificiales', 9000, 8500]] },
  { id: 'nudo-ensueno', n: 'Nudo de Ensueño', d: 'Recipiente entrelazado en yeso blanco artesanal, cera de soja con fragancia y figura del color de tu preferencia.',
    rows: [['Con rosa', 9000, 8500], ['Con oso', 7500, 7000]] },
  { id: 'cristal-verano', n: 'Cristal de Verano', d: 'Recipiente de vidrio con cera de soja, fragancia y tres rosas de colores variados. Cinta de color alrededor del frasco.',
    rows: [['Unidad', 24000, 23500]], note: 'Acetato adicional: $4.000' },
  { id: 'ternura-cristal', n: 'Ternura en Cristal', d: 'Elefante en cera de soja del color de tu preferencia, con cinta y mensaje de la quinceañera.',
    rows: [['En recipiente de vidrio', 16000, 15500], ['Solo elefante en papel cristal', 8000, 7500]] },
  { id: 'jardin-cristal', n: 'Jardín de Cristal y Seda', d: 'Recipiente de vidrio con cera de soja y fragancia, flores artesanales, cinta de color y mensaje.',
    rows: [['Unidad', 19000, 18500]] },
];

async function subirImagen(id) {
  const jpg = path.join(IMG_DIR, `${id}.jpg`);
  const png = path.join(IMG_DIR, `${id}.png`);
  let file, ext;
  try { file = readFileSync(jpg); ext = 'jpg'; }
  catch {
    try { file = readFileSync(png); ext = 'png'; }
    catch {
      // Sin foto propia todavía: se siembra con el logo para no abortar la
      // carga entera, y se avisa cuál falta por conseguir.
      console.warn(`
   ⚠ Falta scripts/seed-images/${id}.jpg — se usa el logo por ahora.`);
      file = readFileSync(path.join(IMG_DIR, 'logo-badge.png')); ext = 'png';
    }
  }
  const destPath = `${id}.${ext}`;
  const { error } = await supabase.storage.from('imagenes').upload(destPath, file, {
    contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Subiendo ${id}: ${error.message}`);
  return supabase.storage.from('imagenes').getPublicUrl(destPath).data.publicUrl;
}

async function main() {
  console.log('1/4 — Verificando/creando el bucket "imagenes"…');
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === 'imagenes')) {
    const { error } = await supabase.storage.createBucket('imagenes', { public: true });
    if (error) throw error;
  }

  console.log('2/4 — Buscando las líneas (Flores, Botánica...)…');
  const { data: lineasData, error: lineasErr } = await supabase.from('lineas').select('id, slug');
  if (lineasErr) throw lineasErr;
  const lineaIdBySlug = Object.fromEntries(lineasData.map((l) => [l.slug, l.id]));
  for (const slug of LINEAS) {
    if (!lineaIdBySlug[slug]) throw new Error(`Falta la línea "${slug}" — corre primero supabase-schema.sql`);
  }

  console.log('3/4 — Productos:');
  for (const p of PRODUCTOS) {
    process.stdout.write(`   ${p.n}… `);
    const imagen_url = await subirImagen(p.id);
    const { error } = await supabase.from('productos').upsert({
      nombre: p.n,
      linea_id: lineaIdBySlug[p.line],
      materiales: p.mat,
      precio: p.p,
      nota: p.note ?? null,
      imagen_url,
      orden: PRODUCTOS.indexOf(p),
      activo: true,
    });
    if (error) throw error;
    console.log('ok');
  }

  console.log('4/4 — Recordatorios:');
  for (const r of RECORDATORIOS) {
    process.stdout.write(`   ${r.n}… `);
    const imagen_url = await subirImagen(r.id);
    const { data: rec, error } = await supabase
      .from('recordatorios')
      .upsert({ nombre: r.n, descripcion: r.d, nota: r.note ?? null, imagen_url, orden: RECORDATORIOS.indexOf(r), activo: true })
      .select()
      .single();
    if (error) throw error;
    // limpia opciones previas (por si se vuelve a correr) y las vuelve a insertar
    await supabase.from('recordatorio_opciones').delete().eq('recordatorio_id', rec.id);
    const opciones = r.rows.map(([descripcion, precio_unidad, precio_mayor], i) => ({
      recordatorio_id: rec.id, descripcion, precio_unidad, precio_mayor, orden: i,
    }));
    const { error: optErr } = await supabase.from('recordatorio_opciones').insert(opciones);
    if (optErr) throw optErr;
    console.log('ok');
  }

  console.log(`
✔ Listo. ${PRODUCTOS.length} productos y ${RECORDATORIOS.length} recordatorios cargados en Supabase.`);
}

main().catch((err) => { console.error('\n✖ Error:', err.message); process.exit(1); });
