import type { Product } from '@/types';

export function exportProductsCSV(products: Product[]) {
  const separator = ';';
  const headers = [
    'id', 'variant_id', 'nome', 'slug', 'categoria', 'marca',
    'preco_varejo', 'preco_atacado', 'qtd_min_atacado',
    'destaque', 'novo', 'ativo',
    'tamanho', 'cor', 'cor_hex', 'estoque', 'sku',
  ];

  const boolStr = (val: boolean | undefined | null) => (val ? 'sim' : 'nao');
  const numStr = (val: number | undefined | null) => (val != null ? String(val) : '');

  const rows: string[][] = [];

  for (const p of products) {
    const baseRow = [
      p.id,
      '', // variant_id placeholder
      p.name,
      p.slug,
      p.category?.name || '',
      p.brand?.name || '',
      numStr(p.retail_price),
      numStr(p.wholesale_price),
      numStr(p.wholesale_min_qty),
      boolStr(p.featured),
      boolStr(p.is_new),
      boolStr(p.is_active),
    ];

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        rows.push([
          ...baseRow.slice(0, 1),
          v.id,
          ...baseRow.slice(2),
          v.size || '',
          v.color || '',
          v.color_hex || '',
          numStr(v.stock_quantity),
          v.sku || '',
        ]);
      }
    } else {
      rows.push([...baseRow, '', '', '', '', '']);
    }
  }

  const csvContent = [
    headers.join(separator),
    ...rows.map(row => row.join(separator)),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'produtos_exportados.csv';
  link.click();
  URL.revokeObjectURL(url);
}
