function forceDownload(blobUrl: string, filename: string) {
  let a: any = document.createElement("a");
  a.download = filename;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function downloadPhoto(url: string, filename?: string) {
  const defaultFilename = url.split("\\").pop()?.split("/").pop() || "image";
  const finalFilename = filename || defaultFilename;

  // Verificar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    // Para mobile, usar fetch e blob para evitar problemas de CORS
    fetch(url, {
      headers: new Headers({
        Origin: location.origin,
      }),
      mode: "cors",
    })
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = blobUrl;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Limpar o blob URL após um delay
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);
      })
      .catch((err) => {
        console.error('Erro no download:', err);
        // Fallback: tentar abrir em nova aba
        window.open(url, '_blank');
      });
  } else {
    // Para desktop, usar download direto
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
