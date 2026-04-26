"use client";

import React, { useEffect, useState } from 'react';
import { AdminOverviewDashboard } from '../components/admin/AdminOverviewDashboard';
import { Loader2 } from 'lucide-react';

export default function AdminOverviewPage() {
  const [data, setData] = useState<{
    students: any[];
    dues: any[];
    transactions: any[];
    admin: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, duesRes, transactionsRes, adminRes] = await Promise.all([
          fetch('/api/admin/students'),
          fetch('/api/admin/dues'),
          fetch('/api/admin/transactions'),
          fetch('/api/admin/me')
        ]);

        if (studentsRes.ok && duesRes.ok && transactionsRes.ok && adminRes.ok) {
          const [students, dues, transactions, admin] = await Promise.all([
            studentsRes.json(),
            duesRes.json(),
            transactionsRes.json(),
            adminRes.json()
          ]);
          setData({ students, dues, transactions, admin });
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#1c5d4a]" />
        <p className="text-sm font-bold text-slate-500">Initializing dashboard...</p>
      </div>
    );
  }

  return (
    <AdminOverviewDashboard
      students={data.students}
      dues={data.dues}
      transactions={data.transactions}
      admin={data.admin}
    />
  );
}
