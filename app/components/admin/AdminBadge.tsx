import type { ReactNode } from 'react';

const badgeStyles: Record<string, string> = {
  green: 'bg-[#1c5d4a]/10 text-[#1c5d4a]',
  slate: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-sky-50 text-sky-700',
};

export function AdminBadge({
  children,
  tone = 'green',
}: {
  children: ReactNode;
  tone?: 'green' | 'slate' | 'amber' | 'red' | 'blue';
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeStyles[tone]}`}
    >
      {children}
    </span>
  );
}
