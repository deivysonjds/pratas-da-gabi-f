 'use client';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Product } from '@/types';
import { ProductFormModal } from '@/components/ProductFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { api } from '@/services/api';
import { mapProduct, unwrapList } from '@/services/mappers';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await api.get('/products?limit=100');
      setProducts(unwrapList(response.data).map(mapProduct));
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível carregar os produtos.' : 'Não foi possível carregar os produtos.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const handleDelete = async () => {
    if (!deleting) return;
    try { await api.delete(`/products/${deleting.id}`); setDeleting(null); await loadProducts(); }
    catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível excluir o produto.' : 'Não foi possível excluir o produto.'); }
  };

  return <div className="max-w-6xl mx-auto p-4 md:p-8">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6"><div><h1 className="text-2xl font-bold">Produtos</h1><p className="text-gray-500 text-sm">Organize seu catálogo e valorize cada detalhe.</p></div><div className="flex gap-2"><button onClick={() => void loadProducts()} className="border rounded-md px-3 py-2 text-sm flex items-center gap-2"><RefreshCw size={15}/> Atualizar</button><button onClick={() => { setEditing(null); setIsFormOpen(true); }} className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"><Plus size={16}/> Adicionar produto</button></div></div>
    <div className="flex items-center gap-4 mb-4 text-sm"><span className="font-medium">{products.length} produtos no catálogo</span><span className="text-gray-400">Dados carregados da API</span></div>
    {error && <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
    <div className="bg-white rounded-lg border border-black/10 overflow-x-auto"><table className="w-full text-left text-sm min-w-[760px]"><thead className="bg-gray-50 text-gray-500 font-medium border-b border-black/10"><tr><th className="px-6 py-3">Produto</th><th className="px-6 py-3">Categoria</th><th className="px-6 py-3">Preço</th><th className="px-6 py-3">Estoque</th><th className="px-6 py-3">Ações</th></tr></thead><tbody className="divide-y">
      {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando produtos...</td></tr> : products.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum produto cadastrado.</td></tr> : products.map(p => <tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div className="flex items-center gap-3">{p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover"/> : <div className="w-12 h-12 rounded bg-gray-100"/>}<div><p className="font-medium">{p.name}</p><p className="text-xs text-gray-500">{p.code}</p></div></div></td><td className="px-6 py-4 text-gray-600">{p.category}</td><td className="px-6 py-4">R$ {p.price.toFixed(2).replace('.', ',')}</td><td className="px-6 py-4">{p.stock} un.</td><td className="px-6 py-4"><div className="flex gap-3"><button aria-label={`Editar ${p.name}`} onClick={() => { setEditing(p); setIsFormOpen(true); }} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button><button aria-label={`Excluir ${p.name}`} onClick={() => setDeleting(p)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></div></td></tr>)}
    </tbody></table></div>
    <ProductFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={() => void loadProducts()} initialData={editing}/>
    <ConfirmModal isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Excluir produto?" subtitle="Confirme antes de remover este item." warning="O produto deixará de aparecer na vitrine e não poderá ser usado em novas vendas." confirmLabel="Sim, excluir produto">{deleting && <div className="border border-black/10 rounded-lg p-4 flex items-center gap-3">{deleting.imageUrl && <img src={deleting.imageUrl} alt={deleting.name} className="w-12 h-12 rounded object-cover"/>}<div><p className="font-medium">{deleting.name}</p><p className="text-xs text-gray-500">{deleting.category} · {deleting.stock} unidades</p></div></div>}</ConfirmModal>
  </div>;
}
