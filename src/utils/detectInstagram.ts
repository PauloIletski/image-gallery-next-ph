/**
 * Detecta se o site está sendo acessado pelo navegador embutido do Instagram
 * @returns true se estiver no navegador do Instagram, false caso contrário
 */
export function isInstagramBrowser(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  // O User-Agent do Instagram geralmente contém "instagram"
  // Exemplo: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 123.0.0.21.114"
  return userAgent.includes('instagram')
}

/**
 * Detecta se o site está sendo acessado pelo navegador embutido do Facebook
 * @returns true se estiver no navegador do Facebook, false caso contrário
 */
export function isFacebookBrowser(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  // O User-Agent do Facebook geralmente contém "fban" ou "fbav"
  return userAgent.includes('fban') || userAgent.includes('fbav')
}

/**
 * Detecta se o site está sendo acessado por um navegador embutido de rede social
 * @returns true se estiver em um navegador de rede social, false caso contrário
 */
export function isSocialMediaBrowser(): boolean {
  return isInstagramBrowser() || isFacebookBrowser()
}

