"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, CheckCircle2, Loader2, UserCircle2 } from 'lucide-react';
import { Card } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';

export default function AdminSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [profile, setProfile] = useState({
    name: 'Samuel Caron',
    email: 'samuelcaron@delivermeat.co.uk',
    phone: '123 456 7788',
  });
  
  const [form, setForm] = useState({ ...profile });
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setProfile({ ...form });
      setSaving(false);
      setIsEditing(false);
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  return (
    <div className="w-full max-w-5xl space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Profile Sidebar */}
        <div className="w-full md:w-[300px] flex-shrink-0">
          <Card className="p-8 flex flex-col items-center justify-center text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-white">
            <div className="w-[120px] h-[120px] rounded-full bg-slate-200 mb-6 overflow-hidden relative shadow-sm">
              {/* Replace with actual image later if needed, using user icon placeholder based on image theme */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
                <UserCircle2 size={80} strokeWidth={1} />
              </div>
            </div>
            <h2 className="text-[22px] font-bold text-slate-900 mb-3 tracking-tight">{profile.name}</h2>
            <div className="flex items-center gap-2 text-slate-500 bg-white">
              <Mail size={15} />
              <span className="text-sm font-medium">{profile.email}</span>
            </div>
          </Card>
        </div>

        {/* Right Details Panel */}
        <div className="flex-1 w-full relative">
          <Card className="px-8 py-8 md:px-10 md:py-10 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-white min-h-[460px]">
            {!isEditing ? (
              <div className="animate-in fade-in duration-200">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-[17px] font-semibold text-slate-400 tracking-wide mt-1">User Information</h3>
                  <Button 
                    onClick={() => { setForm({ ...profile }); setIsEditing(true); }}
                    className="bg-[#1c5d4a] hover:bg-[#154638] text-white px-7 py-2.5 rounded-md font-bold text-sm shadow-sm transition-all"
                  >
                    Edit Profile
                  </Button>
                </div>

                <div className="space-y-6 mb-12">
                  <div>
                    <p className="text-[15px] font-bold text-slate-900 mb-0.5">Name</p>
                    <p className="text-[15px] text-slate-600 font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-900 mb-0.5">Email</p>
                    <p className="text-[15px] text-slate-600 font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-900 mb-0.5">Phone</p>
                    <p className="text-[15px] text-slate-600 font-medium">{profile.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[17px] font-semibold text-slate-400 tracking-wide mb-5">Password</h3>
                  <div>
                    <p className="text-[15px] font-bold text-slate-900 mb-1">Password</p>
                    <div className="flex items-center gap-2 text-[15px] text-slate-700 font-medium">
                      <div className="bg-[#1c5d4a] rounded-full p-[2px] flex items-center justify-center">
                         <CheckCircle2 size={13} strokeWidth={4} className="text-white" />
                      </div>
                      Password has been set
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="animate-in fade-in duration-200 block w-full max-w-[500px]">
                <h3 className="text-[17px] font-semibold text-slate-400 tracking-wide mb-6">User Information</h3>
                
                <div className="space-y-5 mb-10 hidden-label-form">
                  <div className="space-y-1.5 flex flex-col">
                    <p className="text-[14px] font-bold text-slate-900 mb-0">Name</p>
                    <Input 
                      label=""
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="!rounded-md h-11 border-gray-200 bg-white placeholder:text-gray-400 focus:border-[#1c5d4a] !p-0 !px-4 text-[14px]"
                      placeholder="Name"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <p className="text-[14px] font-bold text-slate-900 mb-0">Email</p>
                    <Input 
                      label=""
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({...form, email: e.target.value})}
                      className="!rounded-md h-11 border-gray-200 bg-white placeholder:text-gray-400 focus:border-[#1c5d4a] !p-0 !px-4 text-[14px]"
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <p className="text-[14px] font-bold text-slate-900 mb-0">Phone</p>
                    <Input 
                      label=""
                      type="text"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                      className="!rounded-md h-11 border-gray-200 bg-white placeholder:text-gray-400 focus:border-[#1c5d4a] !p-0 !px-4 text-[14px]"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <h3 className="text-[17px] font-semibold text-slate-400 tracking-wide mb-6">Password</h3>
                <div className="space-y-5 mb-8 hidden-label-form">
                  <div className="space-y-1.5 flex flex-col">
                    <p className="text-[14px] font-bold text-slate-900 mb-0">Current Password</p>
                    <Input 
                      label=""
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      className="!rounded-md h-11 border-gray-200 bg-white placeholder:text-gray-300 focus:border-[#1c5d4a] !p-0 !px-4 text-[14px]"
                      placeholder="****************"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <p className="text-[14px] font-bold text-slate-900 mb-0">New Password</p>
                    <Input 
                      label=""
                      type="password"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({...passwords, newPass: e.target.value})}
                      className="!rounded-md h-11 border-gray-200 bg-white placeholder:text-gray-300 focus:border-[#1c5d4a] !p-0 !px-4 text-[14px]"
                      placeholder="****************"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <p className="text-[14px] font-bold text-slate-900 mb-0">Confirm New Password</p>
                    <Input 
                      label=""
                      type="password"
                      value={passwords.confirmPass}
                      onChange={(e) => setPasswords({...passwords, confirmPass: e.target.value})}
                      className="!rounded-md h-11 border-gray-200 bg-white placeholder:text-gray-300 focus:border-[#1c5d4a] !p-0 !px-4 text-[14px]"
                      placeholder="****************"
                    />
                  </div>
                </div>

                <div className="flex justify-start">
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="bg-[#1c5d4a] hover:bg-[#154638] text-white px-9 rounded-full font-bold h-11 shadow-md transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>

      {successMessage && (
        <div className="fixed bottom-6 right-6 z-[80]">
          <Card className="flex items-center gap-3 px-5 py-4 border-l-4 border-l-[#1c5d4a] shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c5d4a]/10 text-[#1c5d4a]">
              <CheckCircle2 size={16} strokeWidth={3} />
            </div>
            <p className="text-sm font-bold text-slate-800">{successMessage}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
