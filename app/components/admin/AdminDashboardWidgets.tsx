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



type SalesStatCard = {
  title: string;
  value: string;
};

type SalesBar = {
  label: string;
  value: number;
};

export function AdminSalePerformanceCard({
  stats,
  bars,
}: {
  stats: SalesStatCard[];
  bars: SalesBar[];
}) {
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);
  const barSegments = [
    { color: '#90c7ff', ratio: 0.28 },
    { color: '#2e90ff', ratio: 0.24 },
    { color: '#cbbde9', ratio: 0.48 },
  ];

  return (
    <Card className="overflow-hidden !rounded-[1.2rem] !border-0 !bg-white p-6 text-gray-700 ">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-800">
          Payment Analytics
        </h3>
      </div>

      <div className="relative mt-8 rounded-[1.35rem] bg-[#202844] px-4 pb-4 pt-8">
        <div className="absolute left-[58px] right-4 top-[36px] space-y-[58px]">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="h-px w-full bg-white/8" />
          ))}
        </div>

        <div className="relative grid min-h-[286px] grid-cols-[40px_1fr]">
          <div className="flex flex-col justify-between pb-10 pt-2 text-[0.72rem] font-bold text-white/58">
            <span>400</span>
            <span>300</span>
            <span>200</span>
            <span>100</span>
          </div>

          <div className="grid h-full grid-cols-7 items-end gap-4 pt-1">
            {bars.map((bar) => {
              const totalHeight = Math.max((bar.value / maxValue) * 100, 18);

              return (
                <div key={bar.label} className="flex h-full flex-col items-center justify-end gap-2">
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className="flex w-full max-w-[30px] flex-col overflow-hidden rounded-t-[0.95rem]"
                      style={{ height: `${totalHeight}%` }}
                    >
                      {barSegments.map((segment) => (
                        <div
                          key={`${bar.label}-${segment.color}`}
                          className="w-full"
                          style={{
                            height: `${totalHeight * segment.ratio}%`,
                            backgroundColor: segment.color,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[0.78rem] font-medium text-white/72">{bar.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
