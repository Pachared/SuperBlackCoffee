import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Alert,
  Button,
  Card,
  Chip,
  Drawer,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  Snackbar,
} from '@mui/material';
import {
  DashboardMain,
  coffeeIngredientsImage,
  INGREDIENT_STATUS_BADGES,
  PlusIcon,
  SearchIcon,
  XIcon,
  type IngredientStatus,
  type PlusIconHandle,
  type SearchIconHandle,
  type XIconHandle,
} from '@stackbuild/ui';
import { IngredientCardsSkeleton } from '../../components/skeletons/IngredientCardsSkeleton';
import {
  createInventory,
  createStockRequest,
  deleteInventory,
  listInventory,
  updateInventory,
} from '../../lib/api';

type Ingredient = {
  id?: number;
  name: string;
  amount: string;
  status: IngredientStatus;
  imagePosition: string;
  category?: string;
  quantity?: number;
  unit?: string;
  reorderLevel?: number;
};
type OrderItem = Ingredient & { quantity: number };

const filters = [
  'ทั้งหมด',
  'วัตถุดิบใกล้หมด',
  'วัตถุดิบหมด',
  'วัตถุดิบค้างสต๊อก',
] as const;
type IngredientFilter = (typeof filters)[number];

export function PosIngredientsPage() {
  const plusIconRef = useRef<PlusIconHandle>(null);
  const searchIconRef = useRef<SearchIconHandle>(null);
  const closeIconRef = useRef<XIconHandle>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<IngredientFilter>('ทั้งหมด');
  const [isIngredientsLoaded, setIsIngredientsLoaded] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null,
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [inventory, setInventory] = useState<Ingredient[]>([]);
  const [notice, setNotice] = useState('');
  const filteredIngredients = useMemo(
    () =>
      inventory.filter((ingredient) => {
        const matchesQuery = ingredient.name
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const matchesFilter =
          filter === 'ทั้งหมด' || ingredient.status === filter;
        return matchesQuery && matchesFilter;
      }),
    [filter, inventory, query],
  );
  useEffect(() => {
    let cancelled = false;
    void listInventory()
      .then((items) => {
        if (cancelled) return;
        const statusByApiStatus: Record<string, IngredientStatus> = {
          ready: 'พร้อมใช้',
          low: 'วัตถุดิบใกล้หมด',
          out: 'วัตถุดิบหมด',
        };
        setInventory(
          items.map((item, index) => ({
            ...item,
            amount: `คงเหลือ ${item.quantity} ${item.unit}`,
            status: statusByApiStatus[item.status] ?? 'พร้อมใช้',
            imagePosition: `${12 + ((index * 21) % 76)}% ${24 + ((index * 17) % 64)}%`,
          })),
        );
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsIngredientsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );
  const drawerTitle = editingIngredient ? 'แก้ไขวัตถุดิบ' : 'เพิ่มวัตถุดิบ';
  const imageSource =
    imagePreviewUrl ?? (editingIngredient ? coffeeIngredientsImage : null);
  const addToOrder = (ingredient: Ingredient) => {
    setOrderItems((items) => {
      const existingItem = items.find((item) => item.name === ingredient.name);
      return existingItem
        ? items.map((item) =>
            item.name === ingredient.name
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...items, { ...ingredient, quantity: 1 }];
    });
  };
  const orderItemCount = orderItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const saveIngredient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      category: String(form.get('category') ?? 'other'),
      quantity: Number(form.get('quantity') ?? 0),
      unit: String(form.get('unit') ?? 'kg'),
      reorderLevel: Number(form.get('reorderLevel') ?? 0),
    };
    try {
      if (editingIngredient?.id)
        await updateInventory(editingIngredient.id, payload);
      else await createInventory(payload);
      const items = await listInventory();
      const statusByApiStatus: Record<string, IngredientStatus> = {
        ready: 'พร้อมใช้',
        low: 'วัตถุดิบใกล้หมด',
        out: 'วัตถุดิบหมด',
      };
      setInventory(
        items.map((item, index) => ({
          ...item,
          amount: `คงเหลือ ${item.quantity} ${item.unit}`,
          status: statusByApiStatus[item.status] ?? 'พร้อมใช้',
          imagePosition: `${12 + ((index * 21) % 76)}% ${24 + ((index * 17) % 64)}%`,
        })),
      );
      setIsAddDrawerOpen(false);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : 'บันทึกวัตถุดิบไม่สำเร็จ',
      );
    }
  };
  const confirmDelete = async () => {
    const item = inventory.find(
      (candidate) => candidate.name === deleteTargetName,
    );
    try {
      if (item?.id) await deleteInventory(item.id);
      setInventory((items) =>
        items.filter((candidate) => candidate.name !== deleteTargetName),
      );
      setDeleteTargetName(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'ลบวัตถุดิบไม่สำเร็จ');
    }
  };
  const submitOrder = async () => {
    if (!orderItems.length) return;
    try {
      await createStockRequest(
        orderItems.map((item) => ({
          inventoryItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit ?? 'ชิ้น',
        })),
      );
      setOrderItems([]);
      setIsOrderDrawerOpen(false);
      setNotice('ส่งคำขอสั่งวัตถุดิบไปยังสำนักงานกลางแล้ว');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'ส่งคำขอไม่สำเร็จ');
    }
  };

  return (
    <DashboardMain>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice('')}
      >
        <Alert severity="info" variant="filled" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
        }}
      >
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => searchIconRef.current?.startAnimation()}
          onBlur={() => searchIconRef.current?.stopAnimation()}
          placeholder="ค้นหาวัตถุดิบ"
          size="small"
          name="pos-ingredient-search"
          autoComplete="off"
          sx={{
            width: { xs: '100%', lg: 310 },
            '& .MuiOutlinedInput-root': { borderRadius: '12px' },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{
                    alignSelf: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    height: 18,
                  }}
                >
                  <SearchIcon ref={searchIconRef} size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setIsOrderDrawerOpen(true)}
            sx={{
              minHeight: 40,
              borderRadius: '12px',
              borderColor: '#d8c8bd',
              color: '#5f4b3d',
              fontFamily: 'Kanit, sans-serif',
              fontWeight: 500,
              bgcolor: '#fff',
              '&:hover': { borderColor: '#5f4030', bgcolor: '#f7eee8' },
            }}
          >
            ตะกร้าสั่งซื้อ{orderItemCount > 0 ? ` (${orderItemCount})` : ''}
          </Button>
          <Button
            variant="contained"
            startIcon={<PlusIcon ref={plusIconRef} size={16} />}
            onClick={() => {
              setEditingIngredient(null);
              setImagePreviewUrl(null);
              setIsAddDrawerOpen(true);
            }}
            onMouseEnter={() => plusIconRef.current?.startAnimation()}
            onMouseLeave={() => plusIconRef.current?.stopAnimation()}
            sx={{
              minHeight: 40,
              borderRadius: '12px',
              bgcolor: '#201914',
              fontFamily: 'Kanit, sans-serif',
              fontWeight: 500,
              boxShadow: 'none',
              '& .MuiButton-startIcon': { ml: 0.5, mr: 0.75 },
              '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
            }}
          >
            เพิ่มวัตถุดิบ
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {filters.map((item) => (
          <Button
            key={item}
            size="small"
            variant={filter === item ? 'contained' : 'outlined'}
            onClick={() => setFilter(item)}
            sx={{
              minHeight: 34,
              borderRadius: '12px',
              borderColor: '#d8c8bd',
              bgcolor: filter === item ? '#201914' : '#fff',
              color: filter === item ? '#fff' : '#5f4b3d',
              fontFamily: 'Kanit, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                borderColor: '#201914',
                bgcolor: filter === item ? '#3c2d24' : '#f5eee9',
                boxShadow: 'none',
              },
            }}
          >
            {item}
          </Button>
        ))}
      </Box>
      {!isIngredientsLoaded ? (
        <IngredientCardsSkeleton count={Math.min(inventory.length, 4)} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: '16px',
          }}
        >
          {filteredIngredients.map((ingredient) => {
            const statusBadge = INGREDIENT_STATUS_BADGES[ingredient.status];
            return (
              <Card
                key={ingredient.name}
                variant="outlined"
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '15px',
                  borderColor: '#e8ddd5',
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={coffeeIngredientsImage}
                    alt={ingredient.name}
                    sx={{
                      display: 'block',
                      width: '100%',
                      aspectRatio: { xs: '1 / 1', md: '4 / 3' },
                      objectFit: 'cover',
                      objectPosition: ingredient.imagePosition,
                    }}
                  />
                  <Chip
                    label={ingredient.status}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      height: 25,
                      borderRadius: '12px',
                      bgcolor: statusBadge.main,
                      color: statusBadge.contrastText,
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    p: 2.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 18,
                      fontWeight: 500,
                    }}
                  >
                    {ingredient.name}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.6,
                      color: 'text.secondary',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 13,
                    }}
                  >
                    {ingredient.amount}
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 1,
                      mt: 'auto',
                      pt: 2,
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setEditingIngredient(ingredient);
                        setImagePreviewUrl(null);
                        setIsAddDrawerOpen(true);
                      }}
                      sx={{
                        minHeight: 34,
                        borderRadius: '10px',
                        bgcolor: '#5f4030',
                        color: '#fff',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 12,
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
                      }}
                    >
                      แก้ไขวัตถุดิบ
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => setDeleteTargetName(ingredient.name)}
                      sx={{
                        minHeight: 34,
                        borderRadius: '10px',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 12,
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' },
                      }}
                    >
                      ลบวัตถุดิบ
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => addToOrder(ingredient)}
                      sx={{
                        gridColumn: '1 / -1',
                        minHeight: 34,
                        borderRadius: '10px',
                        bgcolor: '#201914',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 12,
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
                      }}
                    >
                      สั่งวัตถุดิบ
                    </Button>
                  </Box>
                </Box>
                {deleteTargetName === ingredient.name && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      p: 2.5,
                      bgcolor: 'rgba(32, 25, 20, .94)',
                      color: '#fff',
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 18,
                        fontWeight: 600,
                      }}
                    >
                      ยืนยันการลบวัตถุดิบ?
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,.75)',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 13,
                      }}
                    >
                      รายการนี้จะถูกลบออกจากสต๊อก
                    </Typography>
                    <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                      <Button
                        fullWidth
                        onClick={confirmDelete}
                        sx={{
                          minHeight: 38,
                          borderRadius: '10px',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,.45)',
                          fontFamily: 'Kanit, sans-serif',
                        }}
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        onClick={() => setDeleteTargetName(null)}
                        sx={{
                          minHeight: 38,
                          borderRadius: '10px',
                          fontFamily: 'Kanit, sans-serif',
                          boxShadow: 'none',
                        }}
                      >
                        ยืนยันลบ
                      </Button>
                    </Box>
                  </Box>
                )}
              </Card>
            );
          })}
        </Box>
      )}
      {filteredIngredients.length === 0 && (
        <Typography
          sx={{
            pt: 4,
            textAlign: 'center',
            color: 'text.secondary',
            fontFamily: 'Kanit, sans-serif',
          }}
        >
          ไม่พบวัตถุดิบที่ค้นหา
        </Typography>
      )}
      <Drawer
        anchor="bottom"
        open={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        transitionDuration={{ enter: 360, exit: 280 }}
        slotProps={{
          paper: {
            sx: {
              left: { md: '254px' },
              width: { md: 'calc(100% - 278px)' },
              minHeight: { sm: 520 },
              maxHeight: '82vh',
              overflowY: 'auto',
              borderRadius: '24px 24px 0 0',
              bgcolor: '#fffaf7',
              boxShadow: '0 -12px 32px rgba(50, 35, 25, .18)',
            },
          },
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 2.5, sm: 4 }, pt: 1.5, pb: 3.5 }}>
          <Box
            sx={{
              width: 44,
              height: 5,
              mx: 'auto',
              mb: 2.5,
              borderRadius: 99,
              bgcolor: '#d8c8bd',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography
              sx={{
                color: '#201914',
                fontFamily: 'Kanit, sans-serif',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {drawerTitle}
            </Typography>
            <Button
              aria-label="ปิด"
              onClick={() => setIsAddDrawerOpen(false)}
              onMouseEnter={() => closeIconRef.current?.startAnimation()}
              onMouseLeave={() => closeIconRef.current?.stopAnimation()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: '12px',
                bgcolor: '#f7eee8',
                color: '#5f4b3d',
                '&:hover': { bgcolor: '#f1e4da' },
              }}
            >
              <XIcon
                ref={closeIconRef}
                size={20}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 0,
                }}
              />
            </Button>
          </Box>
          <Typography
            sx={{
              mt: 0.5,
              color: 'text.secondary',
              fontFamily: 'Kanit, sans-serif',
            }}
          >
            {editingIngredient
              ? 'แก้ไขข้อมูลวัตถุดิบในสต๊อก'
              : 'กรอกข้อมูลวัตถุดิบเพื่อเพิ่มเข้าสต๊อก'}
          </Typography>
          <Box
            component="form"
            onSubmit={saveIngredient}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(0, 1fr) minmax(0, 2fr)',
              },
              gap: 2.5,
              mt: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#fff',
              },
            }}
          >
            <Box
              component="label"
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1 / 1',
                p: 2,
                overflow: 'hidden',
                border: '1.5px dashed #c9b6a9',
                borderRadius: '16px',
                bgcolor: '#f7eee8',
                color: '#5f4b3d',
                cursor: 'pointer',
                transition: 'background-color .2s ease, border-color .2s ease',
                '&:hover': { bgcolor: '#f1e4da', borderColor: '#805637' },
              }}
            >
              {imageSource ? (
                <Box
                  component="img"
                  src={imageSource}
                  alt="ตัวอย่างรูปวัตถุดิบ"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 44,
                      height: 44,
                      mb: 1,
                      borderRadius: '50%',
                      bgcolor: '#ead9cd',
                      color: '#5f4030',
                      fontSize: 28,
                      lineHeight: 1,
                    }}
                  >
                    +
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 14,
                      fontWeight: 500,
                      textAlign: 'center',
                    }}
                  >
                    เพิ่มรูปวัตถุดิบ
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      color: 'text.secondary',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 11,
                      textAlign: 'center',
                    }}
                  >
                    JPG, PNG ไม่เกิน 5 MB
                  </Typography>
                </>
              )}
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setImagePreviewUrl(URL.createObjectURL(file));
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <TextField
                required
                name="name"
                fullWidth
                label="ชื่อวัตถุดิบ"
                placeholder="เช่น เมล็ดกาแฟคั่วกลาง"
                defaultValue={editingIngredient?.name}
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <TextField
                required
                select
                name="category"
                fullWidth
                label="หมวดหมู่"
                defaultValue=""
              >
                <MenuItem value="" disabled>
                  เลือกหมวดหมู่
                </MenuItem>
                <MenuItem value="coffee">เมล็ดกาแฟ</MenuItem>
                <MenuItem value="milk">นมและครีม</MenuItem>
                <MenuItem value="syrup">ไซรัปและผงชง</MenuItem>
                <MenuItem value="other">อื่น ๆ</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="จำนวนคงเหลือ"
                type="number"
                name="quantity"
                defaultValue={editingIngredient?.amount.match(/\d+/)?.[0]}
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                required
                select
                name="unit"
                fullWidth
                label="หน่วย"
                defaultValue="kg"
              >
                <MenuItem value="kg">กิโลกรัม</MenuItem>
                <MenuItem value="liter">ลิตร</MenuItem>
                <MenuItem value="bottle">ขวด</MenuItem>
                <MenuItem value="piece">ชิ้น</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="แจ้งเตือนเมื่อคงเหลือ"
                type="number"
                name="reorderLevel"
                slotProps={{ htmlInput: { min: 0 } }}
              />
              <TextField
                fullWidth
                label="หมายเหตุ"
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1.25,
                  mt: 1,
                  gridColumn: { sm: '1 / -1' },
                }}
              >
                <Button
                  onClick={() => setIsAddDrawerOpen(false)}
                  sx={{
                    minHeight: 40,
                    borderRadius: '12px',
                    color: '#5f4b3d',
                    fontFamily: 'Kanit, sans-serif',
                  }}
                >
                  {editingIngredient ? 'ยกเลิกแก้ไข' : 'ยกเลิกเพิ่ม'}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    minHeight: 40,
                    borderRadius: '12px',
                    bgcolor: '#201914',
                    fontFamily: 'Kanit, sans-serif',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
                  }}
                >
                  {editingIngredient ? 'บันทึกการแก้ไข' : 'บันทึกวัตถุดิบ'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <Drawer
        anchor="bottom"
        open={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        transitionDuration={{ enter: 360, exit: 280 }}
        slotProps={{
          paper: {
            sx: {
              left: { md: '254px' },
              width: { md: 'calc(100% - 278px)' },
              minHeight: { sm: 360 },
              maxHeight: '82vh',
              overflowY: 'auto',
              borderRadius: '24px 24px 0 0',
              bgcolor: '#fffaf7',
              boxShadow: '0 -12px 32px rgba(50, 35, 25, .18)',
            },
          },
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 2.5, sm: 4 }, pt: 1.5, pb: 3.5 }}>
          <Box
            sx={{
              width: 44,
              height: 5,
              mx: 'auto',
              mb: 2.5,
              borderRadius: 99,
              bgcolor: '#d8c8bd',
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#201914',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                ตะกร้าสั่งซื้อ
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                  fontSize: 14,
                }}
              >
                {orderItemCount} รายการที่ต้องการสั่ง
              </Typography>
            </Box>
            <Button
              aria-label="ปิด"
              onClick={() => setIsOrderDrawerOpen(false)}
              onMouseEnter={() => closeIconRef.current?.startAnimation()}
              onMouseLeave={() => closeIconRef.current?.stopAnimation()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                width: 40,
                height: 40,
                p: 0,
                borderRadius: '12px',
                bgcolor: '#f7eee8',
                color: '#5f4b3d',
                '&:hover': { bgcolor: '#f1e4da' },
              }}
            >
              <XIcon
                ref={closeIconRef}
                size={20}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 0,
                }}
              />
            </Button>
          </Box>
          <Box sx={{ mt: 3, display: 'grid', gap: 1.25 }}>
            {orderItems.length === 0 ? (
              <Typography
                sx={{
                  py: 4,
                  textAlign: 'center',
                  color: 'text.secondary',
                  fontFamily: 'Kanit, sans-serif',
                }}
              >
                ยังไม่มีรายการในตะกร้า
              </Typography>
            ) : (
              orderItems.map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 2,
                    border: '1px solid #e8ddd5',
                    borderRadius: '12px',
                    bgcolor: '#fff',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 500 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.25,
                        color: 'text.secondary',
                        fontFamily: 'Kanit, sans-serif',
                        fontSize: 13,
                      }}
                    >
                      {item.amount}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      flexShrink: 0,
                      color: '#5f4030',
                      fontFamily: 'Kanit, sans-serif',
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    จำนวน {item.quantity}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
          {orderItems.length > 0 && (
            <Button
              variant="contained"
              onClick={submitOrder}
              sx={{
                mt: 3,
                minHeight: 44,
                borderRadius: '12px',
                bgcolor: '#201914',
                fontFamily: 'Kanit, sans-serif',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#3c2d24', boxShadow: 'none' },
              }}
            >
              ส่งคำขอสั่งวัตถุดิบ
            </Button>
          )}
        </Box>
      </Drawer>
    </DashboardMain>
  );
}
