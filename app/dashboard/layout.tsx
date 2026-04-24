"use client";

import React, { useState } from 'react';
import { Activity, Home, MoreHorizontal, Plus, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Activity', icon: Activity, path: '/dashboard/activity' },
    { name: 'Account', icon: User, path: '/dashboard/account' },
    { name: 'More', icon: MoreHorizontal, path: '/dashboard/more' },
  ];

  const handleNavClick = (path: string, name: string) => {
    if (name === 'More') {
      setIsComingSoonOpen(true);
      return;
    }

    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans overflow-x-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-gray-100 bg-white p-6 sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-[#1c5d4a] rounded-full flex items-center justify-center">
            <Image src="/nacos_logo.png" alt="NACOS PAY" width={31} height={31} style={{ borderRadius: '50%' }} />
          </div>
          <span className="text-xl font-black tracking-tighter text-[#1c5d4a]">NACOS PAY</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path, item.name)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive
                  ? 'bg-[#1c5d4a] text-white'
                  : 'text-gray-500 hover:text-[#1c5d4a] hover:bg-gray-50'
                  }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-bold text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={async () => {
            await fetch('/api/logout', { method: 'POST' });
            localStorage.removeItem('nacos_student');
            window.location.href = '/';
          }}
          className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative pb-32 lg:pb-0">
        <div className="flex-1">
          {children}
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 pt-3 pb-8 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path, item.name)}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div className={`p-2 transition-all ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>
                  <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>{item.name}</span>
              </button>
            );
          })}

          <button
            onClick={() => router.push('/dashboard/activity?open=payment')}
            className="w-12 h-12 bg-gradient-to-br from-[#1c5d4a] to-[#154638] rounded-full flex items-center justify-center text-white shadow-xl -mt-12 active:scale-95 transition-all"
          >
            <Plus size={32} strokeWidth={3} />
          </button>

          {navItems.slice(2, 4).map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path, item.name)}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div className={`p-2 transition-all ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>
                  <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {isComingSoonOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <button
            type="button"
            aria-label="Close coming soon modal"
            onClick={() => setIsComingSoonOpen(false)}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-800">Coming soon.</h2>
            <p className="mt-2 text-sm text-slate-500">
              This feature is not available yet.
            </p>

            <button
              type="button"
              onClick={() => setIsComingSoonOpen(false)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1c5d4a] px-5 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
