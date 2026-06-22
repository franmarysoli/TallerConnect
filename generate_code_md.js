import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurations
const OUTPUT_FILE = 'codigo_proyecto.md';
const INCLUDE_ROOT_FILES = [
  'firestore.rules',
  'firestore.indexes.json',
  'vite.config.ts',
  'package.json',
  'tsconfig.json',
  'index.html'
];
const SRC_DIR = path.join(__dirname, 'src');

const ALLOWED_EXTENSIONS = new Set([
  '.ts', '.tsx', '.css', '.js', '.jsx', '.json', '.html', '.rules'
]);

const EXCLUDED_FILES_OR_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.agents',
  'package-lock.json',
  'codigo_proyecto.md',
  'generate_code_md.js'
]);

function getLanguageForExtension(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  switch (ext) {
    case '.ts': return 'typescript';
    case '.tsx': return 'tsx';
    case '.css': return 'css';
    case '.js': return 'javascript';
    case '.jsx': return 'jsx';
    case '.json': return 'json';
    case '.html': return 'html';
    case '.rules': return 'javascript'; // Firestore rules formatting is close enough
    default: return '';
  }
}

function traverseDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (EXCLUDED_FILES_OR_DIRS.has(file)) continue;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      traverseDirectory(fullPath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ALLOWED_EXTENSIONS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

function generateMarkdown() {
  let mdContent = `# Código del Proyecto: TallerConnect\n\n`;
  mdContent += `Este documento contiene todo el código fuente del proyecto para facilitar su revisión.\n\n`;
  mdContent += `Generado el: ${new Date().toLocaleString()}\n\n`;

  // 1. Root Files
  mdContent += `## Archivos de Configuración del Proyecto\n\n`;
  for (const filename of INCLUDE_ROOT_FILES) {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
      const relativePath = path.relative(__dirname, filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lang = getLanguageForExtension(filePath);
      mdContent += `### [${relativePath}](file://${filePath})\n\n`;
      mdContent += `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    }
  }

  // 2. Source Files (src)
  mdContent += `## Código Fuente (src)\n\n`;
  if (fs.existsSync(SRC_DIR)) {
    const srcFiles = traverseDirectory(SRC_DIR);
    // Sort files alphabetically
    srcFiles.sort();

    for (const filePath of srcFiles) {
      const relativePath = path.relative(__dirname, filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lang = getLanguageForExtension(filePath);
      mdContent += `### [${relativePath}](file://${filePath})\n\n`;
      mdContent += `\`\`\`${lang}\n${content}\n\`\`\`\n\n`;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, mdContent, 'utf-8');
  console.log(`¡Markdown generado exitosamente en: ${OUTPUT_FILE}!`);
}

generateMarkdown();
