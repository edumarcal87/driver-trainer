# Driver Trainer — Setup de Autenticação

## 1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto (anote a **URL** e a **anon key**)
3. No **SQL Editor**, cole e execute todo o conteúdo de `supabase/schema.sql`

## 2. Configurar provedores de login

No dashboard do Supabase, vá em **Authentication > Providers**:

### Google
1. Ative o provider "Google"
2. Crie credenciais OAuth no [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Tipo: "Web application"
4. Redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Cole o Client ID e Client Secret no Supabase

### Discord
1. Ative o provider "Discord"
2. Crie uma aplicação no [Discord Developer Portal](https://discord.com/developers/applications)
3. Em OAuth2, adicione redirect: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Cole o Client ID e Client Secret no Supabase

### Email
- Já vem ativado por padrão
- Em **Authentication > Settings**, configure:
  - Site URL: `https://seu-dominio.vercel.app`
  - Redirect URLs: `https://seu-dominio.vercel.app/**`

## 3. Configurar variáveis de ambiente

### Desenvolvimento local
Crie um arquivo `.env` na raiz do projeto:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...sua-chave-anon
```

### Vercel (produção)
1. Crie conta em [vercel.com](https://vercel.com)
2. Importe o repositório do GitHub
3. Em **Settings > Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy automático a cada push

## 4. Testar

```bash
npm install
npm run dev
```

O app funciona em 3 modos:
- **Sem Supabase** (`.env` vazio): funciona 100% com localStorage, sem login
- **Supabase + Free**: login funciona, dados sincronizam, mas programas são bloqueados pelo PremiumGate
- **Supabase + Premium**: acesso total — altere o `plan` no Supabase Dashboard para 'premium' no registro do usuário

## 5. Promover usuário a Premium (manual)

No Supabase Dashboard > Table Editor > profiles:
- Encontre o usuário
- Altere `plan` de 'free' para 'premium'
- (Opcional) Defina `plan_expires_at` para uma data futura

## Estrutura de tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do usuário (nome, avatar, plano) |
| `session_logs` | Histórico completo de exercícios |
| `best_scores` | Melhor score por exercício |
| `wheel_calibrations` | Config de pedais por volante |
| `preferences` | Configurações do app |

Todas as tabelas têm **Row Level Security** — cada usuário só acessa seus próprios dados.
