"use client";

import {
  ArrowRight,
  Banknote,
  ShieldCheck,
  Settings2,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import type { AdminDueItem, AdminStudent, AdminTransaction } from '@/app/admin/admin-data';
import { formatCurrency, formatDate } from '@/app/dashboard/transactions';
import {
  AdminMetricCard,
  AdminPaymentAnalyticsCard,
  AdminLevelsHighlightCard,
} from './AdminDashboardWidgets';
import { AdminTopBar } from './AdminTopBar';
import { Card } from '@/app/components/Card';
import { Check } from 'lucide-react';


type AdminOverviewDashboardProps = {
  students: AdminStudent[];
  dues: AdminDueItem[];
  transactions: AdminTransaction[];
};

export function AdminOverviewDashboard({
  students,
  dues,
  transactions,
}: AdminOverviewDashboardProps) {
  const today = formatDate(new Date().toISOString());
  const studentStats = {
    total: students.length,
    active: students.filter((student) => student.status === 'Active').length,
    pending: students.filter((student) => student.status === 'Pending').length,
  };

  const publishedDues = dues.filter((due) => due.status === 'Published').length;

  const duesRevenue = transactions.reduce((sum, t) => {
    return t.status === 'Paid' && t.type === 'Dues' ? sum + t.amount : sum;
  }, 0);

  const merchRevenue = transactions.reduce((sum, t) => {
    return t.status === 'Paid' && t.type === 'Merchandise' ? sum + t.amount : sum;
  }, 0);

  const totalRevenue = transactions.reduce((sum, t) => {
    return t.status === 'Paid' ? sum + t.amount : sum;
  }, 0);

  const paidCount = transactions.filter((transaction) => transaction.status === 'Paid').length;

  const sourceStats = [
    {
      label: 'Social Media',
      value: 9,
      color: '#2ea0ff',
    },
    {
      label: 'Website',
      value: 100,
      color: '#7b55ff',
    },
    {
      label: 'Phone Call',
      value: 100,
      color: '#b8a6e7',
    },
    {
      label: 'Mail',
      value: 100,
      color: '#89c7ff',
    },
  ];

  const performanceStats = [
    { title: 'Conversion Rate', value: '200' },
    { title: 'Average Deal', value: '120' },
    { title: 'Sales Target', value: '234' },
  ];

  const weeklyPerformance = [
    { label: 'Mon', value: 150 },
    { label: 'Tue', value: 310 },
    { label: 'Wed', value: 230 },
    { label: 'Thu', value: 210 },
    { label: 'Fri', value: 400 },
    { label: 'Sat', value: 310 },
    { label: 'Sun', value: 250 },
  ];

  const quickActions = [
    {
      href: '/admin/students',
      icon: Users,
      title: 'Add student',
      description: 'Create a single student record or import in bulk.',
    },
    {
      href: '/admin/transactions',
      icon: Banknote,
      title: 'View transactions',
      description: 'Track payment history, status, and channel.',
    },
    {
      href: '/admin/dues',
      icon: Wallet,
      title: 'Create dues',
      description: 'Set fees, amounts, and deadlines for payment.',
    },
    {
      href: '/admin/settings',
      icon: Settings2,
      title: 'Settings',
      description: 'Adjust admin preferences, security, and branding.',
    },
  ];

  return (
    <div className="space-y-8">
      <AdminTopBar
        title="Hi Admin👋"
        subtitle="Manage students, dues, transactions, and admin settings from one clean workspace."
        profileName="Admin Panel"
        profileHandle="NACOS Pay"
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <AdminMetricCard
          featured
          icon={Users}
          title="Total students"
          value={String(studentStats.total)}
        />
        <AdminMetricCard
          icon={ShieldCheck}
          title="NACOS Dues"
          value={formatCurrency(duesRevenue)}
        />
        <AdminMetricCard
          icon={Wallet}
          title="T-shirt & ID"
          value={formatCurrency(merchRevenue)}
        />
        <AdminMetricCard
          icon={TrendingUp}
          title="Total revenue"
          value={formatCurrency(totalRevenue)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[60%]">
          <AdminPaymentAnalyticsCard transactions={transactions} />
        </div>
        <div className="w-full lg:w-[40%]">
          <AdminLevelsHighlightCard students={students} />
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-slate-800">Recent Transactions</h3>
        <Card className="border-gray-200 shadow-sm rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#f8fafc]/80">
                <tr className="border-b border-gray-200 text-left text-[13px] font-semibold text-slate-500">
                  <th className="px-5 py-4 w-12">
                    <div className="flex h-5 w-5 border-gray-300 bg-white items-center justify-center rounded-[6px] border"></div>
                  </th>
                  <th className="px-5 py-4 whitespace-nowrap">Transaction ID</th>
                  <th className="px-5 py-4 whitespace-nowrap">Student Name</th>
                  <th className="px-5 py-4 whitespace-nowrap">Type</th>
                  <th className="px-5 py-4 whitespace-nowrap">Date</th>
                  <th className="px-5 py-4 whitespace-nowrap">Amount</th>
                  <th className="px-5 py-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((transaction) => {
                  return (
                    <tr key={transaction.id} className="border-b border-gray-100 last:border-none hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex h-5 w-5 items-center justify-center rounded-[6px] border border-gray-300 bg-white"></div>
                      </td>
                      <td className="px-5 py-4 text-[13px] font-bold text-[#1c5d4a] whitespace-nowrap">
                        {transaction.reference}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                        {transaction.student}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-slate-600 whitespace-nowrap">
                        {transaction.type}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-medium text-slate-600 whitespace-nowrap">
                        {formatDate(transaction.dateISO)}
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
                    </tr>
                  )
                })}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-sm font-medium text-slate-500">
                      No recent transactions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
