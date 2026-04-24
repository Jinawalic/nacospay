"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Download,
  Edit2,
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Upload,
  UploadCloud,
  X,
  Loader2,
} from 'lucide-react';
import { adminStudentsSeed, type AdminStudent } from '../admin-data';
import { formatDate } from '../../dashboard/transactions';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Input } from '@/app/components/Input';

type StatusFilter = 'All' | AdminStudent['status'];

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>(adminStudentsSeed);
  const [levelFilter, setLevelFilter] = useState<string>('All');

  // Modals state
  const [studentToEdit, setStudentToEdit] = useState<AdminStudent | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<AdminStudent | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Creation Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await fetch('/api/admin/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    matricNo: '',
    department: '',
    level: '100L',
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, levelFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        search.trim().length === 0 ||
        [student.name, student.matricNo, student.email, student.department, student.level]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ? true : student.status === statusFilter;

      const matchesLevel =
        levelFilter === 'All' ? true : student.level === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [search, statusFilter, levelFilter, students]);

  const [pageSize, setPageSize] = useState(10);
  const MathMax = Math.max;
  const MathMin = Math.min;
  const totalPages = MathMax(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = MathMin(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const paginatedStudents = filteredStudents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map(t => t.id));
    }
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      setSaving(true);
      try {
        const response = await fetch(`/api/admin/students/${studentToDelete.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchStudents();
          setSuccessMessage('Student record has been deleted successfully!');
          setStudentToDelete(null);
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } catch (error) {
        console.error('Error deleting student:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const confirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentToEdit) {
      setSaving(true);
      try {
        const response = await fetch(`/api/admin/students/${studentToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentToEdit),
        });

        if (response.ok) {
          await fetchStudents();
          setSuccessMessage('Student record has been updated successfully!');
          setStudentToEdit(null);
          setTimeout(() => setSuccessMessage(''), 5000);
        }
      } catch (error) {
        console.error('Error updating student:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      if (response.ok) {
        await fetchStudents();
        setIsAddModalOpen(false);
        setAddForm({ name: '', email: '', matricNo: '', department: '', level: '100L' });
        setSuccessMessage('Student record has been created successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Simulation: in a real app, you'd parse CSV/Excel here. 
    // We'll simulate bulk data based on a fixed set for demo purposes.
    const dummyBulk = [
      { name: 'Bulk Student 1', email: 'bulk1@nacos.edu.ng', matricNo: `NACOS/BULK/${Date.now()}-1`, department: 'Computer Science', level: '100L' },
      { name: 'Bulk Student 2', email: 'bulk2@nacos.edu.ng', matricNo: `NACOS/BULK/${Date.now()}-2`, department: 'Software Engineering', level: '200L' },
    ];

    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyBulk),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchStudents();
        setIsBulkModalOpen(false);
        setSuccessMessage(`${data.count || 2} students have been imported successfully!`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error with bulk upload:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all your student records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsBulkModalOpen(true)} className="gap-2 border-gray-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-4 py-2 shadow-sm">
            <Upload size={16} />
            Bulk Upload
          </Button>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-2 bg-[#1c5d4a] hover:bg-[#154638] text-white rounded-xl px-4 py-2 shadow-sm">
            <Plus size={16} />
            Add Single Student
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md hidden-label-form">
          <Input
            label=""
            icon={<Search size={18} />}
            placeholder="Search for Students"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-gray-200 focus:border-[#1c5d4a] focus:ring-[#1c5d4a]"
            style={{ marginTop: '-24px' }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-gray-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl px-4 py-2 shadow-sm">
            <Download size={16} />
            Export
          </Button>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="border border-gray-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl px-4 py-2.5 shadow-sm text-sm font-medium focus:outline-none focus:border-[#1c5d4a]"
          >
            <option value="All">All Levels</option>
            <option value="100L">100L</option>
            <option value="200L">200L</option>
            <option value="300L">300L</option>
            <option value="400L">400L</option>
            <option value="500L">500L</option>
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
                    className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-[6px] border transition-colors ${paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length
                      ? 'border-[#1c5d4a] bg-[#1c5d4a]'
                      : 'border-gray-300 bg-white hover:border-[#1c5d4a]'
                      }`}
                  >
                    {paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length && (
                      <Check size={14} strokeWidth={3} className="text-white" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap">Student Name</th>
                <th className="px-5 py-4 whitespace-nowrap">Matric. No</th>
                <th className="px-5 py-4 whitespace-nowrap">Department</th>
                <th className="px-5 py-4 whitespace-nowrap">Level</th>
                <th className="px-5 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-[#1c5d4a]" size={32} />
                      <p className="text-sm font-medium text-slate-500">Retrieving student records...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-20 text-center">
                    <p className="text-sm font-medium text-slate-500">No student records found.</p>
                  </td>
                </tr>
              ) : paginatedStudents.map((student) => {
                const isChecked = selectedIds.includes(student.id);
                return (
                  <tr key={student.id} className="border-b border-gray-100 last:border-none hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div
                        onClick={() => toggleSelect(student.id)}
                        className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-[6px] border transition-colors ${isChecked
                          ? 'border-[#1c5d4a] bg-[#1c5d4a]'
                          : 'border-gray-300 bg-white hover:border-[#1c5d4a]'
                          }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} className="text-white" />}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] font-bold text-[#1c5d4a] whitespace-nowrap">
                      {student.name}
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                      {student.matricNo}
                    </td>
                    <td className="px-5 py-4 text-[13px] font-medium text-slate-600 whitespace-nowrap">
                      {student.department}
                    </td>
                    <td className="px-5 py-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                      {student.level}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setStudentToEdit(student)} className="text-slate-400 hover:text-[#1c5d4a] transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => setStudentToDelete(student)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm font-medium text-slate-500">
                    No students match your criteria.
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
            <p className="ml-4 text-xs font-semibold text-slate-500">
              Total {students.length} students
            </p>
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

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900">Delete Student</h3>
            <p className="mt-2 text-sm text-slate-500">
              Are you sure you want to delete <strong>{studentToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" disabled={saving} onClick={() => setStudentToDelete(null)}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" disabled={saving} onClick={confirmDelete}>
                {saving ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Student Modal */}
      {studentToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-slate-900">Edit Student</h3>
              <button onClick={() => setStudentToEdit(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={confirmEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Student Name"
                  value={studentToEdit.name}
                  onChange={(e) => setStudentToEdit({ ...studentToEdit, name: e.target.value })}
                  required
                />
                <Input
                  label="Matric Number"
                  value={studentToEdit.matricNo}
                  onChange={(e) => setStudentToEdit({ ...studentToEdit, matricNo: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={studentToEdit.email}
                  onChange={(e) => setStudentToEdit({ ...studentToEdit, email: e.target.value })}
                  required
                />
                <Input
                  label="Login Password"
                  type="text"
                  placeholder="Reset to 12345678"
                  value={studentToEdit.password || ''}
                  onChange={(e) => setStudentToEdit({ ...studentToEdit, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Department"
                  value={studentToEdit.department}
                  onChange={(e) => setStudentToEdit({ ...studentToEdit, department: e.target.value })}
                  required
                />
                <div className="w-full flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Level</label>
                  <select
                    value={studentToEdit.level}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, level: e.target.value })}
                    className="w-full bg-gray-100 rounded-sm px-4 py-3 text-gray-900 border-none focus:ring-0 focus:outline-[#1c5d4a]"
                  >
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                    <option value="500L">500L</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" disabled={saving} onClick={() => setStudentToEdit(null)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving} className="bg-[#1c5d4a] hover:bg-[#154638]">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}



      {/* Add Single Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Add New Student</h3>
              <button disabled={saving} onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Full Name</span>
                  <input
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="e.g. Jinawa Titus"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="student@nacos.edu.ng"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Matric Number</span>
                  <input
                    value={addForm.matricNo}
                    onChange={(e) => setAddForm({ ...addForm, matricNo: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="NACOS/CS/24/001"
                    required
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-600">
                  <span>Department</span>
                  <input
                    value={addForm.department}
                    onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#1c5d4a]"
                    placeholder="Computer Science"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-600 flex flex-col justify-end">
                  <span className="mb-2">Level</span>
                  <select
                    value={addForm.level}
                    onChange={(e) => setAddForm({ ...addForm, level: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all h-[46px] focus:border-[#1c5d4a]"
                  >
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                    <option value="500L">500L</option>
                  </select>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <Button type="button" disabled={saving} onClick={() => setIsAddModalOpen(false)} variant="ghost" className="text-slate-600 hover:text-slate-900">
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
                      Saving User...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">Bulk Upload</h3>
              <button disabled={saving} onClick={() => setIsBulkModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-6">
              <div className="w-full flex-col flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-slate-50/50 p-8 text-center transition-colors hover:border-[#1c5d4a]/50 hover:bg-[#1c5d4a]/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1c5d4a]/10 text-[#1c5d4a] mb-4">
                  <UploadCloud size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Click to upload or drag and drop</h4>
                <p className="mt-1 text-xs text-slate-500">CSV or Excel files only (max. 5MB)</p>
                <input type="file" accept=".csv, .xlsx, .xls" className="hidden" id="file-upload" />
                <label
                  htmlFor="file-upload"
                  className="mt-4 cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Select File
                </label>
              </div>

              <div className="flex flex-col gap-2 rounded-xl bg-blue-50/50 p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                  <FileSpreadsheet size={16} className="text-blue-600" />
                  Format Requirements
                </div>
                <p className="text-xs text-blue-700/80 leading-relaxed">
                  Your file must include the following column headers: <strong>Name, Email, MatricNo, Department, Level</strong>. Download our <a href="#" className="underline font-bold text-blue-600">template file</a> for reference.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <Button type="button" disabled={saving} onClick={() => setIsBulkModalOpen(false)} variant="ghost" className="text-slate-600 hover:text-slate-900">
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Import Students
                    </>
                  )}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* Real Success Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${successMessage ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <Card className="flex items-center gap-4 py-4 px-6 !rounded-2xl border-0 bg-[#1c5d4a] text-white shadow-[0_20px_50px_rgba(28,93,74,0.3)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Check size={20} strokeWidth={3} />
          </div>
          <div className="pr-2">
            <p className="text-[15px] font-bold">Action Completed</p>
            <p className="text-sm font-medium text-white/80">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage('')} className="ml-2 h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} />
          </button>
        </Card>
      </div>

    </div>
  );
}
