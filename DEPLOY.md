# Guia de Deploy - Happy Style Market

Este guia descreve os passos necessários para colocar as funcionalidades de pagamento (ASAAS), frete (Melhor Envio) e integração em produção no Supabase.

## 1. Pré-requisitos

Certifique-se de ter a CLI do Supabase instalada e logada:

```bash
npx supabase login
```

## 2. Configuração de Segredos (Variáveis de Ambiente)

As Edge Functions dependem de chaves de API sensíveis. **Nunca** coloque essas chaves no código. Configure-as no painel do Supabase ou via CLI.

Execute os comandos abaixo no terminal para definir os segredos de produção:

```bash
# Chave de API do ASAAS (Sandbox para testes, Produção para live)
npx supabase secrets set ASAAS_API_KEY="sua_chave_api_asaas_aqui"

# Token do Melhor Envio (Sandbox ou Produção)
npx supabase secrets set MELHOR_ENVIO_TOKEN="seu_token_melhor_envio_aqui"

# Token para validar o Webhook do ASAAS (opcional, mas recomendado)
# Você define um valor aqui e configura o mesmo no painel do ASAAS
npx supabase secrets set ASAAS_WEBHOOK_TOKEN="seu_token_secreto_webhook"
```

> **Nota:** Para o ambiente local, crie um arquivo `.env` na pasta `supabase/functions` com essas variáveis se precisar testar localmente com `supabase functions serve`.

## 3. Deploy das Edge Functions

Para fazer o deploy das funções para a nuvem Supabase, execute:

```bash
# Função de Pagamento (ASAAS)
npx supabase functions deploy create-payment --no-verify-jwt

# Função de Webhook (ASAAS -> Supabase)
npx supabase functions deploy asaas-webhook --no-verify-jwt

# Função de Cálculo de Frete (Melhor Envio)
npx supabase functions deploy calculate-shipping --no-verify-jwt
```

> A flag `--no-verify-jwt` é usada porque essas funções (especialmente o webhook e o cálculo de frete público) podem precisar ser acessadas sem um JWT de usuário autenticado em alguns contextos, ou a validação é feita internamente (como no webhook). Se `create-payment` for chamada apenas por usuários logados, você pode remover a flag, mas certifique-se de passar o `Authorization: Bearer` correto.

## 4. Configuração do Webhook no ASAAS

1. Acesse o painel do ASAAS (Sandbox ou Produção).
2. Vá em **Configurações > Integrações > Webhooks**.
3. Ative o webhook para cobranças.
4. **URL de Produção:**
   ```
   https://<project-ref>.supabase.co/functions/v1/asaas-webhook
   ```
   *(Substitua `<project-ref>` pelo ID do seu projeto Supabase, ex: `ibnfapwqqaxjmqrgvxbr`)*
5. **Token de Autenticação:** Insira o mesmo valor que você definiu em `ASAAS_WEBHOOK_TOKEN`.
6. Selecione os eventos: `PAYMENT_CREATED`, `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`.

## 5. Ativação do Workflow do WhatsApp (n8n)

### Configuração do n8n

1. Crie um novo workflow no n8n com **3 nós**:

   **Nó 1: Webhook (Trigger)**
   - Tipo: Webhook
   - Método: POST
   - Path: `/whatsapp-incoming`
   - Este webhook receberá as mensagens da Evolution API

   **Nó 2: HTTP Request (Chama o Supabase)**
   - Método: POST
   - URL: `https://zcoixlvbkssvuxamzwvs.supabase.co/functions/v1/whatsapp-bot`
   - Headers:
     - `Content-Type`: `application/json`
     - `x-bot-token`: `<seu WHATSAPP_BOT_TOKEN configurado no passo 2>`
   - Body (JSON):
     ```json
     {
       "phone": "{{ $json.data.key.remoteJid.replace('@s.whatsapp.net','') }}",
       "message": "{{ $json.data.message.conversation || $json.data.message.extendedTextMessage?.text }}"
     }
     ```

   **Nó 3: HTTP Request (Responde via Evolution API)**
   - Método: POST
   - URL: `https://<sua-evolution-api>/message/sendText/<instance-name>`
   - Headers:
     - `apikey`: `<sua API key da Evolution>`
   - Body (JSON):
     ```json
     {
       "number": "{{ $('Webhook').item.json.data.key.remoteJid }}",
       "text": "{{ $json.reply }}"
     }
     ```

2. Ative o workflow (toggle no canto superior direito).

### Configuração da Evolution API

1. No painel da Evolution API, configure o webhook da instância:
   - **URL**: `https://<seu-n8n>/webhook/whatsapp-incoming`
   - **Events**: `MESSAGES_UPSERT`
2. Envie "Oi" para o número do bot e verifique se a resposta chega.

## 6. Testes Finais

1. **Frete:** Simule uma compra no app e verifique se o valor do frete muda ao alterar o CEP.
2. **Pagamento:** Gere um PIX no checkout e pague usando o "Pix Copia e Cola" no app do seu banco (ambiente teste se usando Sandbox).
3. **WhatsApp:** Envie "Oi" para o número do bot e veja se a IA responde corretamente.

---

**Suporte:**
Se encontrar erros de "Function not found" ou 500/504, verifique os logs no painel do Supabase em **Edge Functions > Logs**.
