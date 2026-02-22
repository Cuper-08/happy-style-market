

## Replicar Conteudo Institucional do brasconceito.com no App

### Resumo

Vou criar 8 paginas institucionais no app com o conteudo real do site brasconceito.com, atualizar o Footer com os dados reais de contato e links corretos, e registrar todas as rotas no App.tsx.

---

### Paginas a criar

| Pagina | Rota | Arquivo |
|--------|------|---------|
| Prazos e Entregas | `/prazos-e-entregas` | `src/pages/institutional/DeliveryPage.tsx` |
| Perguntas Frequentes | `/perguntas-frequentes` | `src/pages/institutional/FaqPage.tsx` |
| Como Comprar | `/como-comprar` | `src/pages/institutional/HowToBuyPage.tsx` |
| Contato | `/contato` | `src/pages/institutional/ContactPage.tsx` |
| Termos e Condicoes | `/termos` | `src/pages/institutional/TermsPage.tsx` |
| Politica de Privacidade | `/politica-privacidade` | `src/pages/institutional/PrivacyPolicyPage.tsx` |
| Politica de Trocas | `/politica-trocas` | `src/pages/institutional/ExchangePolicyPage.tsx` |
| Politica de Frete | `/politica-frete` | `src/pages/institutional/ShippingPolicyPage.tsx` |

### Conteudo de cada pagina

Cada pagina tera o conteudo **identico** ao copiado do brasconceito.com, adaptado com a marca "Bras Conceito" e os dados reais:
- WhatsApp: 5511985459206
- Email: brasconceito@gmail.com
- Endereco: Rua Conselheiro Belisario, Sao Paulo - SP

As paginas que ja existem no banco (`privacy_policy`, `terms_of_service`, `exchange_policy` via `store_settings`) continuam funcionando -- mas as novas paginas terao o conteudo completo hardcoded como fallback, com prioridade para o conteudo do banco quando disponivel.

### Alteracoes no Footer

Atualizar `src/components/layout/Footer.tsx`:
- Substituir os links de "Categorias" e "Institucional" pelas 8 paginas reais
- Atualizar dados de contato reais (WhatsApp, email, endereco)
- Organizar em 4 colunas: Marca, Institucional, Ajuda, Contato

### Alteracoes no App.tsx

Adicionar 8 novas rotas para as paginas institucionais.

---

### Detalhes tecnicos

**Arquivos novos (8):**
- `src/pages/institutional/DeliveryPage.tsx` -- conteudo de Prazos e Entregas
- `src/pages/institutional/FaqPage.tsx` -- conteudo de Perguntas Frequentes
- `src/pages/institutional/HowToBuyPage.tsx` -- conteudo de Como Comprar
- `src/pages/institutional/ContactPage.tsx` -- conteudo de Contato com formulario basico e link WhatsApp
- `src/pages/institutional/TermsPage.tsx` -- Termos e Condicoes de Uso (conteudo completo)
- `src/pages/institutional/PrivacyPolicyPage.tsx` -- Politica de Privacidade (13 secoes completas)
- `src/pages/institutional/ExchangePolicyPage.tsx` -- Politica de Trocas (baseada nos Termos, secao TROCAS)
- `src/pages/institutional/ShippingPolicyPage.tsx` -- Politica de Frete (conteudo completo)

Todas as paginas seguirao o mesmo padrao:
- Usam o `Layout` existente (Header + Footer)
- Titulo com icone
- Conteudo em `prose` styling com Tailwind
- Link para WhatsApp no final

**Arquivos modificados (2):**
- `src/components/layout/Footer.tsx` -- links e dados de contato atualizados
- `src/App.tsx` -- 8 novas rotas institucionais

**Estrutura de cada pagina institucional:**
```text
Layout
  Container (max-w-4xl, py-12)
    Titulo (h1)
    Conteudo (secoes com h2, listas, paragrafos)
    CTA WhatsApp no final
```

