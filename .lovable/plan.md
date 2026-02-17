

## Carrossel de Categorias com Imagens em Marquee Horizontal

### O que sera feito

Criar uma secao "NAVEGUE POR CATEGORIAS" entre o BenefitsMarquee e os chips de produto na home page. A secao tera 6 imagens de categorias que se movem continuamente da direita para a esquerda (marquee), similar ao BenefitsMarquee mas com imagens grandes e nomes de categoria abaixo. Cada imagem sera clicavel e levara a pagina da categoria correspondente.

### Imagens e categorias

| Imagem | Categoria | Slug/Link |
|--------|-----------|-----------|
| content1.png | Malas | /categoria/malas |
| content2.png | Bolsas | /categoria/bolsas |
| content3.png | Grifes | /categoria/importados |
| content4.png | Meias | /categoria/meias |
| content5.png | Bones | /categoria/bone |
| content6.png | Tenis | /categoria/tenis |

### Mudancas

**1. Copiar 6 imagens para `public/categories/`**
- content1.png -> public/categories/malas.png
- content2.png -> public/categories/bolsas.png
- content3.png -> public/categories/grifes.png
- content4.png -> public/categories/meias.png
- content5.png -> public/categories/bones.png
- content6.png -> public/categories/tenis.png

**2. Novo componente `src/components/home/CategoryMarquee.tsx`**
- Titulo "NAVEGUE POR CATEGORIAS" centralizado e em negrito
- Container com overflow hidden
- Conteudo duplicado (2 copias) para loop infinito seamless
- Cada item: imagem da categoria (tamanho ~150x150 no mobile, ~200x200 no desktop) + nome abaixo
- Clicavel com Link do React Router
- Animacao CSS marquee reutilizando a mesma keyframe existente, porem com velocidade ligeiramente diferente (30s)
- Otimizado para mobile: imagens menores, espacamento reduzido

**3. `src/pages/HomePage.tsx`**
- Importar e inserir `<CategoryMarquee />` entre o BenefitsMarquee e os chips de categoria
- Full-bleed (usando margem negativa) para ocupar toda a largura

### Detalhes Tecnicos

```text
// Estrutura do componente
<section>
  <h2 className="text-center font-bold">NAVEGUE POR CATEGORIAS</h2>
  <div className="overflow-hidden">
    <div className="flex animate-marquee-categories whitespace-nowrap">
      {[...categories, ...categories].map((cat, i) => (
        <Link to={cat.link} className="flex-shrink-0 flex flex-col items-center mx-4">
          <img src={cat.image} className="w-36 h-36 md:w-48 md:h-48 object-contain" />
          <span className="font-semibold mt-2">{cat.name}</span>
        </Link>
      ))}
    </div>
  </div>
</section>
```

A animacao usara uma classe separada `animate-marquee-categories` com duracao de 30s para um ritmo adequado ao tamanho das imagens. A keyframe `marquee` ja existe no CSS.

**4. `src/index.css`**
- Adicionar classe `.animate-marquee-categories` com duracao de 30s

### Resumo

| Arquivo | Mudanca |
|---------|---------|
| `public/categories/*.png` | 6 imagens novas copiadas |
| `src/components/home/CategoryMarquee.tsx` | Novo - carrossel marquee de categorias |
| `src/index.css` | Nova classe animate-marquee-categories |
| `src/pages/HomePage.tsx` | Inserir CategoryMarquee entre BenefitsMarquee e chips |

