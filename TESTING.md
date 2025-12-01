# Configuração para Modo de Teste - Reduzir Rate Limit do Cloudinary

Este documento explica como configurar o projeto para minimizar chamadas à API do Cloudinary durante desenvolvimento e testes.

## Problema

O Cloudinary tem um limite de 500 operações de API por hora na conta gratuita. Cada transformação de imagem (como `c_scale,w_720`) conta como uma operação.

## Soluções Implementadas

### 1. Cache Mais Longo em Desenvolvimento

O cache foi aumentado de 5 minutos para 1 hora em modo de desenvolvimento, reduzindo significativamente as chamadas à API.

### 2. Modo Mock (Dados Falsos)

Você pode ativar o modo mock para usar dados falsos sem fazer chamadas reais ao Cloudinary.

**Como usar:**

Adicione no seu arquivo `.env.local`:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Quando ativado, o sistema retornará dados mock em vez de fazer chamadas reais ao Cloudinary.

### 3. URLs Diretas (Sem Transformações)

Em desenvolvimento, você pode usar URLs diretas sem transformações para reduzir operações de API.

**Como usar:**

Adicione no seu arquivo `.env.local`:

```bash
NEXT_PUBLIC_USE_DIRECT_IMAGE_URLS=true
```

Isso fará com que as imagens sejam carregadas diretamente sem transformações, reduzindo as operações de API.

## Configuração Recomendada para Testes

Para desenvolvimento/testes, adicione ao `.env.local`:

```bash
# Usar dados mock (sem chamadas ao Cloudinary)
NEXT_PUBLIC_USE_MOCK_DATA=true

# OU usar URLs diretas (menos transformações)
NEXT_PUBLIC_USE_DIRECT_IMAGE_URLS=true
```

## Verificando Rate Limit

O sistema já implementa:
- Cache automático (1 hora em dev, 5 min em produção)
- Retry com exponential backoff
- Tratamento de erros de rate limit (código 420)

## Monitoramento

Para verificar o estado do rate limit, você pode verificar os logs do console quando houver erros.

## Notas

- O modo mock é útil para desenvolvimento de UI sem depender do Cloudinary
- URLs diretas reduzem operações mas podem aumentar o tamanho dos arquivos baixados
- Em produção, sempre use as transformações otimizadas para melhor performance

