// Script para testar se os slugs estão sendo gerados corretamente
require('dotenv').config();

const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function testSlugs() {
  try {
    console.log('=== Testando conexão com Cloudinary ===');
    console.log(`Cloud Name: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
    
    const result = await cloudinary.api.sub_folders('galeries');
    
    console.log('\n✓ Conexão bem-sucedida!');
    console.log(`\nPastas encontradas: ${result.folders?.length || 0}`);
    
    if (result.folders && result.folders.length > 0) {
      console.log('\nSlugs gerados:');
      result.folders.forEach(folder => {
        console.log(`  - ${folder.name}`);
      });
    } else {
      console.log('\n⚠️  Nenhuma pasta encontrada em galeries/');
    }
    
  } catch (error) {
    console.error('\n✗ Erro ao conectar com Cloudinary:');
    console.error(`  Status: ${error.http_code || 'Unknown'}`);
    console.error(`  Mensagem: ${error.message}`);
  }
}

testSlugs();
