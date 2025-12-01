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

  // Verificar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Padrão Instagram: abrir a imagem diretamente no navegador padrão do celular
    // Isso permite que o usuário use o menu do navegador (3 pontos) ou pressione e segure
    // a imagem para salvá-la, seguindo o comportamento nativo do dispositivo
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    // Para desktop, garantir download automático usando fetch + blob
    // Isso funciona mesmo com imagens de domínios externos (CORS)
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
        link.click();
        link.remove();
        
        // Limpar o blob URL após um delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
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
}
