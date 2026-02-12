
## Adicionar Dica de Dimensoes Ideais na Sessao de Upload de Banner

### Dimensoes Recomendadas

Com base nos aspect ratios configurados no HeroBanner:
- **Desktop (3:1)**: 1920 x 640px
- **Tablet (2:1)**: 1200 x 600px  
- **Mobile (16:9)**: 720 x 405px

A dimensao ideal para cobrir todos os dispositivos e **1920 x 640px** (3:1), pois o `object-cover` adapta automaticamente para os outros formatos.

### Mudanca no arquivo `src/pages/admin/BannersPage.tsx`

Adicionar um texto informativo abaixo do label "Imagem *" e dentro da area de dropzone, orientando o usuario sobre as dimensoes ideais.

**1. Texto de ajuda abaixo do label (linha ~230)**

Adicionar apos o `<Label>Imagem *</Label>`:
```
<p className="text-xs text-muted-foreground">
  Dimensao ideal: 1920 x 640px (proporcao 3:1). Formatos: PNG, JPG ou WebP.
</p>
```

**2. Texto dentro do dropzone (linha ~260)**

Substituir o texto "Arraste ou clique para enviar" por incluir tambem a dica:
```
<p className="text-sm text-muted-foreground">Arraste ou clique para enviar</p>
<p className="text-xs text-muted-foreground/70">Recomendado: 1920 x 640px (3:1)</p>
```

### Resultado esperado

O administrador vera as dimensoes recomendadas tanto ao lado do label quanto dentro da area de upload, facilitando o envio de imagens no tamanho correto.
