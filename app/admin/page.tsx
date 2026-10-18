 'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, XCircle } from 'lucide-react';
import axios from 'axios';
import { api } from '@/services/api';
import { mapClient, mapProduct, mapSale, unwrapList } from '@/services/mappers';
import type { Client, Product, Sale } from '@/types';

const money = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [dataInicio, setDataInicio] = useState("");

useEffect(() => {
  const hoje = new Date();
  const dataLocal = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");

  setDataInicio(dataLocal);
}, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [productResponse, clientResponse, saleResponse] = await Promise.all([
        api.get('/products?limit=100'), api.get('/clients?limit=100'), api.get('/sales?limit=100'),
      ]);
      setProducts(unwrapList(productResponse.data).map(mapProduct));
      setClients(unwrapList(clientResponse.data).map(mapClient));
      setSales(unwrapList(saleResponse.data).map(mapSale));
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível carregar o dashboard.' : 'Não foi possível carregar o dashboard.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filteredSales = useMemo(() => sales.filter(sale => {
    if (sale.date === '—') return false;
    const [day, month, year] = sale.date.split('/');
    const date = `${year}-${month}-${day}`;
    return date >= startDate && date <= endDate;
  }), [sales, startDate, endDate]);
  const revenue = filteredSales.filter(s => s.status === 'pago').reduce((sum, s) => sum + s.total, 0);
  const paidSales = filteredSales.filter(s => s.status === 'pago');
  const pendingSales = filteredSales.filter(s => s.status === 'pendente pagamento').length;
  const canceledSales = filteredSales.filter(s => s.status === 'cancelado').length;
  const average = paidSales.length ? revenue / paidSales.length : 0;
  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    for (const sale of filteredSales) if (sale.status !== 'cancelado') for (const item of sale.items) map.set(item.name, (map.get(item.name) || 0) + item.quantity);
    return [...map.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [filteredSales]);
  const maxQty = Math.max(1, ...topProducts.map(p => p.qty));
  const stats = [
    { label: 'Faturamento', value: money(revenue), change: 'Vendas pagas no período', icon: DollarSign },
    { label: 'Vendas pagas', value: String(paidSales.length), change: 'Vendas confirmadas', icon: ShoppingCart },
    { label: 'Clientes cadastrados', value: String(clients.length), change: 'Base de clientes', icon: Users },
    { label: 'Ticket médio', value: money(average), change: 'Por venda paga', icon: TrendingUp },
    { label: 'Vendas pendentes', value: String(pendingSales), change: 'Aguardando pagamento', icon: Clock },
    { label: 'Cancelamentos', value: String(canceledSales), change: 'Vendas canceladas no período', icon: XCircle },
  ];

  return <div className="max-w-6xl mx-auto p-4 md:p-8">
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6"><div><h1 className="text-2xl font-bold">Seu negócio, em perspectiva</h1><p className="text-gray-500 text-sm">Indicadores calculados com os dados da API.</p></div><div className="flex gap-3"><div><label className="block text-xs text-gray-500 mb-1">Data de início</label><input type="date" value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)} className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"/></div><div><label className="block text-xs text-gray-500 mb-1">Data de fim</label><input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)} className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"/></div></div></div>
    {error && <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
    {loading && <p className="text-sm text-gray-500 mb-4">Atualizando indicadores...</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">{stats.map(stat => <div key={stat.label} className="bg-white border border-black/10 rounded-lg p-5"><div className="flex justify-between items-start mb-3"><span className="text-sm text-gray-500">{stat.label}</span><stat.icon size={16} className="text-blue-500"/></div><p className="text-2xl font-bold mb-1">{stat.value}</p><p className="text-xs text-gray-500">{stat.change}</p></div>)}</div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"><div className="lg:col-span-2 bg-white border border-black/10 rounded-lg p-6"><h2 className="font-semibold mb-1">Produtos cadastrados</h2><p className="text-xs text-gray-500 mb-4">Distribuição do estoque atual</p><div className="space-y-3">{products.slice(0, 8).map(product => <div key={product.id}><div className="flex justify-between text-xs mb-1"><span className="font-medium">{product.name}</span><span className="text-gray-500">{product.stock} unidades</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-300 rounded-full" style={{ width: `${Math.min(100, product.stock / Math.max(1, ...products.map(p => p.stock)) * 100)}%` }}/></div></div>)}{!products.length && <p className="text-sm text-gray-500">Nenhum produto cadastrado.</p>}</div></div><div className="bg-white border border-black/10 rounded-lg p-6"><h2 className="font-semibold mb-1">Produtos mais vendidos</h2><p className="text-xs text-gray-500 mb-4">Unidades nas vendas não canceladas</p><div className="space-y-3">{topProducts.map(p => <div key={p.name}><div className="flex justify-between text-xs mb-1"><span className="font-medium">{p.name}</span><span className="text-gray-500">{p.qty}</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-300 rounded-full" style={{ width: `${p.qty / maxQty * 100}%` }}/></div></div>)}{!topProducts.length && <p className="text-sm text-gray-500">Ainda não há vendas no período.</p>}</div></div></div>
    <div className="bg-white border border-black/10 rounded-lg p-6"><h2 className="font-semibold mb-1">Últimas vendas</h2><p className="text-xs text-gray-500 mb-4">Movimentações recentes do negócio</p><div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[600px]"><thead className="text-gray-500 font-medium border-b border-black/10"><tr><th className="py-3">Cliente</th><th className="py-3">Produtos</th><th className="py-3">Valor</th><th className="py-3">Data</th><th className="py-3">Status</th></tr></thead><tbody className="divide-y">{[...filteredSales].reverse().slice(0, 8).map(sale => <tr key={sale.id}><td className="py-3 font-medium">{sale.clientName}</td><td className="py-3">{sale.items.map(i => i.name).join(', ') || '—'}</td><td className="py-3">{money(sale.total)}</td><td className="py-3 text-gray-600">{sale.date}</td><td className="py-3"><span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{sale.status}</span></td></tr>)}{!filteredSales.length && <tr><td colSpan={5} className="py-8 text-center text-gray-500">Nenhuma venda no período selecionado.</td></tr>}</tbody></table></div></div>
  </div>;
}
