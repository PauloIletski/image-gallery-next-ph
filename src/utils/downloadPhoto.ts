import { isInstagramBrowser } from './detectInstagram'

function forceDownload(blobUrl: string, filename: string) {
  let a: any = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function downloadPhoto(
  url: string, 
  filename?: string,
  albumName?: string,
  order?: number
) {
  let finalFilename: string;
  
  if (albumName && order !== undefined) {
    // Formato: nomeAlbum_ordem_data (sem pontuação)
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    // Limpar o nome do álbum: remover caracteres especiais e substituir espaços/underscores por nada
    const cleanAlbumName = albumName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const orderStr = (order + 1).toString().padStart(3, '0'); // +1 porque ordem começa em 0
    
    // Obter extensão do arquivo original ou usar jpg como padrão
    const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
    
    finalFilename = `${cleanAlbumName}_${orderStr}_${dateStr}.${extension}`;
  } else {
    const defaultFilename = url.split("\\").pop()?.split("/").pop() || "image";
    finalFilename = filename || defaultFilename;
  }

  // Verificar se é o navegador do Instagram
  const isInstagram = isInstagramBrowser();

  // Se estiver no navegador do Instagram, usar o padrão de abrir no navegador padrão
  // Isso permite que o usuário use o menu do navegador (3 pontos) ou pressione e segure
  // a imagem para salvá-la, seguindo o comportamento nativo do Instagram
  if (isInstagram) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  // Para todos os outros cenários (mobile ou desktop), fazer download automático
  // Usar fetch + blob para garantir que funcione mesmo com imagens de domínios externos (CORS)
  fetch(url, {
    mode: 'cors',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao baixar a imagem');
      }
      return response.blob();
    })
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = finalFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      
      // Usar evento de clique para garantir que funcione no mobile
      link.click();
      
      // Remover o link e revogar o blob URL após um delay maior
      // Importante no mobile: 500ms garante que o navegador iniciou o download
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      }, 500);
    })
    .catch((err) => {
      console.error('Erro no download:', err);
      // Fallback: tentar download direto (pode não funcionar com CORS)
      const link = document.createElement("a");
      link.href = url;
      link.download = finalFilename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
}
