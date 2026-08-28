-- Replace two removed Unsplash assets with verified live images.
UPDATE inventory_items
SET image_url = 'https://images.unsplash.com/photo-1641759756615-1523c931c5d4?w=900&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1548907040-4d42f0b0e0f8?w=900&q=80';

UPDATE menu_items
SET image_url = 'https://images.unsplash.com/photo-1641759756615-1523c931c5d4?w=900&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1548907040-4d42f0b0e0f8?w=900&q=80';

UPDATE menu_items
SET image_url = 'https://images.unsplash.com/photo-1621330716555-5cad596c4562?w=900&q=80'
WHERE image_url = 'https://images.unsplash.com/photo-1513558161293-cbef765ed2fd?w=900&q=80';
