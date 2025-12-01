import { v2 as cloudinary } from 'cloudinary'

interface CacheItem<T> {
    data: T
    timestamp: number
}

interface RateLimitInfo {
    remaining: number
    reset: number
    retryAfter?: number
}

class CloudinaryService {
    private cache: Map<string, CacheItem<any>> = new Map()
    private rateLimitInfo: RateLimitInfo = {
        remaining: 500, // valor inicial padrão
        reset: Date.now() + 3600000 // 1 hora a partir de agora
    }
    // Em modo de desenvolvimento/teste, usar cache mais longo para reduzir chamadas
    private CACHE_TTL = process.env.NODE_ENV === 'development'
        ? 60 * 60 * 1000 // 1 hora em desenvolvimento
        : 5 * 60 * 1000 // 5 minutos em produção
    private USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

    constructor() {
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        })
    }

    // Atualiza as informações de rate limit baseado nos headers da resposta
    private updateRateLimitInfo(headers: any) {
        if (headers['x-featureratelimit-remaining']) {
            this.rateLimitInfo.remaining = parseInt(headers['x-featureratelimit-remaining'])
        }
        if (headers['x-featureratelimit-reset']) {
            this.rateLimitInfo.reset = new Date(headers['x-featureratelimit-reset']).getTime()
        }
        if (headers['retry-after']) {
            this.rateLimitInfo.retryAfter = parseInt(headers['retry-after']) * 1000
        }
    }

    // Verifica se pode fazer uma nova requisição
    private canMakeRequest(): boolean {
        return this.rateLimitInfo.remaining > 0 && Date.now() >= this.rateLimitInfo.reset
    }

    // Implementa retry logic com exponential backoff
    private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (!this.canMakeRequest()) {
                    const waitTime = this.rateLimitInfo.retryAfter || Math.min(1000 * Math.pow(2, attempt), 60000)
                    await new Promise(resolve => setTimeout(resolve, waitTime))
                }

                const result = await operation()
                return result
            } catch (error: any) {
                if (error.http_code === 420 && attempt < maxRetries) { // Rate limit atingido
                    const waitTime = error.headers?.['retry-after'] ?
                        parseInt(error.headers['retry-after']) * 1000 :
                        Math.min(1000 * Math.pow(2, attempt), 60000)

                    await new Promise(resolve => setTimeout(resolve, waitTime))
                    continue
                }
                throw error
            }
        }
        throw new Error('Máximo de tentativas excedido')
    }

    // Gerencia cache para requisições
    private async withCache<T>(key: string, operation: () => Promise<T>): Promise<T> {
        const cached = this.cache.get(key)
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`[CACHE HIT] Usando cache para: ${key}`)
            }
            return cached.data
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`[CACHE MISS] Buscando dados do Cloudinary para: ${key}`)
        }

        try {
            const result = await operation()
            this.cache.set(key, {
                data: result,
                timestamp: Date.now()
            })
            return result
        } catch (error: any) {
            // Se houver erro de rate limit, tentar usar cache mesmo expirado
            if (error.http_code === 420) {
                console.warn('[RATE LIMIT] Rate limit atingido, tentando usar cache expirado')
                if (cached) {
                    return cached.data
                }
            }
            throw error
        }
    }

    // Busca imagens de uma galeria com cache e retry
    async getGalleryImages(slug: string) {
        const cacheKey = `gallery_${slug}`

        // Em modo de teste, retornar dados mock se configurado
        if (this.USE_MOCK_DATA) {
            console.log(`[MOCK] Retornando dados mock para galeria: ${slug}`)
            return {
                resources: [
                    {
                        public_id: `galeries/${slug}/mock1`,
                        format: 'jpg',
                        height: 1080,
                        width: 1920,
                        created_at: new Date().toISOString()
                    },
                    {
                        public_id: `galeries/${slug}/mock2`,
                        format: 'jpg',
                        height: 1920,
                        width: 1080,
                        created_at: new Date().toISOString()
                    }
                ],
                headers: {}
            }
        }

        return this.withCache(cacheKey, async () => {
            return this.retryOperation(async () => {
                const result = await cloudinary.search
                    .expression(`folder:galeries/${slug}/*`)
                    .sort_by('public_id', 'desc')
                    .with_field('context')
                    .max_results(400)
                    .execute()

                this.updateRateLimitInfo(result.headers || {})
                return result
            })
        })
    }

    // Busca pastas com cache e retry
    async getGalleryFolders() {
        const cacheKey = 'gallery_folders'

        // Em modo de teste, retornar dados mock se configurado
        if (this.USE_MOCK_DATA) {
            console.log('[MOCK] Retornando pastas mock')
            return {
                folders: [
                    { name: 'test-album-1', path: 'galeries/test-album-1' },
                    { name: 'test-album-2', path: 'galeries/test-album-2' }
                ],
                headers: {}
            }
        }

        return this.withCache(cacheKey, async () => {
            return this.retryOperation(async () => {
                const result = await cloudinary.api.sub_folders('galeries')
                this.updateRateLimitInfo(result.headers || {})
                return result
            })
        })
    }

    // Limpa o cache para uma chave específica
    clearCache(key: string) {
        this.cache.delete(key)
    }

    // Limpa todo o cache
    clearAllCache() {
        this.cache.clear()
    }

    // Retorna informações sobre o rate limit atual
    getRateLimitInfo(): RateLimitInfo {
        return { ...this.rateLimitInfo }
    }
}

// Exporta uma única instância do serviço
export const cloudinaryService = new CloudinaryService() 