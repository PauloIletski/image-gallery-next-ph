import { getGalleryPaths } from './src/lib/get-gallery-images.ts';

export async function testGenerateStaticParams() {
  try {
    console.log('=== Testando generateStaticParams() ===\n');
    const folders = await getGalleryPaths();
    
    console.log(`✓ Pastas retornadas: ${folders.length}`);
    
    if (folders.length === 0) {
      console.log('\n⚠️  PROBLEMA: generateStaticParams() retornou array vazio!');
      console.log('Isso explica o erro 404!\n');
    } else {
      console.log('\nSlugs que deveriam estar funcionando:');
      folders.forEach(folder => {
        console.log(`  ✓ /issacar-galeries/${folder.slug}`);
      });
    }
  } catch (error) {
    console.error('\n✗ Erro ao executar getGalleryPaths():');
    console.error(error);
  }
}

testGenerateStaticParams();
