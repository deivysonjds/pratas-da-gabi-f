import type { Client, Product, Sale, SaleItem } from '@/types';

export type ApiProduct = {
  id: number;
  name: string;
  description?: string | null;
  value: number | string;
  stock: number;
  category_id?: number;
  category?: string | { id?: number; name?: string } | null;
  image_url?: string | null;
};

export function mapProduct(raw: ApiProduct): Product {
  const category = typeof raw.category === 'string'
    ? raw.category
    : raw.category?.name || 'Sem categoria';
  return {
    id: Number(raw.id),
    code: `PR-${String(raw.id).padStart(4, '0')}`,
    name: raw.name,
    description: raw.description || '',
    price: Number(raw.value),
    stock: Number(raw.stock),
    category,
    imageUrl: raw.image_url || '',
    categoryId: raw.category_id || (typeof raw.category === 'object' ? raw.category?.id : undefined),
  };
}

export function mapClient(raw: Record<string, unknown>): Client {
  const createdAt = raw.createdAt || raw.created_at;
  let createdLabel = '—';
  if (typeof createdAt === 'string' || typeof createdAt === 'number' || (typeof createdAt === 'object' && createdAt instanceof Date)) {
    const date = new Date(createdAt);
    if (!Number.isNaN(date.getTime())) createdLabel = date.toLocaleDateString('pt-BR');
  }
  const cpfDigits = String(raw.cpf || '').replace(/\D/g, '');
  const formattedCpf = cpfDigits.length === 11 ? cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : String(raw.cpf || '');
  return {
    id: Number(raw.id),
    name: String(raw.name || ''),
    cpf: formattedCpf,
    email: String(raw.email || ''),
    contact: String(raw.contact || ''),
    createdAt: createdLabel,
  };
}

function statusLabel(value: unknown): Sale['status'] {
  const status = String(value || 'PENDING').toUpperCase();
  if (['PAID', 'PAGO', 'COMPLETED'].includes(status)) return 'pago';
  if (['CANCELED', 'CANCELLED', 'CANCELADO'].includes(status)) return 'cancelado';
  return 'pendente pagamento';
}

export function mapSale(raw: Record<string, any>): Sale {
  const aggregated = new Map<number, SaleItem>();
  for (const row of (Array.isArray(raw.items) ? raw.items : [])) {
    const product = row.product || {};
    const productId = Number(product.id || row.product_id || row.productId || 0);
    if (!productId) continue;
    const existing = aggregated.get(productId);
    if (existing) existing.quantity += 1;
    else aggregated.set(productId, {
      productId,
      name: String(product.name || 'Produto removido'),
      imageUrl: String(product.image_url || ''),
      price: Number(product.value || 0),
      quantity: 1,
    });
  }
  const items = [...aggregated.values()];
  const installments = (raw.installments || []).map((item: Record<string, any>) => ({
    number: Number(item.number),
    dueLabel: item.due_date ? new Date(item.due_date).toLocaleDateString('pt-BR') : `Parcela ${item.number}`,
    amount: Number(item.amount || 0),
    paid: Boolean(item.is_paid),
  }));
  const date = raw.created_at ? new Date(raw.created_at) : null;
  const client = raw.client || {};
  return {
    id: String(raw.id),
    clientName: String(client.name || 'Cliente'),
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    date: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('pt-BR') : '—',
    status: statusLabel(raw.status),
    paymentMethod: String(raw.paymentMethod || raw.payment_method || ''),
    customer: {
      cpf: String(client.cpf || ''),
      email: String(client.email || ''),
      phone: String(client.contact || ''),
    },
    installments,
  };
}

export function unwrapList<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.data?.data)) return payload.data.data as T[];
  if (Array.isArray(payload?.rows)) return payload.rows as T[];
  return [];
}
