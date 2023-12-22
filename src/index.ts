#!/usr/bin/env node

import path from 'path';
import { promises as fs } from 'fs';

import icoEndec from 'ico-endec';
import sharp from 'sharp';
import { optimize } from 'svgo';

async function createWebManifest(fileDir: string, manifestName: string) {
  const manifest = {
    name: manifestName,
    icons: [
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512' }
    ]
  };
  await fs.writeFile(
    `${fileDir}/manifest.webmanifest`,
    JSON.stringify(manifest, null, 2)
  );
}

async function generatePNG(
  svgContent: string,
  size: number,
  quality: number,
  pathPNG: string
) {
  await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png({
      quality
    })
    .toFile(pathPNG);
}

async function processSvgFile(
  filePath: string,
  quality: number,
  manifestName: string
) {
  try {
    const fileDir = path.dirname(filePath);

    // Get SVG Content
    const rawSvg = await fs.readFile(filePath, 'utf-8');
    const svgContent = optimize(rawSvg).data;

    // Create optimized SVG
    await fs.writeFile(`${fileDir}/favicon-optimized.svg`, svgContent);

    // Create ico file
    const favBuffer = await sharp(Buffer.from(svgContent))
      .resize(32, 32)
      .png()
      .toBuffer();
    const icoBuffer = await icoEndec.encode(favBuffer);
    await fs.writeFile(`${fileDir}/favicon.ico`, icoBuffer);

    // Create PNG Icons
    await Promise.all([
      generatePNG(svgContent, 180, quality, `${fileDir}/apple-touch-icon.png`),
      generatePNG(svgContent, 192, quality, `${fileDir}/icon-192.png`),
      generatePNG(svgContent, 512, quality, `${fileDir}/icon-512.png`)
    ]);

    // Create manifest.webmanifest
    await createWebManifest(fileDir, manifestName);

    // Success messages
    console.log('Succussfully Generated Favicons!');
  } catch (err) {
    console.error(`Error converting ${filePath}: `, err);
  }
}

export async function generateFavicons(
  faviconPath: string,
  quality: number,
  manifestName: string = 'TODO'
) {
  if (!faviconPath) {
    console.error(
      'No Input Found. Try Using: npx @mynaui/favicons your_icon_name.svg'
    );
    process.exit(1);
  }
  if (!faviconPath.includes('.svg')) {
    console.error('Not a SVG File.');
    process.exit(1);
  }
  await processSvgFile(faviconPath, quality, manifestName);
}

// CLI
if (process.argv.length > 2) {
  const args = process.argv.slice(2);
  type Options = {
    input: string;
    quality: number | 85;
    manifestName: string | 'TODO';
  };
  const parseArgs = (args: string[]): Options => {
    const options: Options = {
      input: '',
      quality: 85, // Default quality
      manifestName: 'TODO' // Default manifest name
    };

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--input' || args[i] === '-i') {
        options.input = args[++i];
      } else if (args[i] === '--quality' || args[i] === '-q') {
        options.quality = parseInt(args[++i], 10);
      } else if (args[i] === '--name' || args[i] === '-n') {
        options.manifestName = args[++i];
      } else if (!options.input) {
        options.input = args[i];
      }
    }

    return options;
  };

  const { input, quality, manifestName } = parseArgs(args);
  generateFavicons(input, quality, manifestName).catch(console.error);
}
