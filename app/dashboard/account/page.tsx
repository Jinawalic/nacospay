"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  HelpCircle,
  IdCard,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';

type ModalState = 'security' | 'coming-soon' | null;

export default function AccountPage() {
  const router = useRouter();
  const toastTimer = useRef<number | null>(null);
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [comingSoonLabel, setComingSoonLabel] = useState('Coming soon.');
  const [student, setStudent] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch('/api/student/me');
        if (response.ok) {
          const data = await response.json();
          setStudent(data);
          localStorage.setItem('nacos_student', JSON.stringify(data));
        } else {
          // Fallback to localStorage if API fails
          const stored = localStorage.getItem('nacos_student');
          if (stored) {
            setStudent(JSON.parse(stored));
          }
        }
      } catch (e) {
        const stored = localStorage.getItem('nacos_student');
        if (stored) {
          setStudent(JSON.parse(stored));
        }
      }
    };

    fetchStudent();

    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const accountStats = [
    { label: 'Wallet Balance', value: `NGN ${student?.balance?.toLocaleString() || '0.00'}`, icon: Wallet, tone: 'bg-[#1c5d4a]/10 text-[#1c5d4a]' },
    { label: 'Payments Made', value: student?.transactions?.length?.toString() || '0', icon: CreditCard, tone: 'bg-[#154638]/10 text-[#154638]' },
    { label: 'Membership', value: student?.status || 'Active', icon: BadgeCheck, tone: 'bg-slate-100 text-slate-600' },
    { label: 'Session', value: '2024 / 2025', icon: Globe, tone: 'bg-[#1c5d4a]/5 text-[#1c5d4a]' },
  ];

  const menuItems = [
    {
      label: 'Security Settings',
      description: 'Update password and account protection.',
      icon: ShieldCheck,
      action: 'security' as const,
    },
    {
      label: 'Payment Methods',
      description: 'Manage the card connected to your account.',
      icon: CreditCard,
      action: 'coming-soon' as const,
    },
    {
      label: 'Notifications',
      description: 'Control balance and payment alerts.',
      icon: Bell,
      action: 'coming-soon' as const,
    },
    {
      label: 'Help & Support',
      description: 'Get help with payment issues and profile access.',
      icon: HelpCircle,
      action: 'coming-soon' as const,
    },
  ];

  const openSecurityModal = () => {
    setActiveModal('security');
  };

  const openComingSoonModal = (label: string) => {
    setComingSoonLabel(`${label} is coming soon.`);
    setActiveModal('coming-soon');
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalError('');
  };

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

  const handleSignOut = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('nacos_student');
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      router.push('/');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setModalError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setModalError('New password must be at least 6 characters.');
      return;
    }

    setIsUpdating(true);
    setModalError('');

    try {
      const response = await fetch('/api/student/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password updated! Returning to dashboard...');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          closeModal();
          router.push('/dashboard');
        }, 1500);
      } else {
        setModalError(data.error || 'Failed to update password.');
      }
    } catch (error) {
      setModalError('A network error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-8 lg:px-10 lg:py-10">
      <section className="flex items-center justify-between gap-4">
        <div>
          <h1 className="mt-2 text-xl font-bold text-slate-800">My Profile</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Manage your student profile, wallet access, and preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-700 transition-transform active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
      </section>

      <section className="grid gap-2 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-xl bg-white p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-13 w-13 rounded-full items-center justify-center rounded-2xl bg-[#1c5d4a] text-white">
                <User size={32} strokeWidth={2.2} />
              </div>

              <div>
                <h2 className="mt-1 text-xl font-bold text-slate-800">{student?.name || 'Student'}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">NACOS Member since {student?.joined ? new Date(student.joined).getFullYear() : '2024'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <IdCard className="text-[#1c5d4a]" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400">MATRICULATION NUMBER</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{student?.matricNo || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <MapPin className="text-[#1c5d4a]" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400">DEPARTMENT</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{student?.department || 'Computer Science'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <Phone className="text-[#1c5d4a]" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400">PHONE</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{student?.phone || '+234 810 555 0194'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center gap-3">
                <Mail className="text-[#1c5d4a]" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-slate-400">EMAIL</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{student?.email || 'student@nacos.edu.ng'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">

          <Card className="rounded-xl bg-white p-3">
            <p className="text-[10px] font-bold text-slate-400">ACCOUNT MENU</p>
            <div className="mt-4 space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.action === 'security') {
                      openSecurityModal();
                      return;
                    }

                    openComingSoonModal(item.label);
                  }}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-[#f8fafc] p-4 text-left transition-all hover:border-[#1c5d4a]/20 hover:bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a]">
                      <item.icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black tracking-tight text-slate-800">{item.label}</p>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={16} className="shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="!rounded-2xl !border-gray-200 !text-red-500 lg:hidden"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </section>

      {/* Security Modal */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <button
            type="button"
            aria-label="Close security modal"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#1c5d4a]">SECURITY SETTINGS</p>
                <h2 className="mt-2 text-xl font-bold text-slate-800">Change Password</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                  Update your login password to keep your account secure.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-700"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password"
                icon={<LockKeyhole size={18} />}
                className="!rounded-xl !bg-gray-100"
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
                icon={<KeyRound size={18} />}
                className="!rounded-xl !bg-gray-100"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                icon={<KeyRound size={18} />}
                className="!rounded-xl !bg-gray-100"
              />
            </div>
            
            {modalError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-500 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle size={14} />
                <p>{modalError}</p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isUpdating}
                className="flex-1 !rounded-2xl !border-gray-200 "
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isUpdating}
                className="flex-1 !rounded-2xl !bg-[#1c5d4a] !text-white"
                onClick={handlePasswordUpdate}
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {activeModal === 'coming-soon' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4">
          <button
            type="button"
            aria-label="Close coming soon modal"
            onClick={closeModal}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-800">Coming soon.</h2>
            <p className="mt-2 text-sm text-slate-500">{comingSoonLabel}</p>

            <button
              type="button"
              onClick={closeModal}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1c5d4a] px-5 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isToastVisible && (
        <div className="fixed top-6 right-6 z-[70] animate-in slide-in-from-right-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-[#1c5d4a] px-5 py-4 text-white shadow-[0_18px_50px_rgba(28,93,74,0.28)]">
            <CheckCircle2 size={20} />
            <p className="text-sm font-bold">{toastMessage}</p>
          </div>
        </div>
      )}
    </main>
  );
}
