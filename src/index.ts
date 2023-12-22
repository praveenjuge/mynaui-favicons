#!/usr/bin/env node

import path from 'path';
import { promises as fs } from 'fs';

import icoEndec from 'ico-endec';
import sharp from 'sharp';
import { optimize } from 'svgo';

interface CommandLineOptions {
  input: string | null;
  quality: number;
  manifestName: string;
}

const args = process.argv.slice(2);

const parseArgs = (args: string[]): CommandLineOptions => {
  const options: CommandLineOptions = {
    input: null,
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

if (!input) {
  console.error(
    'No Input Found. Try Using: npx @mynaui/favicons your_icon_name.svg'
  );
  process.exit(1);
}

export const DEFAULTS = {
  IOS_IMAGE_PADDING: 0,
  IOS_PADDING_COLOR: { r: 0, g: 0, b: 0, alpha: 0 },
  PNG_QUALITY: quality
};

export type OPTIONS = typeof DEFAULTS;

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

async function generatePNG(svgContent: string, size: number, pathPNG: string) {
  await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png({
      quality: DEFAULTS.PNG_QUALITY
    })
    .toFile(pathPNG);
}

export async function processSvgFile(
  filePath: string,
  options: OPTIONS,
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
      generatePNG(svgContent, 180, `${fileDir}/apple-touch-icon.png`),
      generatePNG(svgContent, 192, `${fileDir}/icon-192.png`),
      generatePNG(svgContent, 512, `${fileDir}/icon-512.png`)
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
  options = DEFAULTS,
  manifestName: string = 'TODO'
) {
  if (path.extname(faviconPath) === '.svg')
    await processSvgFile(faviconPath, options, manifestName);
}

generateFavicons(input, DEFAULTS, manifestName).catch(console.error);
