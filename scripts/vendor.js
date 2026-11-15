// Copies Leaflet and the two fonts into ./vendor so the app works offline.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'vendor');
const nm = p => path.join(root, 'node_modules', p);
fs.mkdirSync(path.join(out, 'leaflet'), { recursive: true });
fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
for (const f of ['leaflet.js', 'leaflet.css']) fs.copyFileSync(nm('leaflet/dist/' + f), path.join(out, 'leaflet', f));
fs.cpSync(nm('leaflet/dist/images'), path.join(out, 'leaflet/images'), { recursive: true });
let css = '';
for (const w of [400, 500, 600, 700]) {
  const f = `inter-latin-${w}-normal.woff2`;
  fs.copyFileSync(nm('@fontsource/inter/files/' + f), path.join(out, 'fonts', f));
  css += `@font-face{font-family:Inter;font-style:normal;font-weight:${w};font-display:swap;src:url(${f}) format('woff2')}\n`;
}
for (const w of [500, 600, 700]) {
  const f = `space-grotesk-latin-${w}-normal.woff2`;
  fs.copyFileSync(nm('@fontsource/space-grotesk/files/' + f), path.join(out, 'fonts', f));
  css += `@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:${w};font-display:swap;src:url(${f}) format('woff2')}\n`;
}
fs.writeFileSync(path.join(out, 'fonts', 'fonts.css'), css);
console.log('vendor/ ready');
