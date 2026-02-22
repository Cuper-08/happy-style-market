# 🛍️ Happy Style Market — Plataforma de Varejo + WhatsApp IA

> Template completo para lojas de moda com App, Banco de Dados e Atendente Virtual IA no WhatsApp.
> Replicável para qualquer loja. Desenvolvido pela **HSB Marketing / Antigravity**.

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTE (WhatsApp)                            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ envia mensagem
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EVOLUTION API (self-hosted)                       │
│       Gerencia instâncias WhatsApp via protocolo Baileys             │
│       URL: https://evo.hsbmarketing.com.br                          │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ webhook MESSAGES_UPSERT (POST)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│            SUPABASE EDGE FUNCTION: whatsapp-bot                      │
│                    (Deno / TypeScript)                               │
│                                                                     │
│  1. Filtra (ignora grupos, próprias msgs, msgs vazias)              │
│  2. Salva msg do cliente em chat_history (role=user)                │
│  3. Busca histórico da conversa (últimas 8 msgs)                    │
│  4. Busca catálogo de produtos do banco (60 itens)                  │
│  5. Monta prompt completo com contexto da loja + produtos           │
│  6. Chama OpenAI GPT-4o-mini                                        │
│  7. Detecta intenção de transferência (keywords + IA)               │
│  8. Salva resposta em chat_history (role=assistant)                 │
│  9. Envia resposta via Evolution API                                 │
│ 10. Se transferência: envia alerta para número do vendedor          │
└──────────┬───────────────────────────────────┬──────────────────────┘
           │                                   │
           ▼                                   ▼
┌──────────────────────┐          ┌────────────────────────────┐
│  SUPABASE DATABASE   │          │    OPENAI API              │
│  PostgreSQL          │          │    Modelo: gpt-4o-mini     │
│                      │          │    Max tokens: 500         │
│  Tabelas:            │          │    Temperature: 0.7        │
│  - products          │          └────────────────────────────┘
│  - chat_history      │
│  - store_settings    │
│  - profiles          │
│  - orders            │
└──────────────────────┘
           │
           │ Trigger SQL (pg_net) — opcional
           ▼
┌──────────────────────┐
│   n8n (OPCIONAL)     │
│   Para fluxos extras │
│   de automação       │
└──────────────────────┘
```

---

## ❓ Por que **não** usamos o n8n como intermediário?

O n8n foi testado, mas apresentou limitações críticas:

| Problema | Impacto |
|---------|---------|
| Webhook de produção exige ativação **manual** no editor | Instável para reinicializações |
| Latência adicional de 1-2s por hop extra | Pior UX no WhatsApp |
| Mais pontos de falha (Evolution → n8n → Supabase → OpenAI) | Menos confiável |
| Dificuldade de escalar para múltiplos clientes | Complexidade operacional |

**A solução atual** (Evolution → Supabase Edge Function → OpenAI) é:
- ✅ **Mais simples**: menos componentes
- ✅ **Mais rápida**: 1 hop a menos
- ✅ **Mais confiável**: Supabase tem 99.9% SLA
- ✅ **Mais escalável**: Edge Functions escalam automaticamente (sem configuração)
- ✅ **Mais barata**: Custo por invocação (centavos)

> O n8n ainda existe no sistema com um trigger SQL que o chama via `pg_net`.
> Pode ser ativado para automações extras (relatórios, CRM, notificações agendadas).

---

## 🌙 Luna — Atendente Virtual IA

### Como funciona o prompt da Luna

A Edge Function constrói dinamicamente um prompt com 4 camadas:

```
SYSTEM PROMPT = [Base da PersonaI] + [Info da Loja] + [Catálogo de Produtos] + [Histórico da Conversa]
USER MESSAGE  = mensagem do cliente
```

**Camada 1 — Persona e Regras** (fixo no código)
- Nome, personalidade, estilo de escrita
- Regras de comportamento (quando mandar app, como responder, etc.)

**Camada 2 — Dados da Loja** (fixo no código, personalizar por cliente)
- Endereço físico, horário, Instagram, formas de pagamento
- Políticas de atacado/varejo

**Camada 3 — Catálogo Real** (dinâmico — vem do banco a cada requisição)
- Top 60 produtos ordenados por preço (maior primeiro)
- Agrupados por categoria com nome e preço

**Camada 4 — Histórico** (dinâmico — personalizado por número de telefone)
- Últimas 8 mensagens da conversa desse cliente específico
- Permite continuidade da conversa (Luna "lembra" do contexto)

### Lógica de Transferência para Humano

```
Cliente menciona: "chamada de vídeo" | "falar com vendedor" | "falar com humano"
                              ↓
