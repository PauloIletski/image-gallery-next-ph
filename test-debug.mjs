import { v2 as cloudinary } from 'cloudinary';

const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

console.log('=== Testando Cloudinary ===');
console.log(`Cloud Name: ${cloud}`);
console.log(`API Key: ${key ? '✓ Configurado' : '✗ Faltando'}`);
console.log(`API Secret: ${secret ? '✓ Configurado' : '✗ Faltando'}`);

if (!cloud || !key || !secret) {
  console.error('\n✗ Variáveis de ambiente faltando!');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloud,
  api_key: key,
  api_secret: secret,
  secure: true
});

try {
  console.log('\n⏳ Conectando ao Cloudinary...');
  const result = await cloudinary.api.sub_folders('galeries');
  
  console.log('✓ Conexão bem-sucedida!\n');
  console.log(`Pastas encontradas: ${result.folders?.length || 0}`);
  
  if (result.folders && result.folders.length > 0) {
    console.log('\nSlugs (pastas):');
    result.folders.forEach(folder => {
      console.log(`  - ${folder.name}`);
    });
  } else {
    console.log('\n⚠️  Nenhuma pasta encontrada em galeries/');
  }
} catch (error) {
  console.error('\n✗ Erro ao conectar:');
  console.error(`Status: ${error.http_code || 'Unknown'}`);
  console.error(`Mensagem: ${error.message}`);
}
