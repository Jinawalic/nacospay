"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  Download,
  Eye,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { adminTransactionsSeed, type AdminTransaction } from '../admin-data';
import { formatCurrency, formatDate } from '../../dashboard/transactions';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Input } from '@/app/components/Input';

type StatusFilter = 'All' | AdminTransaction['status'];

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    fetch('/api/admin/transactions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransactions(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Modals state
  const [transactionToView, setTransactionToView] = useState<AdminTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<AdminTransaction | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        search.trim().length === 0 ||
        [transaction.reference, transaction.student, transaction.matricNo, transaction.details, transaction.channel, transaction.type, transaction.status]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ? true : transaction.status === statusFilter;

      const matchesType =
        typeFilter === 'All' 
          ? true 
          : typeFilter === 'Merchandise'
            ? (transaction.type.toLowerCase().includes('shirt') || transaction.type.toLowerCase().includes('id') || transaction.type.toLowerCase().includes('merchandise'))
            : transaction.type.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter, transactions]);

  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const MathMax = Math.max;
  const MathMin = Math.min;
  const totalPages = MathMax(1, Math.ceil(filteredTransactions.length / pageSize));
  const safePage = MathMin(page, totalPages);

  const paginatedTransactions = filteredTransactions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedTransactions.map(t => t.id));
    }
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        const response = await fetch(`/api/admin/transactions/${transactionToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
          setSuccessMessage('Transaction deleted successfully!');
          setTransactionToDelete(null);
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete transaction');
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('An error occurred while deleting the transaction');
      }
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    const headers = ['Reference', 'Student', 'Matric No', 'Type', 'Details', 'Amount', 'Date', 'Status', 'Channel'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.reference,
        `"${t.student}"`,
        t.matricNo,
        `"${t.type}"`,
        `"${t.details}"`,
        t.amount,
        formatDate(t.dateISO),
        t.status,
        t.channel
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${typeFilter.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">
            View all of your Transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="gap-2 border-gray-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-4 py-2 shadow-sm"
          >
            <Download size={16} />
            Export Transactions
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md hidden-label-form">
          <Input
            label=""
            icon={<Search size={18} />}
            placeholder="Search for Transactions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-gray-200 focus:border-[#1c5d4a] focus:ring-[#1c5d4a]"
            style={{ marginTop: '-24px' }}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 sm:flex shadow-sm">
            <CalendarDays size={16} className="text-slate-400" />
            <span>Mar 01, 2024 - Mar 30, 2024</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:border-[#1c5d4a]"
          >
            <option value="All">All Types</option>
            <option value="Dues">Dues</option>
            <option value="Merchandise">T-Shirt/ID Card</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="mt-6 border-gray-200 shadow-sm rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#f8fafc]/80">
              <tr className="border-b border-gray-200 text-left text-[13px] font-semibold text-slate-500">
                <th className="px-5 py-4 w-12">
                  <div
                    onClick={toggleSelectAll}
                    className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-[6px] border transition-colors ${paginatedTransactions.length > 0 && selectedIds.length === paginatedTransactions.length
                      ? 'border-[#1c5d4a] bg-[#1c5d4a]'
                      : 'border-gray-300 bg-white hover:border-[#1c5d4a]'
                      }`}
                  >
                    {paginatedTransactions.length > 0 && selectedIds.length === paginatedTransactions.length && (
                      <Check size={14} strokeWidth={3} className="text-white" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap">Student Name</th>
                <th className="px-5 py-4 whitespace-nowrap">Matric. No</th>
                <th className="px-5 py-4 whitespace-nowrap">Type</th>
                <th className="px-5 py-4 whitespace-nowrap">Amount</th>
                <th className="px-5 py-4 whitespace-nowrap">Status</th>
                <th className="px-5 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-[#1c5d4a]" />
                      <p className="text-sm font-bold text-slate-500">Fetching transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-slate-500">No transactions match your criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((transaction) => {
                  const isChecked = selectedIds.includes(transaction.id);
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 last:border-none hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div
                          onClick={() => toggleSelect(transaction.id)}
                          className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-[6px] border transition-colors ${isChecked
                            ? 'border-[#1c5d4a] bg-[#1c5d4a]'
                            : 'border-gray-300 bg-white hover:border-[#1c5d4a]'
                            }`}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} className="text-white" />}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-bold text-[#1c5d4a] whitespace-nowrap">
                        {transaction.student}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                        {transaction.matricNo}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-slate-600 whitespace-nowrap">
                        {transaction.type}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${transaction.status === 'Paid'
                          ? 'bg-[#1c5d4a]/10 text-[#1c5d4a]'
                          : transaction.status === 'Pending'
                            ? 'bg-amber-100/70 text-amber-700'
                            : 'bg-red-100/70 text-red-700'
                          }`}>
                          {transaction.status === 'Paid' ? 'Active' : transaction.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setTransactionToView(transaction)} className="text-slate-400 hover:text-blue-500 transition-colors">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => setTransactionToDelete(transaction)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination & Rows Selection */}
      {totalPages > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1c5d4a] cursor-pointer hover:border-[#1c5d4a]/30 transition-all"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = safePage === pageNum;

              // Truncate logic if many pages
              if (totalPages > 7) {
                if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - safePage) > 1) {
                  if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                  return null;
                }
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-xl text-sm font-bold transition-all ${isActive
                    ? 'bg-[#1c5d4a]/10 text-[#1c5d4a]'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900">Delete Transaction</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to delete transaction <strong>{transactionToDelete.reference}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setTransactionToDelete(null)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}

      {/* View Receipt Modal */}
      {transactionToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-0 animate-in fade-in zoom-in duration-200 overflow-hidden shadow-2xl">
            <div className="bg-[#1c5d4a] p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Transaction Receipt</h3>
                <p className="text-sm text-white/80 mt-1">{formatDate(transactionToView.dateISO)}</p>
              </div>
              <button onClick={() => setTransactionToView(null)} className="text-white hover:text-white/70 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-slate-500 text-sm">Reference</span>
                <span className="font-bold text-slate-800">{transactionToView.reference}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-slate-500 text-sm">Student</span>
                <span className="font-semibold text-slate-800">{transactionToView.student}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-slate-500 text-sm">Matric No</span>
                <span className="font-semibold text-slate-800">{transactionToView.matricNo}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-slate-500 text-sm">Type</span>
                <span className="font-semibold text-slate-800">{transactionToView.type}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-slate-500 text-sm">Details</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px]">{transactionToView.details}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-slate-500 text-sm">Channel</span>
                <span className="font-semibold text-slate-800">{transactionToView.channel}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="text-2xl font-black text-[#1c5d4a]">{formatCurrency(transactionToView.amount)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-gray-100 flex justify-end">
              <Button onClick={() => setTransactionToView(null)} variant="outline" className="border-gray-200 text-slate-700 hover:bg-slate-100">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <Card className="flex items-center gap-3 px-5 py-4 border-l-4 border-l-[#1c5d4a] shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c5d4a]/10 text-[#1c5d4a]">
              <Check size={16} strokeWidth={3} />
            </div>
            <p className="text-sm font-bold text-slate-800">{successMessage}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
