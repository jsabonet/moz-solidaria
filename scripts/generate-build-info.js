#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Gerar informações de build para cache busting
function generateBuildInfo() {
  const buildTimestamp = new Date().toISOString();
  const buildHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const buildInfo = {
    version: packageJson.version,
    buildTime: buildTimestamp,
    gitHash: buildHash,
    buildId: `${packageJson.version}-${buildHash}-${Date.now()}`,
    // Cache busting query parameter
    cacheBuster: Date.now()
  };

  // Salvar informações de build no dist
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  // Arquivo para frontend consumir
  fs.writeFileSync(
    path.join(distPath, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  // Arquivo para uso em scripts
  fs.writeFileSync(
    path.join(__dirname, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  console.log('✅ Build info generated:');
  console.log(`   Version: ${buildInfo.version}`);
  console.log(`   Build ID: ${buildInfo.buildId}`);
  console.log(`   Git Hash: ${buildInfo.gitHash}`);
  console.log(`   Build Time: ${buildInfo.buildTime}`);

  return buildInfo;
}

// Função para atualizar o index.html com cache busting
function updateIndexHtml(buildInfo) {
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Adicionar meta tag com versão para cache busting
    const metaTag = `    <meta name="app-version" content="${buildInfo.buildId}">
    <meta name="build-time" content="${buildInfo.buildTime}">`;
    
    // Inserir após a tag <head>
    indexContent = indexContent.replace(
      '<head>',
      `<head>\n${metaTag}`
    );
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Index.html updated with build info');
  }
}

// Executar se chamado diretamente
try {
  const buildInfo = generateBuildInfo();
  updateIndexHtml(buildInfo);
} catch (error) {
  console.error('❌ Error generating build info:', error.message);
  process.exit(1);
}

export { generateBuildInfo, updateIndexHtml };
