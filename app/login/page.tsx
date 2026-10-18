 'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { login } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(next && next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Não foi possível conectar à API.'
        : 'Não foi possível realizar o login.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">P</div>
          <span className="font-bold text-2xl">Pratas da Gabi</span>
        </div>
        <div className="bg-white border rounded-xl p-8">
          <h1 className="text-2xl font-bold mb-1">Bem-vindo de volta</h1>
          <p className="text-gray-500 text-sm mb-6">Entre para acessar o painel administrativo.</p>
          {error && <p role="alert" className="mb-4 rounded-md bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
              <input id="email" name="email" type="email" autoComplete="username" required value={email}
                onChange={event => setEmail(event.target.value)} maxLength={254}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={password}
                onChange={event => setPassword(event.target.value)} maxLength={256}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-blue-300 hover:bg-blue-400 disabled:opacity-60 text-blue-900 rounded-md py-3 text-sm font-medium">
              {loading ? 'Entrando...' : 'Acessar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
