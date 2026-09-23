// Prepara los recortes sin fondo para el optimizador de Astro.
//
// Los PNG originales vienen en lienzos de 1600×1200 con la pieza ocupando
// apenas un tercio: el resto es transparencia. Astro no recorta, así que sin
// este paso cada WebP cargaría ese margen vacío y la pieza se vería diminuta
// dentro de su caja. Aquí se recorta al contorno real y se limita el lado
// largo a 900 px (de sobra para 2x). El WebP final lo genera <Image> en build.
//
//   node scripts/recortar-flota.mjs
//
// Vuelve a correrlo cada vez que cambies o añadas un PNG en la carpeta de origen.
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ORIGEN = 'originales/flota';
const DESTINO = 'src/assets/flota';
const LADO_MAX = 900;

await mkdir(DESTINO, { recursive: true });
const archivos = (await readdir(ORIGEN)).filter((f) => f.toLowerCase().endsWith('.png'));

for (const f of archivos) {
  // trim() toma el pixel de la esquina (transparente) como fondo y lo corta;
  // se hace en dos pasos para que el resize trabaje sobre la pieza ya recortada.
  const recorte = await sharp(path.join(ORIGEN, f)).trim({ threshold: 8 }).toBuffer();
  const info = await sharp(recorte)
    .resize(LADO_MAX, LADO_MAX, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(DESTINO, f));
  console.log(`${f.padEnd(8)} → ${info.width}×${info.height}`);
}
