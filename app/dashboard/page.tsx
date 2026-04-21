"use client";

import React from 'react';
import {
  Bell,
  Plus,
  Briefcase,
  Shirt,
  History as HistoryIcon,
  AlertCircle,
  Monitor,
  Menu,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Search } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12 space-y-8 animate-in fade-in duration-700">

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black tracking-widest text-[#1c5d4a] uppercase">WELCOME BACK</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tighter">Chidi Okonkwo</h1>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
            <Menu size={20} className="text-slate-500" />
          </button>
          <button className="relative w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm">
            <Bell size={20} className="text-slate-500" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#1c5d4a] rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* BALANCE CARD (Using Brand Color) */}
      <Card className="relative overflow-hidden !rounded-xl bg-gradient-to-br from-[#1c5d4a] via-[#1a4f3e] to-[#154638] p-8 lg:p-10 text-white border-0 shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white/70">NACOS Wallet Balance</p>
            <h2 className="text-2xl font-black text-white tracking-tighter flex items-baseline gap-2">
              ₦0.00
            </h2>
            <p className="text-xs font-bold text-white/50 pt-1 tracking-wide uppercase">2024/2025 Academic Session</p>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1 !bg-white !text-[#1c5d4a] hover:!bg-gray-50 !rounded-2xl h-10 font-black flex items-center justify-center gap-1"
            >
              <Plus size={20} strokeWidth={3} />
              Make Payment
            </Button>
            <Button
              variant="outline"
              className="flex-1 !border-white/20 !text-white hover:!bg-white/10 !rounded-2xl h-10 font-bold"
            >
              History
            </Button>
          </div>
        </div>

        {/* Abstract decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      </Card>

      {/* QUICK ACTIONS */}
      <div className="space-y-5">
        <h3 className="text-xl font-bold text-slate-800 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'NACOS Dues', icon: Briefcase, color: 'bg-green-50 text-[#1c5d4a]' },
            { label: 'T-Shirt/ID', icon: Shirt, color: 'bg-amber-50 text-amber-500' },
            { label: 'History', icon: HistoryIcon, color: 'bg-blue-50 text-blue-500' },
            { label: 'Support', icon: AlertCircle, color: 'bg-rose-50 text-rose-500' }
          ].map((action, i) => (
            <Card
              key={i}
              className="flex flex-col items-center justify-center p-2 !rounded-xl bg-white border-gray-50 hover:border-[#1c5d4a]/20 hover:shadow-md transition-all group border-0 shadow-sm"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={26} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 tracking-tight">{action.label}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-1">
          <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
          <div className="w-full md:w-64">
            <Input
              label=""
              placeholder="Search history..."
              icon={<Search size={18} />}
              className="!py-2.5 !rounded-xl text-sm"
            />
          </div>
          <button className="hidden md:flex text-sm font-bold text-[#1c5d4a] hover:underline items-center gap-1">
            See all <ChevronRight size={14} />
          </button>
        </div>

        {/* EMPTY STATE */}
        <Card className="py-20 flex flex-col items-center justify-center space-y-6 !rounded-xl border-0 shadow-sm bg-white">
          <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center group">
            <Monitor size={40} className="text-slate-300 group-hover:text-[#1c5d4a] transition-colors" />
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-lg font-bold text-slate-800">No transactions yet</h4>
            <p className="text-sm font-bold text-slate-400 max-w-[220px] mx-auto leading-relaxed">
              Start making your payments to see your history here.
            </p>
          </div>
        </Card>
      </div>

    </div>
  );
}
