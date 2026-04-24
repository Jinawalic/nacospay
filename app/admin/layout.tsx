"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  LayoutDashboard,
  Menu,
  Settings2,
  Users,
  Wallet,
  X,
} from 'lucide-react';

type AdminNavItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  description: string;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo<AdminNavItem[]>(
    () => [
      {
        label: 'Overview',
        icon: LayoutDashboard,
        href: '/admin',
        description: ''
      },
      {
        label: 'Students',
        icon: Users,
        href: '/admin/students',
        description: ''
      },
      {
        label: 'Transactions',
        icon: Banknote,
        href: '/admin/transactions',
        description: ''
      },
      {
        label: 'Dues',
        icon: Wallet,
        href: '/admin/dues',
        description: ''
      },
      {
        label: 'Settings',
        icon: Settings2,
        href: '/admin/settings',
        description: ''
      },
    ],
    [],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleNavigate = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>

      <div className={`mt-8 flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-[#1c5d4a] rounded-full flex items-center justify-center">
          <Image src="/nacos_logo.png" alt="NACOS PAY" width={31} height={31} style={{ borderRadius: '50%' }} />
        </div>
        {!collapsed && (
          <div>
            <span className="text-xl font-black tracking-tighter text-[#1c5d4a]">NACOS PAY</span>
            <p className="mt-1 text-sm font-bold text-slate-700">Administration</p>
          </div>
        )}
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const active = item.href === '/admin'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <button
              key={item.label}
              type="button"
              title={item.label}
              onClick={() => handleNavigate(item.href)}
              className={[
                'group flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all',
                collapsed ? 'justify-center px-0' : '',
                active
                  ? 'bg-[#1c5d4a] text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-[#1c5d4a]',
              ].join(' ')}
            >
              <item.icon size={21} strokeWidth={active ? 2.4 : 2} />
              {!collapsed && (
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="mt-1 block text-[11px] font-medium text-inherit/70">
                    {item.description}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">

        <button
          type="button"
          onClick={async () => {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
          }}
          className={[
            'flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-bold text-red-500 transition-all hover:bg-red-50',
            collapsed ? 'justify-center px-0' : '',
          ].join(' ')}
        >
          <X size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {pathname === '/admin/login' ? (
        children
      ) : (
        <div className="flex min-h-screen">
          <aside
            className={[
              'fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-gray-100 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.12)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shadow-sm',
              collapsed ? 'lg:w-24' : 'lg:w-80',
              mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            ].join(' ')}
          >
            {sidebarContent}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/90 px-4 py-4 backdrop-blur-xl lg:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-700"
              >
                <Menu size={20} />
              </button>

              <div className="text-center">
                <p className="text-[10px] font-black tracking-[0.24em] text-[#1c5d4a]">ADMIN</p>
                <h2 className="text-sm font-black tracking-tight text-slate-800">NACOSPAY</h2>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-700 opacity-0"
              >
                <X size={20} />
              </button>
            </header>

            <main className="min-h-[calc(100vh-4rem)] p-4 pb-10 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      )}

      {mobileOpen && pathname !== '/admin/login' && (
        <button
          type="button"
          aria-label="Close admin sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {pathname !== '/admin/login' && (
        <aside
          className={[
            'fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-gray-100 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.12)] transition-transform duration-300 lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c5d4a]">
              <Image src="/nacos_logo.png" alt="NACOS PAY" width={31} height={31} />
            </div>
            <div>
              <h1 className="mt-1 text-lg font-black tracking-tight text-slate-800">
                NACOS Admin
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const active = item.href === '/admin'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className={[
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left transition-all',
                  active
                    ? 'bg-[#1c5d4a] text-white shadow-[0_18px_40px_rgba(28,93,74,0.18)]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#1c5d4a]',
                ].join(' ')}
              >
                <item.icon size={21} strokeWidth={active ? 2.4 : 2} />
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="mt-1 block text-[11px] font-medium text-inherit/70">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' });
              window.location.href = '/';
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-bold text-red-500 transition-all hover:bg-red-50"
          >
            <X size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      )}
    </div>
  );
}
