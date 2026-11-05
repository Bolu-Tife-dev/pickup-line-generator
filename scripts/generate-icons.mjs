// One-off: rasterize public/logo.svg into every icon size the PWA needs.
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const PUB = fileURLToPath(new URL("../public/", import.meta.url));
const logo = await readFile(fileURLToPath(new URL("../public/logo.svg", import.meta.url)));

// Composite the logo (it has rounded corners + transparency) at `padding`
// inset, centred on a solid #FF2157 square so no icon has transparent corners.
async function makeIcon(size, file, padding = 0) {
  const inner = Math.round(size * (1 - padding * 2));
  const resized = await sharp(logo, { density: 300 }).resize(inner, inner, { fit: "inside" }).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#FF2157" },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toFile(`${PUB}${file}`);
  console.log(`icon: ${file} (${size}px)`);
}

await makeIcon(180, "apple-touch-icon.png", 0.15);
await makeIcon(192, "icon-192.png", 0.15);
await makeIcon(512, "icon-512.png", 0.15);
await makeIcon(192, "maskable-192.png", 0.25);
await makeIcon(512, "maskable-512.png", 0.25);

console.log("all icons generated");
