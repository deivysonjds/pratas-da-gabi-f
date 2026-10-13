'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData } from '@/schemas/productSchema';
import { api } from '@/services/api';
import { X, Upload } from 'lucide-react';
import { useState } from 'react';

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function ProductForm({ onClose, onSuccess, initialData }: ProductFormProps) {
  const [preview, setPreview] = useState<string | null>(initialData?.imageUrl || null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || { category: 'Brincos' }
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image' && value[0]) {
          formData.append('image', value[0]);
        } else if (key !== 'image') {
          formData.append(key, value.toString());
        }
      });

      if (initialData) {
        // await api.put(`/products/${initialData.id}`, formData);
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold mb-1">{initialData ? 'Editar produto' : 'Adicionar produto'}</h2>
        <p className="text-gray-500 text-sm mb-6">Os detalhes certos fazem sua bijuteria se destacar.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do produto *</label>
            <input {...register('name')} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição *</label>
            <textarea {...register('description')} rows={3} className="w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
            {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Preço de venda *</label>
              <input type="number" step="0.01" {...register('price')} className="w-full border rounded-md px-3 py-2 text-sm" />
              {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estoque atual</label>
              <input type="number" {...register('stock')} className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select {...register('category')} className="w-full border rounded-md px-3 py-2 text-sm bg-white">
              <option value="Brincos">Brincos</option>
              <option value="Colares">Colares</option>
              <option value="Pulseiras">Pulseiras</option>
              <option value="Anéis">Anéis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Imagem do produto</label>
            <div className="border-2 border-dashed rounded-lg p-4 flex items-center gap-4">
              {preview ? (
                <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <Upload size={20} className="text-gray-400" />
                </div>
              )}
              <div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium">
                  Trocar imagem
                  <input type="file" accept="image/*" {...register('image')} onChange={handleImageChange} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-1">JPG ou PNG, até 5 MB. Recomendado: 800 x 800 px.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-md text-sm font-medium disabled:opacity-50">
              {isSubmitting ? 'Salvando...' : initialData ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}