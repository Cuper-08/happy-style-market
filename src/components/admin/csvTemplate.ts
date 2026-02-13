import { extractColorFromName } from './colorDictionary';

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
      '38,39,40,41,42', 'Preto', '#000000', '50', '',
    ],
    [
      'Camiseta Basica', 'camiseta-basica', 'Camiseta algodao', 'Camisetas', 'Adidas',
      '89.90', '59.90', '6', 'nao', 'sim', 'sim',
      'P,M,G,GG', 'Preto,Branco', '#000000,#FFFFFF', '30', '',
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

// --- Bulk Update CSV parsing ---

export interface VariantDiff {
  variant_id?: string; // empty = new variant
  changes: Record<string, any>;
  oldValues: Record<string, any>;
  label: string; // e.g. "Tam 42 / Preto"
}

export interface ProductDiff {
  id: string;
  name: string;
  changes: Record<string, any>;
  oldValues: Record<string, any>;
  variantDiffs: VariantDiff[];
  newVariants: { size: string; color?: string; color_hex?: string; stock_quantity: number; sku?: string }[];
}

interface CurrentProduct {
  id: string;
  name: string;
  retail_price: number;
  wholesale_price?: number;
  wholesale_min_qty: number;
  featured: boolean;
  is_new: boolean;
  is_active: boolean;
  variants?: { id: string; size: string; color?: string; color_hex?: string; stock_quantity: number; sku?: string }[];
}

export function parseUpdateCSV(
  content: string,
  currentProducts: CurrentProduct[],
): { diffs: ProductDiff[]; errors: string[] } {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { diffs: [], errors: ['Arquivo vazio ou sem dados.'] };

  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());

  const col = (row: string[], name: string) => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? (row[idx] || '').trim() : '';
  };

  const productMap = new Map(currentProducts.map(p => [p.id, p]));

  // Group rows by product id
  const rowsByProduct = new Map<string, string[][]>();
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(separator);
    const id = col(row, 'id');
    if (!id) {
      errors.push(`Linha ${i + 1}: ID vazio, ignorada.`);
      continue;
    }
    if (!productMap.has(id)) {
      errors.push(`Linha ${i + 1}: Produto com ID "${id}" não encontrado.`);
      continue;
    }
    if (!rowsByProduct.has(id)) rowsByProduct.set(id, []);
    rowsByProduct.get(id)!.push(row);
  }

  const diffs: ProductDiff[] = [];

  for (const [id, rows] of rowsByProduct) {
    const current = productMap.get(id)!;
    const firstRow = rows[0];
    const changes: Record<string, any> = {};
    const oldValues: Record<string, any> = {};

    // Product-level diffs (from first row)
    const csvRetail = parseNumber(col(firstRow, 'preco_varejo'));
    if (csvRetail && csvRetail !== Number(current.retail_price)) {
      changes.retail_price = csvRetail;
      oldValues.retail_price = Number(current.retail_price);
    }

    const csvWholesale = parseNumber(col(firstRow, 'preco_atacado'));
    const curWholesale = current.wholesale_price ? Number(current.wholesale_price) : 0;
    if (col(firstRow, 'preco_atacado') && csvWholesale !== curWholesale) {
      changes.wholesale_price = csvWholesale || null;
      oldValues.wholesale_price = curWholesale;
    }

    const csvMinQty = parseInt(col(firstRow, 'qtd_min_atacado')) || 0;
    if (col(firstRow, 'qtd_min_atacado') && csvMinQty !== current.wholesale_min_qty) {
      changes.wholesale_min_qty = csvMinQty;
      oldValues.wholesale_min_qty = current.wholesale_min_qty;
    }

    if (col(firstRow, 'destaque')) {
      const csvFeatured = parseBool(col(firstRow, 'destaque'));
      if (csvFeatured !== current.featured) {
        changes.featured = csvFeatured;
        oldValues.featured = current.featured;
      }
    }

    if (col(firstRow, 'novo')) {
      const csvNew = parseBool(col(firstRow, 'novo'));
      if (csvNew !== current.is_new) {
        changes.is_new = csvNew;
        oldValues.is_new = current.is_new;
      }
    }

    if (col(firstRow, 'ativo')) {
      const csvActive = parseBool(col(firstRow, 'ativo'));
      if (csvActive !== current.is_active) {
        changes.is_active = csvActive;
        oldValues.is_active = current.is_active;
      }
    }

    // Variant-level diffs
    const variantMap = new Map((current.variants || []).map(v => [v.id, v]));
    const variantDiffs: VariantDiff[] = [];
    const newVariants: ProductDiff['newVariants'] = [];

    for (const row of rows) {
      const variantId = col(row, 'variant_id');
      const csvSize = col(row, 'tamanho');
      const csvColor = col(row, 'cor');
      const csvColorHex = col(row, 'cor_hex');
      const csvStockStr = col(row, 'estoque');
      const csvSku = col(row, 'sku');

      if (!csvSize && !variantId) continue; // no variant data

      if (variantId) {
        const curVariant = variantMap.get(variantId);
        if (!curVariant) {
          errors.push(`Produto "${current.name}": variant_id "${variantId}" não encontrada.`);
          continue;
        }

        const vChanges: Record<string, any> = {};
        const vOld: Record<string, any> = {};

        if (csvSize && csvSize !== curVariant.size) {
          vChanges.size = csvSize;
          vOld.size = curVariant.size;
        }
        if (csvColor && csvColor !== (curVariant.color || '')) {
          vChanges.color = csvColor;
          vOld.color = curVariant.color || '';
        }
        if (csvColorHex && csvColorHex !== (curVariant.color_hex || '')) {
          vChanges.color_hex = csvColorHex;
          vOld.color_hex = curVariant.color_hex || '';
        }
        if (csvStockStr) {
          const csvStock = parseInt(csvStockStr) || 0;
          if (csvStock !== (curVariant.stock_quantity || 0)) {
            vChanges.stock_quantity = csvStock;
            vOld.stock_quantity = curVariant.stock_quantity || 0;
          }
        }
        if (csvSku && csvSku !== (curVariant.sku || '')) {
          vChanges.sku = csvSku;
          vOld.sku = curVariant.sku || '';
        }

        if (Object.keys(vChanges).length > 0) {
          variantDiffs.push({
            variant_id: variantId,
            changes: vChanges,
            oldValues: vOld,
            label: `Tam ${curVariant.size}${curVariant.color ? ' / ' + curVariant.color : ''}`,
          });
        }
      } else if (csvSize) {
        // New variant
        newVariants.push({
          size: csvSize,
          color: csvColor || undefined,
          color_hex: csvColorHex || undefined,
          stock_quantity: parseInt(csvStockStr) || 0,
          sku: csvSku || undefined,
        });
      }
    }

    // Auto-detect color for products with no variants at all
    if (newVariants.length === 0 && variantDiffs.length === 0 && (!current.variants || current.variants.length === 0)) {
      const autoColor = extractColorFromName(current.name);
      if (autoColor) {
        newVariants.push({
          size: 'Unico',
          color: autoColor.color,
          color_hex: autoColor.color_hex,
          stock_quantity: 0,
        });
      }
    }

    if (Object.keys(changes).length > 0 || variantDiffs.length > 0 || newVariants.length > 0) {
      diffs.push({ id, name: current.name, changes, oldValues, variantDiffs, newVariants });
    }
  }

  return { diffs, errors };
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

    // Auto-detect color from product name
    const autoColor = extractColorFromName(name);

    const variants: ParsedVariant[] = rows.flatMap(r => {
      const rawSize = col(r, 'tamanho');
      if (!rawSize) return [];

      const sizes = rawSize.split(',').map(s => s.trim()).filter(Boolean);
      const rawColor = col(r, 'cor');
      const rawColorHex = col(r, 'cor_hex');
      const colors = rawColor ? rawColor.split(',').map(s => s.trim()).filter(Boolean) : [];
      const colorHexes = rawColorHex ? rawColorHex.split(',').map(s => s.trim()).filter(Boolean) : [];
      const stock = parseInt(col(r, 'estoque')) || 0;
      const csvSku = col(r, 'sku') || undefined;

      // Build cartesian product of sizes x colors
      if (colors.length > 0) {
        const result: ParsedVariant[] = [];
        for (const size of sizes) {
          for (let ci = 0; ci < colors.length; ci++) {
            result.push({
              size,
              color: colors[ci] || autoColor?.color || undefined,
              color_hex: colorHexes[ci] || autoColor?.color_hex || undefined,
              stock_quantity: stock,
              sku: undefined, // SKU not applied for multi-variant rows
            });
          }
        }
        // Apply SKU only if exactly 1 variant resulted
        if (result.length === 1 && csvSku) result[0].sku = csvSku;
        return result;
      }

      // Single or multiple sizes, no multiple colors
      const result: ParsedVariant[] = sizes.map(size => ({
        size,
        color: autoColor?.color || undefined,
        color_hex: autoColor?.color_hex || undefined,
        stock_quantity: stock,
        sku: undefined,
      }));
      if (result.length === 1 && csvSku) result[0].sku = csvSku;
      return result;
    });

    // If no variants from CSV but color detected in name, create a "Unico" variant
    if (variants.length === 0 && autoColor) {
      variants.push({
        size: 'Unico',
        color: autoColor.color,
        color_hex: autoColor.color_hex,
        stock_quantity: 0,
      });
    }

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
