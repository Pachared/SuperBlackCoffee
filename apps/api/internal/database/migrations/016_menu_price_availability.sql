-- แยกกรณีที่ไฟล์ต้นทางไม่ได้ระบุราคาขาย ออกจากราคา 0 บาท
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS store_price_available BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS lineman_price_available BOOLEAN NOT NULL DEFAULT true;

UPDATE menu_items
SET
  store_price_available = CASE
    WHEN name IN ('กระเพราพริกแห้ง ทะเล', 'ปีกไก่ Super Black', 'ไข่เจียวหมู ทรงเครื่อง', 'ไข่เจียวกุ้ง ทรงเครื่อง', 'ไข่ขยี้คั่วพริกเกลือ หมู', 'อะโวคาโดโยเกิร์ตปั่น') THEN false
    ELSE store_price_available
  END,
  lineman_price_available = CASE
    WHEN name IN ('กระเพราพริกแห้ง ทะเล', 'ปีกไก่ Super Black', 'ไข่เจียวหมู ทรงเครื่อง', 'ไข่เจียวกุ้ง ทรงเครื่อง', 'ไข่ขยี้คั่วพริกเกลือ หมู', 'สลัดทูน่าอะโวคาโดทองวิมล', 'อะโวคาโดโยเกิร์ตปั่น') THEN false
    ELSE lineman_price_available
  END;
