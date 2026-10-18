# Frontend Pratas da Gabi

Next.js App Router. O frontend chama a API por `/backend/api`; o rewrite em `next.config.ts` encaminha as requisições para o backend e mantém os cookies de autenticação HttpOnly no domínio do frontend.

## Local

1. `npm install`
2. Copie `.env.example` para `.env.local` (ou configure as variáveis no ambiente):
   - `NEXT_PUBLIC_API_URL=/backend/api`
   - `API_PROXY_TARGET=http://localhost:3333`
3. Inicie a API na porta 3333 e execute `npm run dev`.

## Produção

Configure `API_PROXY_TARGET` com a URL raiz do backend, por exemplo `https://seu-backend.onrender.com`, e mantenha `NEXT_PUBLIC_API_URL=/backend/api`. No backend, adicione a origem exata do frontend em `CORS_ORIGINS`.

O arquivo `proxy.ts` protege `/admin/*` verificando os cookies de sessão. A autorização real permanece no backend, que valida a assinatura e a expiração do JWT em todas as rotas administrativas. A renovação usa o refresh token rotativo por cookie HttpOnly.
