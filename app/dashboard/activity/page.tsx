"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Script from 'next/script';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Shirt,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AmountSummary,
  CheckmarkBadge,
  EmptyTransactionsState,
  PaymentTypeCard,
  ReceiptPreviewCard,
  StepIndicator,
  SummaryBlock,
  TransactionTable,
  TransactionItem,
} from '../transaction-ui';
import {
  duesLevels,
  formatCurrency,
  getTransactionsSnapshot,
  initialTransactions,
  initializeTransactionsStore,
  makeTxnId,
  merchandiseItem,
  setTransactionsSnapshot,
  studentName,
  studentMatric,
  subscribeTransactions,
  syncTransactionsWithServer,
  Transaction,
  TransactionKind,
} from '../transactions';
import { Input } from '@/app/components/Input';

type Step = 1 | 2 | 3;
type FilterKey = 'all' | 'dues' | 'merchandise';
type PaystackSuccess = { reference: string };

declare global {
  interface Window {
    PaystackPop?: new () => {
      newTransaction: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        onSuccess?: (transaction: PaystackSuccess) => void;
        onCancel?: () => void;
        onError?: (error: { message?: string }) => void;
      }) => void;
    };
  }
}

const paymentMethod = 'Paystack';
const paystackPublicKey = 'pk_test_6aed518f320cf74c905058e0ee94d445bca28100';
const filterOptions: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'dues', label: 'NACOS Dues' },
  { key: 'merchandise', label: 'T-Shirt / ID' },
];

function parseType(value: string | null): TransactionKind | null {
  if (value === 'dues' || value === 'merchandise') {
    return value;
  }

  return null;
}

function buildTransaction(
  selectedLevels: string[],
  reference: string | undefined,
  paymentOptions: any[],
  selectedSizes: Record<string, string> = {},
  student: string = studentName,
  matricNo?: string
): Transaction {
  const txnId = reference ?? makeTxnId();
  const now = new Date().toISOString();

  const selectedOpts = selectedLevels
    .map(id => paymentOptions.find(o => o.id === id))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));
  const hasDues = selectedOpts.some(o => !o.isMerch);
  const hasMerch = selectedOpts.some(o => o.isMerch);

  const kind: TransactionKind = hasDues && hasMerch ? 'dues' : hasDues ? 'dues' : 'merchandise';
  const typeLabel = hasDues && hasMerch ? 'Dues & Merchandise' : hasDues ? 'NACOS Dues' : 'T-Shirt / ID Card';
  const details = selectedOpts.map(o => o.isMerch && selectedSizes[o.id] ? `${o.title} (Size: ${selectedSizes[o.id]})` : o.title).join(', ');
  const amount = selectedOpts.reduce((sum, o) => sum + o.amount, 0);

  return {
    id: txnId.toLowerCase(),
    txnId,
    kind,
    typeLabel,
    student,
    matricNo,
    details,
    amount,
    dateISO: now,
    status: 'Paid' as const,
    paymentMethod,
  };
}

function ActivityPageBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOpen = searchParams.get('open') === 'payment';

  const transactions = useSyncExternalStore(
    subscribeTransactions,
    getTransactionsSnapshot,
    () => initialTransactions,
  );
  const [filter, setFilter] = useState<FilterKey>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpen);
  const [step, setStep] = useState<Step>(1);
  const [paymentMode, setPaymentMode] = useState<string>(searchParams.get('type') || 'all');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [sizeModalItem, setSizeModalItem] = useState<any | null>(null);
  const [proceedLoading, setProceedLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const [availableDues, setAvailableDues] = useState<any[]>([]);
  const [fetchingDues, setFetchingDues] = useState(true);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('nacos_student');
    if (stored) {
      try {
        const studentInfo = JSON.parse(stored);
        setCurrentStudent(studentInfo);
        syncTransactionsWithServer(studentInfo.id);
      } catch (e) {
        console.error('Failed to parse student data');
      }
    }
  }, []);

  useEffect(() => {
    initializeTransactionsStore();

    fetch('/api/admin/dues')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableDues(data.filter((d: any) => d.status === 'Published'));
        }
      })
      .catch(console.error)
      .finally(() => setFetchingDues(false));

    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filter === 'all') {
        return true;
      }

      if (filter === 'dues') {
        return transaction.kind === 'dues';
      }

      return transaction.kind === 'merchandise';
    });
  }, [filter, transactions]);

  const isMerch = (title: string) => /t-shirt|t shirt|tshirt|shirt|id|merchandise|merch/i.test(title);

  const paymentOptions = useMemo(() => {
    const opts: Array<{ id: string, title: string, amount: number, isMerch: boolean, category: string, sizes?: string }> = [];

    availableDues.forEach(due => {
      if (isMerch(due.title)) {
        opts.push({
          id: due.id,
          title: due.title,
          amount: due.amount,
          isMerch: true,
          category: 'Merchandise',
          sizes: due.sizes // From database
        });
      } else {
        const levels = due.audience === 'All Levels' ? ['100L', '200L', '300L', '400L'] : [due.audience];
        levels.forEach(level => {
          const finalAmount = level === '100L' ? due.amount + 500 : due.amount;
          opts.push({
            id: `${due.id}-${level}`,
            title: due.title.includes(level) ? due.title : `${due.title} - ${level}`,
            amount: finalAmount,
            isMerch: false,
            category: 'NACOS Dues'
          });
        });
      }
    });
    return opts;
  }, [availableDues]);

  const currentAmount = useMemo(() => {
    return selectedLevels.reduce((sum, id) => {
      const option = paymentOptions.find(o => o.id === id);
      return sum + (option ? option.amount : 0);
    }, 0);
  }, [selectedLevels, paymentOptions]);

  useEffect(() => {
    if (isModalOpen && paymentMode === 'merch' && step === 1 && !fetchingDues && paymentOptions.length > 0) {
      const merch = paymentOptions.filter(o => o.isMerch);
      if (merch.length >= 1 && !sizeModalItem && selectedLevels.length === 0) {
        setSizeModalItem(merch[0]);
      }
    }
  }, [isModalOpen, paymentMode, step, fetchingDues, paymentOptions, sizeModalItem, selectedLevels]);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const openPaymentFlow = (mode?: string) => {
    clearTimers();
    setIsModalOpen(true);
    setReceiptTransaction(null);
    setSelectedLevels([]);
    setSelectedSizes({});
    setStep(1);
    setPaymentMode(mode || 'all');
    setProceedLoading(false);
    setPayLoading(false);
    setDownloadLoading(false);

    if (mode) {
      router.push(`/dashboard/activity?open=payment&type=${mode}`);
    } else {
      router.push('/dashboard/activity?open=payment');
    }
  };

  const closeModal = () => {
    clearTimers();
    setIsModalOpen(false);
    setStep(1);
    setSelectedLevels([]);
    setSelectedSizes({});
    setProceedLoading(false);
    setPayLoading(false);
    setDownloadLoading(false);
    setReceiptTransaction(null);
    router.replace('/dashboard/activity');
  };

  const handleBack = () => {
    if (!isModalOpen) {
      router.push('/dashboard');
      return;
    }

    if (step === 1) {
      closeModal();
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 3) {
      setStep(2);
      return;
    }
  };



  const toggleLevel = (id: string) => {
    const isLevelMerch = paymentOptions.find(o => o.id === id)?.isMerch;

    if (isLevelMerch && !selectedLevels.includes(id)) {
      setSizeModalItem(paymentOptions.find(o => o.id === id) || null);
      return;
    }

    setSelectedLevels((current) => {
      if (current.includes(id)) {
        if (isLevelMerch) {
          setSelectedSizes(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
        return current.filter((item) => item !== id);
      }
      if (!isLevelMerch) {
        return [...current, id];
      }
      return current;
    });
  };

  const handleSizeSelect = (size: string) => {
    if (!sizeModalItem) return;

    const withoutOtherMerch = selectedLevels.filter(id => !paymentOptions.find(o => o.id === id)?.isMerch);
    setSelectedLevels([...withoutOtherMerch, sizeModalItem.id]);
    setSelectedSizes({ [sizeModalItem.id]: size });
    setSizeModalItem(null);

    if (paymentMode === 'merch') {
      const timer = window.setTimeout(() => {
        setStep(2);
      }, 300);
      timers.current.push(timer);
    }
  };

  const visibleOptions = paymentOptions.filter(opt => paymentMode === 'all' || (paymentMode === 'dues' && !opt.isMerch) || (paymentMode === 'merch' && opt.isMerch));

  const handleProceed = () => {
    clearTimers();
    setProceedLoading(true);
    const timer = window.setTimeout(() => {
      setProceedLoading(false);
      setStep(2);
    }, 200);

    timers.current.push(timer);
  };

  const handleSuccessfulPayment = async (reference: string) => {
    const selectedOpts = selectedLevels
      .map(id => paymentOptions.find(o => o.id === id))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));

    const details = selectedOpts.map(o => o.isMerch && selectedSizes[o.id] ? `${o.title} (Size: ${selectedSizes[o.id]})` : o.title).join(', ');
    const typeLabel = selectedOpts.some(o => !o.isMerch) && selectedOpts.some(o => o.isMerch) ? 'Dues & Merchandise' : selectedOpts.some(o => !o.isMerch) ? 'NACOS Dues' : 'T-Shirt / ID Card';

    try {
      const resp = await fetch('/api/student/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          studentId: currentStudent?.id,
          amount: currentAmount,
          type: typeLabel,
          details,
          paymentMethod,
        })
      });

      if (!resp.ok) {
        throw new Error('Failed to record transaction');
      }

      const transaction = buildTransaction(
        selectedLevels,
        reference,
        paymentOptions,
        selectedSizes,
        currentStudent?.name || studentName,
        currentStudent?.matricNo || studentMatric
      );

      const nextTransactions = [
        transaction,
        ...transactions.filter((item) => item.txnId !== transaction.txnId),
      ];

      setTransactionsSnapshot(nextTransactions);
      setReceiptTransaction(transaction);
      setPayLoading(false);
      setStep(3);
    } catch (err) {
      console.error(err);
      setPayLoading(false);
      alert('Payment was successful but we couldn\'t record it. Reference: ' + reference);
    }
  };

  useEffect(() => {
    const checkPaystack = () => {
      if (window.PaystackPop) {
        setPaystackReady(true);
      }
    };
    checkPaystack();
    const interval = setInterval(checkPaystack, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePayNow = () => {
    if (selectedLevels.length === 0) {
      alert('Please select at least one item to pay for.');
      return;
    }

    clearTimers();
    setPayLoading(true);

    if (!window.PaystackPop) {
      setPayLoading(false);
      alert('Payment gateway is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: paystackPublicKey,
        email: currentStudent?.email || 'jinawa.titus@nacos.edu.ng',
        amount: Math.round(currentAmount * 100),
        currency: 'NGN',
        onSuccess: (transaction) => {
          handleSuccessfulPayment(transaction.reference);
        },
        onCancel: () => {
          setPayLoading(false);
        },
        onError: (error) => {
          console.error('Paystack error:', error);
          setPayLoading(false);
          alert('An error occurred with the payment gateway: ' + (error?.message || 'Unknown error'));
        },
      });
    } catch (e) {
      console.error('Paystack initialization error:', e);
      setPayLoading(false);
      alert('Could not initialize payment. Please try again.');
    }
  };

  const handleDownloadReceipt = async () => {
    if (!receiptTransaction) {
      return;
    }

    setDownloadLoading(true);

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 42;
      let y = 56;

      doc.setFillColor(28, 93, 74);
      doc.rect(0, 0, 595.28, 96, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('NACOS PAY RECEIPT', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Official student payment receipt', margin, y + 24);

      doc.setTextColor(11, 79, 54);
      doc.setFontSize(15);
      doc.text('Transaction Summary', margin, 132);
      doc.setDrawColor(28, 93, 74);
      doc.setLineWidth(1);
      doc.line(margin, 140, 553, 140);

      const pdfCurrency = (amount: number) => `NGN ${amount.toLocaleString('en-NG')}`;

      const rows = [
        ['TXN ID', receiptTransaction.txnId],
        ['Student', receiptTransaction.student],
        ['Matric.No', receiptTransaction.matricNo || 'NACOS/CS/24/019'],
        ['Type', receiptTransaction.typeLabel],
        ['Details', receiptTransaction.details],
        ['Amount', pdfCurrency(receiptTransaction.amount)],
        ['Date', new Date(receiptTransaction.dateISO).toLocaleString('en-NG')],
        ['Status', receiptTransaction.status],
      ] as const;

      y = 168;
      rows.forEach(([label, value]) => {
        doc.setTextColor(110, 110, 110);
        doc.setFontSize(11);
        doc.text(label, margin, y);
        doc.setTextColor(28, 93, 74);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), margin + 135, y);
        doc.setFont('helvetica', 'normal');
        y += 26;
      });

      doc.setTextColor(11, 79, 54);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`Total paid: ${pdfCurrency(receiptTransaction.amount)}`, margin, y + 18);
      doc.save(`${receiptTransaction.txnId}.pdf`);

      setTimeout(() => {
        setDownloadLoading(false);
        setIsModalOpen(false);
        setStep(1);
        setReceiptTransaction(null);
        router.replace('/dashboard');
      }, 150);
    } catch {
      setDownloadLoading(false);
    }
  };

  const confirmRows = [
    {
      label: 'Selected Items',
      value: selectedLevels.length > 0 ? selectedLevels.map(id => {
        const opt = paymentOptions.find(o => o.id === id);
        return opt?.isMerch && selectedSizes[id] ? `${opt.title} (Size: ${selectedSizes[id]})` : opt?.title;
      }).join(', ') : 'None selected',
    },
    { label: 'Method', value: paymentMethod },
  ];

  const paymentTitle = selectedLevels.some(id => paymentOptions.find(o => o.id === id)?.isMerch)
    ? (selectedLevels.some(id => !paymentOptions.find(o => o.id === id)?.isMerch) ? 'Dues & Merchandise' : 'T-Shirt / ID Card')
    : 'NACOS Dues';

  return (
    <main className="min-h-screen bg-[#f8fafc] lg:px-6 lg:py-6">
      <Script
        id="paystack-inline-js"
        src="https://js.paystack.co/v2/inline.js"
        strategy="afterInteractive"
        onLoad={() => setPaystackReady(true)}
      />

      <section className="mx-auto flex min-h-screen w-full flex-col bg-[#f8fafc] lg:min-h-[calc(100vh-3rem)] lg:max-w-7xl lg:rounded-[32px] lg:border lg:border-gray-200 lg:bg-white lg:px-8 lg:py-8 lg:shadow-[0_30px_90px_rgba(0,0,0,0.08)]">
        <div className="flex-1 px-5 pb-6 pt-6 lg:px-0 lg:pb-0 lg:pt-0">
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-700 shadow-[0_10px_25px_rgba(11,79,54,0.05)] transition-transform active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="min-w-0 flex-1 px-2 text-center">
              <h1 className="mt-1 text-xl font-bold text-slate-800">
                Transaction History
              </h1>
            </div>

            <button
              type="button"
              onClick={() => openPaymentFlow()}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#1c5d4a] px-4 text-sm font-bold text-white transition-transform active:scale-95"
            >
              <CreditCard size={16} />
              <span>Pay</span>
            </button>
          </div>

          <div className="mt-6">
            <Input
              className="rounded-xl bg-gray-100 p-4 shadow-[0_12px_30px_rgba(11,79,54,0.04)]"
              placeholder="Search transactions..."
              label=""
              icon={<Search size={18} />}
            />
          </div>

          <div className="mt-6">
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {filterOptions.map((option) => {
                const active = filter === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilter(option.key)}
                    className={[
                      'shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all',
                      active
                        ? 'bg-[#1c5d4a] text-white'
                        : 'border border-gray-200 bg-white text-slate-500',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 space-y-3 lg:hidden">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.txnId} transaction={transaction} />
              ))
            ) : (
              <EmptyTransactionsState
                title="No transactions for this filter"
                description="Try another filter or make a new payment to populate this view."
              />
            )}
          </div>

          <div className="mt-6 hidden lg:block">
            {filteredTransactions.length > 0 ? (
              <TransactionTable transactions={filteredTransactions} />
            ) : (
              <EmptyTransactionsState
                title="No transactions for this filter"
                description="Try another filter or make a new payment to populate this view."
              />
            )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 backdrop-blur-[2px] lg:items-center">
          <button
            type="button"
            aria-label="Close payment modal"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative h-[100dvh] w-full overflow-hidden bg-white shadow-[0_-20px_80px_rgba(0,0,0,0.28)] lg:h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-3rem)] lg:w-[60vw] lg:rounded-xl lg:border-0 animate-[sheetUp_220ms_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-700 transition-transform active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>

                <StepIndicator step={step} />

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-700 transition-transform active:scale-95"
                >
                  <span className="text-lg font-black leading-none">x</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 lg:px-8 lg:py-6">
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.24em] text-[#1c5d4a]">
                        STEP 1 OF 3
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-800">
                        Select items to pay
                      </h2>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                        Choose the Dues and Merchandise you want to pay for.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {fetchingDues ? (
                        <div className="col-span-full py-6 text-center text-slate-500 flex flex-col items-center">
                          <Loader2 size={24} className="animate-spin mb-2 text-[#1c5d4a]" />
                          Loading available items...
                        </div>
                      ) : visibleOptions.length === 0 ? (
                        <div className="col-span-full py-6 text-center text-slate-500 border border-dashed border-gray-200 rounded-xl">
                          No items are currently available for payment.
                        </div>
                      ) : visibleOptions.map((option) => {
                        const checked = selectedLevels.includes(option.id);

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => toggleLevel(option.id)}
                            className={[
                              'flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all',
                              checked
                                ? 'border-[#1c5d4a] bg-[#1c5d4a]/5'
                                : 'border-gray-100 bg-white',
                            ].join(' ')}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-base font-extrabold tracking-tight text-slate-800">
                                  {option.title}
                                  {checked && option.isMerch && selectedSizes[option.id] ? <span className="ml-1 text-slate-500 font-medium">(Size: {selectedSizes[option.id]})</span> : ''}
                                </p>
                              </div>
                              <p className="mt-1 text-sm font-medium text-slate-500 flex justify-between">
                                <span>{formatCurrency(option.amount)}</span>
                                <span className={['rounded-full px-2 py-0.5 text-[10px] font-bold', checked ? 'bg-[#1c5d4a]/20 text-[#1c5d4a]' : 'bg-slate-100 text-slate-500'].join(' ')}>
                                  {option.category}
                                </span>
                              </p>
                            </div>

                            <div
                              className={[
                                'flex shrink-0 h-6 w-6 items-center justify-center rounded-full border transition-all',
                                checked
                                  ? 'border-[#1c5d4a] bg-[#1c5d4a] text-white'
                                  : 'border-gray-300 bg-transparent text-transparent',
                              ].join(' ')}
                            >
                              <CheckCircle2 size={14} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <AmountSummary
                      rows={[
                        {
                          label: 'Selected items',
                          value: selectedLevels.length > 0 ? selectedLevels.map(id => {
                            const opt = paymentOptions.find(o => o.id === id);
                            return opt?.isMerch && selectedSizes[id] ? `${opt.title} (Size: ${selectedSizes[id]})` : opt?.title;
                          }).join(', ') : 'None selected',
                        },
                      ]}
                      total={formatCurrency(currentAmount)}
                    />

                    <button
                      type="button"
                      onClick={handleProceed}
                      disabled={selectedLevels.length === 0 || proceedLoading}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1c5d4a] px-5 py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {proceedLoading ? (
                        <span className="inline-flex items-center gap-3">
                          <Loader2 size={18} className="animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        'Proceed to Review'
                      )}
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.24em] text-[#1c5d4a]">
                        STEP 2 OF 3
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-slate-800">
                        Confirm and pay
                      </h2>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                        Check the summary, then pay securely to complete the transaction.
                      </p>
                    </div>

                    <SummaryBlock
                      title={paymentTitle}
                      description="Review the payment details before submitting."
                      rows={confirmRows}
                      total={formatCurrency(currentAmount)}
                    />

                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-slate-400">
                            PAYMENT METHOD
                          </p>
                          <p className="mt-1 text-sm font-extrabold tracking-tight text-slate-800">
                            {paymentMethod}
                          </p>
                        </div>
                        <div className="rounded-full bg-[#1c5d4a]/10 px-3 py-1 text-[10px] font-bold text-[#1c5d4a]">
                          Secure
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={payLoading}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1c5d4a] px-5 py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      {payLoading ? (
                        <span className="inline-flex items-center gap-3">
                          <Loader2 size={18} className="animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        'Pay Now'
                      )}
                    </button>
                  </div>
                )}

                {step === 3 && receiptTransaction && (
                  <div className="space-y-5">
                    <div className="flex flex-col items-center text-center">
                      <CheckmarkBadge />
                      <h2 className="mt-5 text-xl font-bold text-slate-800">
                        Payment successful
                      </h2>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                        Your receipt is ready. Download it as a PDF, and you will be returned to Home.
                      </p>
                    </div>

                    <ReceiptPreviewCard transaction={receiptTransaction} />

                    <button
                      type="button"
                      onClick={handleDownloadReceipt}
                      disabled={downloadLoading}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1c5d4a] px-5 py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      {downloadLoading ? (
                        <span className="inline-flex items-center gap-3">
                          <Loader2 size={18} className="animate-spin" />
                          Generating PDF...
                        </span>
                      ) : (
                        'Download Receipt (PDF)'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {sizeModalItem && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-4">
          <div className="relative w-full max-w-xs md:max-w-sm rounded-[1.5rem] bg-white p-6 shadow-2xl animate-[sheetUp_220ms_ease-out]">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Select Size</h3>
            <p className="text-sm text-slate-500 mb-5">Please pick a size to continue.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(sizeModalItem.sizes ? sizeModalItem.sizes.split(',').map((s: any) => s.trim()) : ['S', 'M', 'L', 'XL', 'XXL']).map((size: string) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className="rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-slate-700 transition-all hover:border-[#1c5d4a] hover:bg-[#1c5d4a]/5 active:scale-95"
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSizeModalItem(null)}
              className="w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-gray-200 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes sheetUp {
          from {
            transform: translateY(18px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes receiptPop {
          0% {
            transform: scale(0.75);
            opacity: 0;
          }
          70% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .receipt-pop {
          animation: receiptPop 320ms ease-out;
        }
      `}</style>
    </main>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f8fafc]" />}>
      <ActivityPageBody />
    </Suspense>
  );
}
