// Simulação de rate limit para o Cloudinary
// Isso ajuda a evitar atingir os limites da conta gratuita

const RATE_LIMIT_WINDOW = 1000 * 60 * 60 // 1 hora em milissegundos
const MAX_REQUESTS_PER_HOUR = 500 // Limite de transformações por hora na conta gratuita

interface RateLimitState {
    requests: number
    windowStart: number
}

let state: RateLimitState = {
    requests: 0,
    windowStart: Date.now()
}

export function checkRateLimit(): boolean {
    const now = Date.now()

    // Reseta o contador se passou uma hora
    if (now - state.windowStart >= RATE_LIMIT_WINDOW) {
        state = {
            requests: 0,
            windowStart: now
        }
    }

    // Incrementa o contador e verifica o limite
    state.requests++

    // Retorna true se ainda está dentro do limite
    return state.requests <= MAX_REQUESTS_PER_HOUR
}

export function getRemainingRequests(): number {
    const now = Date.now()

    // Reseta o contador se passou uma hora
    if (now - state.windowStart >= RATE_LIMIT_WINDOW) {
        state = {
            requests: 0,
            windowStart: now
        }
    }

    return Math.max(0, MAX_REQUESTS_PER_HOUR - state.requests)
}

export function resetRateLimit(): void {
    state = {
        requests: 0,
        windowStart: Date.now()
    }
} 