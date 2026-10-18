 'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Check, Eye, RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { mapClient, mapProduct, mapSale, unwrapList } from '@/services/mappers';
import type { Client, Product, Sale, SaleItem } from '@/types';

const money = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VendasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [productResponse, clientResponse, saleResponse] = await Promise.all([
        api.get('/products?limit=100'), api.get('/clients?limit=100'), api.get('/sales?limit=100'),
      ]);
      const productList = unwrapList(productResponse.data).map(mapProduct);
      setProducts(productList); setClients(unwrapList(clientResponse.data).map(mapClient));
      setSales(unwrapList(saleResponse.data).map(mapSale));
      setSelectedProductId(current => current || String(productList[0]?.id || ''));
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível carregar os dados de vendas.' : 'Não foi possível carregar os dados de vendas.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  function addProduct() {
    if (!selectedProduct) return;
    setItems(current => {
      const existing = current.find(item => item.productId === selectedProduct.id);
      if (existing) return current.map(item => item.productId === selectedProduct.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { productId: selectedProduct.id, name: selectedProduct.name, imageUrl: selectedProduct.imageUrl, price: selectedProduct.price, quantity: 1 }];
    });
  }
  function changeQuantity(productId: number, quantity: number) {
    setItems(current => quantity < 1 ? current.filter(item => item.productId !== productId) : current.map(item => item.productId === productId ? { ...item, quantity } : item));
  }

  async function confirmSale() {
    setError(''); setNotice('');
    if (!selectedClientId || !items.length) { setError('Selecione um cliente e adicione pelo menos um produto.'); return; }
    setSaving(true);
    try {
      const productIds = items.flatMap(item => Array.from({ length: item.quantity }, () => item.productId));
      await api.post('/sales/complete', { client_id: Number(selectedClientId), paymentMethod, products: productIds, installments: [] });
      setNotice('Venda registrada e estoque atualizado.'); setItems([]); await load();
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível registrar a venda.' : 'Não foi possível registrar a venda.');
    } finally { setSaving(false); }
  }

  return <div className="max-w-6xl mx-auto p-4 md:p-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6"><div><h1 className="text-2xl font-bold">Vendas</h1><p className="text-gray-500 text-sm">Registre vendas e consulte o histórico real do sistema.</p></div><button onClick={() => void load()} className="border rounded-md px-3 py-2 text-sm flex items-center gap-2 self-start"><RefreshCw size={15}/> Atualizar</button></div>
    {error && <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}{notice && <div role="status" className="bg-green-50 text-green-700 rounded-lg p-3 mb-4 text-sm">{notice}</div>}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><section className="lg:col-span-2 bg-white border border-black/10 rounded-lg p-6"><h2 className="font-semibold mb-1">Nova venda</h2><p className="text-xs text-gray-500 mb-4">Selecione o cliente, os produtos e confirme.</p>
      <div className="space-y-4"><div><label className="block text-sm font-medium mb-1">Cliente *</label><select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white"><option value="">Selecione um cliente</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name} · {client.cpf}</option>)}</select><p className="text-xs text-gray-500 mt-1">Para cadastrar um cliente, use a tela Clientes.</p></div>
      <div><label className="block text-sm font-medium mb-1">Produto</label><div className="flex gap-2"><select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="flex-1 border rounded-md px-3 py-2 text-sm bg-white">{products.map(product => <option key={product.id} value={product.id}>{product.name} · {money(product.price)} · estoque {product.stock}</option>)}</select><button onClick={addProduct} disabled={!selectedProduct || selectedProduct.stock < 1} className="bg-blue-100 text-blue-800 rounded-md px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-40"><Plus size={16}/> Adicionar</button></div></div>
      <div><label className="block text-sm font-medium mb-1">Forma de pagamento</label><select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-white"><option>Pix</option><option>Dinheiro</option><option>Cartão de Crédito</option><option>Cartão de Débito</option><option>Parcelado</option></select></div>
      <div><p className="text-xs text-gray-500 uppercase mb-2">Itens da venda</p>{items.length ? <div className="space-y-2">{items.map(item => <div key={item.productId} className="flex items-center gap-3 bg-gray-50 rounded-md p-3">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover"/> : <div className="w-12 h-12 rounded bg-gray-200"/>}<div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{item.name}</p><p className="text-xs text-gray-500">{money(item.price)} cada</p></div><input aria-label={`Quantidade de ${item.name}`} type="number" min={0} max={50} value={item.quantity} onChange={e => changeQuantity(item.productId, Number(e.target.value))} className="w-16 border rounded px-2 py-1 text-sm"/><span className="font-medium text-sm">{money(item.price * item.quantity)}</span></div>)}</div> : <p className="text-sm text-gray-500 border border-dashed rounded-md p-4">Nenhum produto adicionado.</p>}</div>
      </div></section>
      <aside className="bg-white border border-black/10 rounded-lg p-6 h-fit"><h2 className="font-semibold mb-4">Resumo da venda</h2><div className="space-y-3 mb-6">{items.map(item => <div key={item.productId} className="flex justify-between gap-3 text-sm"><span>{item.quantity}× {item.name}</span><span>{money(item.price * item.quantity)}</span></div>)}</div><div className="border-t pt-4 mb-4 flex justify-between items-center"><span className="text-sm text-gray-600">Total</span><span className="text-xl font-bold">{money(total)}</span></div><button onClick={confirmSale} disabled={saving || loading} className="w-full bg-blue-300 hover:bg-blue-400 disabled:opacity-60 text-blue-900 rounded-md py-3 text-sm font-medium flex items-center justify-center gap-2"><Check size={16}/>{saving ? 'Registrando...' : 'Confirmar venda'}</button><p className="text-xs text-gray-500 mt-3 text-center">A API valida o estoque e registra a venda em uma transação.</p></aside></div>
    <section className="mt-8 bg-white border border-black/10 rounded-lg p-6"><div className="flex justify-between items-center mb-4"><div><h2 className="text-xl font-bold">Histórico de vendas</h2><p className="text-gray-500 text-sm">{sales.length} registro(s)</p></div></div><div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[700px]"><thead className="text-gray-500 font-medium border-b"><tr><th className="py-3">Venda</th><th className="py-3">Cliente</th><th className="py-3">Produtos</th><th className="py-3">Total</th><th className="py-3">Data</th><th className="py-3">Status</th><th className="py-3">Detalhes</th></tr></thead><tbody className="divide-y">{loading ? <tr><td colSpan={7} className="py-8 text-center text-gray-500">Carregando vendas...</td></tr> : [...sales].reverse().map(sale => <tr key={sale.id}><td className="py-3">#{sale.id}</td><td className="py-3 font-medium">{sale.clientName}</td><td className="py-3">{sale.items.map(item => `${item.quantity}× ${item.name}`).join(', ') || '—'}</td><td className="py-3 font-medium">{money(sale.total)}</td><td className="py-3 text-gray-600">{sale.date}</td><td className="py-3"><span className="text-xs rounded bg-gray-100 px-2 py-1">{sale.status}</span></td><td className="py-3"><button onClick={() => setSelectedSale(sale)} className="text-blue-600 flex items-center gap-1"><Eye size={14}/> Ver</button></td></tr>)}{!loading && !sales.length && <tr><td colSpan={7} className="py-8 text-center text-gray-500">Nenhuma venda registrada.</td></tr>}</tbody></table></div></section>
    {selectedSale && <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSale(null)}><div className="bg-white rounded-lg max-w-lg w-full p-6" onClick={e => e.stopPropagation()}><h2 className="text-lg font-bold mb-4">Detalhes da venda #{selectedSale.id}</h2><p className="text-sm mb-1">Cliente: {selectedSale.clientName}</p><p className="text-sm mb-1">Data: {selectedSale.date}</p><p className="text-sm mb-4">Pagamento: {selectedSale.paymentMethod || 'Não informado'}</p><div className="space-y-2 mb-4">{selectedSale.items.map(item => <div key={item.productId} className="flex justify-between text-sm"><span>{item.quantity}× {item.name}</span><span>{money(item.price * item.quantity)}</span></div>)}</div><div className="border-t pt-3 font-bold flex justify-between"><span>Total</span><span>{money(selectedSale.total)}</span></div><button onClick={() => setSelectedSale(null)} className="mt-5 border rounded-md px-4 py-2 text-sm">Fechar</button></div></div>}
  </div>;
}
