
## Integração WhatsApp + Supabase + Evolution API: Bot Inteligente para o App

### Visão Geral

Sim, é totalmente possível — e o seu app já tem toda a infraestrutura necessária para isso. O Supabase já armazena produtos, pedidos, clientes e configurações. O que falta é criar uma **ponte entre o WhatsApp e o seu banco de dados** via Evolution API + n8n (ou diretamente via Edge Functions).

A arquitetura completa ficaria assim:

```text
Cliente envia mensagem no WhatsApp
        |
        v
Evolution API (recebe e envia mensagens WhatsApp)
        |
        v
n8n (orquestra a lógica do bot: interpreta a mensagem, chama APIs)
        |
        v
Supabase Edge Function: "whatsapp-bot"
  - Busca produtos por texto (title, category)
  - Consulta estoque (product_variants.stock)
  - Histórico de conversa (chat_history já existe!)
  - Formata link mascarado: https://happy-style-market.lovable.app/produto/{slug}
        |
        v
n8n retorna resposta formatada → Evolution API → Cliente no WhatsApp
```

---

### O que o Bot Consegue Fazer (Capacidades)

O bot pode dominar praticamente tudo que está no banco de dados do seu app:

**Busca de Produtos**
- "Tem tênis Nike?" → busca por título/categoria e retorna nome, preço, disponibilidade e link direto
- "Quais bolsas vocês têm?" → lista todos os produtos da categoria "bolsas"
- "Tem esse produto no tamanho 42?" → consulta `product_variants` com size + stock = true

**Link Mascarado Direto ao Produto**
- O bot envia: `https://happy-style-market.lovable.app/produto/tenis-nike-air-max`
- Ao clicar, o cliente cai direto na página do produto no app
- A rota `/produto/:slug` já existe e funciona perfeitamente

**Consulta de Pedidos**
- "Qual o status do meu pedido?" → consulta tabela `orders` pelo telefone cadastrado no perfil
- "Meu pedido foi enviado?" → retorna `tracking_code` se disponível

**Informações da Loja**
- Endereço, WhatsApp, horário → via tabela `store_settings`

**Histórico de Conversa**
- A tabela `chat_history` já existe no banco com campos `contact_phone`, `role`, `message`
- O bot pode ter memória de conversa por número de telefone

---

### Arquitetura Técnica Detalhada

#### Peças necessárias

| Componente | O que é | Custo |
|-----------|---------|-------|
| **Evolution API** | Conecta seu número WhatsApp a uma API HTTP | Open source, self-hosted ou pago (Railway, etc.) |
| **n8n** | Orquestrador visual de automações (como Zapier, mas poderoso) | Open source / cloud gratuito parcial |
| **Supabase Edge Function** | Lógica do bot: busca produtos, formata respostas | Já existe no projeto |
| **App React** | Já tem todas as páginas de produto com slugs únicos | Já pronto |

#### O que será criado no Lovable

**Edge Function: `whatsapp-bot`**

Esta função é o "cérebro" do bot. Receberá do n8n:
```json
{
  "phone": "5511999999999",
  "message": "tem tênis nike?"
}
```

E retornará:
```json
{
  "reply": "Encontrei 3 produtos:\n\n👟 *Tênis Nike Air Max*\nPreço: R$ 299,90\n🔗 https://happy-style-market.lovable.app/produto/tenis-nike-air-max\n\n..."
}
```

A função vai:
1. Buscar produtos no Supabase com `ilike` por `title` e `category`
2. Verificar se há variantes com `stock = true`
3. Salvar a conversa na tabela `chat_history`
4. Gerar os links mascarados com o slug do produto
5. Retornar resposta formatada em texto para o WhatsApp

**Fluxo no n8n (simples)**
```text
Webhook (recebe mensagem da Evolution API)
    → Chama Edge Function whatsapp-bot
    → Evolution API envia resposta ao cliente
```

---

### O que será entregue pelo Lovable

1. **Edge Function `whatsapp-bot`** — endpoint HTTP que o n8n chama
   - Recebe `{ phone, message }`
   - Interpreta a intenção (busca por produto, consulta de pedido, info da loja)
   - Busca no Supabase com busca textual flexível
   - Grava na `chat_history`
   - Retorna texto formatado com link do produto

2. **Proteger o endpoint com token** — o n8n envia um header secreto para autenticar

3. **Documentação do fluxo n8n** — como configurar os nós no n8n para fechar o ciclo com a Evolution API

---

### O que NÃO precisa mudar no App

- Nada nas páginas React
- Nada nas rotas
- Nada no banco de dados (a tabela `chat_history` já existe)
- Os links dos produtos já funcionam: `/produto/{slug}`

---

### Limitações Importantes

- **Inteligência do bot**: Para entender linguagem natural avançada (ex: "quero algo bonito pra presente feminino até R$200"), seria necessário integrar uma LLM como OpenAI GPT. Para buscas diretas por palavra-chave, a Edge Function resolve sozinha.
- **Evolution API**: Precisa ser configurada externamente (self-hosted ou serviço pago). O Lovable cria a ponta do Supabase; a configuração do WhatsApp em si é feita fora.
- **n8n**: Também é configurado externamente, mas é simples — apenas 2 nós no fluxo.

---

### Próximo Passo

O Lovable criaria agora a **Edge Function `whatsapp-bot`** com toda a lógica de busca, formatação de links e gravação de histórico. Você então configura o n8n para apontar para ela e conecta com sua Evolution API.

Quer prosseguir com a criação da Edge Function?
