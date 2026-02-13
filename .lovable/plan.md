
## Expandir Variantes com Virgula no Formulario Manual

### Problema
A logica de separar tamanhos e cores por virgula foi implementada apenas no fluxo de importacao CSV (modal). Quando o usuario digita "38,39,40,42" no campo tamanho do formulario manual de produto, o sistema salva como uma unica variante com esse texto literal, em vez de criar 4 variantes separadas.

### Solucao
Adicionar logica de expansao no `onSubmit` do formulario de produto (`ProductFormPage.tsx`). Quando o usuario digitar valores separados por virgula nos campos de tamanho e/ou cor, o sistema automaticamente gera as variantes individuais antes de salvar.

### Exemplo pratico

**Entrada no formulario:**
- Tamanho: `38,39,40,42`
- Cor: `Preto,Branco`
- Estoque: `162`

**Resultado apos expansao (produto cartesiano):**
8 variantes criadas: 38/Preto, 38/Branco, 39/Preto, 39/Branco, 40/Preto, 40/Branco, 42/Preto, 42/Branco — todas com estoque 162.

### Mudanca tecnica

**Arquivo: `src/pages/admin/ProductFormPage.tsx`**

Alterar a funcao `onSubmit` (linha ~148) para, antes de enviar as variantes ao backend, expandir cada variante cujos campos `size` ou `color` contenham virgulas:

```
const expandedVariants = validVariants.flatMap(v => {
  const sizes = v.size.split(',').map(s => s.trim()).filter(Boolean);
  const colors = v.color ? v.color.split(',').map(s => s.trim()).filter(Boolean) : [];
  const colorHexes = v.color_hex ? v.color_hex.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (colors.length > 0) {
    const result = [];
    for (const size of sizes) {
      for (let ci = 0; ci < colors.length; ci++) {
        result.push({
          size,
          color: colors[ci],
          color_hex: colorHexes[ci] || null,
          stock_quantity: v.stock_quantity,
          sku: null,
        });
      }
    }
    return result;
  }

  return sizes.map(size => ({
    ...v,
    size,
    sku: sizes.length === 1 ? v.sku : null,
  }));
});
```

A variavel `expandedVariants` substitui `validVariants` na chamada de `createProduct` / `updateProduct`.

Nenhuma outra alteracao e necessaria — o backend ja aceita arrays de variantes normalmente.
