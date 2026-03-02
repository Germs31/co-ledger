import '../styles/globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Providers } from './providers';
import { Shell } from '@/components/Shell';

export const metadata: Metadata = {
  title: 'Co Ledger',
  description: 'Co Ledger — shared household cashflow dashboard'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink-900 text-gray-100">
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
