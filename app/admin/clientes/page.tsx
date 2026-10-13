'use client';
import { useState } from 'react';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { mockClients } from '@/data/mock';
import { Client } from '@/types';
import { ClientFormModal } from '@/components/ClientFormModal';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const handleDelete = () => {
    if (deleting) setClients(clients.filter((c) => c.id !== deleting.id));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-500 text-sm">Uma visão completa de quem compra com você.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setIsFormOpen(true); }}
          className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> Adicionar cliente
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <span className="font-medium">{clients.length} clientes cadastrados</span>
        <span className="text-gray-400">38 novos em setembro</span>
      </div>

      {/* Filtros */}
      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Nome</label>
          <input placeholder="Buscar por nome" className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">CPF</label>
          <input placeholder="Digite o CPF" className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">E-mail</label>
          <input placeholder="Buscar por e-mail" className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="flex items-end">
          <button className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 w-full md:w-auto justify-center">
            <Filter size={14} /> Filtrar
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium">Lista de clientes</h2>
        <span className="text-xs text-gray-500">Mais recentes primeiro</span>
      </div>

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">CPF</th>
              <th className="px-6 py-3">E-mail</th>
              <th className="px-6 py-3">Cadastro</th>
              <th className="px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map((c) => {
              const initials = c.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                        {initials}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.cpf}</td>
                  <td className="px-6 py-4 text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-gray-600">{c.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setEditing(c); setIsFormOpen(true); }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleting(c)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>Por página</span>
          <select className="border rounded px-2 py-1"><option>10</option></select>
          <span>1–{clients.length} de {clients.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1 hover:bg-gray-100 rounded">‹</button>
          <button className="px-3 py-1 bg-blue-200 text-blue-800 rounded font-medium">1</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">2</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">3</button>
          <button className="px-3 py-1 hover:bg-gray-100 rounded">›</button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Dados demonstrativos. CPFs e contatos utilizados apenas para ilustrar o sistema.
      </p>

      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editing}
      />

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir cliente?"
        subtitle="Esta ação não pode ser desfeita."
        warning="O cadastro será removido da lista de clientes. Os registros de vendas já realizadas serão preservados no histórico."
        confirmLabel="Sim, excluir cliente"
      >
        {deleting && (
          <div className="border rounded-lg p-4">
            <p className="font-medium">{deleting.name}</p>
            <p className="text-xs text-gray-500">CPF: {deleting.cpf}</p>
            <p className="text-xs text-gray-500">{deleting.email}</p>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}