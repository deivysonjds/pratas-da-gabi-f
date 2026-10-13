'use client';
import { Modal } from './Modal';
import { CheckCircle2, Copy, Send, Plus } from 'lucide-react';
import { Sale } from '@/types';

interface SaleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onNewSale: () => void;
}

export function SaleSuccessModal({ isOpen, onClose, sale, onNewSale }: SaleSuccessModalProps) {
  if (!sale) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <h2 className="text-xl font-bold mb-1">Pedido realizado</h2>
      <p className="text-gray-500 text-sm mb-4">
        O pedido foi criado com sucesso e já está pronto para compartilhar com o cliente.
      </p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2 mb-4 text-sm">
        <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-green-800">Pedido criado com sucesso</p>
          <p className="text-xs text-green-700">
            O código da venda já está pronto para ser compartilhado com o cliente.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-sm">Código da venda</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
            {sale.id}
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <button className="flex-1 border rounded-md py-2 text-sm font-medium hover:bg-white flex items-center justify-center gap-2">
            <Copy size={14} /> Copiar código
          </button>
          <button className="flex-1 bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2">
            <Send size={14} /> Enviar ao cliente
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold">Venda {sale.id}</span>
          <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
            {sale.status}
          </span>
        </div>

        <p className="text-xs text-gray-400 uppercase mb-1">Cliente</p>
        <p className="font-medium text-sm">{sale.clientName}</p>
        <p className="text-xs text-gray-500 mb-4">CPF: 529.982.247-25</p>

        <div className="space-y-2">
          {sale.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name} · {item.quantity} un.</span>
              <span className="font-medium">
                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t mt-3 pt-3 flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>R$ {sale.total.toFixed(2).replace('.', ',')}</span>
        </div>

        <p className="text-xs text-gray-400 mt-3">30/09/2026 às 15:02</p>
      </div>

      <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Ver histórico de vendas
        </button>
        <button
          onClick={() => { onClose(); onNewSale(); }}
          className="px-4 py-2 bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-md text-sm font-medium flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Nova venda
        </button>
      </div>
    </Modal>
  );
}