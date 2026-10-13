import { Product, Client, Sale } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 1,
    code: 'BJ-001',
    name: 'Brincos Arco',
    description: 'Aro simples com acabamento dourado.',
    price: 129,
    stock: 42,
    category: 'Brincos',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
  },
  {
    id: 2,
    code: 'BJ-002',
    name: 'Colar Barra',
    description: 'Peça leve e versátil com acabamento dourado.',
    price: 149,
    stock: 28,
    category: 'Colares',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
  },
  {
    id: 3,
    code: 'BJ-003',
    name: 'Pulseira Cadeia',
    description: 'Corrente fina com acabamento dourado.',
    price: 89,
    stock: 64,
    category: 'Pulseiras',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
  },
  {
    id: 4,
    code: 'BJ-004',
    name: 'Brincos Ponto',
    description: 'Peça clássica com acabamento dourado.',
    price: 79,
    stock: 19,
    category: 'Brincos',
    imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400',
  },
  {
    id: 5,
    code: 'BJ-005',
    name: 'Anel Liso',
    description: 'Simplicidade e elegância com acabamento dourado.',
    price: 99,
    stock: 35,
    category: 'Anéis',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
  },
  {
    id: 6,
    code: 'BJ-006',
    name: 'Pulseira Cuff',
    description: 'Peça ousada com acabamento dourado.',
    price: 159,
    stock: 87,
    category: 'Pulseiras',
    imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
  },
];

export const mockClients: Client[] = [
  { id: 1, name: 'Ana Paula Lima', cpf: '529.982.247-25', email: 'ana.lima@exemplo.com', createdAt: '28/09/2026' },
  { id: 2, name: 'Bruno Oliveira', cpf: '111.444.777-35', email: 'bruno@exemplo.com', createdAt: '26/09/2026' },
  { id: 3, name: 'Carla Santos', cpf: '123.456.789-09', email: 'carla.s@exemplo.com', createdAt: '24/09/2026' },
  { id: 4, name: 'Diego Martins', cpf: '987.654.321-00', email: 'diego@exemplo.com', createdAt: '22/09/2026' },
  { id: 5, name: 'Elisa Ferreira', cpf: '321.654.987-00', email: 'elisa@exemplo.com', createdAt: '20/09/2026' },
  { id: 6, name: 'Felipe Costa', cpf: '456.789.123-00', email: 'felipe@exemplo.com', createdAt: '19/09/2026' },
  { id: 7, name: 'Gabriela Rocha', cpf: '789.123.456-00', email: 'gabi@exemplo.com', createdAt: '18/09/2026' },
  { id: 8, name: 'Henrique Alves', cpf: '654.321.987-00', email: 'henrique@exemplo.com', createdAt: '16/09/2026' },
  { id: 9, name: 'Isabela Souza', cpf: '147.258.369-00', email: 'isabela@exemplo.com', createdAt: '15/09/2026' },
  { id: 10, name: 'João Ribeiro', cpf: '369.258.147-00', email: 'joao@exemplo.com', createdAt: '12/09/2026' },
];

export const mockSales: Sale[] = [
  {
    id: '#0160',
    clientName: 'Ana Paula Lima',
    items: [
      { productId: 1, name: 'Brincos Arco', imageUrl: mockProducts[0].imageUrl, price: 129, quantity: 2 },
      { productId: 2, name: 'Colar Barra', imageUrl: mockProducts[1].imageUrl, price: 149, quantity: 1 },
    ],
    total: 407,
    date: '30/09/2026',
    status: 'pendente pagamento',
  },
  {
    id: '#0158',
    clientName: 'Bruno Oliveira',
    items: [
      { productId: 3, name: 'Pulseira Cadeia', imageUrl: mockProducts[2].imageUrl, price: 89, quantity: 1 },
      { productId: 5, name: 'Anel Liso', imageUrl: mockProducts[4].imageUrl, price: 99, quantity: 1 },
    ],
    total: 188,
    date: '30/09/2026',
    status: 'pago',
  },
  {
    id: '#0157',
    clientName: 'Carla Santos',
    items: [
      { productId: 4, name: 'Brincos Ponto', imageUrl: mockProducts[3].imageUrl, price: 79, quantity: 1 },
      { productId: 6, name: 'Pulseira Cuff', imageUrl: mockProducts[5].imageUrl, price: 159, quantity: 1 },
    ],
    total: 238,
    date: '29/09/2026',
    status: 'cancelado',
  },
];