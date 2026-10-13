'use client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
            e
          </div>
          <span className="font-bold text-2xl">elo</span>
        </div>

        <div className="bg-white border rounded-xl p-8">
          <h1 className="text-2xl font-bold mb-1">Bem-vindo de volta</h1>
          <p className="text-gray-500 text-sm mb-6">Acesse seu espaço de vendas.</p>

          <form onSubmit={(e) => { e.preventDefault(); router.push('/'); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Login</label>
              <input
                type="email"
                defaultValue="marina@elostudio.com.br"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input
                type="password"
                defaultValue="••••••••••"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-300 hover:bg-blue-400 text-blue-900 rounded-md py-3 text-sm font-medium"
            >
              Acessar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}