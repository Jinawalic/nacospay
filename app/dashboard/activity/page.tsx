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
  subscribeTransactions,
  Transaction,
  TransactionKind,
} from '../transactions';
import { Input } from '@/app/components/Input';

type Step = 1 | 2 | 3 | 4;
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
  kind: TransactionKind,
  selectedLevels: string[],
  reference?: string,
): Transaction {
  const txnId = reference ?? makeTxnId();
  const now = new Date().toISOString();

  if (kind === 'dues') {
    return {
      id: txnId.toLowerCase(),
      txnId,
      kind,
      typeLabel: 'NACOS Dues',
      student: studentName,
      details: selectedLevels.join(', '),
      amount: selectedLevels.length * duesLevels[0].amount,
      dateISO: now,
      status: 'Paid' as const,
      paymentMethod,
    };
  }

  return {
    id: txnId.toLowerCase(),
    txnId,
    kind,
    typeLabel: 'T-Shirt / ID Card',
    student: studentName,
    details: '1 item bundle',
    amount: merchandiseItem.amount,
    dateISO: now,
    status: 'Paid' as const,
    paymentMethod,
  };
}

function ActivityPageBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = parseType(searchParams.get('type'));
  const initialOpen = searchParams.get('open') === 'payment' || Boolean(initialType);

  const transactions = useSyncExternalStore(
    subscribeTransactions,
    getTransactionsSnapshot,
    () => initialTransactions,
  );
  const [filter, setFilter] = useState<FilterKey>('all');
  const [isModalOpen, setIsModalOpen] = useState(initialOpen);
  const [step, setStep] = useState<Step>(initialType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<TransactionKind | null>(initialType);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [typeLoading, setTypeLoading] = useState<TransactionKind | null>(null);
  const [proceedLoading, setProceedLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [receiptTransaction, setReceiptTransaction] = useState<Transaction | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    initializeTransactionsStore();
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

  const selectedDuesTotal = selectedLevels.length * duesLevels[0].amount;
  const currentAmount =
    selectedType === 'dues' ? selectedDuesTotal : merchandiseItem.amount;

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const openPaymentFlow = (kind?: TransactionKind) => {
    clearTimers();
    setIsModalOpen(true);
    setReceiptTransaction(null);
    setSelectedLevels([]);
    setSelectedType(kind ?? null);
    setStep(kind ? 2 : 1);
    setTypeLoading(null);
    setProceedLoading(false);
    setPayLoading(false);
    setDownloadLoading(false);

    if (kind) {
      router.push(`/dashboard/activity?open=payment&type=${kind}`);
    } else {
      router.push('/dashboard/activity?open=payment');
    }
  };

  const closeModal = () => {
    clearTimers();
    setIsModalOpen(false);
    setStep(1);
    setSelectedType(null);
    setSelectedLevels([]);
    setTypeLoading(null);
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
      setSelectedType(null);
      setSelectedLevels([]);
      return;
    }

    if (step === 3) {
      setStep(2);
      return;
    }

    setStep(3);
  };

  const handleTypeSelect = (kind: TransactionKind) => {
    clearTimers();
    setTypeLoading(kind);
    setSelectedType(kind);
    setSelectedLevels([]);

    const timer = window.setTimeout(() => {
      setStep(2);
      setTypeLoading(null);
    }, 200);

    timers.current.push(timer);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels((current) =>
      current.includes(level)
        ? current.filter((item) => item !== level)
        : [...current, level],
    );
  };

  const handleProceed = () => {
    clearTimers();
    setProceedLoading(true);
    const timer = window.setTimeout(() => {
      setProceedLoading(false);
      setStep(3);
    }, 200);

    timers.current.push(timer);
  };

  const handleSuccessfulPayment = (reference: string) => {
    if (!selectedType) {
      return;
    }

    const transaction = buildTransaction(selectedType, selectedLevels, reference);
    const nextTransactions = [
      transaction,
      ...transactions.filter((item) => item.txnId !== transaction.txnId),
    ];

    setTransactionsSnapshot(nextTransactions);
    setReceiptTransaction(transaction);
    setPayLoading(false);
    setStep(4);
  };

  const handlePayNow = () => {
    if (!selectedType) {
      return;
    }

    clearTimers();
    setPayLoading(true);

    if (!paystackReady || !window.PaystackPop) {
      setPayLoading(false);
      return;
    }

    try {
      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: paystackPublicKey,
        email: 'jinawa.titus@nacos.edu.ng',
        amount: currentAmount * 100,
        currency: 'NGN',
        onSuccess: (transaction) => {
          handleSuccessfulPayment(transaction.reference);
        },
        onCancel: () => {
          setPayLoading(false);
        },
        onError: () => {
          setPayLoading(false);
        },
      });
    } catch {
      setPayLoading(false);
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
        setSelectedType(null);
        setSelectedLevels([]);
        setReceiptTransaction(null);
        router.replace('/dashboard');
      }, 150);
    } catch {
      setDownloadLoading(false);
    }
  };

  const confirmRows =
    selectedType === 'dues'
      ? [
          {
            label: 'Selected levels',
            value: selectedLevels.length > 0 ? selectedLevels.join(', ') : 'None selected',
          },
          {
            label: 'Rate x count',
            value: `${formatCurrency(duesLevels[0].amount)} x ${selectedLevels.length}`,
          },
        ]
      : [
          { label: 'Item', value: merchandiseItem.name },
          { label: 'Qty', value: '1' },
          { label: 'Method', value: paymentMethod },
        ];

  const paymentTitle = selectedType === 'dues' ? 'NACOS Dues' : 'T-Shirt / ID Card';

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

                <StepIndicator step={step === 4 ? 3 : step} />

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
                        Choose payment type
                      </h2>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                        Pick the option you want to pay for. The next step opens automatically.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <PaymentTypeCard
                        title="NACOS Dues"
                        description="Select one or more unpaid levels and pay in one go."
                        icon={ShieldCheck}
                        selected={selectedType === 'dues'}
                        loading={typeLoading === 'dues'}
                        disabled={typeLoading !== null}
                        onClick={() => handleTypeSelect('dues')}
                      />
                      <PaymentTypeCard
                        title="T-Shirt / ID Card"
                        description="Pay the official T-shirt and ID card bundle."
                        icon={Shirt}
                        selected={selectedType === 'merchandise'}
                        loading={typeLoading === 'merchandise'}
                        disabled={typeLoading !== null}
                        onClick={() => handleTypeSelect('merchandise')}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && selectedType === 'dues' && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.24em] text-[#1c5d4a]">
                        STEP 2 OF 3
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-slate-800">
                        Select unpaid levels
                      </h2>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                        Choose one or more levels. Each level is billed at {formatCurrency(duesLevels[0].amount)}.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                      {duesLevels.map((level) => {
                        const checked = selectedLevels.includes(level.label);

                        return (
                          <button
                            key={level.label}
                            type="button"
                            onClick={() => toggleLevel(level.label)}
                            className={[
                              'flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all',
                              checked
                                ? 'border-[#1c5d4a] bg-[#1c5d4a]/5'
                                : 'border-gray-100 bg-white',
                            ].join(' ')}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-base font-extrabold tracking-tight text-slate-800">
                                  {level.label}
                                </p>
                                <span className="rounded-full bg-[#1c5d4a]/10 px-2 py-0.5 text-[10px] font-bold text-[#1c5d4a]">
                                  Not paid
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-slate-500">
                                {formatCurrency(duesLevels[0].amount)}
                              </p>
                            </div>

                            <div
                              className={[
                                'flex h-6 w-6 items-center justify-center rounded-full border transition-all',
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
                          label: 'Selected levels',
                          value: selectedLevels.length > 0 ? selectedLevels.join(', ') : 'None selected',
                        },
                        {
                          label: 'Rate x count',
                          value: `${formatCurrency(duesLevels[0].amount)} x ${selectedLevels.length}`,
                        },
                      ]}
                      total={formatCurrency(selectedDuesTotal)}
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
                        'Proceed'
                      )}
                    </button>
                  </div>
                )}

                {step === 2 && selectedType === 'merchandise' && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.24em] text-[#1c5d4a]">
                        STEP 2 OF 3
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-slate-800">
                        Review merchandise item
                      </h2>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                        Confirm the T-shirt and ID card bundle before moving to payment.
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-[0_12px_35px_rgba(11,79,54,0.05)]">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a]">
                          <Shirt size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-800">
                            {merchandiseItem.name}
                          </h3>
                          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                            {merchandiseItem.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl bg-[#f8fafc] p-4">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="font-medium text-slate-500">Price</span>
                          <span className="font-black text-[#1c5d4a]">
                            {formatCurrency(merchandiseItem.amount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <AmountSummary
                      rows={[
                        { label: 'Item', value: merchandiseItem.name },
                        { label: 'Qty', value: '1' },
                        { label: 'Bundle', value: formatCurrency(merchandiseItem.amount) },
                      ]}
                      total={formatCurrency(merchandiseItem.amount)}
                    />

                    <button
                      type="button"
                      onClick={handleProceed}
                      disabled={proceedLoading}
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[#1c5d4a] px-5 py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {proceedLoading ? (
                        <span className="inline-flex items-center gap-3">
                          <Loader2 size={18} className="animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        'Proceed'
                      )}
                    </button>
                  </div>
                )}

                {step === 3 && selectedType && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-black tracking-[0.24em] text-[#1c5d4a]">
                        STEP 3 OF 3
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

                {step === 4 && receiptTransaction && (
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
