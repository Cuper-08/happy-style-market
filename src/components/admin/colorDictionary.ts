/** PT-BR color name → hex mapping */
export const COLOR_DICTIONARY: Record<string, string> = {
  preto: '#000000',
  branco: '#FFFFFF',
  vermelho: '#FF0000',
  azul: '#0000FF',
  verde: '#008000',
  amarelo: '#FFD700',
  rosa: '#FF69B4',
  laranja: '#FF8C00',
  cinza: '#808080',
  marrom: '#8B4513',
  bege: '#F5DEB3',
  prata: '#C0C0C0',
  dourado: '#DAA520',
  lilas: '#9370DB',
  roxo: '#800080',
  ciano: '#00CED1',
  fluorescente: '#ADFF2F',
  cafe: '#6F4E37',
  'off white': '#FAF9F6',
  offwhite: '#FAF9F6',
  vinho: '#722F37',
  coral: '#FF7F50',
  turquesa: '#40E0D0',
  nude: '#E3BC9A',
  mostarda: '#FFDB58',
  bordo: '#800020',
  grafite: '#474747',
  creme: '#FFFDD0',
  caramelo: '#FFD59A',
  petroleo: '#006064',
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Extract color info from product name.
 * Expects color to be the uppercase suffix, e.g.
 * "Adizero Adios Pro 4 VERMELHO-PRETO"
 */
export function extractColorFromName(name: string): { color: string; color_hex: string } | null {
  // Find trailing uppercase words (may contain hyphens)
  const match = name.match(/\s([A-ZÀÁÂÃÉÊÍÓÔÕÚÇ][A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\s-]{1,})\s*$/);
  if (!match) return null;

  const rawColor = match[1].trim();
  const parts = rawColor.split(/[-\s]+/);

  // Check if at least one part is a known color
  let foundHex: string | null = null;
  for (const part of parts) {
    const hex = COLOR_DICTIONARY[normalize(part)];
    if (hex) {
      if (!foundHex) foundHex = hex;
    }
  }

  if (!foundHex) return null;

  // Format color name: "Vermelho-Preto"
  const formatted = parts
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('-');

  return { color: formatted, color_hex: foundHex };
}
