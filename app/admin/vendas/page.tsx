
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  Check,
  Eye,
  RefreshCw,
  X,
  Save,
  ShoppingBag,
  UserRound,
  CreditCard,
  CalendarDays,
  Package,
} from 'lucide-react';

import { api } from '@/services/api';
import {
  mapClient,
  mapProduct,
  mapSale,
  unwrapList,
} from '@/services/mappers';

import type { Client, Product, Sale, SaleItem } from '@/types';

const money = (value: number) =>
  `R$ ${Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

type Installment = {
  id: number;
  number: number;
  dueDate: string;
  amount: number;
  status: string;
};

const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'PAID', label: 'Pago' },
  { value: 'OVERDUE', label: 'Atrasado' },
  { value: 'CANCELED', label: 'Cancelado' },
];

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;
}

function normalizeInstallment(item: any, index: number): Installment {
  return {
    id: Number(item.id ?? item.installmentId),
    number: Number(
      item.number ??
      item.installmentNumber ??
      item.installment_number ??
      index + 1
    ),
    dueDate:
      item.dueDate ??
      item.due_date ??
      item.dueDateFormatted ??
      '',
    amount: Number(
      item.amount ??
      item.value ??
      item.installmentValue ??
      item.installment_value ??
      0
    ),
    status: item.is_paid === true || String(item.status ?? '').toUpperCase() === 'PAID' ? 'PAID' : 'PENDING',
  };
}

function getSaleData(responseData: any) {
  return responseData?.data?.sale ??
    responseData?.sale ??
    responseData?.data ??
    responseData;
}

function isInstallmentPayment(method?: string) {
  return String(method ?? '')
    .toLowerCase()
    .includes('parcel');
}

export default function VendasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [installmentCount, setInstallmentCount] = useState(2);
  const [items, setItems] = useState<SaleItem[]>([]);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [newSaleStatus, setNewSaleStatus] = useState('PENDING');
  const [installmentChanges, setInstallmentChanges] =
    useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [detailError, setDetailError] = useState('');
  const [detailNotice, setDetailNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [
        productResponse,
        clientResponse,
        saleResponse,
      ] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/clients?limit=100'),
        api.get('/sales?limit=100'),
      ]);

      const productList = unwrapList(productResponse.data).map(mapProduct);

      setProducts(productList);
      setClients(unwrapList(clientResponse.data).map(mapClient));
      setSales(unwrapList(saleResponse.data).map(mapSale));

      setSelectedProductId(current =>
        current || String(productList[0]?.id || '')
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Não foi possível carregar os dados de vendas.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedProduct = products.find(
    product => product.id === Number(selectedProductId)
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [items]
  );

  function addProduct() {
    if (!selectedProduct || selectedProduct.stock < 1) return;

    setItems(current => {
      const existing = current.find(
        item => item.productId === selectedProduct.id
      );

      if (existing) {
        if (existing.quantity >= selectedProduct.stock) return current;

        return current.map(item =>
          item.productId === selectedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          imageUrl: selectedProduct.imageUrl,
          price: selectedProduct.price,
          quantity: 1,
        },
      ];
    });
  }

  function changeQuantity(productId: number, quantity: number) {
    const product = products.find(item => item.id === productId);

    setItems(current => {
      if (quantity < 1) {
        return current.filter(item => item.productId !== productId);
      }

      const safeQuantity = product
        ? Math.min(quantity, product.stock)
        : quantity;

      return current.map(item =>
        item.productId === productId
          ? { ...item, quantity: safeQuantity }
          : item
      );
    });
  }

  async function confirmSale() {
    setError('');
    setNotice('');

    if (!selectedClientId || !items.length) {
      setError(
        'Selecione um cliente e adicione pelo menos um produto.'
      );
      return;
    }

    setSaving(true);

    try {
      const productIds = items.flatMap(item =>
        Array.from(
          { length: item.quantity },
          () => item.productId
        )
      );

      const saleInstallments = paymentMethod === 'Parcelado'
        ? Array.from({ length: installmentCount }, (_, index) => ({
            number: index + 1,
            amount: Math.round((total / installmentCount + Number.EPSILON) * 100) / 100,
            is_paid: false,
          }))
        : [];

      // Ajusta a última parcela para que a soma corresponda exatamente ao total.
      if (saleInstallments.length) {
        const previousTotal = saleInstallments.slice(0, -1).reduce((sum, installment) => sum + installment.amount, 0);
        saleInstallments[saleInstallments.length - 1].amount = Math.round((total - previousTotal + Number.EPSILON) * 100) / 100;
      }

      await api.post('/sales/complete', {
        client_id: Number(selectedClientId),
        paymentMethod,
        products: productIds,
        installments: saleInstallments,
      });

      setNotice('Venda registrada e estoque atualizado.');
      setItems([]);
      await load();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Não foi possível registrar a venda.'
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function openSaleDetails(sale: Sale) {
    setSelectedSale(sale);
    setNewSaleStatus(sale.status === 'pago' ? 'PAID' : sale.status === 'cancelado' ? 'CANCELED' : 'PENDING');
    setInstallments([]);
    setInstallmentChanges({});
    setDetailError('');
    setDetailNotice('');
    setDetailLoading(true);

    try {
      // Pressupõe que a API disponibilize GET /sales/:id.
      const response = await api.get(`/sales/${sale.id}`);
      const data = getSaleData(response.data);

      const normalizedSale = mapSale(data);

      setSelectedSale(normalizedSale);
      const apiStatus = String(data.status ?? '').toUpperCase();
      setNewSaleStatus(['PAID', 'CANCELED', 'PENDING'].includes(apiStatus) ? apiStatus : normalizedSale.status === 'pago' ? 'PAID' : normalizedSale.status === 'cancelado' ? 'CANCELED' : 'PENDING');

      const method = String(
        data.paymentMethod ??
        data.payment_method ??
        normalizedSale.paymentMethod ??
        ''
      );

      if (isInstallmentPayment(method)) {
        const rawInstallments =
          data.installments ??
          data.Installments ??
          data.installmentList ??
          data.installment_list ??
          [];

        setInstallments(
          Array.isArray(rawInstallments)
            ? rawInstallments.map(normalizeInstallment)
            : []
        );
      }
    } catch (err) {
      setDetailError(
        getErrorMessage(
          err,
          'Não foi possível carregar os detalhes completos da venda.'
        )
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveSaleStatus() {
    if (!selectedSale) return;

    setDetailSaving(true);
    setDetailError('');
    setDetailNotice('');

    try {
      // Ajuste esta rota se o backend usar outro endpoint.
      // O backend atualiza a venda pela rota genérica PATCH /sales/:id.
      await api.patch(`/sales/${selectedSale.id}/status`, {
        status: newSaleStatus,
      });

      const updatedUiStatus = newSaleStatus === 'PAID' ? 'pago' : newSaleStatus === 'CANCELED' ? 'cancelado' : 'pendente pagamento';
      setSelectedSale(current => current ? { ...current, status: updatedUiStatus } : current);
      setSales(current => current.map(sale => sale.id === selectedSale.id ? { ...sale, status: updatedUiStatus } : sale));

      setDetailNotice('Status do pagamento atualizado.');
    } catch (err) {
      setDetailError(
        getErrorMessage(
          err,
          'Não foi possível atualizar o status do pagamento. Verifique a rota da API.'
        )
      );
    } finally {
      setDetailSaving(false);
    }
  }

  async function saveInstallmentStatus(installmentId: number) {
    const status = installmentChanges[installmentId];

    if (!status) return;

    setDetailSaving(true);
    setDetailError('');
    setDetailNotice('');

    try {
      // Ajuste esta rota se o backend usar outro endpoint.
      // Installment usa is_paid (boolean), não um campo status.
      await api.patch(`/installments/${installmentId}/status`, {
        is_paid: status === 'PAID',
      });

      setInstallments(current => current.map(installment => installment.id === installmentId ? { ...installment, status: status === 'PAID' ? 'PAID' : 'PENDING' } : installment));

      setInstallmentChanges(current => {
        const updated = { ...current };
        delete updated[installmentId];
        return updated;
      });

      setDetailNotice('Status da parcela atualizado.');
    } catch (err) {
      setDetailError(
        getErrorMessage(
          err,
          'Não foi possível atualizar o status da parcela. Verifique a rota da API.'
        )
      );
    } finally {
      setDetailSaving(false);
    }
  }

  function closeSaleDetails() {
    setSelectedSale(null);
    setInstallments([]);
    setInstallmentChanges({});
    setDetailError('');
    setDetailNotice('');
  }

  function statusLabel(status: string) {
    return (
      PAYMENT_STATUSES.find(item => item.value === status)?.label ??
      status ??
      'Não informado'
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-sm text-gray-500">
            Registre vendas e consulte os detalhes das compras.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-2 self-start rounded-md border px-3 py-2 text-sm"
        >
          <RefreshCw size={15} />
          Atualizar
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-black/10 bg-white p-6 lg:col-span-2">
          <h2 className="mb-1 font-semibold">Nova venda</h2>
          <p className="mb-4 text-xs text-gray-500">
            Selecione o cliente, os produtos e confirme a venda.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Cliente *
              </label>

              <select
                value={selectedClientId}
                onChange={event => setSelectedClientId(event.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option value="">Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.cpf}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs text-gray-500">
                Para cadastrar um cliente, utilize a tela Clientes.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Produto
              </label>

              <div className="flex gap-2">
                <select
                  value={selectedProductId}
                  onChange={event =>
                    setSelectedProductId(event.target.value)
                  }
                  className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-sm"
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {money(product.price)} · estoque{' '}
                      {product.stock}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={addProduct}
                  disabled={!selectedProduct || selectedProduct.stock < 1}
                  className="flex items-center gap-1 rounded-md bg-blue-100 px-3 py-2 text-sm text-blue-800 disabled:opacity-40"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Forma de pagamento
              </label>

              <select
                value={paymentMethod}
                onChange={event => setPaymentMethod(event.target.value)}
                className="w-full rounded-md border bg-white px-3 py-2 text-sm"
              >
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Cartão de Crédito</option>
                <option>Cartão de Débito</option>
                <option>Parcelado</option>
              </select>

              {paymentMethod === 'Parcelado' && (
                <div className="mt-3">
                  <label className="mb-1 block text-sm font-medium" htmlFor="installment-count">Quantidade de parcelas</label>
                  <select id="installment-count" value={installmentCount} onChange={event => setInstallmentCount(Number(event.target.value))} className="w-full rounded-md border bg-white px-3 py-2 text-sm">
                    {Array.from({ length: 12 }, (_, index) => index + 1).map(count => <option key={count} value={count}>{count}x de {money(total / count)}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">As parcelas serão criadas como pendentes; a última pode variar alguns centavos para fechar o total.</p>
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs uppercase text-gray-500">
                Itens da venda
              </p>

              {items.length ? (
                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-3 rounded-md bg-gray-50 p-3"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200" />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {money(item.price)} cada
                        </p>
                      </div>

                      <input
                        aria-label={`Quantidade de ${item.name}`}
                        type="number"
                        min={0}
                        max={
                          products.find(
                            product => product.id === item.productId
                          )?.stock ?? 50
                        }
                        value={item.quantity}
                        onChange={event =>
                          changeQuantity(
                            item.productId,
                            Number(event.target.value)
                          )
                        }
                        className="w-16 rounded border px-2 py-1 text-sm"
                      />

                      <span className="text-sm font-medium">
                        {money(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed p-4 text-sm text-gray-500">
                  Nenhum produto adicionado.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-black/10 bg-white p-6">
          <h2 className="mb-4 font-semibold">Resumo da venda</h2>

          <div className="mb-6 space-y-3">
            {items.map(item => (
              <div
                key={item.productId}
                className="flex justify-between gap-3 text-sm"
              >
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span>{money(item.price * item.quantity)}</span>
              </div>
            ))}

            {!items.length && (
              <p className="text-sm text-gray-500">
                Adicione produtos para calcular o total.
              </p>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold">{money(total)}</span>
          </div>

          <button
            type="button"
            onClick={() => void confirmSale()}
            disabled={saving || loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-300 py-3 text-sm font-medium text-blue-900 hover:bg-blue-400 disabled:opacity-60"
          >
            <Check size={16} />
            {saving ? 'Registrando...' : 'Confirmar venda'}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            A API valida o estoque e registra a venda.
          </p>
        </aside>
      </div>

      <section className="mt-8 rounded-lg border border-black/10 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Histórico de vendas</h2>
            <p className="text-sm text-gray-500">
              {sales.length} registro(s)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b font-medium text-gray-500">
              <tr>
                <th className="py-3">Venda</th>
                <th className="py-3">Cliente</th>
                <th className="py-3">Produtos</th>
                <th className="py-3">Total</th>
                <th className="py-3">Data</th>
                <th className="py-3">Status</th>
                <th className="py-3">Detalhes</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Carregando vendas...
                  </td>
                </tr>
              ) : (
                [...sales].reverse().map(sale => (
                  <tr key={sale.id}>
                    <td className="py-3">#{sale.id}</td>
                    <td className="py-3 font-medium">
                      {sale.clientName}
                    </td>
                    <td className="py-3">
                      {sale.items
                        .map(item => `${item.quantity}× ${item.name}`)
                        .join(', ') || '—'}
                    </td>
                    <td className="py-3 font-medium">
                      {money(sale.total)}
                    </td>
                    <td className="py-3 text-gray-600">{sale.date}</td>
                    <td className="py-3">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                        {statusLabel(sale.status)}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => void openSaleDetails(sale)}
                        className="flex items-center gap-1 text-blue-600"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {!loading && !sales.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-500"
                  >
                    Nenhuma venda registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
          onClick={closeSaleDetails}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sale-dialog-title"
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <header className="flex items-start justify-between border-b p-5 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Detalhes da compra
                </p>
                <h2
                  id="sale-dialog-title"
                  className="mt-1 text-xl font-bold"
                >
                  Venda #{selectedSale.id}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedSale.date || 'Data não informada'}
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar detalhes"
                onClick={closeSaleDetails}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {detailError && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {detailError}
                </div>
              )}

              {detailNotice && (
                <div
                  role="status"
                  className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
                >
                  {detailNotice}
                </div>
              )}

              {detailLoading ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  Carregando informações da compra...
                </p>
              ) : (
                <>
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                      <UserRound size={18} />
                      Dados do cliente
                    </h3>

                    <div className="grid grid-cols-1 gap-3 rounded-lg border bg-gray-50 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="font-medium">
                          {selectedSale.clientName || 'Não informado'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">CPF</p>
                        <p className="font-medium">
                          {selectedSale.customer?.cpf || 'Não informado'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">E-mail</p>
                        <p className="break-words font-medium">
                          {selectedSale.customer?.email || 'Não informado'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Contato</p>
                        <p className="font-medium">
                          {selectedSale.customer?.phone || 'Não informado'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Data da compra
                        </p>
                        <p className="font-medium">
                          {selectedSale.date || '—'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Forma de pagamento
                        </p>
                        <p className="font-medium">
                          {selectedSale.paymentMethod || 'Não informada'}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                      <Package size={18} />
                      Produtos da compra
                    </h3>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full min-w-[480px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                          <tr>
                            <th className="p-3">Produto</th>
                            <th className="p-3 text-center">Qtd.</th>
                            <th className="p-3 text-right">Unitário</th>
                            <th className="p-3 text-right">Subtotal</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y">
                          {selectedSale.items.map(item => (
                            <tr key={item.productId}>
                              <td className="p-3 font-medium">
                                {item.name}
                              </td>
                              <td className="p-3 text-center">
                                {item.quantity}
                              </td>
                              <td className="p-3 text-right">
                                {money(item.price)}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {money(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}

                          {!selectedSale.items.length && (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-4 text-center text-gray-500"
                              >
                                Nenhum produto encontrado.
                              </td>
                            </tr>
                          )}
                        </tbody>

                        <tfoot className="border-t bg-gray-50">
                          <tr>
                            <td colSpan={3} className="p-3 font-semibold">
                              Total da compra
                            </td>
                            <td className="p-3 text-right text-base font-bold">
                              {money(selectedSale.total)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </section>

                  <section className="rounded-lg border p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold">
                      <CreditCard size={18} />
                      Status do pagamento
                    </h3>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        value={newSaleStatus}
                        onChange={event =>
                          setNewSaleStatus(event.target.value)
                        }
                        className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-sm"
                      >
                        {PAYMENT_STATUSES.filter(status => ['PENDING', 'PAID', 'CANCELED'].includes(status.value)).map(status => (
                          <option
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </option>
                        ))}

                        {!PAYMENT_STATUSES.some(
                          status => status.value === newSaleStatus
                        ) && newSaleStatus && (
                          <option value={newSaleStatus}>
                            {newSaleStatus}
                          </option>
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() => void saveSaleStatus()}
                        disabled={
                          detailSaving ||
                          (newSaleStatus === 'PAID' && selectedSale.status === 'pago') || (newSaleStatus === 'CANCELED' && selectedSale.status === 'cancelado') || (newSaleStatus === 'PENDING' && selectedSale.status === 'pendente pagamento')
                        }
                        className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        <Save size={16} />
                        {detailSaving ? 'Salvando...' : 'Salvar status'}
                      </button>
                    </div>
                  </section>

                  {isInstallmentPayment(selectedSale.paymentMethod) && (
                    <section>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 font-semibold">
                          <CalendarDays size={18} />
                          Parcelas da compra
                        </h3>
                        <span className="text-xs text-gray-500">
                          {installments.length} parcela(s)
                        </span>
                      </div>

                      {installments.length ? (
                        <div className="space-y-3">
                          {installments.map(installment => {
                            const currentStatus =
                              installmentChanges[installment.id] ??
                              installment.status;

                            return (
                              <div
                                key={installment.id}
                                className="rounded-lg border p-4"
                              >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium">
                                      Parcela {installment.number}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      Vencimento:{' '}
                                      {installment.dueDate || 'Não informado'}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      Status atual:{' '}
                                      {statusLabel(installment.status)}
                                    </p>
                                  </div>

                                  <p className="font-semibold">
                                    {money(installment.amount)}
                                  </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                  <select
                                    value={currentStatus}
                                    onChange={event =>
                                      setInstallmentChanges(current => ({
                                        ...current,
                                        [installment.id]: event.target.value,
                                      }))
                                    }
                                    className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-sm"
                                  >
                                    {PAYMENT_STATUSES.filter(status => ['PENDING', 'PAID'].includes(status.value)).map(status => (
                                      <option
                                        key={status.value}
                                        value={status.value}
                                      >
                                        {status.label}
                                      </option>
                                    ))}

                                    {!PAYMENT_STATUSES.some(
                                      status => status.value === currentStatus
                                    ) && (
                                      <option value={currentStatus}>
                                        {currentStatus}
                                      </option>
                                    )}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void saveInstallmentStatus(
                                        installment.id
                                      )
                                    }
                                    disabled={
                                      detailSaving ||
                                      !installmentChanges[installment.id] ||
                                      installmentChanges[installment.id] ===
                                        installment.status
                                    }
                                    className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
                                  >
                                    Salvar parcela
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
                          Nenhuma parcela foi retornada pela API. Verifique
                          se o endpoint de detalhes inclui as parcelas desta
                          venda.
                        </p>
                      )}
                    </section>
                  )}
                </>
              )}
            </div>

            <footer className="flex justify-end border-t bg-gray-50 p-4">
              <button
                type="button"
                onClick={closeSaleDetails}
                className="rounded-md border bg-white px-5 py-2 text-sm font-medium"
              >
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
