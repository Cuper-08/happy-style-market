export function downloadCSVTemplate() {
  const separator = ';';
  const headers = [
    'nome', 'slug', 'descricao', 'categoria', 'marca',
    'preco_varejo', 'preco_atacado', 'qtd_min_atacado',
    'destaque', 'novo', 'ativo',
    'tamanho', 'cor', 'cor_hex', 'estoque', 'sku',
  ];

  const exampleRows = [
    [
      'Tenis Exemplo', 'tenis-exemplo', 'Descricao do produto', 'Tenis', 'Nike',
      '299.90', '199.90', '6', 'sim', 'sim', 'sim',
      '38', 'Preto', '#000000', '50', 'SKU001',
    ],
    [
      'Tenis Exemplo', 'tenis-exemplo', '', 'Tenis', 'Nike',
      '299.90', '199.90', '6', 'sim', 'sim', 'sim',
      '39', 'Preto', '#000000', '30', 'SKU002',
    ],
  ];

  const csvContent = [
    headers.join(separator),
    ...exampleRows.map(row => row.join(separator)),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modelo_produtos.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface ParsedVariant {
  size: string;
  color?: string;
  color_hex?: string;
  stock_quantity: number;
  sku?: string;
}

export interface ParsedProduct {
  name: string;
  slug: string;
  description?: string;
  categoryName?: string;
  brandName?: string;
  retail_price: number;
  wholesale_price?: number;
  wholesale_min_qty?: number;
  featured: boolean;
  is_new: boolean;
  is_active: boolean;
  variants: ParsedVariant[];
  errors: string[];
  category_id?: string;
  brand_id?: string;
}

function parseBool(val: string): boolean {
  return ['sim', 's', 'true', '1', 'yes'].includes(val.trim().toLowerCase());
}

function parseNumber(val: string): number {
  return parseFloat(val.replace(',', '.')) || 0;
}

export function parseCSV(
  content: string,
  categories: { id: string; name: string }[],
  brands: { id: string; name: string }[],
): ParsedProduct[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());

  const col = (row: string[], name: string) => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? (row[idx] || '').trim() : '';
  };

  const catMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
  const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));

  const grouped = new Map<string, { rows: string[][] }>();

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(separator);
    const name = col(row, 'nome');
    if (!name) continue;

    if (!grouped.has(name)) {
      grouped.set(name, { rows: [] });
    }
    grouped.get(name)!.rows.push(row);
  }

  const products: ParsedProduct[] = [];
  const usedSlugs = new Set<string>();

  for (const [name, { rows }] of grouped) {
    const first = rows[0];
    const errors: string[] = [];

    let slug = generateSlug(name);
    if (usedSlugs.has(slug)) {
      let counter = 2;
      while (usedSlugs.has(`${slug}-${counter}`)) counter++;
      slug = `${slug}-${counter}`;
    }
    usedSlugs.add(slug);
    const categoryName = col(first, 'categoria');
    const brandName = col(first, 'marca');
    const retailPrice = parseNumber(col(first, 'preco_varejo'));

    if (!name) errors.push('Nome obrigatório');
    if (!retailPrice) errors.push('Preço varejo obrigatório');

    const category_id = categoryName ? catMap.get(categoryName.toLowerCase()) : undefined;
    if (categoryName && !category_id) errors.push(`Categoria "${categoryName}" não encontrada`);

    const brand_id = brandName ? brandMap.get(brandName.toLowerCase()) : undefined;
    if (brandName && !brand_id) errors.push(`Marca "${brandName}" não encontrada`);

    const variants: ParsedVariant[] = rows
      .filter(r => col(r, 'tamanho'))
      .map(r => ({
        size: col(r, 'tamanho'),
        color: col(r, 'cor') || undefined,
        color_hex: col(r, 'cor_hex') || undefined,
        stock_quantity: parseInt(col(r, 'estoque')) || 0,
        sku: col(r, 'sku') || undefined,
      }));

    products.push({
      name,
      slug,
      description: col(first, 'descricao') || undefined,
      categoryName: categoryName || undefined,
      brandName: brandName || undefined,
      retail_price: retailPrice,
      wholesale_price: parseNumber(col(first, 'preco_atacado')) || undefined,
      wholesale_min_qty: parseInt(col(first, 'qtd_min_atacado')) || undefined,
      featured: parseBool(col(first, 'destaque')),
      is_new: parseBool(col(first, 'novo')),
      is_active: col(first, 'ativo') ? parseBool(col(first, 'ativo')) : true,
      variants,
      errors,
      category_id,
      brand_id,
    });
  }

  return products;
}
