"use client";

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
import { Card } from '../Card';

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



export function AdminPaymentAnalyticsCard() {
  const [dateRange, setDateRange] = React.useState('Jan 01 - Dec 31');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxAmount = 40000;

  const data = React.useMemo(() => months.map(m => ({
    month: m,
    value: Math.floor(Math.random() * 25000) + 10000,
  })), [dateRange]);

  const formatY = (val: number) => (val / 1000) + 'k';

  return (
    <Card className="h-full w-full overflow-hidden !rounded-[1.2rem] !bg-white p-6 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h3 className="text-xl font-bold text-slate-800">
          Payment Analytics
        </h3>

        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600 outline-none appearance-none cursor-pointer bg-white"
          >
            <option value="Jan 01 - Dec 31">Jan 01 - Dec 31</option>
            <option value="Jan 01 - Jun 30">Jan 01 - Jun 30</option>
            <option value="Jul 01 - Dec 31">Jul 01 - Dec 31</option>
          </select>
        </div>
      </div>

      <div className="relative mt-8 h-[300px]">
        <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-3">
          {[40000, 30000, 20000, 10000, 0].map((val) => (
            <div key={val} className="relative w-full h-px bg-gray-100">
              <span className="absolute -top-2.5 -left-2 text-xs font-bold text-slate-400 w-8 right-full text-right -ml-2">
                {formatY(val)}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 left-10 flex items-end justify-between pb-2 pt-2">
          {data.map((d) => (
            <div key={d.month} className="relative flex h-full w-full flex-col justify-end items-center group px-1">
              <div
                className="w-full max-w-[20px] bg-[#1c5d4a] rounded-t-sm transition-all duration-500 ease-out group-hover:opacity-80"
                style={{ height: `${(d.value / maxAmount) * 100}%` }}
              ></div>
              <span className="absolute -bottom-6 text-xs font-semibold text-slate-500">{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function AdminLevelsHighlightCard() {
  const [filter, setFilter] = React.useState('Monthly');

  const levels = React.useMemo(() => [
    // display all these on the arc with the color
    { label: '400L', value: '87%', color: '#1c5d4a' }, // Highest: Green
    { label: '200L', value: '70%', color: '#3b82f6' }, // 2nd: Blue
    { label: '300L', value: '55%', color: '#334155' }, // Other: Dark
    { label: '100L', value: '30%', color: '#ef4444' }, // Lowest: Red
  ], [filter]);

  return (
    <Card className="h-full w-full overflow-hidden !rounded-[1.2rem] !bg-white p-6 text-slate-800 flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-xl font-bold text-slate-800">
          Levels Highlight
        </h3>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600 outline-none appearance-none cursor-pointer bg-white"
          >
            <option value="Monthly">Monthly</option>
            <option value="Weekly">Weekly</option>
            <option value="Yearly">Yearly</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown size={14} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center min-h-[150px]">
        <div className="relative w-56 h-28 overflow-hidden mb-2">
          <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[22px] border-slate-100 box-border"></div>
          <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[22px] border-blue-500 box-border border-b-transparent border-l-transparent -rotate-[15deg] transition-transform"></div>
          <div className="absolute top-0 left-0 w-56 h-56 rounded-full border-[22px] border-[#1c5d4a] box-border border-b-transparent border-r-transparent -rotate-[45deg] transition-transform"></div>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <p className="text-xs font-semibold text-slate-500">Total Paid</p>
            <p className="text-lg font-black text-slate-800 tracking-tight">1,204</p>
          </div>
        </div>
      </div>

      <div className="space-y-1 mt-auto">
        {levels.map((lvl) => (
          <div key={lvl.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: lvl.color }}></span>
              <span className="text-sm font-semibold text-slate-700">{lvl.label}</span>
            </div>
            <span className="font-bold text-slate-900">{lvl.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
