-- Refine the catalog imagery by matching the item name to a more specific ingredient/menu photo.
UPDATE inventory_items SET image_url = CASE
  WHEN name ILIKE '%กาแฟ%' THEN 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80'
  WHEN name ILIKE '%มัทฉะ%' OR name ILIKE '%ชาเขียว%' THEN 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&q=80'
  WHEN name ILIKE '%โกโก้%' THEN 'https://images.unsplash.com/photo-1548907040-4d42f0b0e0f8?w=900&q=80'
  WHEN name ILIKE '%นม%' OR name ILIKE '%โยเกิร์ต%' OR name ILIKE '%วิปครีม%' THEN 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&q=80'
  WHEN name ILIKE '%ไซรัป%' OR name ILIKE '%ไซรับ%' OR name ILIKE '%น้ำเชื่อม%' OR name ILIKE '%น้ำผึ้ง%' THEN 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=900&q=80'
  WHEN name ILIKE '%อะโวคาโด%' THEN 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=900&q=80'
  WHEN name ILIKE '%กล้วย%' OR name ILIKE '%ขนุน%' OR name ILIKE '%ส้ม%' OR name ILIKE '%มะนาว%' THEN 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=900&q=80'
  WHEN name ILIKE '%กุ้ง%' OR name ILIKE '%หมึก%' OR name ILIKE '%ทูน่า%' THEN 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80'
  WHEN name ILIKE '%ไก่%' OR name ILIKE '%ปีกไก่%' OR name ILIKE '%หมู%' THEN 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=900&q=80'
  WHEN name ILIKE '%พริก%' OR name ILIKE '%มะเขือเทศ%' OR name ILIKE '%ผัก%' OR name ILIKE '%หอม%' OR name ILIKE '%กระเทียม%' OR name ILIKE '%แครอท%' THEN 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&q=80'
  WHEN kind = 'stock' THEN 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=900&q=80'
  ELSE image_url
END;

UPDATE menu_items SET image_url = CASE
  WHEN name ILIKE '%อเมริกาโน่%' OR name ILIKE '%เอสเปรสโซ่%' OR name ILIKE '%ลาเต้%' OR name ILIKE '%คาปูชิโน่%' OR name ILIKE '%มอคค่า%' THEN 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80'
  WHEN name ILIKE '%มัทฉะ%' OR name ILIKE '%ชาเขียว%' OR name ILIKE '%ชาไทย%' OR name ILIKE '%ชาพีช%' OR name ILIKE '%ชาลิ้นจี่%' THEN 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=900&q=80'
  WHEN name ILIKE '%โกโก้%' OR name ILIKE '%ช็อกโก%' THEN 'https://images.unsplash.com/photo-1548907040-4d42f0b0e0f8?w=900&q=80'
  WHEN name ILIKE '%ปั่น%' OR name ILIKE '%สมูทตี้%' THEN 'https://images.unsplash.com/photo-1502741224143-90386d7f8c82?w=900&q=80'
  WHEN name ILIKE '%โซดา%' OR name ILIKE '%น้ำผึ้ง%' OR name ILIKE '%เลม่อน%' THEN 'https://images.unsplash.com/photo-1513558161293-cbef765ed2fd?w=900&q=80'
  WHEN name ILIKE '%อะโวคาโด%' THEN 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=900&q=80'
  WHEN name ILIKE '%สปาเก็ตตี้%' THEN 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=900&q=80'
  WHEN name ILIKE '%สลัด%' THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80'
  WHEN name ILIKE '%ข้าว%' OR name ILIKE '%กะเพรา%' OR name ILIKE '%ผัด%' OR name ILIKE '%ทอด%' OR name ILIKE '%ไข่%' THEN 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&q=80'
  ELSE image_url
END;
