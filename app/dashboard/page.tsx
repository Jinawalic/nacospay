"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ChevronRight,
  Bell,
  MailOpen,
  History as HistoryIcon,
  Loader2,
  Plus,
  ReceiptText,
  Shirt,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { EmptyTransactionsState, TransactionItem } from './transaction-ui';
import {
  getTransactionsSnapshot,
  initialTransactions,
  initializeTransactionsStore,
  subscribeTransactions,
} from './transactions';

type DashboardAction = 'payment' | 'dues' | 'merch' | 'history' | 'all' | null;

export default function Dashboard() {
  const router = useRouter();
  const transactions = useSyncExternalStore(
    subscribeTransactions,
    getTransactionsSnapshot,
    () => initialTransactions,
  );
  const [pendingAction, setPendingAction] = useState<DashboardAction>(null);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const timers = useRef<number[]>([]);

  const messages = [
    {
      title: 'Payment reminder',
      body: 'Your dues and merchandise payments are available from the Activity page.',
      time: 'Just now',
    },
    {
      title: 'Wallet update',
      body: 'Your current wallet balance is NGN 2,000.',
      time: 'Today',
    },
    {
      title: 'Support notice',
      body: 'Need help with your account? Open the Account page for security and support options.',
      time: 'Yesterday',
    },
  ];

  useEffect(() => {
    initializeTransactionsStore();
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const navigateWithLoading = (href: string, action: DashboardAction) => {
    clearTimers();
    setPendingAction(action);

    const timer = window.setTimeout(() => {
      router.push(href);
    }, 180);

    timers.current.push(timer);
  };

  const quickActions = [
    {
      label: 'NACOS Dues',
      icon: ShieldCheck,
      href: '/dashboard/activity?open=payment&type=dues',
      action: 'dues' as DashboardAction,
      bg: 'bg-[#1c5d4a]/10 text-[#1c5d4a]',
    },
    {
      label: 'T-Shirt / ID',
      icon: Shirt,
      href: '/dashboard/activity?open=payment&type=merchandise',
      action: 'merch' as DashboardAction,
      bg: 'bg-[#154638]/10 text-[#154638]',
    },
    {
      label: 'History',
      icon: HistoryIcon,
      href: '/dashboard/activity',
      action: 'history' as DashboardAction,
      bg: 'bg-slate-100 text-slate-500',
    },
    {
      label: 'Support',
      icon: AlertCircle,
      href: '/dashboard/activity',
      action: 'all' as DashboardAction,
      bg: 'bg-[#1c5d4a]/5 text-[#1c5d4a]',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 animate-in fade-in duration-700 lg:p-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1c5d4a]">
            WELCOME BACK
          </p>
          <h1 className="text-2xl font-bold tracking-tighter text-slate-800">
            Jinawa Titus
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsMessagesOpen(true)}
            className="relative flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-all hover:bg-gray-50"
          >
            <Bell size={20} className="text-slate-500" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#1c5d4a]" />
          </button>
        </div>
      </div>

      <Card className="relative overflow-hidden !rounded-xl border-0 bg-gradient-to-br from-[#1c5d4a] via-[#1a4f3e] to-[#154638] p-8 text-white shadow-2xl lg:p-10">
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white/70">NACOS Wallet Balance</p>
            <h2 className="flex items-baseline gap-2 text-2xl font-bold text-white">
              ₦ 2000.00
            </h2>
            <p className="pt-1 text-xs font-bold uppercase tracking-wide text-white/50">
              2024/2025 Academic Session
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => navigateWithLoading('/dashboard/activity?open=payment', 'payment')}
              className="flex-1 !rounded-2xl !bg-white !text-[#1c5d4a] hover:!bg-gray-50 h-10 font-black"
            >
              {pendingAction === 'payment' ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Plus size={20} strokeWidth={3} />
                  Make Payment
                </span>
              )}
            </Button>
            <Button
              type="button"
              disabled={pendingAction !== null}
              onClick={() => setIsComingSoonOpen(true)}
              variant="outline"
              className="flex-1 !rounded-2xl !border-white/20 !text-white hover:!bg-white/10 h-10 font-bold"
            >
              Fund Wallet
            </Button>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/2 translate-y-1/2 rounded-full bg-black/5" />
      </Card>

      <div className="space-y-5">
        <h3 className="px-1 text-xl font-bold text-slate-800">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickActions.map((action) => {
            const isLoading = pendingAction === action.action;
            return (
              <Card
                key={action.label}
                className="group border-0 bg-white p-2 !rounded-xl shadow-sm transition-all hover:shadow-md"
              >
                <button
                  type="button"
                  disabled={pendingAction !== null}
                  onClick={() => navigateWithLoading(action.href, action.action)}
                  className="flex h-full w-full flex-col items-center justify-center rounded-[0.9rem] p-2 text-center transition-all"
                >
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${action.bg} transition-transform group-hover:scale-110`}>
                    {isLoading ? (
                      <Loader2 size={22} className="animate-spin" />
                    ) : (
                      <action.icon size={26} />
                    )}
                  </div>
                  <span className="text-[11px] font-bold tracking-tight text-slate-500">
                    {isLoading ? 'Loading...' : action.label}
                  </span>
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 px-1 md:flex-row">
          <h3 className="text-xl font-bold text-slate-800">Recent Transactions</h3>
          <div className="w-full md:w-64">
            <Input
              label=""
              placeholder="Search history..."
              icon={<ReceiptText size={18} />}
              className="!rounded-xl !py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={pendingAction !== null}
            onClick={() => navigateWithLoading('/dashboard/activity', 'all')}
            className="hidden items-center gap-1 text-sm font-bold text-[#1c5d4a] hover:underline md:flex"
          >
            {pendingAction === 'all' ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Loading...
              </span>
            ) : (
              <>
                See all <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <TransactionItem key={transaction.txnId} transaction={transaction} />
            ))}
          </div>
        ) : (
          <EmptyTransactionsState
            title="No transactions yet"
            description="Start making your payments to see your history here."
          />
        )}
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

{/* Messages Modal */}
      {isMessagesOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <button
            type="button"
            aria-label="Close messages modal"
            onClick={() => setIsMessagesOpen(false)}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a]">
                  <MailOpen size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-[0.24em] text-[#1c5d4a]">MESSAGES</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-800">
                    Messages for you
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMessagesOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-700"
              >
                <span className="text-lg font-black leading-none">x</span>
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.title}
                  className="rounded-2xl border border-gray-100 bg-[#f8fafc] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {message.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {message.body}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsMessagesOpen(false)}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#1c5d4a] px-5 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
