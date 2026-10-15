'use client';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  warning: string;
  confirmLabel?: string;
  children?: ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle,
  warning,
  confirmLabel = 'Sim, excluir',
  children,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mb-4">{subtitle}</p>}

      {children && <div className="my-4">{children}</div>}

      <div className="flex items-start gap-2 text-sm text-gray-600 mt-4">
        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <p>{warning}</p>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-black/10">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-black/10 rounded-md text-sm font-medium hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}