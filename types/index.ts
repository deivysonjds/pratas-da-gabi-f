export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  categoryId?: number;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  contact?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  clientName: string;
  items: SaleItem[];
  total: number;
  date: string;
  status: 'pago' | 'pendente pagamento' | 'cancelado';
  paymentMethod?: string;
  customer?: {
    email?: string;
    phone?: string;
  };
  installments?: Installment[];
  createdAt?: string;
  paidAt?: string;
  canceledAt?: string;
  dueDate?: string;
}

type Installment = {
  number: number;
  dueLabel: string;
  amount: number;
  paid: boolean;
  id?: number;
  dueDate?: string;
  paidAt?: string;
};