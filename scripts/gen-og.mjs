import sharp from 'sharp';

const W = 1200, H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#D9C0BC"/>
      <stop offset="55%" stop-color="#D1B4B0"/>
      <stop offset="100%" stop-color="#A57E79"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="#F7F0EA" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#F7F0EA" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="#C49A45" stroke-opacity="0.55" stroke-width="1.5"/>
  <text x="50%" y="478" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="#4A3B39">Yeska Essence</text>
  <text x="50%" y="524" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="23" letter-spacing="1" fill="#6E4A10">VELAS ARTESANALES EN CERA DE SOJA Y YESO · COLOMBIA</text>
</svg>`;

const bg = await sharp(Buffer.from(svg)).png().toBuffer();
const logo = await sharp('public/img/logo-badge.png').resize(220, 230, { fit: 'inside' }).toBuffer();
await sharp(bg)
  .composite([{ input: logo, top: 96, left: Math.round((W - 220) / 2) }])
  .png()
  .toFile('public/og-image.png');
console.log('og-image.png listo');
