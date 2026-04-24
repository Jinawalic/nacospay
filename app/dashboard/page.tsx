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
  LogOut,
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
  syncTransactionsWithServer,
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
  const [studentName, setStudentName] = useState('Student');
  const [availableDues, setAvailableDues] = useState<any[]>([]);
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
    const stored = localStorage.getItem('nacos_student');
    if (stored) {
      try {
        const student = JSON.parse(stored);
        if (student.name) setStudentName(student.name);
        syncTransactionsWithServer(student.id);
      } catch (e) { /* ignore */ }
    }
    
    initializeTransactionsStore();
    
    fetch('/api/admin/dues')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableDues(data.filter((d: any) => d.status === 'Published'));
        }
      })
      .catch(console.error);

    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedMerch, setSelectedMerch] = useState<any>(null);

  const navigateWithLoading = (href: string, action: DashboardAction) => {
    if (action === 'merch') {
      const merch = availableDues.find(d => isMerch(d.title));
      if (merch) {
        setSelectedMerch(merch);
        setIsSizeModalOpen(true);
        return;
      }
    }

    clearTimers();
    setPendingAction(action);

    const timer = window.setTimeout(() => {
      router.push(href);
    }, 180);

    timers.current.push(timer);
  };

  const handleSizeSelect = (size: string) => {
    setIsSizeModalOpen(false);
    setPendingAction('merch');
    // Navigate to activity with pre-selected merch and size
    router.push(`/dashboard/activity?open=payment&type=merchandise&merchId=${selectedMerch.id}&size=${size}`);
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

  const isMerch = (title: string) => /t-shirt|t shirt|id card|merchandise|merch/i.test(title);
  const visibleActions = quickActions.filter(action => {
    if (action.action === 'dues') return availableDues.some(d => !isMerch(d.title));
    if (action.action === 'merch') return availableDues.some(d => isMerch(d.title)); 
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 animate-in fade-in duration-700 lg:p-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1c5d4a]">
            WELCOME BACK
          </p>
          <h1 className="text-2xl font-bold tracking-tighter text-slate-800">
            {studentName}
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
          
          <button
            type="button"
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' });
              localStorage.removeItem('nacos_student');
              window.location.href = '/';
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-all hover:bg-gray-50 text-slate-500 hover:text-red-500"
            title="Logout"
          >
            <LogOut size={20} />
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
        <div className={`grid gap-4 ${visibleActions.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
          {visibleActions.map((action) => {
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
      {/* Size Selection Modal */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 lg:items-center p-4">
          <div className="w-full max-w-sm animate-in slide-in-from-bottom-5 duration-300">
            <Card className="p-8 !rounded-[2rem] border-0 shadow-2xl relative overflow-hidden bg-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1c5d4a]/5 rounded-full -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a]">
                    <Shirt size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Select Size</h3>
                    <p className="text-sm font-medium text-slate-500">For {selectedMerch?.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {(selectedMerch?.sizes?.split(',') || ['S', 'M', 'L', 'XL', 'XXL']).map((size: string) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className="flex h-14 items-center justify-center rounded-2xl border-2 border-gray-100 bg-slate-50 text-base font-bold text-slate-700 transition-all hover:border-[#1c5d4a] hover:bg-[#1c5d4a]/5 hover:text-[#1c5d4a] active:scale-95"
                    >
                      {size.trim()}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => setIsSizeModalOpen(false)}
                  variant="ghost"
                  fullWidth
                  className="!rounded-2xl py-3 text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
