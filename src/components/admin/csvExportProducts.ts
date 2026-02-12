import type { Product } from '@/types';

export function exportProductsCSV(products: Product[]) {
  const separator = ';';
  const headers = [
    'id', 'nome', 'slug', 'categoria', 'marca',
    'preco_varejo', 'preco_atacado', 'qtd_min_atacado',
    'destaque', 'novo', 'ativo',
  ];

  const boolStr = (val: boolean | undefined | null) => (val ? 'sim' : 'nao');
  const numStr = (val: number | undefined | null) => (val != null ? String(val) : '');

  const rows = products.map(p => [
    p.id,
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
  ]);

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
