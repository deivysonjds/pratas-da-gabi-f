'use client';
import { Search, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { mockProducts } from '@/data/mock';
import { useState } from 'react';

const categories = ['Todas', 'Brincos', 'Colares', 'Pulseiras'];

export default function VitrinePage() {
  const [activeCategory, setActiveCategory] = useState('Todas');

  const filtered =
    activeCategory === 'Todas'
      ? mockProducts
      : mockProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header público */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              e
            </div>
            <span className="font-bold text-xl">elo</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Coleções</a>
            <a href="#" className="hover:text-gray-900">Brincos</a>
            <a href="#" className="hover:text-gray-900">Colares</a>
            <a href="#" className="hover:text-gray-900">Pulseiras</a>
          </nav>
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
            <p className="text-sm text-gray-500">{filtered.length} bijuterias selecionadas para você</p>
          </div>
          <div className="relative w-full md:w-64">
            <input
              placeholder="Buscar bijuteria"
              className="w-full border rounded-md pl-3 pr-9 py-2 text-sm"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
          {filtered.map((p) => (
            <div key={p.id} className="group">
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
              <div className="flex items-center justify-between">
                <span className="font-bold">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                <button className="bg-blue-300 hover:bg-blue-400 text-blue-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5">
                  <ArrowUpRight size={14} /> Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 px-6 text-xs text-gray-500">
          <span>© 2026 Elo Studio. Todos os direitos reservados.</span>
          <span>Feito para simplificar o seu dia.</span>
        </div>
      </footer>
    </div>
  );
}