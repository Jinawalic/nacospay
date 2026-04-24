"use client";

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { Card } from '../Card';
import type { AdminTransaction, AdminStudent } from '@/app/admin/admin-data';

export function AdminMetricCard({
  icon: Icon,
  title,
  value,
  featured = false,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#2f7b66] via-[#1c5d4a] to-[#154638] p-4 text-white">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/8" />
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/10" />

        <div className="relative z-10 flex min-h-[8px] items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white">
            <Icon size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-xl font-bold sm:text-xl">{value}</p>
            <p className="mt-0.5 text-sm font-medium text-white/85">{title}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#1e3140] via-[#172635] to-[#0f1c2b] p-4 text-white shadow-[0_18px_45px_rgba(9,19,32,0.18)]">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c39b3f]/20" />
      <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/15" />

      <div className="flex min-h-[8px] items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#ffcc4d]">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-xl font-bold text-white sm:text-xl">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-white/85">{title}</p>
        </div>
      </div>
    </Card>
  );
}

export function AdminQuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.15rem] border border-gray-100 bg-white p-4 transition-all hover:border-[#1c5d4a]/20 hover:shadow-[0_12px_30px_rgba(11,79,54,0.05)]"
    >
      <div className="space-y-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a]">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}



export function AdminPaymentAnalyticsCard({ transactions }: { transactions: AdminTransaction[] }) {
  const [dateRange, setDateRange] = React.useState('Jan 01 - Dec 31');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const data = React.useMemo(() => months.map((m, index) => {
    // Current year is 2026 based on timestamps
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.dateISO);
      return d.getMonth() === index && t.status === 'Paid';
    });
    const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    return {
      month: m,
      value: total,
    };
  }), [transactions]);

  const maxAmount = Math.max(...data.map(d => d.value), 1000);
  const formatY = (val: number) => val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val;
  const gridLines = [maxAmount, maxAmount * 0.75, maxAmount * 0.5, maxAmount * 0.25, 0];

  return (
    <Card className="h-full w-full overflow-hidden !rounded-[1.2rem] !bg-white p-6 text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          Payment Analytics
        </h3>

        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-bold text-slate-600 outline-none appearance-none cursor-pointer bg-white"
          >
            <option value="Jan 01 - Dec 31">Annual Trend</option>
          </select>
        </div>
      </div>

      <div className="relative mt-10 h-[300px]">
        <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-5">
          {gridLines.map((val) => (
            <div key={val} className="relative w-full h-px bg-gray-50">
              <span className="absolute -top-2.5 -left-1 text-[10px] font-black text-slate-300 w-10 text-right pr-2">
                {formatY(val)}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 left-10 flex items-end justify-between pb-5 pt-2">
          {data.map((d) => (
            <div key={d.month} className="relative flex h-full w-full flex-col justify-end items-center group px-1">
              <div
                className="w-full max-w-[24px] bg-gradient-to-t from-[#1c5d4a] to-[#2ea0ff] rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110 shadow-lg"
                style={{ height: `${(d.value / maxAmount) * 100}%`, minHeight: d.value > 0 ? '4px' : '0' }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none transition-all z-10 whitespace-nowrap">
                  ₦{d.value.toLocaleString()}
                </div>
              </div>
              <span className="absolute -bottom-7 text-[10px] font-black uppercase tracking-tighter text-slate-400 group-hover:text-[#1c5d4a] transition-colors">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function AdminLevelsHighlightCard({ students }: { students: AdminStudent[] }) {
  const levels = ['100L', '200L', '300L', '400L', '500L'];
  const colors = ['#ef4444', '#3b82f6', '#334155', '#1c5d4a', '#7b55ff'];

  const levelStats = React.useMemo(() => {
    const total = students.length || 1;
    return levels.map((label, i) => {
      const count = students.filter(s => s.level === label).length;
      const percentage = Math.round((count / total) * 100);
      return {
        label,
        value: `${percentage}%`,
        count,
        color: colors[i] || colors[0]
      };
    }).filter(s => s.count > 0);
  }, [students]);

  const totalPaid = levelStats.reduce((sum, s) => sum + s.count, 0);

  return (
    <Card className="h-full w-full overflow-hidden !rounded-[1.2rem] !bg-white p-6 text-slate-800 flex flex-col font-sans">
      <div className="flex items-center justify-between gap-2 mb-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          Levels Highlight
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center min-h-[150px] relative">
        <div className="relative w-56 h-28 overflow-hidden mb-4">
          <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[22px] border-slate-50 box-border"></div>
          {/* Dynamic Arcs would be complex without a library, using semi-circular visualization */}
          <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[22px] border-[#1c5d4a] box-border border-b-transparent border-r-transparent -rotate-[45deg] transition-all duration-1000"></div>
          <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[22px] border-blue-500 box-border border-b-transparent border-l-transparent -rotate-[15deg] transition-all duration-1000 opacity-60"></div>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">STUDENTS</p>
            <p className="text-2xl font-black text-slate-800 tracking-tight">{students.length}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {levelStats.map((lvl) => (
          <div key={lvl.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-3.5 border border-slate-100 group hover:border-[#1c5d4a]/20 transition-all">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: lvl.color }}></span>
              <span className="text-sm font-bold text-slate-600">{lvl.label} Students</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-300">{lvl.count} users</span>
              <span className="font-black text-slate-900 text-sm tracking-tight">{lvl.value}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