[duas detecções em paralelo]
  1. Keyword matching (código — mais rápido)
  2. IA retorna [TRANSFERIR_HUMANO:Nome:Necessidade]
                              ↓
Luna responde: "Vou chamar um consultor agora!"
                              ↓
Evolution API envia alerta para o número do vendedor:
  🚨 TRANSFERÊNCIA - BRÁS CONCEITO
  👤 Cliente: João
  📱 https://wa.me/5511...
  💬 Necessidade: quer fazer video chamada
  ⏰ 21/02/2026 19:10
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas principais

```sql
-- Catálogo de produtos
products (id, slug, title, description, price, price_display, price_retail, price_retail_display, category, images[], original_url)

-- Histórico do WhatsApp (por telefone, não por usuário logado)
chat_history (id, contact_phone, role [user|assistant], message, metadata jsonb, created_at)

-- Configurações da loja
store_settings (id, company_name, whatsapp, email, address, ...)

-- Perfis de usuários do App
profiles (id, full_name, avatar_url, phone, role, ...)

-- Pedidos
orders (id, user_id, total, status, items jsonb, ...)
```

### Triggers SQL

```sql
-- Dispara chamada HTTP para o n8n via pg_net quando cliente envia msg
-- (opcional — n8n pode estar inativo)
CREATE TRIGGER trg_whatsapp_msg_to_n8n
  AFTER INSERT ON chat_history
  FOR EACH ROW EXECUTE FUNCTION notify_n8n_whatsapp_message();
```

---

## 📱 Aplicativo (Lovable — React + Supabase)

O app foi gerado e está hospedado em: **https://happy-style-market.lovable.app**

### Stack do App
- **Frontend**: React + TypeScript + Tailwind CSS (gerado via Lovable.dev)
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Auth**: Supabase Auth (email/senha + Google OAuth)
- **Hosting**: Lovable.dev (deploy automático via GitHub)

### Repositório
- GitHub: `https://github.com/Cuper-08/happy-style-market`
- Branch principal: `main`

---

## 🔧 Stack Tecnológica Completa

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| WhatsApp | Evolution API (self-hosted) | Gerencia conexão WhatsApp |
| Bot IA | Supabase Edge Function (Deno) | Lógica do bot Luna |
| IA | OpenAI GPT-4o-mini | Geração de respostas |
| Banco | Supabase PostgreSQL | Produtos, histórico, usuários |
| App | React + Lovable.dev | Vitrine online + pedidos |
| Auth | Supabase Auth | Login, sessões, Google |
| Storage | Supabase Storage | Imagens de produtos |
| Automação (extra) | n8n (self-hosted) | Fluxos extras (opcional) |

---

## 🚀 Como Replicar para um Novo Cliente

### Passo 1 — Criar novo projeto Supabase

```bash
# 1. Acesse https://supabase.com → New Project
# 2. Anote: Project URL e anon/service_role keys
# 3. Execute as migrations SQL (ver pasta /supabase/migrations)
```

### Passo 2 — Configurar variáveis de ambiente

As Edge Functions precisam das seguintes secrets no Supabase:
```
SUPABASE_URL          = https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJ...
OPENAI_API_KEY        = sk-proj-...  (opcional — pode ser hardcoded)
```

### Passo 3 — Personalizar a Edge Function `whatsapp-bot`

Edite o arquivo `/supabase/functions/whatsapp-bot/index.ts`:

```typescript
// ===== PERSONALIZAR POR CLIENTE =====
const APP_URL = "https://[url-do-app-do-cliente].lovable.app";
const EVOLUTION_INSTANCE = "[nome-da-instancia-whatsapp]";
const EVOLUTION_API_KEY = "[token-da-instancia]";
const VENDEDOR_NUMBER = "55[DDD][numero]"; // Número para transferências
const OPENAI_KEY = "sk-proj-..."; // Chave OpenAI

// Personalizar a persona da Luna
const SYSTEM_PROMPT_BASE = `Você é [NOME_DO_BOT], vendedora da [NOME_DA_LOJA]...
  Endereço: [ENDEREÇO]
  Horário: [HORÁRIO]
  Pagamento: [FORMAS DE PAGAMENTO]
  ...`;
```

### Passo 4 — Deploy da Edge Function

```bash
# Via Supabase CLI
supabase functions deploy whatsapp-bot --project-ref [project-ref]

# Ou via Supabase Dashboard → Edge Functions → Deploy
```

### Passo 5 — Configurar Evolution API

```bash
# 1. Criar instância no painel Evolution (https://[seu-evolution]/manager)
# 2. Conectar WhatsApp via QR Code
# 3. Configurar Webhook para apontar para a Edge Function:
#    URL: https://[project-ref].supabase.co/functions/v1/whatsapp-bot
#    Events: MESSAGES_UPSERT
```

