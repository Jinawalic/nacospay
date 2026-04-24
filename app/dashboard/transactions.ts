export type TransactionKind = 'dues' | 'merchandise';

export type Transaction = {
  id: string;
  txnId: string;
  kind: TransactionKind;
  typeLabel: 'NACOS Dues' | 'T-Shirt / ID Card' | 'Dues & Merchandise';
  student: string;
  details: string;
  amount: number;
  dateISO: string;
  status: 'Paid';
  paymentMethod: string;
  matricNo?: string;
};

export const studentName = typeof window !== 'undefined' && localStorage.getItem('nacos_student')
  ? JSON.parse(localStorage.getItem('nacos_student')!).name || 'Jinawa Titus'
  : 'Jinawa Titus';

export const studentMatric = typeof window !== 'undefined' && localStorage.getItem('nacos_student')
  ? JSON.parse(localStorage.getItem('nacos_student')!).matricNo || 'NACOS/CS/24/019'
  : 'NACOS/CS/24/019';

export const transactionStorageKey = 'nacospay.transactions.v1';

export const duesLevels = [
  { label: '100L', amount: 5000 },
  { label: '200L', amount: 5000 },
  { label: '300L', amount: 5000 },
  { label: '400L', amount: 5000 },
];

export const merchandiseItem = {
  name: 'T-Shirt / ID Card',
  description: 'Official NACOS branded T-shirt and student ID card bundle.',
  amount: 8500,
};

export const initialTransactions: Transaction[] = [];

let memoryTransactions = initialTransactions;
const listeners = new Set<() => void>();

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateISO: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateISO));
}

export function formatDateTime(dateISO: string) {
  return new Intl.DateTimeFormat('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateISO));
}

export function getTransactionsSnapshot() {
  return memoryTransactions;
}

export function initializeTransactionsStore() {
  if (typeof window === 'undefined') {
    return memoryTransactions;
  }

  const stored = window.localStorage.getItem(transactionStorageKey);

  if (!stored) {
    window.localStorage.setItem(
      transactionStorageKey,
      JSON.stringify(initialTransactions),
    );
    if (memoryTransactions !== initialTransactions) {
      memoryTransactions = initialTransactions;
      listeners.forEach((listener) => listener());
    }
    return memoryTransactions;
  }

  try {
    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed)) {
      const nextTransactions = parsed as Transaction[];
      const same =
        memoryTransactions.length === nextTransactions.length &&
        memoryTransactions.every((item, index) => {
          const next = nextTransactions[index];
          return (
            item.txnId === next.txnId &&
            item.kind === next.kind &&
            item.typeLabel === next.typeLabel &&
            item.student === next.student &&
            item.details === next.details &&
            item.amount === next.amount &&
            item.dateISO === next.dateISO &&
            item.status === next.status &&
            item.paymentMethod === next.paymentMethod
          );
        });

      if (!same) {
        memoryTransactions = nextTransactions;
        listeners.forEach((listener) => listener());
      }
    }
  } catch {
    window.localStorage.setItem(
      transactionStorageKey,
      JSON.stringify(initialTransactions),
    );
    memoryTransactions = initialTransactions;
    listeners.forEach((listener) => listener());
  }

  return memoryTransactions;
}

export function subscribeTransactions(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setTransactionsSnapshot(transactions: Transaction[]) {
  memoryTransactions = transactions;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      transactionStorageKey,
      JSON.stringify(transactions),
    );
  }

  listeners.forEach((listener) => listener());
}

export function makeTxnId() {
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-6).toUpperCase();
  return `NP-${timestamp}-${randomPart}`;
}

export async function syncTransactionsWithServer(studentId: string) {
  if (!studentId) return;
  
  try {
    const res = await fetch(`/api/student/transactions/${studentId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setTransactionsSnapshot(data);
    }
  } catch (e) {
    console.error('Failed to sync transactions:', e);
  }
}

