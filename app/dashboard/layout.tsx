"use client";

import React, { useState } from 'react';
import {
  Home,
  Activity,
  User,
  MoreHorizontal,
  Plus,
  Bell,
  Menu,
  CreditCard,
  Shirt,
  ClipboardList,
  Info,
  Monitor
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Activity', icon: Activity, path: '/dashboard/activity' },
    { name: 'Account', icon: User, path: '/dashboard/account' },
    { name: 'More', icon: MoreHorizontal, path: '/dashboard/more' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans overflow-x-hidden">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-gray-100 bg-white p-6 sticky top-0 h-screen shadow-sm">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-[#1c5d4a] rounded-xl flex items-center justify-center shadow-lg shadow-[#1c5d4a]/20">
            <span className="font-black text-white italic text-lg">N</span>
          </div>
          <span className="text-xl font-black tracking-tighter italic text-[#1c5d4a]">NACOS PAY</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isActive
                  ? 'bg-[#1c5d4a] text-white shadow-xl shadow-[#1c5d4a]/20'
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
          onClick={() => router.push('/')}
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
              <button key={item.name} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className={`p-2 transition-all ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>
                  <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>{item.name}</span>
              </button>
            );
          })}

          <button className="w-12 h-12 bg-gradient-to-br from-[#1c5d4a] to-[#154638] rounded-full flex items-center justify-center text-white shadow-xl -mt-12 active:scale-95 transition-all">
            <Plus size={32} strokeWidth={3} />
          </button>

          {navItems.slice(2, 4).map((item) => {
            const isActive = pathname === item.path;
            return (
              <button key={item.name} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className={`p-2 transition-all ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>
                  <item.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-[#1c5d4a]' : 'text-gray-400'}`}>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
