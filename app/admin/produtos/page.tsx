'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { mockProducts } from '@/data/mock';
import { Product } from '@/types';
import { ProductFormModal } from '@/components/ProductFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const handleDelete = () => {
    if (deleting) setProducts(products.filter((p) => p.id !== deleting.id));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-gray-500 text-sm">Organize seu catálogo e valorize cada detalhe.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setIsFormOpen(true); }}
          className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> Adicionar produto
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <span className="font-medium">{products.length} produtos no catálogo</span>
        <span className="text-gray-400">
          {products.reduce((acc, p) => acc + p.stock, 0)} unidades em estoque
        </span>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-black/10 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Nome ou código</label>
          <div className="relative">
            <input placeholder="Buscar produto" className="w-full border border-black/10 rounded-md pl-3 pr-8 py-2 text-sm" />
            <Search size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Categoria</label>
          <select className="w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white">
            <option>Todas as categorias</option>
            <option>Brincos</option>
            <option>Colares</option>
            <option>Pulseiras</option>
            <option>Anéis</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Estoque</label>
          <select className="w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white">
            <option>Todos os produtos</option>
            <option>Com estoque</option>
            <option>Sem estoque</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 w-full md:w-auto justify-center">
            <Filter size={14} /> Filtrar
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-black/10 overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-black/10">
            <tr>
              <th className="px-6 py-3">Produto</th>
              <th className="px-6 py-3">Categoria</th>
              <th className="px-6 py-3">Preço</th>
              <th className="px-6 py-3">Estoque</th>
              <th className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 border-black/10">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="font-medium text-gray-900">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.description}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{p.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{p.category}</td>
                <td className="px-6 py-4">R$ {p.price.toFixed(2).replace('.', ',')}</td>
                <td className="px-6 py-4">{p.stock} un.</td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setEditing(p); setIsFormOpen(true); }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleting(p)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Por página</span>
          <select className="border border-black/10 rounded px-2 py-1">
            <option>10</option>
            <option>20</option>
          </select>
          <span>1–{products.length} de {products.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 hover:bg-gray-100 rounded">‹</button>
          <button className="px-3 py-1 bg-blue-200 text-blue-800 rounded font-medium">1</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">›</button>
        </div>
      </div>

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editing}
      />

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir produto?"
        subtitle="Confirme antes de remover este item."
        warning="O produto deixará de aparecer na vitrine e não poderá ser usado em novas vendas. O histórico será preservado. Esta ação não pode ser desfeita."
        confirmLabel="Sim, excluir produto"
      >
        {deleting && (
          <div className="border border-black/10 rounded-lg p-4 flex items-center gap-3">
            <img src={deleting.imageUrl} alt={deleting.name} className="w-12 h-12 rounded object-cover" />
            <div>
              <p className="font-medium">{deleting.name}</p>
              <p className="text-xs text-gray-500">{deleting.category} · {deleting.stock} unidades</p>
              <p className="text-sm mt-1">R$ {deleting.price.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}