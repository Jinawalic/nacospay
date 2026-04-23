"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Eye, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { Card } from '@/app/components/Card';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/admin');
    }, 1500);
  };

  return (
    <main className="min-h-screen w-full bg-[#f8fafc] flex flex-col font-sans lg:overflow-hidden overflow-auto">
      {/* HEADER BAR (Visible on Mobile, Hidden on Desktop Split) */}
      <header className="lg:hidden w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6">
            <Image
              src="/nacos_logo.png"
              alt="Logo"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">NACOS<span className="text-[#1c5d4a]">P</span>AY <span className="font-light">ADMIN</span></span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row h-full">
        {/* LEFT SIDE: BRANDING SECTION (Desktop Only) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-start p-14 bg-[#1c5d4a] text-white relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white px-20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg">
            <div className="flex items-center gap-4 mb-20 animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="bg-white p-3 rounded-full">
                <Image
                  src="/nacos_logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                NACOS PAY <span className="font-light tracking-wide opacity-80">ADMIN</span>
              </h1>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
              Manage transactions & <br />
              student records <span className="text-green-300">securely</span>.
            </h2>

            <Card className="!bg-white/10 border-white/20 !rounded-[2rem] p-8 backdrop-blur-md mb-10 text-white animate-in fade-in slide-in-from-bottom-5 duration-500 delay-200 fill-mode-both">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-xl shrink-0">
                  <ShieldCheck size={28} className="text-green-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Administrator Access</h3>
                  <p className="text-[15px] leading-relaxed font-light opacity-90">
                    This portal is restricted to authorized administrative personnel only. All access and actions are strictly monitored and logged for security purposes.
                  </p>
                </div>
              </div>
            </Card>

            <p className="text-sm font-medium tracking-wide opacity-50 mt-10 animate-in fade-in duration-500 delay-300 fill-mode-both">
              © 2026 NACOS. Secure Admin Portal.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative bg-white lg:bg-[#f8fafc]">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-800">Welcome back</h2>
              <p className="text-slate-500 mt-2 font-medium">Log in to the administrative console.</p>
            </div>

            <Card className="p-8 lg:p-10 !rounded-3xl border-gray-100 bg-white">
              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@nacos.edu.ng"
                  icon={<Mail size={20} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!rounded-2xl h-14 bg-slate-50 border-gray-200 focus:border-[#1c5d4a] focus:bg-white text-[15px]"
                  required
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter admin password"
                    icon={<Lock size={20} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="!rounded-2xl h-14 bg-slate-50 border-gray-200 focus:border-[#1c5d4a] focus:bg-white text-[15px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-[44px] text-gray-400 hover:text-[#1c5d4a] transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1c5d4a] focus:ring-[#1c5d4a]" />
                      <span className="text-sm font-medium text-slate-500 group-hover:text-slate-800 transition-colors">Remember me</span>
                    </label>
                    <button type="button" className="text-sm font-bold text-[#1c5d4a] hover:underline">
                      Recover access
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    fullWidth
                    disabled={isLoading}
                    className="!rounded-2xl py-4 text-[16px] font-bold group bg-[#1c5d4a] hover:bg-[#154638]"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center justify-center">
                        Authenticate Access
                        <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
