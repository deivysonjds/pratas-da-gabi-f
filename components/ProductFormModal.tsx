'use client';
import { Modal } from './Modal';
import { Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Product } from '@/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, initialData }: ProductFormModalProps) {
  const isEditing = !!initialData;
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', category: 'Brincos',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description,
        price: String(initialData.price),
        stock: String(initialData.stock),
        category: initialData.category,
      });
      setPreview(initialData.imageUrl);
    } else {
      setForm({ name: '', description: '', price: '', stock: '', category: 'Brincos' });
      setPreview(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <h2 className="text-xl font-bold mb-1">
        {isEditing ? 'Editar produto' : 'Adicionar produto'}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {isEditing ? `${initialData?.name} · ${initialData?.code}` : 'Os detalhes certos fazem sua bijuteria se destacar.'}
      </p>

      <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do produto *</label>
          <input
            name="name" value={form.name} onChange={handleChange} required
            className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição *</label>
          <textarea
            name="description" value={form.description} onChange={handleChange} rows={3} required
            className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preço de venda *</label>
            <input
              name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required
              placeholder="R$ 0,00"
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {isEditing ? 'Estoque atual' : 'Estoque inicial'}
            </label>
            <input
              name="stock" type="number" value={form.stock} onChange={handleChange}
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            name="category" value={form.category} onChange={handleChange}
            className="w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option>Brincos</option>
            <option>Colares</option>
            <option>Pulseiras</option>
            <option>Anéis</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imagem do produto</label>
          <div className="border-2 border-dashed border-black/10 rounded-lg p-4 flex items-center gap-4">
            {preview ? (
              <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                <Upload size={20} className="text-gray-400" />
              </div>
            )}
            <div>
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium">
                {preview ? 'Trocar imagem' : 'Selecionar imagem'}
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG ou PNG, até 5 MB. Recomendado: 800 × 800 px.</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          {isEditing
            ? 'As alterações serão exibidas na vitrine. Vendas anteriores manterão o valor registrado.'
            : '* Campos obrigatórios. O produto aparecerá na vitrine após o cadastro.'}
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-black/10 rounded-md text-sm font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-md text-sm font-medium">
            {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}