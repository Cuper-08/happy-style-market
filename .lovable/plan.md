

## Plano: Corrigir Agrupamento do Parser CSV

### Problema
O parser CSV agrupa linhas pelo campo `slug` para identificar variantes de um mesmo produto. No arquivo do usuario, todos os produtos tem o mesmo slug (`/tenis`), fazendo com que todas as 264 linhas sejam tratadas como variantes de um unico produto.

### Solucao
Alterar a logica de agrupamento para usar o **nome do produto** como chave principal, e auto-gerar o slug a partir do nome quando o slug nao for unico ou estiver vazio.

### Alteracoes

**Arquivo**: `src/components/admin/csvTemplate.ts`

1. Mudar o agrupamento de `slug` para `nome` (campo que realmente identifica cada produto)
2. Auto-gerar o slug a partir do nome usando a funcao `generateSlug()` ja existente
3. Ignorar o valor da coluna `slug` do CSV se ele for generico (igual para todos) -- cada produto recebe seu proprio slug gerado do nome
4. Garantir que slugs duplicados (produtos com mesmo nome) recebam sufixo numerico para evitar conflitos no banco

Logica simplificada da mudanca:

```text
ANTES:  agrupamento por slug  ->  "/tenis" = 1 grupo = 1 produto
DEPOIS: agrupamento por nome  ->  cada nome unico = 1 produto com slug auto-gerado
```

### Detalhes Tecnicos

Na funcao `parseCSV`:
- Trocar a chave do `Map` de `slug` para `nome`
- Gerar o slug automaticamente com `generateSlug(nome)`
- Adicionar deduplicacao de slugs (ex: "adizero-adios-pro-4" e "adizero-adios-pro-4-2" se houver nomes iguais)
- Manter a logica de variantes: linhas com mesmo nome continuam sendo agrupadas como variantes

### Arquivo modificado
| Arquivo | Acao |
|---------|------|
| `src/components/admin/csvTemplate.ts` | Modificar - Alterar agrupamento de slug para nome |
