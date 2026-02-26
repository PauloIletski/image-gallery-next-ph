#!/usr/bin/env node

// Simula o comportamento do generateStaticParams
import { promisify } from 'util';
import { execSync } from 'child_process';

console.log('=== Analisando o Problema do 404 ===\n');

// Testa a build para ver se há erros
try {
  console.log('1️⃣  Executando build...\n');
  const buildOutput = execSync('npm run build 2>&1', { 
    cwd: '/home/phuser/image-gallery-next-ph',
    encoding: 'utf-8'
  });
  
  // Procura por patterns relacionados a [slug]
  const slugLines = buildOutput.split('\n').filter(line => 
    line.includes('[slug]') || 
    line.includes('issacar') || 
    line.includes('Generating') ||
    line.includes('aborting') ||
    line.includes('Error')
  );
  
  if (slugLines.length > 0) {
    console.log('❌ Erros encontrados na build relacionados a [slug]:\n');
    slugLines.forEach(line => console.log('  ', line));
  } else {
    console.log('✓ Build completada sem erros óbvios em [slug]');
  }
  
} catch (error) {
  console.error('Erro ao executar build:', error.message);
}
