
-- 1. Bolsas (bags, keepall, neverfull, bumbag, pochete, bowling bag)
UPDATE products SET category = 'Bolsas' 
WHERE category = 'Outros' AND (
  title ILIKE '%bag%' OR title ILIKE '%keepall%' 
  OR title ILIKE '%neverfull%' OR title ILIKE '%bumbag%' 
  OR title ILIKE '%pochete%' OR title ILIKE '%bowling%'
  OR title ILIKE '%necessaire%'
);

-- 2. Tênis Infantil
UPDATE products SET category = 'Tênis Infantil' 
WHERE category = 'Outros' AND title ILIKE '%(GS)%';

-- 3. Importados (marcas premium que não são bolsas)
UPDATE products SET category = 'Importados' 
WHERE category = 'Outros' AND (
  title ILIKE '%louis vuitton%' OR title ILIKE '%gucci%' 
  OR title ILIKE '%balenciaga%' OR title ILIKE '%amiri%' 
  OR title ILIKE '%alexander mcqueen%' OR title ILIKE '%diesel%'
  OR title ILIKE '%fendi%' OR title ILIKE '%prada%'
);

-- 4. Todo o resto de "Outros" vira "Tênis"
UPDATE products SET category = 'Tênis' WHERE category = 'Outros';
