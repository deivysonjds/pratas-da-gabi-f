'use client';
import { useState } from 'react';
import { Plus, Check, ChevronDown, Calendar } from 'lucide-react';
import { mockProducts, mockSales } from '@/data/mock';
import { Sale, SaleItem } from '@/types';
import { SaleSuccessModal } from '@/components/SaleSuccessModal';

export default function VendasPage() {
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0]);
  const [items, setItems] = useState<SaleItem[]>([
    { productId: 1, name: 'Brincos Arco', imageUrl: mockProducts[0].imageUrl, price: 129, quantity: 2 },
    { productId: 2, name: 'Colar Barra', imageUrl: mockProducts[1].imageUrl, price: 149, quantity: 1 },
  ]);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleAddProduct = () => {
    const existing = items.find((i) => i.productId === selectedProduct.id);
    if (existing) {
      setItems(items.map((i) =>
        i.productId === selectedProduct.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems([
        ...items,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          imageUrl: selectedProduct.imageUrl,
          price: selectedProduct.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      setItems(items.filter((i) => i.productId !== productId));
    } else {
      setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
    }
  };

  const handleConfirm = () => {
    const sale: Sale = {
      id: '#0160',
      clientName: 'Ana Paula Lima',
      items,
      total,
      date: '30/09/2026',
      status: 'pendente pagamento',
    };
    setSuccessSale(sale);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Vendas</h1>
        <p className="text-gray-500 text-sm">Do primeiro clique ao registro. Tudo em um só lugar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda: Nova Venda */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-1">Nova venda</h2>
            <p className="text-xs text-gray-500 mb-4">Selecione os produtos e identifique o cliente.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Produto</label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => setSelectedProduct(mockProducts.find((p) => p.id === Number(e.target.value))!)}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                >
                  {mockProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · R$ {p.price.toFixed(2).replace('.', ',')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">Cliente</label>
                  <button className="text-xs text-blue-600 hover:underline">+ Cadastrar cliente</button>
                </div>
                <label className="block text-xs text-gray-500 mb-1">Buscar por nome ou CPF</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option>Ana Paula Lima · 529.982.247-25</option>
                </select>
                <div className="bg-gray-50 rounded-md p-3 mt-2">
                  <p className="text-sm font-medium">Ana Paula Lima</p>
                  <p className="text-xs text-gray-500">ana.lima@exemplo.com</p>
                </div>
              </div>

              <button
                onClick={handleAddProduct}
                className="w-full border-2 border-dashed rounded-md py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Adicionar produto
              </button>

              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Itens da venda</p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 bg-gray-50 rounded-md p-3">
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Bijuteria · R$ {item.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantity(item.productId, Number(e.target.value))}
                        className="border rounded px-2 py-1 text-sm bg-white"
                      >
                        {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
                      </select>
                      <span className="font-medium text-sm w-24 text-right">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita: Resumo */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-4">
            <h2 className="font-semibold mb-4">Resumo da venda</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} unidade{item.quantity > 1 ? 's' : ''}</p>
                  </div>
                  <span className="font-medium text-sm">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">Total da venda</span>
              <span className="text-xl font-bold">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-md py-3 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Check size={16} /> Confirmar venda
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              Ao confirmar, a venda será registrada como pendente pagamento e o estoque será atualizado.
            </p>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="mt-8">
        {!showHistory ? (
          <button
            onClick={() => setShowHistory(true)}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md py-3 text-sm font-medium"
          >
            Ver histórico de vendas
          </button>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold">Histórico de vendas</h2>
                <p className="text-gray-500 text-sm">164 vendas em setembro</p>
              </div>
              <div className="flex gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Período</label>
                  <div className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm bg-white">
                    <Calendar size={14} className="text-gray-400" />
                    <span>01–30 set. 2026</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select className="border rounded-md px-3 py-2 text-sm bg-white">
                    <option>Todos</option>
                    <option>Pago</option>
                    <option>Pendente pagamento</option>
                    <option>Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md py-3 text-sm font-medium mb-4"
            >
              Ocultar histórico de vendas
            </button>

            <div className="bg-white rounded-lg border overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                    <th className="px-6 py-3">Venda</th>
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Produtos e quantidades</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{sale.id}</td>
                      <td className="px-6 py-4">{sale.clientName}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {sale.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded object-cover" />
                              <div>
                                <p className="text-sm font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.quantity} unidade{item.quantity > 1 ? 's' : ''} × R$ {item.price.toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">R$ {sale.total.toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4 text-gray-600">{sale.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            sale.status === 'pago'
                              ? 'bg-green-100 text-green-700'
                              : sale.status === 'pendente pagamento'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <SaleSuccessModal
        isOpen={!!successSale}
        onClose={() => setSuccessSale(null)}
        sale={successSale}
        onNewSale={() => { setSuccessSale(null); setItems([]); }}
      />
    </div>
  );
}