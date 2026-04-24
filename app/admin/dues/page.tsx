"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { adminDueSeed, type AdminDueItem } from '../admin-data';
import { formatCurrency } from '../../dashboard/transactions';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';

type DueStatus = AdminDueItem['status'];

const blankDueForm = {
  title: '',
  audience: 'All Levels',
  amount: '5000',
  session: '2024/2025',
  status: 'Published' as DueStatus,
  description: '',
  sizes: '',
};

function buildDueId() {
  return `due-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AdminDuesPage() {
  const [dues, setDues] = useState<AdminDueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState(blankDueForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Table state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [dueToEdit, setDueToEdit] = useState<AdminDueItem | null>(null);
  const [dueToDelete, setDueToDelete] = useState<AdminDueItem | null>(null);

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/dues');
      if (res.ok) {
        const data = await res.json();
        setDues(data);
      }
    } catch (error) {
      console.error('Failed to fetch dues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: number | undefined;

    if (toast) {
      setIsToastVisible(true);
      timer = window.setTimeout(() => {
        setIsToastVisible(false);
        setToast('');
      }, 2600);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [toast]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredDues = useMemo(() => {
    return dues.filter((due) => {
      const matchesSearch = search.trim().length === 0 ||
        [due.title, due.audience, due.session].join(' ').toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [search, dues]);

  const [pageSize, setPageSize] = useState(10);
  const MathMax = Math.max;
  const MathMin = Math.min;
  const totalPages = MathMax(1, Math.ceil(filteredDues.length / pageSize));
  const safePage = MathMin(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const paginatedDues = filteredDues.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const showToast = (message: string) => {
    setToast(message);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/dues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title.trim(),
          audience: form.audience.trim(),
          amount: Number(form.amount),
          session: form.session.trim(),
          description: form.description.trim(),
          status: form.status,
        }),
      });

      if (res.ok) {
        const newDue = await res.json();
        setDues((current) => [newDue, ...current]);
        setForm(blankDueForm);
        setIsCreateModalOpen(false);
        showToast(`${newDue.title} created successfully.`);
      } else {
        showToast('Failed to create due');
      }
    } catch (error) {
      console.error(error);
      showToast('Error creating due');
    } finally {
      setSaving(false);
    }
  };

  const confirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueToEdit) return;

    try {
      const res = await fetch(`/api/admin/dues/${dueToEdit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dueToEdit),
      });

      if (res.ok) {
        const updatedDue = await res.json();
        setDues(prev => prev.map(d => d.id === updatedDue.id ? updatedDue : d));
        setDueToEdit(null);
        showToast('Due updated successfully!');
      } else {
        showToast('Failed to update due');
      }
    } catch (error) {
      console.error(error);
      showToast('Error updating due');
    }
  };

  const confirmDelete = async () => {
    if (!dueToDelete) return;

    try {
      const res = await fetch(`/api/admin/dues/${dueToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDues(prev => prev.filter(d => d.id !== dueToDelete.id));
        setDueToDelete(null);
        showToast('Due deleted successfully!');
      } else {
        showToast('Failed to delete due');
      }
    } catch (error) {
      console.error(error);
      showToast('Error deleting due');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-2 mt-4">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">Manage Dues</h3>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-[#1c5d4a] hover:bg-[#154638] text-white rounded-xl px-4 py-2 shadow-sm">
          <Plus size={16} />
          Create Due
        </Button>
      </div>

      <div className="mt-6 w-full sm:max-w-md hidden-label-form">
        <Input
          label=""
          icon={<Search size={18} />}
          placeholder="Search for Dues"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-gray-200 focus:border-[#1c5d4a] focus:ring-[#1c5d4a]"
          style={{ marginTop: '-24px' }}
        />
      </div>

      <Card className="border-gray-200 shadow-sm rounded-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#f8fafc]/80">
              <tr className="border-b border-gray-200 text-left text-[13px] font-semibold text-slate-500">
                <th className="px-5 py-4 w-12">
                  <div className="flex h-5 w-5 items-center justify-center rounded-[6px] border border-gray-300 bg-white"></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap">Title</th>
                <th className="px-5 py-4 whitespace-nowrap">Level</th>
                <th className="px-5 py-4 whitespace-nowrap">Amount</th>
                <th className="px-5 py-4 whitespace-nowrap">Status</th>
                <th className="px-5 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDues.map((due) => (
                <tr key={due.id} className="border-b border-gray-100 last:border-none hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex h-5 w-5 items-center justify-center rounded-[6px] border border-gray-300 bg-white"></div>
                  </td>
                  <td className="px-5 py-4 text-[13px] font-bold text-[#1c5d4a] whitespace-nowrap">
                    {due.title}
                  </td>
                  <td className="px-5 py-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                    {due.audience}
                  </td>
                  <td className="px-5 py-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                    {formatCurrency(due.amount)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${due.status === 'Published'
                      ? 'bg-[#1c5d4a]/10 text-[#1c5d4a]'
                      : 'bg-slate-100 text-slate-600'
                      }`}>
                      {due.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setDueToEdit(due)} className="text-slate-400 hover:text-[#1c5d4a] transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDueToDelete(due)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedDues.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm font-medium text-slate-500">
                    No dues match your criteria.
                  </td>
                </tr>
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


      {isToastVisible && (
        <div className="fixed bottom-6 right-6 z-[80]">
          <Card className="flex items-center gap-3 px-5 py-4 border-l-4 border-l-[#1c5d4a] shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c5d4a]/10 text-[#1c5d4a]">
              <CheckCircle2 size={16} strokeWidth={3} />
            </div>
            <p className="text-sm font-bold text-slate-800">{toast}</p>
          </Card>
        </div>
      )}

      {/* Create Due Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Create New Due</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="NACOS Annual Dues"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Level</span>
                  <select
                    value={form.audience}
                    onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    required
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="5000"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600 flex flex-col justify-end">
                  <span className="mb-2">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as DueStatus }))}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all h-[46px] focus:border-[#1c5d4a]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-600 block">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                  placeholder="Explain what the due covers and any important notes."
                />
              </label>

              {/t-shirt|tshirt|shirt|merch|merchandise/i.test(form.title) && (
                <label className="space-y-2 text-sm font-medium text-slate-600 block">
                  <span>Available Sizes (Comma separated)</span>
                  <input
                    value={form.sizes}
                    onChange={(event) => setForm((current) => ({ ...current, sizes: event.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="S, M, L, XL, XXL"
                  />
                </label>
              )}

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <Button type="button" onClick={() => setIsCreateModalOpen(false)} variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c5d4a] px-5 py-2.5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-80 shadow-md hover:bg-[#154638]"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving due...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Publish Due
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Due Modal */}
      {dueToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Edit Due</h3>
              <button onClick={() => setDueToEdit(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={confirmEdit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Title</span>
                  <input
                    value={dueToEdit.title}
                    onChange={(event) => setDueToEdit((current) => current ? { ...current, title: event.target.value } : null)}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Level</span>
                  <select
                    value={dueToEdit.audience}
                    onChange={(event) => setDueToEdit((current) => current ? { ...current, audience: event.target.value } : null)}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    required
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                    <option value="500L">500L</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    value={dueToEdit.amount}
                    onChange={(event) => setDueToEdit((current) => current ? { ...current, amount: Number(event.target.value) } : null)}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600 flex flex-col justify-end">
                  <span className="mb-2">Status</span>
                  <select
                    value={dueToEdit.status}
                    onChange={(event) => setDueToEdit((current) => current ? { ...current, status: event.target.value as DueStatus } : null)}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all h-[46px] focus:border-[#1c5d4a]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-600 block">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={dueToEdit.description}
                  onChange={(event) => setDueToEdit((current) => current ? { ...current, description: event.target.value } : null)}
                  className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                />
              </label>

              {/t-shirt|tshirt|shirt|merch|merchandise/i.test(dueToEdit.title) && (
                <label className="space-y-2 text-sm font-medium text-slate-600 block">
                  <span>Available Sizes (Comma separated)</span>
                  <input
                    value={dueToEdit.sizes || ''}
                    onChange={(event) => setDueToEdit((current) => current ? { ...current, sizes: event.target.value } : null)}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="S, M, L, XL, XXL"
                  />
                </label>
              )}

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <Button type="button" onClick={() => setDueToEdit(null)} variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Cancel
                </Button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c5d4a] px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md hover:bg-[#154638]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {dueToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900">Delete Due</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to delete <strong>{dueToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDueToDelete(null)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmDelete}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
