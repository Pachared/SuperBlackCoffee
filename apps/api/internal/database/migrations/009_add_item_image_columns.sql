-- Keep image fields as schema only. Real image URLs are managed by the application.
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';
