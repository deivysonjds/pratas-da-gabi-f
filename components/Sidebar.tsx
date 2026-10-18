'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Store, Menu, X, LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/api';

const menuItems = [
  { name: 'Visão geral', path: '/admin/', icon: LayoutDashboard },
  { name: 'Clientes', path: '/admin/clientes', icon: Users },
  { name: 'Produtos', path: '/admin/produtos', icon: Package },
  { name: 'Vendas', path: '/admin/vendas', icon: ShoppingCart },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Administrador');

  useEffect(() => {
    try {
      const user = JSON.parse(sessionStorage.getItem('authUser') || 'null');
      if (user?.name) setUserName(user.name);
    } catch { /* ignora dados locais inválidos */ }
  }, []);

  async function handleLogout() {
    try { await logout(); } catch { /* o cookie será invalidado pelo servidor quando possível */ }
    router.replace('/login');
    router.refresh();
  }

  return (
    <>
      {/* Topbar mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-black/10 z-50 flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">P</div>
          <span className="font-bold text-xl">Pratas da Gabi</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-black/10 flex flex-col transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="hidden md:flex items-center gap-2 p-6 border-b border-black/10">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">P</div>
          <span className="font-bold text-xl">Pratas da Gabi</span>
        </div>

        <div className="p-4 mt-14 md:mt-0">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
            Espaço de trabalho
          </p>
          <p className="text-sm font-semibold mb-4">Pratas da Gabi</p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-black/10">
              <Link href="../" target="_blank">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 text-sm">
                  <Store size={18} />
                  <span>Ver vitrine</span>
                  <span className="ml-auto text-xs text-gray-400">↗</span>
                </div>
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-black/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
            MC
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-gray-500">Administradora</p>
          </div>
          <button onClick={handleLogout} aria-label="Sair" title="Sair" className="text-gray-400 hover:text-gray-600">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}