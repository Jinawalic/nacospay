"use client";

import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Loader2,
  Palette,
  Settings2,
  ShieldCheck,
  Smartphone,
  UserCircle2,
} from 'lucide-react';
import { AdminBadge, AdminPageHeader, AdminSection, AdminStatCard } from '../admin-ui';

type ToggleKey = 'emailAlerts' | 'smsAlerts' | 'auditLog' | 'twoFactor';

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({
    adminName: 'NACOS Admin',
    adminEmail: 'admin@nacos.edu.ng',
    systemName: 'NACOS Pay Admin',
    receiptPrefix: 'NP-',
    accentColor: '#1c5d4a',
  });
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    emailAlerts: true,
    smsAlerts: false,
    auditLog: true,
    twoFactor: true,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

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

  const showToast = (message: string) => {
    setToast(message);
  };

  const handleSave = () => {
    setSaving(true);

    window.setTimeout(() => {
      setSaving(false);
      showToast('Admin settings updated successfully.');
    }, 250);
  };

  const stats = [
    {
      icon: UserCircle2,
      label: 'Profile',
      value: profile.adminName,
      hint: 'Admin identity and contact details.',
    },
    {
      icon: Bell,
      label: 'Alerts',
      value: toggles.emailAlerts ? 'Email on' : 'Email off',
      hint: 'Notifications for admin activity and payment events.',
    },
    {
      icon: ShieldCheck,
      label: 'Security',
      value: toggles.twoFactor ? '2FA enabled' : '2FA off',
      hint: 'Recommended for the primary admin account.',
    },
    {
      icon: Settings2,
      label: 'Receipt prefix',
      value: profile.receiptPrefix,
      hint: 'Applied to generated payment references and receipts.',
    },
  ];

  const toggle = (key: ToggleKey) => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="SYSTEM SETTINGS"
        title="Admin settings"
        description="Adjust identity, payment branding, security controls, and notification preferences in a clean, responsive settings workspace."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AdminSection
          eyebrow="PROFILE"
          title="Identity and branding"
          description="These values shape how the admin workspace and receipts present your team."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-600 sm:col-span-1">
              <span>Admin name</span>
              <input
                value={profile.adminName}
                onChange={(event) => setProfile((current) => ({ ...current, adminName: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#1c5d4a]"
                placeholder="Admin full name"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-600 sm:col-span-1">
              <span>Admin email</span>
              <input
                value={profile.adminEmail}
                onChange={(event) => setProfile((current) => ({ ...current, adminEmail: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#1c5d4a]"
                placeholder="admin@nacos.edu.ng"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-600 sm:col-span-2">
              <span>System name</span>
              <input
                value={profile.systemName}
                onChange={(event) => setProfile((current) => ({ ...current, systemName: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#1c5d4a]"
                placeholder="NACOS Pay Admin"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-600">
              <span>Receipt prefix</span>
              <input
                value={profile.receiptPrefix}
                onChange={(event) => setProfile((current) => ({ ...current, receiptPrefix: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#1c5d4a]"
                placeholder="NP-"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-600">
              <span>Accent color</span>
              <input
                value={profile.accentColor}
                onChange={(event) => setProfile((current) => ({ ...current, accentColor: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-[#1c5d4a]"
                placeholder="#1c5d4a"
              />
            </label>
          </div>
        </AdminSection>

        <AdminSection
          eyebrow="SECURITY"
          title="Access and notifications"
          description="Keep the admin workspace secure and make sure relevant updates reach the team."
        >
          <div className="space-y-4">
            {([
              {
                key: 'twoFactor',
                title: 'Two-factor authentication',
                description: 'Adds an extra verification step for the main admin account.',
                icon: ShieldCheck,
              },
              {
                key: 'auditLog',
                title: 'Audit log',
                description: 'Records important admin actions for review.',
                icon: Settings2,
              },
              {
                key: 'emailAlerts',
                title: 'Email alerts',
                description: 'Sends notifications for payment and student updates.',
                icon: Bell,
              },
              {
                key: 'smsAlerts',
                title: 'SMS alerts',
                description: 'Backup notification path for critical updates.',
                icon: Smartphone,
              },
            ] as const).map((item) => {
              const enabled = toggles[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggle(item.key)}
                  className={[
                    'flex w-full items-center justify-between gap-4 rounded-[1.25rem] border p-4 text-left transition-all',
                    enabled
                      ? 'border-[#1c5d4a] bg-[#1c5d4a]/5'
                      : 'border-gray-100 bg-[#f8fafc] hover:border-[#1c5d4a]/20',
                  ].join(' ')}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#1c5d4a] shadow-sm">
                      <item.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black tracking-tight text-slate-800">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.description}</p>
                    </div>
                  </div>

                  <span
                    className={[
                      'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
                      enabled ? 'bg-[#1c5d4a] text-white' : 'bg-slate-200 text-slate-600',
                    ].join(' ')}
                  >
                    {enabled ? 'On' : 'Off'}
                  </span>
                </button>
              );
            })}
          </div>
        </AdminSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminSection
          eyebrow="PAYMENT BRANDING"
          title="Receipt and payment display"
          description="These settings help standardize what students see on receipt and payment surfaces."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-[#f8fafc] p-4">
              <p className="text-sm font-bold text-slate-800">Paystack key</p>
              <p className="mt-2 break-all text-sm leading-relaxed text-slate-500">
                pk_test_***************
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-[#f8fafc] p-4">
              <p className="text-sm font-bold text-slate-800">Receipt theme</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Consistent green accent styling to match the student dashboard.
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-[#f8fafc] p-4">
              <p className="text-sm font-bold text-slate-800">Approval path</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Transactions can be reviewed and approved from the admin transactions page.
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-[#f8fafc] p-4">
              <p className="text-sm font-bold text-slate-800">Session safety</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Keep 2FA active to protect all student and payment operations.
              </p>
            </div>
          </div>
        </AdminSection>

        <AdminSection
          eyebrow="SAVE CHANGES"
          title="Review and apply settings"
          description="When you save, the current configuration is reflected in the admin workspace preview."
        >
          <div className="space-y-4">
            <div className="rounded-[1.25rem] border border-gray-100 bg-[#f8fafc] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c5d4a]/10 text-[#1c5d4a]">
                  <Palette size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Brand preview</p>
                  <p className="mt-1 text-sm text-slate-500">
                    The admin palette stays aligned with the student portal.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span
                  className="h-5 w-5 rounded-full border border-gray-200"
                  style={{ backgroundColor: profile.accentColor }}
                />
                <p className="text-sm font-medium text-slate-600">
                  Accent color set to <span className="font-bold text-slate-800">{profile.accentColor}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1c5d4a] px-5 py-4 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-80"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving settings...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Save changes
                </>
              )}
            </button>

            <div className="rounded-[1.25rem] border border-gray-100 bg-white p-4">
              <p className="text-sm font-bold text-slate-800">Admin access</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Keep the primary admin account limited to trusted personnel only.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <AdminBadge tone={toggles.twoFactor ? 'green' : 'slate'}>
                  {toggles.twoFactor ? 'Secure' : 'Review'}
                </AdminBadge>
                <AdminBadge tone={toggles.emailAlerts ? 'blue' : 'slate'}>
                  {toggles.emailAlerts ? 'Email alerts on' : 'Email alerts off'}
                </AdminBadge>
              </div>
            </div>
          </div>
        </AdminSection>
      </div>

      {isToastVisible && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl bg-[#1c5d4a] px-5 py-4 text-white shadow-[0_18px_50px_rgba(28,93,74,0.28)]">
            <CheckCircle2 size={18} />
            <p className="text-sm font-bold">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
