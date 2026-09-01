import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DashboardMain, formatDate } from '@stackbuild/ui';
import {
  createPurchaseOrder,
  createSupplier,
  listBranches,
  listInventory,
  listPurchaseOrders,
  listSuppliers,
  receivePurchaseOrder,
  updatePurchaseOrderStatus,
  type InventoryItem,
  type PurchaseOrder,
} from '../../api';

const statusLabel: Record<PurchaseOrder['status'], string> = {
  draft: 'ฉบับร่าง',
  submitted: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  ordered: 'สั่งซื้อแล้ว',
  partially_received: 'รับแล้วบางส่วน',
  received: 'รับครบแล้ว',
  cancelled: 'ยกเลิก',
};

const nextStatus: Partial<
  Record<PurchaseOrder['status'], 'submitted' | 'approved' | 'ordered'>
> = { draft: 'submitted', submitted: 'approved', approved: 'ordered' };

const statusColor: Record<
  PurchaseOrder['status'],
  'default' | 'warning' | 'info' | 'success' | 'error'
> = {
  draft: 'default',
  submitted: 'warning',
  approved: 'info',
  ordered: 'info',
  partially_received: 'warning',
  received: 'success',
  cancelled: 'error',
};

type OrderLine = {
  inventoryItemId: number;
  quantity: string;
  unitCost: string;
};

