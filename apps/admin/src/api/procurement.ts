import { secured } from './client';

export type Supplier = {
  id: number;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
};

export type SupplierInput = Omit<Supplier, 'id'>;

export type Branch = { id: number; name: string; code: string };

export type PurchaseOrderItem = {
  id: number;
  inventoryItemId: number;
  name: string;
  quantityOrdered: number;
  quantityReceived: number;
  unit: string;
  unitCost: number;
};

export type PurchaseOrder = {
  id: number;
  branchId: number;
  branchName: string;
  supplierId: number;
  supplierName: string;
  status:
    | 'draft'
    | 'submitted'
    | 'approved'
    | 'ordered'
    | 'partially_received'
    | 'received'
    | 'cancelled';
  note: string;
  createdAt: string;
  items: PurchaseOrderItem[];
};

export type StockMovement = {
  id: number;
  inventoryItemId: number;
  inventoryItemName: string;
  movementType:
    | 'initial'
    | 'purchase_receipt'
    | 'stock_request_receipt'
    | 'pos_sale'
    | 'adjustment';
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  note: string;
  createdAt: string;
};

export const listSuppliers = () => secured<Supplier[]>('/suppliers');
export const createSupplier = (data: SupplierInput) =>
  secured<{ id: number }>('/suppliers', { method: 'POST', data });
export const updateSupplier = (id: number, data: SupplierInput) =>
  secured<{ id: number }>(`/suppliers/${id}`, { method: 'PATCH', data });
export const listBranches = () => secured<Branch[]>('/branches');
export const listPurchaseOrders = () =>
  secured<PurchaseOrder[]>('/purchase-orders');
export const createPurchaseOrder = (data: {
  branchId: number;
  supplierId: number;
  note: string;
  items: { inventoryItemId: number; quantity: number; unitCost: number }[];
}) =>
  secured<{ id: number; status: 'draft' }>('/purchase-orders', {
    method: 'POST',
    data,
  });
export const updatePurchaseOrderStatus = (
  id: number,
  status: 'submitted' | 'approved' | 'ordered' | 'cancelled',
) =>
  secured<{ id: number; status: PurchaseOrder['status'] }>(
    `/purchase-orders/${id}/status`,
    { method: 'PATCH', data: { status } },
  );
export const receivePurchaseOrder = (
  id: number,
  items: { itemId: number; quantity: number }[],
  note = '',
) =>
  secured<{ id: number; status: PurchaseOrder['status'] }>(
    `/purchase-orders/${id}/receive`,
    { method: 'POST', data: { items, note } },
  );
export const listStockMovements = (branchCode: string) =>
  secured<StockMovement[]>(
    `/stock-movements?branchCode=${encodeURIComponent(branchCode)}`,
  );
export const adjustInventory = (
  id: number,
  quantity: number,
  note: string,
  branchCode: string,
) =>
  secured<{ id: number; quantity: number }>(
    `/inventory/${id}/adjust?branchCode=${encodeURIComponent(branchCode)}`,
    { method: 'POST', data: { quantity, note } },
  );