### Passo 6 — Fork do App (Lovable)

```bash
# 1. Fork do repositório: https://github.com/Cuper-08/happy-style-market
# 2. Conectar ao Lovable.dev com o novo repo
# 3. Atualizar variáveis de ambiente no Lovable:
#    VITE_SUPABASE_URL = [novo projeto]
#    VITE_SUPABASE_ANON_KEY = [nova chave anon]
# 4. Publish no Lovable → gera nova URL do cliente
```

### Passo 7 — Importar produtos

```bash
# Via scraper Python (se o cliente tem site):
python scraper/scrape_products.py --url [url-da-loja]

# Via upload manual no Supabase Dashboard → Table Editor → products

# Via CSV import:
supabase db seed --db-url [connection-string] < produtos.sql
```

---

## 📊 Capacidade e Escalabilidade

| Métrica | Valor |
|---------|-------|
| Edge Functions invocações/mês (free) | 500.000 |
| Latência média da Luna responder | 2-5 segundos |
| Histórico por cliente | Ilimitado (PostgreSQL) |
| Produtos no catálogo | Ilimitado |
| Clientes simultâneos | Escalável automaticamente |
| Custo por mensagem processada | ~$0.0003 (GPT-4o-mini) |
| Instâncias WhatsApp suportadas | 1 por projeto Supabase |

**Estimativa de custo mensal (1000 msgs/dia):**
- Supabase (free tier): R$ 0
- OpenAI (~30k tokens/dia): ~R$ 0,90/dia = ~R$ 27/mês
- Evolution API: plano HSB Marketing (incluso)
- **Total estimado: ~R$ 30-50/mês por cliente**

---

## 🔐 Variáveis e Credenciais

| Variável | Onde Fica | Descrição |
|---------|-----------|-----------|
| `SUPABASE_URL` | Edge Function secret | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function secret | Chave admin do Supabase |
| `OPENAI_API_KEY` | Hardcoded / secret | Chave da OpenAI |
| `EVOLUTION_API_KEY` | Hardcoded no código | Token da instância WhatsApp |
| `EVOLUTION_INSTANCE` | Hardcoded no código | Nome da instância Evolution |
| `VENDEDOR_NUMBER` | Hardcoded no código | Número para receber transferências |
| `VITE_SUPABASE_URL` | .env do App | URL pública do Supabase (frontend) |
| `VITE_SUPABASE_ANON_KEY` | .env do App | Chave pública do Supabase (frontend) |

---

## 📁 Estrutura do Repositório

```
happy-style-market/
├── src/                         # Código do App React
│   ├── components/              # Componentes UI
│   ├── pages/                   # Páginas (Home, Produto, Checkout...)
│   ├── hooks/                   # Custom hooks (useProducts, useCart...)
│   ├── integrations/supabase/   # Cliente Supabase gerado automaticamente
│   └── types/                   # Tipos TypeScript
├── supabase/
│   ├── functions/
│   │   ├── whatsapp-bot/        # ⭐ Bot Luna (IA WhatsApp)
│   │   │   └── index.ts         # Lógica principal do bot
│   │   └── calculate-shipping/  # Cálculo de frete
│   └── migrations/              # Histórico de migrations SQL
├── public/                      # Assets estáticos
├── .env.example                 # Template de variáveis de ambiente
└── README.md                    # este arquivo
```

---

## 🆘 Troubleshooting

### Luna não responde no WhatsApp
1. Verifique o webhook da Evolution API → deve apontar para a Edge Function
2. Verifique os logs: Supabase Dashboard → Edge Functions → Logs
3. Verifique se a instância WhatsApp está conectada (status "open")

### Luna responde mas a mensagem não chega
1. `evoStatus` no log deve ser `201`. Se for `401` → API key errada
2. Se `400` → número inválido ou instância desconectada
3. Verifique o token da instância em Evolution → Instâncias

### Produto não aparece no contexto da Luna
1. Verifique se o produto está na tabela `products` com `price_retail_display` preenchido
2. A Edge Function busca os 60 produtos mais caros — produtos sem preço não aparecem

### Transferência não chega ao vendedor
1. Verifique `VENDEDOR_NUMBER` no código (deve ter 55 + DDD + número)
2. Verifique se a instância Evolution está conectada
3. O número do vendedor precisa ter WhatsApp ativo

---

## 📞 Suporte

**Desenvolvido por:** HSB Marketing / Antigravity  
**Contato:** [seu-email@hsb.com]  
**Evolution API:** https://evo.hsbmarketing.com.br  
**n8n (automações):** https://n8n.hsbmarketing.com.br