export function AdminProcurementPage() {
  const queryClient = useQueryClient();
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [error, setError] = useState('');
  const [supplier, setSupplier] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    status: 'active' as const,
  });
  const [orderBranchId, setOrderBranchId] = useState('');
  const [orderSupplierId, setOrderSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([
    { inventoryItemId: 0, quantity: '', unitCost: '' },
  ]);
  const suppliers = useQuery({
    queryKey: ['suppliers'],
    queryFn: listSuppliers,
  });
  const branches = useQuery({ queryKey: ['branches'], queryFn: listBranches });
  const orders = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: listPurchaseOrders,
  });
  const selectedBranch = branches.data?.find(
    (branch) => String(branch.id) === orderBranchId,
  );
  const inventory = useQuery({
    queryKey: ['procurement-inventory', selectedBranch?.code],
    queryFn: () => listInventory('ingredient', selectedBranch!.code),
    enabled: Boolean(selectedBranch),
  });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    void queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    void queryClient.invalidateQueries({ queryKey: ['procurement-inventory'] });
  };
  const saveSupplier = useMutation({
    mutationFn: () => createSupplier(supplier),
    onSuccess: () => {
      refresh();
      setSupplierOpen(false);
      setSupplier({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        status: 'active',
      });
    },
    onError: (reason: Error) => setError(reason.message),
  });
  const saveOrder = useMutation({
    mutationFn: () =>
      createPurchaseOrder({
        branchId: Number(orderBranchId),
        supplierId: Number(orderSupplierId),
        note,
        items: lines.map((line) => ({
          inventoryItemId: line.inventoryItemId,
          quantity: Number(line.quantity),
          unitCost: Number(line.unitCost),
        })),
      }),
    onSuccess: () => {
      refresh();
      setOrderOpen(false);
      setOrderBranchId('');
      setOrderSupplierId('');
      setNote('');
      setLines([{ inventoryItemId: 0, quantity: '', unitCost: '' }]);
    },
    onError: (reason: Error) => setError(reason.message),
  });
  const changeStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: 'submitted' | 'approved' | 'ordered';
    }) => updatePurchaseOrderStatus(id, status),
    onSuccess: refresh,
    onError: (reason: Error) => setError(reason.message),
  });
  const receiveAll = useMutation({
    mutationFn: (order: PurchaseOrder) =>
      receivePurchaseOrder(
        order.id,
        order.items
          .filter((item) => item.quantityReceived < item.quantityOrdered)
          .map((item) => ({
            itemId: item.id,
            quantity: item.quantityOrdered - item.quantityReceived,
          })),
        'รับสินค้าครบตามใบสั่งซื้อ',
      ),
    onSuccess: refresh,
    onError: (reason: Error) => setError(reason.message),
  });
  const canSaveOrder = useMemo(
    () =>
      Boolean(
        orderBranchId &&
        orderSupplierId &&
        lines.length &&
        lines.every(
          (line) =>
            line.inventoryItemId > 0 &&
            Number(line.quantity) > 0 &&
            Number(line.unitCost) >= 0,
        ),
      ),
    [lines, orderBranchId, orderSupplierId],
  );

  useEffect(() => {
    if (error) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [error]);

  return (
    <DashboardMain>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: 'Kanit, sans-serif',
              fontSize: 22,
              fontWeight: 600,
              color: '#3c2d24',
            }}
          >
            จัดซื้อและรับสินค้า
          </Typography>
          <Typography
            sx={{
              fontFamily: 'Kanit, sans-serif',
              color: 'text.secondary',
              fontSize: 13,
            }}
          >
            สร้างใบสั่งซื้อจากผู้ขาย และรับสินค้าเข้าสต๊อกอย่างมีประวัติ
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => {
              setError('');
              setSupplierOpen(true);
            }}
          >
            เพิ่มผู้ขาย
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setError('');
              setOrderOpen(true);
            }}
            sx={{ bgcolor: '#201914', '&:hover': { bgcolor: '#3c2d24' } }}
          >
            สร้างใบสั่งซื้อ
          </Button>
        </Stack>
      </Box>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card
        variant="outlined"
        sx={{ borderRadius: 3, borderColor: '#e8ddd5', overflow: 'hidden' }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}>
            ใบสั่งซื้อล่าสุด
          </Typography>
          <Chip size="small" label={`${orders.data?.length ?? 0} รายการ`} />
        </Box>
        <Divider />
        {orders.isLoading ? (
          <Typography sx={{ p: 3, fontFamily: 'Kanit, sans-serif' }}>
            กำลังโหลด...
          </Typography>
        ) : orders.data?.length ? (
          orders.data.map((order) => {
            const next = nextStatus[order.status];
            const total = order.items.reduce(
              (sum, item) => sum + item.quantityOrdered * item.unitCost,
              0,
            );
            return (
              <Box
                key={order.id}
                sx={{
                  p: 2.5,
                  borderBottom: '1px solid #eee5df',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 600 }}
                    >
                      PO-{order.id} · {order.supplierName}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Kanit, sans-serif',
                        color: 'text.secondary',
                        fontSize: 13,
                      }}
                    >
                      {order.branchName} · {formatDate(order.createdAt)} ·{' '}
                      {order.items.length} รายการ ·{' '}
                      {total.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      บาท
                    </Typography>
                  </Box>
                  <Chip
                    color={statusColor[order.status]}
                    size="small"
                    label={statusLabel[order.status]}
                  />
                </Box>
                <Typography
                  sx={{
                    mt: 1,
                    fontFamily: 'Kanit, sans-serif',
                    fontSize: 13,
                    color: '#5f4b3d',
                  }}
                >
                  {order.items
                    .map(
                      (item) =>
                        `${item.name} ${item.quantityReceived}/${item.quantityOrdered} ${item.unit}`,
                    )
                    .join(' · ')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  {next && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        changeStatus.mutate({ id: order.id, status: next })
                      }
                    >
                      {statusLabel[next]}
                    </Button>
                  )}
                  {(order.status === 'ordered' ||
                    order.status === 'partially_received') && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => receiveAll.mutate(order)}
                      sx={{
                        bgcolor: '#3c5b47',
                        '&:hover': { bgcolor: '#2a4535' },
                      }}
                    >
                      รับสินค้าครบ
                    </Button>
                  )}
                </Stack>
              </Box>
            );
          })
        ) : (
          <Typography
            sx={{
              p: 3,
              fontFamily: 'Kanit, sans-serif',
              color: 'text.secondary',
            }}
          >
            ยังไม่มีใบสั่งซื้อ
          </Typography>
        )}
      </Card>

      <Dialog
        open={supplierOpen}
        onClose={() => setSupplierOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontFamily: 'Kanit, sans-serif' }}>
          เพิ่มผู้ขาย
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              required
              label="ชื่อผู้ขาย"
              value={supplier.name}
              onChange={(event) =>
                setSupplier({ ...supplier, name: event.target.value })
              }
            />
            <TextField
              label="ผู้ติดต่อ"
              value={supplier.contactName}
              onChange={(event) =>
                setSupplier({ ...supplier, contactName: event.target.value })
              }
            />
            <TextField
              label="เบอร์โทร"
              value={supplier.phone}
              onChange={(event) =>
                setSupplier({ ...supplier, phone: event.target.value })
              }
            />
            <TextField
              label="อีเมล"
              value={supplier.email}
              onChange={(event) =>
                setSupplier({ ...supplier, email: event.target.value })
              }
            />
            <TextField
              label="ที่อยู่"
              multiline
              minRows={2}
              value={supplier.address}
              onChange={(event) =>
                setSupplier({ ...supplier, address: event.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupplierOpen(false)}>ยกเลิก</Button>
          <Button
            disabled={!supplier.name || saveSupplier.isPending}
            variant="contained"
            onClick={() => saveSupplier.mutate()}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontFamily: 'Kanit, sans-serif' }}>
          สร้างใบสั่งซื้อ
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
              }}
            >
              <TextField
                select
                required
                label="สาขาที่รับสินค้า"
                value={orderBranchId}
                onChange={(event) => {
                  setOrderBranchId(event.target.value);
                  setLines([
                    { inventoryItemId: 0, quantity: '', unitCost: '' },
                  ]);
                }}
              >
                {branches.data?.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                required
                label="ผู้ขาย"
                value={orderSupplierId}
                onChange={(event) => setOrderSupplierId(event.target.value)}
              >
                {suppliers.data
                  ?.filter((item) => item.status === 'active')
                  .map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
            {lines.map((line, index) => (
              <Box
                key={index}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr auto' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  select
                  required
                  label="รายการสต๊อก"
                  value={line.inventoryItemId || ''}
                  onChange={(event) =>
                    setLines(
                      lines.map((current, position) =>
                        position === index
                          ? {
                              ...current,
                              inventoryItemId: Number(event.target.value),
                            }
                          : current,
                      ),
                    )
                  }
                >
                  {inventory.data?.map((item: InventoryItem) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit})
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  label="จำนวน"
                  type="number"
                  value={line.quantity}
                  onChange={(event) =>
                    setLines(
                      lines.map((current, position) =>
                        position === index
                          ? { ...current, quantity: event.target.value }
                          : current,
                      ),
                    )
                  }
                />
                <TextField
                  required
                  label="ต้นทุน/หน่วย"
                  type="number"
                  value={line.unitCost}
                  onChange={(event) =>
                    setLines(
                      lines.map((current, position) =>
                        position === index
                          ? { ...current, unitCost: event.target.value }
                          : current,
                      ),
                    )
                  }
                />
                <Button
                  color="error"
                  disabled={lines.length === 1}
                  onClick={() =>
                    setLines(lines.filter((_, position) => position !== index))
                  }
                >
                  ลบ
                </Button>
              </Box>
            ))}
            <Button
              variant="text"
              onClick={() =>
                setLines([
                  ...lines,
                  { inventoryItemId: 0, quantity: '', unitCost: '' },
                ])
              }
            >
              + เพิ่มรายการ
            </Button>
            <TextField
              label="หมายเหตุ"
              value={note}
              multiline
              minRows={2}
              onChange={(event) => setNote(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderOpen(false)}>ยกเลิก</Button>
          <Button
            disabled={!canSaveOrder || saveOrder.isPending}
            variant="contained"
            onClick={() => saveOrder.mutate()}
          >
            บันทึกฉบับร่าง
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardMain>
  );
}
