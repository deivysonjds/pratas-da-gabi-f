 'use client';
import { ProductFormModal } from '@/components/ProductFormModal';
import type { Product } from '@/types';

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Product | null;
}

// Compatibilidade com a antiga API do componente: toda a lógica de persistência
// fica centralizada no formulário integrado ao backend.
export function ProductForm({ onClose, onSuccess, initialData }: ProductFormProps) {
  return (
    <ProductFormModal
      isOpen
      onClose={onClose}
      onSaved={onSuccess}
      initialData={initialData}
    />
  );
}
