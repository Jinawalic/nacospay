import React from 'react';
import type { LucideIcon } from 'lucide-react';

type SectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tagLabel?: string;
  tagClassName?: string;
  valueClassName?: string;
};

const badgeStyles: Record<string, string> = {
  green: 'bg-[#1c5d4a]/10 text-[#1c5d4a]',
  slate: 'bg-slate-100 text-slate-600',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-600',
  blue: 'bg-sky-50 text-sky-700',
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1c5d4a]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-800">{title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function AdminSection({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = '',
}: SectionProps) {
  return (
    <section
      className={[
        'rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-[0_12px_35px_rgba(11,79,54,0.05)] lg:p-6',
        className,
      ].join(' ')}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {eyebrow && (
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1c5d4a]">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-black tracking-tight text-slate-800">{title}</h2>
          {description && <p className="text-sm leading-relaxed text-slate-500">{description}</p>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>

      {children}
    </section>
  );
}

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  hint,
  tagLabel = 'Live',
  tagClassName = 'bg-[#1c5d4a]/10 text-[#1c5d4a]',
  valueClassName = 'text-slate-800',
}: StatCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-[0_12px_35px_rgba(11,79,54,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a]">
            <Icon size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-3xl font-black tracking-tight ${valueClassName}`}>{value}</p>
          </div>
        </div>

        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${tagClassName}`}>
          {tagLabel}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">{hint}</p>
    </div>
  );
}

export function AdminBadge({
  children,
  tone = 'green',
}: {
  children: React.ReactNode;
  tone?: 'green' | 'slate' | 'amber' | 'red' | 'blue';
}) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeStyles[tone]}`}>
      {children}
    </span>
  );
}
