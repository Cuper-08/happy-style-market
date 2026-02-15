import type { Product } from '@/types';

export function exportProductsCSV(products: Product[]) {
  const separator = ';';
  const headers = [
    'id', 'variant_id', 'titulo', 'slug',
    'preco_varejo', 'preco_atacado',
    'tamanho', 'em_estoque',
  ];

  const numStr = (val: number | undefined | null) => (val != null ? String(val) : '');
  const boolStr = (val: boolean | undefined | null) => (val ? 'sim' : 'nao');

  const rows: string[][] = [];

  for (const p of products) {
    const baseRow = [
      p.id,
      '',
      p.title,
      p.slug,
      numStr(p.price_retail),
      numStr(p.price),
    ];

    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        rows.push([
          ...baseRow.slice(0, 1),
          v.id,
          ...baseRow.slice(2),
          v.size || '',
          boolStr(v.stock),
        ]);
      }
    } else {
      rows.push([...baseRow, '', '']);
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
