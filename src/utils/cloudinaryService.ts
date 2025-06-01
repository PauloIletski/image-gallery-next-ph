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
    private CACHE_TTL = 5 * 60 * 1000 // 5 minutos em milissegundos

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
            return cached.data
        }

        const result = await operation()
        this.cache.set(key, {
            data: result,
            timestamp: Date.now()
        })
        return result
    }

    // Busca imagens de uma galeria com cache e retry
    async getGalleryImages(slug: string) {
        const cacheKey = `gallery_${slug}`

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