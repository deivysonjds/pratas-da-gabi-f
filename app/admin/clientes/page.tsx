 'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Filter, RefreshCw } from 'lucide-react';
import { Client } from '@/types';
import { ClientFormModal } from '@/components/ClientFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { api } from '@/services/api';
import { mapClient, unwrapList } from '@/services/mappers';

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [cpfFilter, setCpfFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadClients = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await api.get('/clients?limit=100'); setClients(unwrapList(response.data).map(mapClient)); }
    catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível carregar os clientes.' : 'Não foi possível carregar os clientes.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadClients(); }, [loadClients]);

  const filtered = useMemo(() => clients.filter(c => c.name.toLowerCase().includes(nameFilter.toLowerCase()) && c.cpf.replace(/\D/g, '').includes(cpfFilter.replace(/\D/g, '')) && c.email.toLowerCase().includes(emailFilter.toLowerCase())), [clients, nameFilter, cpfFilter, emailFilter]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleDelete() {
    if (!deleting) return;
    try { await api.delete(`/clients/${deleting.id}`); setDeleting(null); await loadClients(); }
    catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Não foi possível excluir o cliente.' : 'Não foi possível excluir o cliente.'); }
  }

  return <div className="max-w-6xl mx-auto p-4 md:p-8">
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6"><div><h1 className="text-2xl font-bold">Clientes</h1><p className="text-gray-500 text-sm">Uma visão completa de quem compra com você.</p></div><div className="flex gap-2"><button onClick={() => void loadClients()} className="border rounded-md px-3 py-2 text-sm flex items-center gap-2"><RefreshCw size={15}/> Atualizar</button><button onClick={() => { setEditing(null); setIsFormOpen(true); }} className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"><Plus size={16}/> Adicionar cliente</button></div></div>
    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm"><span className="font-medium">{clients.length} clientes cadastrados</span><span className="text-gray-400">Dados carregados da API</span></div>
    {error && <div role="alert" className="bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
    <div className="bg-white border border-black/10 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3"><div><label className="block text-xs font-medium mb-1">Nome</label><input value={nameFilter} onChange={e => { setNameFilter(e.target.value); setPage(1); }} placeholder="Buscar por nome" className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"/></div><div><label className="block text-xs font-medium mb-1">CPF</label><input value={cpfFilter} onChange={e => { setCpfFilter(e.target.value); setPage(1); }} placeholder="Digite o CPF" className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"/></div><div><label className="block text-xs font-medium mb-1">E-mail</label><input value={emailFilter} onChange={e => { setEmailFilter(e.target.value); setPage(1); }} placeholder="Buscar por e-mail" className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"/></div><div className="flex items-end"><span className="text-sm text-gray-500 flex items-center gap-2"><Filter size={14}/>{filtered.length} resultado(s)</span></div></div>
    <div className="flex justify-between items-center mb-2"><h2 className="font-medium">Lista de clientes</h2><span className="text-xs text-gray-500">Ordenados por ID</span></div>
    <div className="bg-white rounded-lg border border-black/10 overflow-x-auto"><table className="w-full text-left text-sm min-w-[760px]"><thead className="bg-gray-50 text-gray-500 font-medium border-b border-black/10"><tr><th className="px-6 py-3">Nome</th><th className="px-6 py-3">CPF</th><th className="px-6 py-3">E-mail</th><th className="px-6 py-3">Contato</th><th className="px-6 py-3">Cadastro</th><th className="px-6 py-3">Ações</th></tr></thead><tbody className="divide-y">
      {loading ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando clientes...</td></tr> : visible.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum cliente encontrado.</td></tr> : visible.map(c => <tr key={c.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">{c.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}</div><span className="font-medium">{c.name}</span></div></td><td className="px-6 py-4 text-gray-600">{c.cpf}</td><td className="px-6 py-4 text-gray-600">{c.email}</td><td className="px-6 py-4 text-gray-600">{c.contact || '—'}</td><td className="px-6 py-4 text-gray-600">{c.createdAt}</td><td className="px-6 py-4"><div className="flex gap-3"><button aria-label={`Editar ${c.name}`} onClick={() => { setEditing(c); setIsFormOpen(true); }} className="text-blue-500 hover:text-blue-700"><Edit size={16}/></button><button aria-label={`Excluir ${c.name}`} onClick={() => setDeleting(c)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></div></td></tr>)}
    </tbody></table></div>
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-500"><div className="flex items-center gap-2"><span>Por página</span><select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1"><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select><span>{filtered.length ? (page-1)*pageSize+1 : 0}–{Math.min(page*pageSize,filtered.length)} de {filtered.length}</span></div><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage(p => p-1)} className="px-3 py-1 border rounded disabled:opacity-40">Anterior</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded disabled:opacity-40">Próxima</button></div></div>
    <ClientFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={() => void loadClients()} initialData={editing}/>
    <ConfirmModal isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Excluir cliente?" subtitle="Esta ação não pode ser desfeita." warning="Se houver vendas relacionadas, o banco poderá impedir a exclusão para preservar o histórico." confirmLabel="Sim, excluir cliente">{deleting && <div className="border border-black/10 rounded-lg p-4"><p className="font-medium">{deleting.name}</p><p className="text-xs text-gray-500">CPF: {deleting.cpf}</p><p className="text-xs text-gray-500">{deleting.email}</p></div>}</ConfirmModal>
  </div>;
}
