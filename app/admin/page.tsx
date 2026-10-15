'use client';
import { DollarSign, ShoppingCart, Users, TrendingUp, Clock, XCircle } from 'lucide-react';
import { mockSales } from '@/data/mock';

export default function DashboardPage() {
  const stats = [
    { label: 'Faturamento', value: 'R$ 30.350,00', change: '+12,4% vs. agosto', icon: DollarSign },
    { label: 'Vendas pagas', value: '150', change: '+18 vendas vs. agosto', icon: ShoppingCart },
    { label: 'Novos clientes', value: '38', change: '+8 clientes vs. agosto', icon: Users },
    { label: 'Ticket médio', value: 'R$ 202,33', change: 'Por venda paga', icon: TrendingUp },
    { label: 'Vendas pendentes', value: '8', change: 'Aguardando pagamento', icon: Clock },
    { label: 'Cancelamentos', value: '3,7%', change: '6 de 164 vendas no período', icon: XCircle },
  ];

  const weeklyData = [
    { label: '01-07', value: 4800 },
    { label: '08-14', value: 6250 },
    { label: '15-21', value: 7100 },
    { label: '22-30', value: 12200 },
  ];
  const maxValue = Math.max(...weeklyData.map((d) => d.value));

  const topProducts = [
    { name: 'Brincos Arco', qty: 24 },
    { name: 'Colar Barra', qty: 22 },
    { name: 'Pulseira Cadeia', qty: 20 },
    { name: 'Brincos Ponto', qty: 18 },
    { name: 'Anel Liso', qty: 16 },
    { name: 'Pulseira Cuff', qty: 14 },
  ];
  const maxQty = Math.max(...topProducts.map((p) => p.qty));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Seu negócio, em perspectiva</h1>
          <p className="text-gray-500 text-sm">Acompanhe os resultados e encontre suas próximas oportunidades.</p>
        </div>
        <div className="flex gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data de início</label>
            <input type="text" defaultValue="01/09/2026" className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white w-32" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data de fim</label>
            <input type="text" defaultValue="30/09/2026" className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white w-32" />
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-black/10 rounded-lg p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <stat.icon size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-black/10 rounded-lg p-6">
          <h2 className="font-semibold mb-1">Evolução do faturamento</h2>
          <p className="text-xs text-gray-500 mb-4">Vendas pagas · Setembro de 2026</p>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Faturamento semanal (vendas pagas)
          </div>

          <div className="h-48 flex items-end gap-3 md:gap-6">
            {weeklyData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-600">{d.value.toLocaleString('pt-BR')}</span>
                <div
                  className={`w-full rounded-t transition-all ${d.value === maxValue ? 'bg-blue-300' : 'bg-blue-100'}`}
                  style={{ height: `${(d.value / maxValue) * 140}px` }}
                />
                <span className="text-xs text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-lg p-6">
          <h2 className="font-semibold mb-1">Produtos mais vendidos</h2>
          <p className="text-xs text-gray-500 mb-4">Quantidade de vendas pagas</p>

          <div className="space-y-3">
            {topProducts.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500">{p.qty}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-300 rounded-full"
                    style={{ width: `${(p.qty / maxQty) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas vendas */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="font-semibold mb-1">Últimas vendas</h2>
        <p className="text-xs text-gray-500 mb-4">Movimentações recentes do seu negócio</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="text-gray-500 font-medium border-b border-black/10">
              <tr>
                <th className="py-3">Cliente</th>
                <th className="py-3">Produto</th>
                <th className="py-3">Valor</th>
                <th className="py-3">Data</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 border-black/10">
                  <td className="py-3 font-medium">{sale.clientName}</td>
                  <td className="py-3">{sale.items[0].name}</td>
                  <td className="py-3">R$ {sale.items[0].price.toFixed(2).replace('.', ',')}</td>
                  <td className="py-3 text-gray-600">{sale.date}</td>
                  <td className="py-3">
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
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Atualizado em 30/09/2026 às 14:35. Faturamento e ticket médio consideram apenas vendas pagas.
      </p>
    </div>
  );
}