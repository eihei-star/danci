'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '首页', icon: HomeIcon },
  { href: '/me', label: '我的', icon: MeIcon },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 border-t border-gray-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((it) => {
        const active = it.href === '/' ? pathname === '/' : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex h-14 flex-1 flex-col items-center justify-center gap-1 text-xs ${
              active ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <it.icon className="h-6 w-6" />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M12 3l8 6v11a1 1 0 01-1 1h-5v-7h-4v7H5a1 1 0 01-1-1V9z" />
    </svg>
  );
}

function MeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 1.8-8 4v2h16v-2c0-2.2-4-4-8-4z" />
    </svg>
  );
}