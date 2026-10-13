export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export interface Client {
  id: number;
  name: string;
  cpf: string;
  email: string;
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
}