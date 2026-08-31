import { afterEach, expect, test, vi } from 'vitest';
import { createPOSOrder } from './api';

afterEach(() => vi.unstubAllGlobals());

test('ส่งออเดอร์ POS พร้อมช่องทางและรายการขายไปยัง API', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({ success: true, data: { id: 1, total: 60 } }),
  });
  vi.stubGlobal('fetch', fetchMock);
  await expect(
    createPOSOrder('storefront', [
      { productName: 'อเมริกาโน่', quantity: 1, unitPrice: 60 },
    ]),
  ).resolves.toEqual({ id: 1, total: 60 });
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/pos/orders'),
    expect.objectContaining({ method: 'POST' }),
  );
});
