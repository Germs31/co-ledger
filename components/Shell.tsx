'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ReactNode } from 'react';

type NavItem = { href: string; label: string; Icon: () => JSX.Element };

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', Icon: HomeIcon },
  { href: '/bills', label: 'Bills', Icon: BillIcon },
  { href: '/credit-cards', label: 'Cards', Icon: CardIcon },
  { href: '/settings', label: 'Settings', Icon: SettingsIcon }
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-ink-900 text-gray-100">
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col border-r border-ink-700/80 bg-ink-800/80 backdrop-blur-xl">
          <div className="px-5 py-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neon-500 text-ink-900 font-semibold grid place-items-center">CL</div>
            <div>
              <p className="text-sm text-gray-300">Co Ledger</p>
              <p className="text-xs text-gray-500">Household money</p>
            </div>
          </div>
          <nav className="px-3 space-y-1">
            {navItems.map(({ href, label, Icon }) => {
              const active = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    active ? 'bg-neon-500/10 text-neon-300 border border-neon-500/30' : 'text-gray-300 hover:bg-ink-700'
                  }`}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto px-5 py-4 text-xs text-gray-500">
            <p className="font-medium text-gray-300">Local-only</p>
            <p>Data lives on your machine.</p>
          </div>
        </aside>

        <div className="flex-1 flex flex-col md:ml-64">
          <header className="sticky top-0 z-20 border-b border-ink-700/80 bg-ink-800/70 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 md:px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Overview</p>
                <h1 className="text-xl font-semibold text-neon-400">Household Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/settings" className="btn btn-ghost text-sm px-3 py-2 border border-ink-700">
                  Settings
                </Link>
                <button className="btn btn-primary text-sm px-3 py-2" onClick={() => signOut({ callbackUrl: '/signin' })}>
                  Log out
                </button>
              </div>
            </div>
            <div className="md:hidden flex gap-2 overflow-x-auto px-4 pb-3">
              {navItems.map(({ href, label, Icon }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      active ? 'bg-neon-500/15 text-neon-300 border border-neon-500/30' : 'text-gray-300 border border-ink-700'
                    }`}
                  >
                    <Icon />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </header>
          <main className="px-4 md:px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5v10h12v-10" />
    </svg>
  );
}

function BillIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h5M8 17h3" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 15h2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.4 1.31 1.02 1.59.07.03.15.06.23.08H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
