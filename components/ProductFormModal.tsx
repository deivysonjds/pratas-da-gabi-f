 'use client';
import { Modal } from './Modal';
import { Upload, AlertCircle } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { api } from '@/services/api';
import { Product } from '@/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, onSaved, initialData }: ProductFormModalProps) {
  const isEditing = !!initialData;
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', category: 'Brincos' });

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, description: initialData.description || '', price: String(initialData.price), stock: String(initialData.stock), category: initialData.category || 'Brincos' });
      setPreview(initialData.imageUrl || null);
    } else {
      setForm({ name: '', description: '', price: '', stock: '', category: 'Brincos' });
      setPreview(null);
    }
    setImageFile(null);
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use uma imagem JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5 MB.');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const value = Number(form.price);
    const stock = Number(form.stock);
    if (!form.name.trim() || !form.description.trim() || !Number.isFinite(value) || value < 0 || !Number.isInteger(stock) || stock < 0) {
      setError('Preencha os campos corretamente. Preço e estoque não podem ser negativos.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim(), value, stock, category: form.category };
      const response = isEditing
        ? await api.put(`/products/${initialData!.id}`, payload)
        : await api.post('/products', payload);
      const product = response.data;
      if (imageFile && product?.id) {
        const body = new FormData();
        body.append('image', imageFile);
        await api.post(`/products/${product.id}/image`, body);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível salvar o produto.' : 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <h2 className="text-xl font-bold mb-1">{isEditing ? 'Editar produto' : 'Adicionar produto'}</h2>
      <p className="text-gray-500 text-sm mb-6">{isEditing ? `${initialData?.name} · ${initialData?.code}` : 'Os detalhes certos fazem sua bijuteria se destacar.'}</p>
      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={18} />{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Nome do produto *</label><input name="name" value={form.name} onChange={handleChange} required maxLength={120} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Descrição *</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} required maxLength={2000} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Preço de venda (R$) *</label><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Estoque *</label><input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" /></div>
        </div>
        <div><label className="block text-sm font-medium mb-1">Categoria *</label><select name="category" value={form.category} onChange={handleChange} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white"><option>Brincos</option><option>Colares</option><option>Pulseiras</option><option>Anéis</option><option>Conjuntos</option><option>Outros</option></select></div>
        <div><label className="block text-sm font-medium mb-1">Imagem do produto</label><div className="border-2 border-dashed border-black/10 rounded-lg p-4 flex items-center gap-4">
          {preview ? <img src={preview} alt="Pré-visualização" className="w-16 h-16 object-cover rounded" /> : <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center"><Upload size={20} className="text-gray-400" /></div>}
          <div><label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium">{preview ? 'Trocar imagem' : 'Selecionar imagem'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="hidden" /></label><p className="text-xs text-gray-500 mt-1">JPG, PNG ou WebP, até 5 MB.</p></div>
        </div></div>
        <p className="text-xs text-gray-500">As alterações serão exibidas na vitrine após salvar.</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-black/10"><button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 border border-black/10 rounded-md text-sm">Cancelar</button><button type="submit" disabled={saving} className="px-4 py-2 bg-blue-300 hover:bg-blue-400 disabled:opacity-60 text-blue-900 rounded-md text-sm font-medium">{saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar produto'}</button></div>
      </form>
    </Modal>
  );
}
