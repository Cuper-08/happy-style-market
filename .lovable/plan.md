

## Atualizar Token do SuperFrete

### O que será feito
1. Atualizar o secret `SUPERFRETE_TOKEN` com o novo token JWT fornecido
2. Re-deploy da Edge Function `calculate-shipping` para usar o novo token
3. Testar a função com um CEP de destino para validar que o erro 401 foi resolvido

### Pendência
- Confirmar o **CEP de origem** (STORE_CEP) correto da loja. Atualmente está usando `01001000` (Centro de SP). Se precisar alterar, será atualizado junto.

