"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Download,
  Loader2,
  ReceiptText,
  Shirt,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  Transaction,
  setTransactionsSnapshot,
} from './transactions';

export function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isMerchandise = transaction.kind === 'merchandise';
  const Icon = isMerchandise ? Shirt : ReceiptText;
  const iconClasses = isMerchandise
    ? 'bg-[#1c5d4a]/10 text-[#1c5d4a]'
    : 'bg-[#154638]/10 text-[#154638]';

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-[0_10px_30px_rgba(11,79,54,0.04)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}>
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold tracking-tight text-slate-800">
              {transaction.typeLabel}
            </h4>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
              <CalendarDays size={12} className="shrink-0" />
              <span>{formatDate(transaction.dateISO)}</span>
              <span className="text-slate-300">|</span>
              <span className="truncate">{transaction.details}</span>
            </p>
          </div>

          <div className="shrink-0 rounded-full bg-[#1c5d4a]/10 px-3 py-1 text-[10px] font-bold tracking-wide text-[#1c5d4a]">
            {transaction.status}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-semibold text-slate-400">{transaction.txnId}</p>
          <p className="text-sm font-black tracking-tight text-[#a33b3b]">
            - {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const pageSize = 2;
  const [page, setPage] = useState(1);
  const [downloadLoadingId, setDownloadLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [safePage, transactions]);

  const startIndex = transactions.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, transactions.length);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setIsToastVisible(false);
      toastTimer.current = null;
    }, 2800);
  };

  const handleDownload = async (transaction: Transaction) => {
    setDownloadLoadingId(transaction.txnId);

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
        ['TXN ID', transaction.txnId],
        ['Student', transaction.student],
        ['Matric.No', transaction.matricNo || 'NACOS/CS/24/019'],
        ['Type', transaction.typeLabel],
        ['Details', transaction.details],
        ['Amount', pdfCurrency(transaction.amount)],
        ['Date', new Date(transaction.dateISO).toLocaleString('en-NG')],
        ['Status', transaction.status],
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
      doc.text(`Total paid: ${pdfCurrency(transaction.amount)}`, margin, y + 18);
      doc.save(`${transaction.txnId}.pdf`);

      showToast(`Receipt for ${transaction.txnId} downloaded successfully.`);
    } catch {
      showToast('Download failed. Please try again.');
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handleDelete = (transaction: Transaction) => {
    const nextTransactions = transactions.filter((item) => item.txnId !== transaction.txnId);
    setTransactionsSnapshot(nextTransactions);
    setDeleteTarget(null);
    showToast(`Transaction ${transaction.txnId} deleted successfully.`);
  };

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_12px_35px_rgba(11,79,54,0.05)] lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse">
            <thead className="bg-slate-50/80">
              <tr className="text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                <th className="px-5 py-4">Transaction</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => {
                const isMerchandise = transaction.kind === 'merchandise';
                const iconClasses = isMerchandise
                  ? 'bg-[#1c5d4a]/10 text-[#1c5d4a]'
                  : 'bg-[#154638]/10 text-[#154638]';

                return (
                  <tr key={transaction.txnId} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}>
                          {isMerchandise ? <Shirt size={18} /> : <ReceiptText size={18} />}
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-slate-800">
                            {transaction.typeLabel}
                          </h4>
                          <p className="mt-1 truncate text-xs font-medium text-slate-500">
                            {transaction.txnId} | {transaction.details}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} className="shrink-0" />
                        {formatDate(transaction.dateISO)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-[#a33b3b]">
                      - {formatCurrency(transaction.amount)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-[#1c5d4a]/10 px-3 py-1 text-[10px] font-bold tracking-wide text-[#1c5d4a]">
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(transaction)}
                          disabled={downloadLoadingId === transaction.txnId}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 transition-all hover:border-[#1c5d4a]/20 hover:text-[#1c5d4a] disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Download ${transaction.txnId}`}
                        >
                          {downloadLoadingId === transaction.txnId ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(transaction)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 transition-all hover:border-red-200 hover:text-red-500"
                          aria-label={`Delete ${transaction.txnId}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transactions.length > 0 && totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Showing {startIndex}-{endIndex} of {transactions.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage === 1}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage === totalPages}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4">
          <button
            type="button"
            aria-label="Close delete confirmation"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[0.24em] text-red-500">CONFIRM DELETE</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-slate-800">
                  Delete this transaction?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  This action cannot be undone. The transaction will be removed from your history.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isToastVisible && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-[#1c5d4a] px-5 py-4 text-white shadow-[0_18px_50px_rgba(28,93,74,0.28)]">
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold">{toastMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}

export function AmountSummary({
  rows,
  total,
}: {
  rows: { label: string; value: string }[];
  total: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#f8fafc] p-4 shadow-[0_10px_30px_rgba(11,79,54,0.03)]">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-slate-500">{row.label}</span>
            <span className="font-bold text-slate-800">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="my-4 h-px bg-gray-200" />

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-slate-700">Total</span>
        <span className="text-lg font-black tracking-tight text-[#1c5d4a]">{total}</span>
      </div>
    </div>
  );
}

export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((index) => {
        const done = index < step;
        const active = index === step;

        return (
          <span
            key={index}
            className={[
              'h-2 rounded-full transition-all duration-200',
              active ? 'w-8 bg-[#1c5d4a]' : '',
              done ? 'w-2 bg-[#1c5d4a]' : '',
              !active && !done ? 'w-2 border border-gray-300 bg-transparent' : '',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

export function ReceiptPreviewCard({
  transaction,
}: {
  transaction: Transaction;
}) {
  const receiptRows = [
    { label: 'TXN ID', value: transaction.txnId },
    { label: 'Student', value: transaction.student },
    { label: 'Matric.No', value: transaction.matricNo || 'NACOS/CS/24/019' },
    { label: 'Type', value: transaction.typeLabel },
    { label: 'Details', value: transaction.details },
    { label: 'Amount', value: formatCurrency(transaction.amount) },
    { label: 'Date', value: formatDateTime(transaction.dateISO) },
    { label: 'Status', value: transaction.status },
  ];

  return (
    <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="text-center mb-8 mt-2">
        <h2 className="text-[32px] font-black tracking-tight text-[#172b22]">{formatCurrency(transaction.amount)}</h2>
      </div>

      <div className="space-y-4">
        {receiptRows.map((row) => (
          <div key={row.label} className="flex justify-between text-[15px]">
            <span className="font-semibold text-slate-500">{row.label}</span>
            <span className="font-bold text-slate-900">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyTransactionsState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-gray-100 bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(11,79,54,0.04)]">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#1c5d4a]/10 text-[#1c5d4a]">
        <BadgeCheck size={34} />
      </div>
      <h3 className="text-lg font-extrabold tracking-tight text-slate-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-[240px] text-sm font-medium leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

export function PaymentTypeCard({
  title,
  description,
  icon: Icon,
  selected,
  loading,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  selected?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        'group rounded-xl border p-5 text-left transition-all duration-200',
        selected
          ? 'border-[#1c5d4a] bg-[#1c5d4a]/5 shadow-[0_15px_40px_rgba(28,93,74,0.12)]'
          : 'border-gray-100 bg-white hover:border-[#1c5d4a]/20 hover:shadow-[0_12px_35px_rgba(11,79,54,0.05)]',
      ].join(' ')}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a] transition-transform duration-200 group-hover:scale-105">
        {loading ? <Loader2 size={22} className="animate-spin" /> : <Icon size={22} />}
      </div>
      <h4 className="text-base font-extrabold tracking-tight text-slate-800">{title}</h4>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
    </button>
  );
}

export function SummaryBlock({
  title,
  description,
  rows,
  total,
}: {
  title: string;
  description: string;
  rows: { label: string; value: string }[];
  total: string;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-[#f8fafc] p-4">
      <div>
        <h4 className="text-base font-extrabold tracking-tight text-slate-800">{title}</h4>
        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
      </div>
      <AmountSummary rows={rows} total={total} />
    </div>
  );
}

export function CheckmarkBadge() {
  return (
    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-[#1c5d4a] text-white receipt-pop">
      <CheckCircle2 size={42} strokeWidth={2.5} />
    </div>
  );
}
