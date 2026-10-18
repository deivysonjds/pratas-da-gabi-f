import { Sidebar } from '@/components/Sidebar';

export const metadata = {
  title: 'Pratas da Gabi',
  description: 'Gestão de vendas e produtos da Pratas da Gabi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}