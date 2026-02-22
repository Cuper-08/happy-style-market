

## Melhorias na Luna (whatsapp-bot) -- Plano de Implementacao

### Resumo das melhorias

Todas as melhorias identificadas na analise anterior serao aplicadas diretamente no arquivo `supabase/functions/whatsapp-bot/index.ts`.

---

### 1. Corrigir campo `first_name` para `full_name`

O campo `first_name` nao existe na tabela `profiles`. O campo correto e `full_name`. Sera corrigido no SELECT e em todas as referencias.

### 2. Busca dinamica de produtos por palavras-chave

Antes de montar o prompt para a IA, a Luna vai extrair palavras-chave da mensagem do usuario e fazer uma busca `ilike` no banco. Isso permite que quando o cliente perguntar "tem tenis Nike?", a Luna busque produtos reais no catalogo de 1295 itens e injete os resultados no contexto da IA.

Logica:
- Extrair palavras com 3+ caracteres da mensagem (excluindo stopwords como "tem", "voce", "qual", etc.)
- Buscar com `or(title.ilike.%palavra%,category.ilike.%palavra%)` limitado a 8 resultados
- Incluir slug e preco no contexto para a IA gerar links corretos

### 3. Aumentar base de produtos em destaque de 5 para 20

Em vez de enviar apenas 5 produtos aleatorios, enviar 20 produtos variados (misturando categorias) para dar mais repertorio a Luna. As 8 categorias existentes sao: Bolsas, Bone, Chinelo, Importados, Malas, Meias, Tenis, Tenis Infantil.

### 4. Aumentar `max_tokens` de 300 para 500

Para evitar respostas cortadas, especialmente quando a Luna lista varios produtos com links.

### 5. Filtro de seguranca contra mensagens de grupo e loops

- Ignorar mensagens onde o telefone contenha `@g.us` (grupos do WhatsApp)
- Ignorar mensagens vazias ou muito curtas (menos de 2 caracteres)

### 6. Melhorar o prompt da IA

Adicionar no prompt:
- Instrucao explicita para usar os links dos produtos encontrados na busca dinamica
- Lista de categorias disponiveis para a Luna poder sugerir
- Instrucao para nao inventar produtos que nao estejam no contexto

---

### Detalhes Tecnicos

**Arquivo modificado:** `supabase/functions/whatsapp-bot/index.ts`

Mudancas principais no codigo:

```text
1. Linha 63: "first_name" -> "full_name" (SELECT e todas as refs)
2. Linha 54-57: Aumentar limit de 5 para 20 produtos em destaque
3. Novo bloco: Busca dinamica por palavras-chave antes da chamada OpenAI
4. Linha 134: max_tokens de 300 -> 500
5. Novo bloco: Filtro de grupo (@g.us) e mensagens vazias no inicio
6. Linhas 104-106: Prompt melhorado com categorias e instrucoes de link
```

**Stopwords para filtro de busca:**
```
tem, voce, quero, qual, como, onde, quando, para, esse, essa,
isso, aqui, ali, uma, uns, umas, que, com, sem, por, dos, das,
nos, nas, mais, muito, pode, queria, gostaria, preciso, olha,
boa, bom, tarde, noite, dia, oi, ola, obrigado, obrigada
```

**Busca dinamica (pseudo-codigo):**
```typescript
const stopwords = new Set([...]);
const keywords = message.toLowerCase()
  .split(/\s+/)
  .filter(w => w.length >= 3 && !stopwords.has(w));

let searchResults = [];
if (keywords.length > 0) {
  const searchTerm = keywords.join(" ");
  // Busca por cada keyword individualmente com OR
  const orFilter = keywords
    .map(k => `title.ilike.%${k}%,category.ilike.%${k}%`)
    .join(",");
  const { data } = await supabase
    .from("products")
    .select("title, slug, price_retail_display, category")
    .or(orFilter)
    .limit(8);
  searchResults = data || [];
}
```

**Prompt melhorado (trecho):**
```
Categorias disponiveis na loja: Tenis, Bolsas, Bone, Chinelo, 
Importados, Malas, Meias, Tenis Infantil.

Produtos encontrados pela busca do cliente: [resultados dinamicos]

IMPORTANTE: Sempre use os links no formato exato: 
${APP_URL}/produto/[slug-do-produto]
Nunca invente produtos. Se nao encontrou na busca, sugira 
categorias ou o site.
```

### Resultado esperado

- Luna conhece o catalogo inteiro (busca dinamica) em vez de apenas 5 produtos
- Respostas nunca sao cortadas (500 tokens)
- Campo correto `full_name` no perfil
- Sem loops com grupos ou mensagens do proprio bot
- Links sempre corretos e baseados em produtos reais do banco

