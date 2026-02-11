

## Correcao: Botoes de Imagem Submetendo o Formulario

### Causa Raiz

O componente `ImageUploader` e renderizado dentro de um `<form>` no `ProductFormPage`. Os botoes de mover (setas) e remover (X) NAO possuem o atributo `type="button"`. Em HTML, botoes dentro de um formulario tem `type="submit"` por padrao.

Resultado: ao clicar para mover uma imagem, o formulario e submetido, o `onSubmit` executa `navigate('/admin/produtos')`, e voce e "expulso" da tela.

### Solucao

Adicionar `type="button"` nos 3 botoes do `ImageUploader` (mover esquerda, remover, mover direita) para impedir que eles submetam o formulario.

### Detalhes Tecnicos

**Arquivo**: `src/components/admin/ImageUploader.tsx`

Adicionar `type="button"` nos seguintes botoes:
- Botao de mover para esquerda (linha ~89)
- Botao de remover imagem (linha ~96)
- Botao de mover para direita (linha ~102)

Alteracao minima, apenas 3 linhas afetadas.

