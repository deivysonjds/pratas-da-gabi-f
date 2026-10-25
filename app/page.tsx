'use client';
import { Search, ShoppingBag, ArrowUpRight, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Product } from '@/types';
import { api } from '@/services/api';
import { mapProduct, unwrapList } from '@/services/mappers';

const WHATSAPP_NUMBER = '5581988993441'; // Substitua pelo número real
const CART_STORAGE_KEY = 'elo_cart';

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CustomerData = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
};

// Máscaras
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

// Validações
const isValidCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(digits[10]);
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string) => {
  return phone.replace(/\D/g, '').length >= 10;
};

export default function VitrinePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [selectedQty, setSelectedQty] = useState<Record<string, number>>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [customer, setCustomer] = useState<CustomerData>({
    name: '',
    cpf: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    let active = true;
    api.get('/products?limit=100')
      .then(response => { if (active) setProducts(unwrapList(response.data).map(mapProduct)); })
      .catch(error => { if (active) setProductsError(axios.isAxiosError(error) ? error.response?.data?.message || 'Não foi possível carregar os produtos.' : 'Não foi possível carregar os produtos.'); })
      .finally(() => { if (active) setProductsLoading(false); });
    return () => { active = false; };
  }, []);

  // Carrega o carrinho do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch (err) {
      console.error('Erro ao carregar carrinho:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || productsLoading || productsError) return;
    setCart(current => current
      .map(item => {
        const currentProduct = products.find(product => product.id === item.id);
        return currentProduct ? { ...item, name: currentProduct.name, price: currentProduct.price } : null;
      })
      .filter((item): item is CartItem => item !== null));
  }, [products, productsLoading, productsError, isHydrated]);

  // Salva o carrinho sempre que ele mudar
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Erro ao salvar carrinho:', err);
    }
  }, [cart, isHydrated]);

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(products.map(product => product.category).filter(Boolean)))], [products]);
  const filtered = activeCategory === 'Todas' ? products : products.filter((product) => product.category === activeCategory);

  const getQty = (id: number) => selectedQty[id] ?? 1;

  const changeQty = (id: number, delta: number) => {
    setSelectedQty((prev) => {
      const current = prev[id] ?? 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const addToCart = (product: Product) => {
    const qty = getQty(product.id);

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        { id: product.id, name: product.name, price: product.price, quantity: qty },
      ];
    });

    setSelectedQty((prev) => ({ ...prev, [product.id]: 1 }));
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.error('Erro ao limpar carrinho:', err);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handlers dos campos com máscara
  const handleNameChange = (value: string) => {
    setCustomer((prev) => ({ ...prev, name: value }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleCPFChange = (value: string) => {
    setCustomer((prev) => ({ ...prev, cpf: maskCPF(value) }));
    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: '' }));
  };

  const handleEmailChange = (value: string) => {
    setCustomer((prev) => ({ ...prev, email: value }));
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
  };

  const handlePhoneChange = (value: string) => {
    setCustomer((prev) => ({ ...prev, phone: maskPhone(value) }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!customer.name.trim() || customer.name.trim().length < 3) {
      newErrors.name = 'Informe seu nome completo';
    }
    if (!isValidCPF(customer.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!isValidEmail(customer.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!isValidPhone(customer.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const finalizeOrder = async () => {
    if (cart.length === 0 || submittingOrder) return;
    if (!validate()) return;
    setOrderError('');
    setSubmittingOrder(true);
    const whatsappWindow = window.open('about:blank', '_blank');

    try {
      const response = await api.post('/sales', {
        customer: {
          name: customer.name.trim(),
          cpf: customer.cpf,
          email: customer.email.trim().toLowerCase(),
          phone: customer.phone,
        },
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        paymentMethod,
      });

      const sale = response.data?.sale;
      const orderId = sale?.id ? `PDG-${sale.id}` : `PDG-${Date.now().toString().slice(-6)}`;
      const serverItems = Array.isArray(sale?.items) ? sale.items : [];
      const itemsText = serverItems.map((row: { product?: { name?: string; value?: number | string }; product_id?: number }) => {
        const product = row.product || {};
        return `• ${product.name || 'Produto'} - R$ ${Number(product.value || 0).toFixed(2).replace('.', ',')}`;
      }).join('\n');
      const serverTotal = Number(response.data?.total ?? cartTotal);
      const message =
        `*Novo pedido ${orderId}*\n\n` +
        `*Cliente:*\nNome: ${customer.name}\nCPF: ${customer.cpf}\nE-mail: ${customer.email}\nContato: ${customer.phone}\n\n` +
        `*Itens:*\n${itemsText}\n\n` +
        `*Total:* R$ ${serverTotal.toFixed(2).replace('.', ',')}\n` +
        `*Forma de pagamento:* ${paymentMethod}`;
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) whatsappWindow.location.href = whatsappUrl;
      else window.location.href = whatsappUrl;

      clearCart();
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCustomer({ name: '', cpf: '', email: '', phone: '' });
      setPaymentMethod('Pix');
      setErrors({});
    } catch (err) {
      whatsappWindow?.close();
      setOrderError(axios.isAxiosError(err)
        ? err.response?.data?.message || 'Não foi possível registrar o pedido. Tente novamente.'
        : 'Não foi possível registrar o pedido. Tente novamente.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black/10 sticky top-0 bg-white z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">P</div>
            <span className="font-bold text-xl">Pratas da Gabi</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Coleções</a>
            <a href="#" className="hover:text-gray-900">Brincos</a>
            <a href="#" className="hover:text-gray-900">Colares</a>
            <a href="#" className="hover:text-gray-900">Pulseiras</a>
          </nav>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6 md:p-12">
          <div>
            <p className="text-xs font-semibold tracking-wider text-gray-500 mb-3">NOVIDADES</p>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Bijuterias para brilhar no seu dia a dia.
            </h1>
            <p className="text-gray-600 mb-4 max-w-md">
              Brincos, colares, pulseiras e anéis com design contemporâneo e acabamento dourado.
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              ✦ Detalhes que transformam qualquer look com acabamento dourado.
            </p>
          </div>
          <div className="aspect-[4/3] rounded-xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800"
              alt="Coleção"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section className="max-w-7xl mx-auto p-6 md:p-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Encontre sua nova peça</h2>
            <p className="text-sm text-gray-500">
              {productsLoading ? 'Carregando catálogo...' : `${filtered.length} produtos disponíveis para você`}
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <input
              placeholder="Buscar bijuteria"
              className="w-full border border-black/10 rounded-md pl-3 pr-9 py-2 text-sm"
            />
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-200 text-blue-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsError && <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{productsError}</p>}
          {!productsLoading && !productsError && filtered.length === 0 && <p className="py-12 text-center text-gray-500">Nenhum produto disponível nesta categoria.</p>}
          {filtered.map((p) => (
            <div key={p.id} className="group shadow-xl p-2 rounded-lg">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-xs text-gray-500 mb-1">{p.category}</p>
              <h3 className="font-semibold mb-1">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{p.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold">
                  R$ {p.price.toFixed(2).replace('.', ',')}
                </span>
                <div className="flex items-center border border-black/10 rounded-md">
                  <button
                    onClick={() => changeQty(p.id, -1)}
                    className={'p-1.5 hover:bg-gray-100 disabled:opacity-40'}
                    disabled={getQty(p.id) <= 1}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm w-8 text-center font-medium select-none">
                    {getQty(p.id)}
                  </span>
                  <button
                    onClick={() => changeQty(p.id, 1)}
                    className="cursor-pointer p-1.5 hover:bg-gray-100"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => addToCart(p)}
                className="cursor-pointer w-full bg-blue-300 hover:bg-blue-400 text-blue-900 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight size={14} /> Adicionar ao carrinho
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 px-6 text-xs text-gray-500">
          <span>© 2026 Pratas da Gabi. Todos os direitos reservados.</span>
          <span>Feito para simplificar o seu dia.</span>
        </div>
      </footer>

      {/* Overlay */}
      {(isCartOpen || isCheckoutOpen) && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(false);
          }}
        />
      )}

      {/* Carrinho lateral */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-black/10">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag size={18} /> Seu carrinho
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <ShoppingBag size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Seu carrinho está vazio</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-3 border-b border-black/10 pb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 border border-black/10 rounded hover:bg-gray-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 border border-black/10 rounded hover:bg-gray-50"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold text-sm">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-black/10 p-4 space-y-3">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium"
            >
              Finalizar compra
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              Limpar carrinho
            </button>
          </div>
        )}
      </aside>

      {/* Modal de checkout */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative my-8">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-md"
            >
              <X size={20} />
            </button>

            <h2 className="font-bold text-lg mb-4">Finalizar pedido</h2>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Nome completo *
                </label>
                <input
                  value={customer.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className={`w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.name ? 'border-red-400/10' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* CPF */}
              <div>
                <label className="text-sm font-medium block mb-1">CPF *</label>
                <input
                  value={customer.cpf}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  className={`w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.cpf ? 'border-red-400/10' : ''
                  }`}
                />
                {errors.cpf && (
                  <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium block mb-1">E-mail *</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="seu@email.com"
                  className={`w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.email ? 'border-red-400/10' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="text-sm font-medium block mb-1">
                  Contato (WhatsApp) *
                </label>
                <input
                  value={customer.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  inputMode="numeric"
                  className={`w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    errors.phone ? 'border-red-400/10' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Pagamento */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  Forma de pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'parcelado'].map(
                    (method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`border border-black/10 rounded-md py-2 px-3 text-sm transition-colors ${
                          paymentMethod === method
                            ? 'bg-blue-100 border-blue-400/10 text-blue-900 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>
              </div>

              {orderError && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{orderError}</p>}
              <div className="border-t border-black/10 pt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Itens</span>
                  <span>{cartCount}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                onClick={finalizeOrder}
                disabled={submittingOrder}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-md font-medium"
              >
                {submittingOrder ? 'Registrando pedido...' : 'Finalizar e enviar no WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}