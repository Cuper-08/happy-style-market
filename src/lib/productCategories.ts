export interface BrandInfo {
  slug: string;
  name: string;
  keywords: string[];
}

export const BRAND_DICTIONARY: BrandInfo[] = [
  { slug: 'air-jordan', name: 'Air Jordan', keywords: ['air jordan', 'jordan 1', 'jordan 4', 'jordan 6'] },
  { slug: 'nike', name: 'Nike', keywords: ['nike'] },
  { slug: 'adidas', name: 'Adidas', keywords: ['adidas', 'yeezy', 'adizero'] },
  { slug: 'new-balance', name: 'New Balance', keywords: ['new balance'] },
  { slug: 'balenciaga', name: 'Balenciaga', keywords: ['balenciaga'] },
  { slug: 'gucci', name: 'Gucci', keywords: ['gucci'] },
  { slug: 'louis-vuitton', name: 'Louis Vuitton', keywords: ['louis vuitton'] },
  { slug: 'on-running', name: 'On Running', keywords: ['on cloud', 'cloudtilt'] },
  { slug: 'asics', name: 'ASICS', keywords: ['asics'] },
  { slug: 'puma', name: 'Puma', keywords: ['puma', 'nitro'] },
  { slug: 'travis-scott', name: 'Travis Scott', keywords: ['travis scott'] },
  { slug: 'amiri', name: 'Amiri', keywords: ['amiri'] },
];

export function extractBrand(title: string): BrandInfo | null {
  const lower = title.toLowerCase();
  // Check more specific brands first (e.g., "Air Jordan" before "Nike")
  for (const brand of BRAND_DICTIONARY) {
    if (brand.keywords.some(kw => lower.includes(kw))) {
      return brand;
    }
  }
  return null;
}

export function extractBrandSlug(title: string): string {
  return extractBrand(title)?.slug || 'outros';
}

export function getAvailableBrands(products: { title: string }[]): BrandInfo[] {
  const found = new Set<string>();
  const result: BrandInfo[] = [];

  for (const p of products) {
    const brand = extractBrand(p.title);
    if (brand && !found.has(brand.slug)) {
      found.add(brand.slug);
      result.push(brand);
    }
  }

  // Check if there are unmatched products
  const hasOthers = products.some(p => !extractBrand(p.title));
  if (hasOthers) {
    result.push({ slug: 'outros', name: 'Outros', keywords: [] });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
