'use client';
import { Modal } from './Modal';
import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { AlertCircle } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Client | null;
}

export function ClientFormModal({ isOpen, onClose, initialData }: ClientFormModalProps) {
  const isEditing = !!initialData;
  const [form, setForm] = useState({ name: '', cpf: '', email: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name, cpf: initialData.cpf, email: initialData.email });
    } else {
      setForm({ name: '', cpf: '', email: '' });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Informe um e-mail válido. Ex.: nome@dominio.com');
      return;
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-1">
        {isEditing ? 'Editar cliente' : 'Adicionar cliente'}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {isEditing
          ? `Atualize os dados de ${initialData?.name}.`
          : 'Preencha os dados para cadastrar um novo cliente.'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Não foi possível salvar</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo *</label>
          <input
            name="name" value={form.name} onChange={handleChange} required
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CPF *</label>
          <input
            name="cpf" value={form.cpf} onChange={handleChange} required
            placeholder="000.000.000-00"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-mail *</label>
          <input
            name="email" type="text" value={form.email} onChange={handleChange} required
            placeholder="nome@dominio.com"
            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${
              error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'focus:ring-2 focus:ring-blue-400'
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {isEditing ? (
          <p className="text-xs text-gray-500">Cadastro em {initialData?.createdAt} · Dados ainda não salvos.</p>
        ) : (
          <p className="text-xs text-gray-500">* Campos obrigatórios. O CPF deve ser único no cadastro.</p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-md text-sm font-medium">
            {isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}