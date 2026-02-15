

## Corrigir Zoom e Transicao do Carrossel

### Causa Raiz Identificada

**1. Carrossel nao troca:** Existe **1 banner ativo no banco de dados** (Supabase). Como `dbBanners.length > 0`, o codigo ignora os 3 banners padrao (as imagens enviadas) e mostra apenas esse unico banner do banco. Com 1 banner, nao ha transicao.

**2. Imagem com muito zoom:** O aspect ratio `aspect-[4/5]` no mobile cria um container muito alto (quase retrato), forcando o `object-cover` a cortar excessivamente a imagem.

---

### Correcoes

**Arquivo: `src/components/home/HeroBanner.tsx`**

1. **Mudar logica de fallback**: Usar os banners padrao (as 3 imagens enviadas) quando o banco tiver menos de 2 banners ativos. Isso garante que o carrossel funcione com as 3 imagens mesmo com 1 banner solitario no banco.

2. **Ajustar aspect ratio no mobile**: Trocar de `aspect-[4/5]` para `aspect-[3/2]` no mobile. Isso reduz significativamente o zoom, mostrando mais da imagem sem corte excessivo. Manter `sm:aspect-[2/1]` e `md:aspect-[3/1]` para tablet e desktop.

3. **Remover `scale-105` na transicao**: O efeito de scale nos slides inativos (`scale-105`) contribui para a sensacao de zoom. Substituir por uma transicao apenas de opacidade (fade) mais limpa.

---

### Detalhes Tecnicos

**Mudanca de fallback (linha 46):**
```text
// Antes: usa defaults so quando DB esta vazio
const banners = dbBanners && dbBanners.length > 0 ? dbBanners : defaultBanners;

// Depois: usa defaults quando DB tem menos de 2 banners
const banners = dbBanners && dbBanners.length >= 2 ? dbBanners : defaultBanners;
```

**Mudanca de aspect ratio (linhas 68, 73):**
```text
// Antes
aspect-[4/5] sm:aspect-[2/1] md:aspect-[3/1]

// Depois
aspect-[3/2] sm:aspect-[2/1] md:aspect-[3/1]
```

**Remover scale na transicao (linhas 79-81):**
```text
// Antes
index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'

// Depois
index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
```

**Arquivo unico a modificar:** `src/components/home/HeroBanner.tsx`

