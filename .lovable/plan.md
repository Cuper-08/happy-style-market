
## Barra de Beneficios com Marquee Continuo

### O que sera feito

Criar uma barra horizontal com animacao de marquee (rolagem continua infinita) posicionada entre o banner hero e a secao "Produtos". A barra tera fundo dourado (cor primary) e exibira 4 beneficios com icones, rolando continuamente da direita para a esquerda.

### Beneficios exibidos

1. **FRETE EXPRESSO!** - "Faca seu pedido hoje e receba em ate 7 dias uteis!" (icone: Truck)
2. **PARCELE EM ATE 12X** - "Ou pague a vista no Pix a vista!" (icone: CreditCard)
3. **COMPRA SEGURA** - "Site 100% seguro, garantimos a melhor experiencia do cliente!" (icone: ShieldCheck)
4. **SUPORTE AO CLIENTE** - "Estamos prontos para te atender e tirar suas duvidas!" (icone: MessageCircle)

### Mudancas

**1. Novo componente `src/components/home/BenefitsMarquee.tsx`**
- Barra com fundo `bg-primary` e texto branco
- Conteudo duplicado (2 copias lado a lado) para criar efeito de loop infinito
- Animacao CSS `marquee` que translada de 0% a -50% no eixo X infinitamente
- Cada beneficio tem icone do Lucide + titulo em negrito + descricao
- Responsivo: no mobile os textos ficam menores

**2. `src/index.css`**
- Adicionar keyframe `@keyframes marquee` para a animacao de scroll continuo

**3. `src/pages/HomePage.tsx`**
- Importar e inserir `<BenefitsMarquee />` logo apos o `<HeroBanner />` e antes dos chips de categoria
- O componente ficara fora do container para ocupar largura total da tela (full-bleed)

### Detalhes Tecnicos

```text
// Estrutura do marquee
<div class="overflow-hidden bg-primary">
  <div class="flex animate-marquee whitespace-nowrap">
    [4 items] [4 items duplicados]  // duplicar para loop seamless
  </div>
</div>

// CSS keyframe
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

A duplicacao do conteudo garante que quando a primeira copia sai pela esquerda, a segunda ja esta visivel, criando a ilusao de rolagem infinita.

### Resumo

| Arquivo | Mudanca |
|---------|---------|
| `src/components/home/BenefitsMarquee.tsx` | Novo - barra marquee com 4 beneficios |
| `src/index.css` | Adicionar keyframe `marquee` |
| `src/pages/HomePage.tsx` | Inserir BenefitsMarquee entre banner e chips |
