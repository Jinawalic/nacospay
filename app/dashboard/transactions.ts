export type TransactionKind = 'dues' | 'merchandise';

export type Transaction = {
  id: string;
  txnId: string;
  kind: TransactionKind;
  typeLabel: 'NACOS Dues' | 'T-Shirt / ID Card';
  student: string;
  details: string;
  amount: number;
  dateISO: string;
  status: 'Paid';
  paymentMethod: string;
};

export const studentName = 'Jinawa Titus';
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

export const initialTransactions: Transaction[] = [
  {
    id: 'txn-1',
    txnId: 'NP-260418-A1',
    kind: 'dues',
    typeLabel: 'NACOS Dues',
    student: studentName,
    details: '100L, 200L, 300L',
    amount: 15000,
    dateISO: '2026-04-18T10:24:00.000Z',
    status: 'Paid',
    paymentMethod: 'Card payment',
  },
  {
    id: 'txn-2',
    txnId: 'NP-260410-B2',
    kind: 'merchandise',
    typeLabel: 'T-Shirt / ID Card',
    student: studentName,
    details: '1 item bundle',
    amount: 8500,
    dateISO: '2026-04-10T15:42:00.000Z',
    status: 'Paid',
    paymentMethod: 'Card payment',
  },
  {
    id: 'txn-3',
    txnId: 'NP-260314-C3',
    kind: 'dues',
    typeLabel: 'NACOS Dues',
    student: studentName,
    details: '400L, 500L',
    amount: 10000,
    dateISO: '2026-03-14T09:12:00.000Z',
    status: 'Paid',
    paymentMethod: 'Card payment',
  },
];

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
