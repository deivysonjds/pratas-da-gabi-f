 'use client';
import { Modal } from './Modal';
import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Client } from '@/types';
import { AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Client | null;
}

export function ClientFormModal({ isOpen, onClose, onSaved, initialData }: ClientFormModalProps) {
  const isEditing = !!initialData;
  const [form, setForm] = useState({ name: '', cpf: '', email: '', contact: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initialData
      ? { name: initialData.name, cpf: initialData.cpf, email: initialData.email, contact: initialData.contact || '' }
      : { name: '', cpf: '', email: '', contact: '' });
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.name.trim().length < 3 || form.cpf.replace(/\D/g, '').length !== 11 || !/^\S+@\S+\.\S+$/.test(form.email.trim()) || form.contact.replace(/\D/g, '').length < 10) {
      setError('Informe nome, CPF, e-mail e telefone válidos.');
      return;
    }
    setSaving(true); setError('');
    try {
      const payload = { name: form.name.trim(), cpf: form.cpf.trim(), email: form.email.trim().toLowerCase(), contact: form.contact.trim() };
      if (isEditing) await api.put(`/clients/${initialData!.id}`, payload);
      else await api.post('/clients', payload);
      onSaved(); onClose();
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível salvar o cliente.' : 'Não foi possível salvar o cliente.');
    } finally { setSaving(false); }
  }

  return <Modal isOpen={isOpen} onClose={onClose}>
    <h2 className="text-xl font-bold mb-1">{isEditing ? 'Editar cliente' : 'Adicionar cliente'}</h2>
    <p className="text-gray-500 text-sm mb-6">{isEditing ? `Atualize os dados de ${initialData?.name}.` : 'Preencha os dados para cadastrar um novo cliente.'}</p>
    {error && <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 flex items-start gap-2 text-sm"><AlertCircle size={18}/><span>{error}</span></div>}
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-sm font-medium mb-1">Nome completo *</label><input name="name" value={form.name} onChange={handleChange} required maxLength={120} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"/></div>
      <div><label className="block text-sm font-medium mb-1">CPF *</label><input name="cpf" value={form.cpf} onChange={handleChange} required maxLength={14} placeholder="000.000.000-00" className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"/></div>
      <div><label className="block text-sm font-medium mb-1">E-mail *</label><input name="email" type="email" value={form.email} onChange={handleChange} required maxLength={254} placeholder="nome@dominio.com" className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"/></div>
      <div><label className="block text-sm font-medium mb-1">Telefone/WhatsApp *</label><input name="contact" value={form.contact} onChange={handleChange} required maxLength={30} placeholder="(81) 99999-9999" className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"/></div>
      <div className="flex justify-end gap-3 pt-4 border-t border-black/10"><button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 border border-black/10 rounded-md text-sm">Cancelar</button><button type="submit" disabled={saving} className="px-4 py-2 bg-blue-300 hover:bg-blue-400 disabled:opacity-60 text-blue-900 rounded-md text-sm font-medium">{saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}</button></div>
    </form>
  </Modal>;
}
