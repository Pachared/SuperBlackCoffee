ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';

-- Curated Unsplash images (free to use under the Unsplash License) grouped by item type.
UPDATE inventory_items
SET image_url = CASE
  WHEN kind = 'stock' THEN 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=900&q=80'
  WHEN name ILIKE '%กาแฟ%' OR name ILIKE '%โกโก้%' THEN 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80'
  WHEN name ILIKE '%ชา%' OR name ILIKE '%มัทฉะ%' THEN 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&q=80'
  WHEN name ILIKE '%นม%' OR name ILIKE '%ครีม%' THEN 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&q=80'
  WHEN name ILIKE '%ไซรัป%' OR name ILIKE '%น้ำเชื่อม%' THEN 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=900&q=80'
  ELSE 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80'
END
WHERE image_url = '';

UPDATE menu_items
SET image_url = CASE
  WHEN category ILIKE '%กาแฟ%' THEN 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80'
  WHEN category ILIKE '%ชา%' OR category ILIKE '%มัทฉะ%' THEN 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&q=80'
  WHEN category ILIKE '%เบเกอรี่%' OR category ILIKE '%อาหาร%' THEN 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900&q=80'
  ELSE 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80'
END
WHERE image_url = '';
