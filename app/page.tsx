"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, Eye, Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Card } from './components/Card';

export default function Login() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation: check if password is "password" (default) or just trigger for demo
    setTimeout(() => {
      setIsLoading(false);
      if (password === 'password') {
        setShowFirstLoginModal(true);
      } else {
        router.push('/dashboard');
      }
    }, 1500);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChanging(true);
    setTimeout(() => {
      setIsChanging(false);
      setShowFirstLoginModal(false);
      router.push('/dashboard');
    }, 1500);
  };

  const features = [
    "Secure access to your student profile and payments",
    "Pay your departmental dues and school fees instantly",
    "Generate and print your payment receipts for clearance",
    "Check your registration and payment status 24/7",
    "Fast, secure and reliable student portal integration"
  ];

  return (
    <main className="h-screen w-full bg-[#f8fafc] flex flex-col font-sans lg:overflow-hidden overflow-auto">
      {/* HEADER BAR (Visible on Mobile, Hidden on Desktop Split) */}
      <header className="lg:hidden w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shadow-sm z-50">
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
          <span className="text-xl font-bold text-gray-800 tracking-tight">NACOS<span className='text-nacos'>P</span>AY</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row h-full">
        {/* LEFT SIDE: LOGIN FORM */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
          <div className="w-full max-w-md">
            {/* Desktop Brand Header */}

            <Card className="p-8 lg:p-12 !rounded-xl border-gray-50 bg-white">
              <form onSubmit={handleLogin} className="space-y-8">
                <Input
                  label="Matriculation Number"
                  placeholder="e.g 2023/123456"
                  icon={<User size={20} />}
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="!rounded-2xl text"
                  required
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    icon={<Lock size={20} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="!rounded-2xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-[50px] text-gray-400 hover:text-nacos transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                  <div className="flex justify-end mt-2">
                    <button type="button" className="text-sm font-bold text-nacos hover:underline">
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  disabled={isLoading}
                  className="!rounded-2xl py-3 text-lg font-bold group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Access Portal
                      <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-sm font-semibold text-gray-500">
                  Not registered yet? <button className="text-nacos font-bold hover:underline">Contact Excos</button>
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT SIDE: BRANDING SECTION (Desktop Only) */}
        <div className="hidden lg:flex flex-1 flex-col justify-center items-start p-14 bg-nacos text-white relative">
          {/* Subtle pattern background overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white px-20 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-2 ">
              Manage your departmental <br />
              payments with <span className="text-green-300">ease</span>.
            </h2>

            <div className="space-y-3 mb-3">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
                    <Check size={18} className="text-green-300" strokeWidth={3} />
                  </div>
                  <span className="text-[18px] font-medium opacity-90">{feature}</span>
                </div>
              ))}
            </div>

            <Card className="!bg-white/5 border-white/10 !rounded-3xl p-10 backdrop-blur-sm mb-10 text-white">
              <p className="text-[18px] leading-relaxed font-light opacity-95">
                "NACOS Pay is dedicated to providing students with a fast, reliable, and secure way to manage their NACOS-related payments seamlessly."
              </p>
            </Card>

            <p className=" text-sm font-medium tracking-wide opacity-50 capitalize mt-auto">
              © 2026 NACOS. All rights reserved!
            </p>
          </div>
        </div>
      </div>

      {/* First Time Login Password Change Modal */}
      {showFirstLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
            <Card className="p-8 lg:p-10 !rounded-[2rem] border-white shadow-2xl relative overflow-hidden bg-white">
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1c5d4a]/5 rounded-full -mr-16 -mt-16" />
              
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Security Update</h2>
                  <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                    This is your first time logging in! For your safety, please update your default password or continue to the dashboard.
                  </p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-5">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Create a strong password"
                    icon={<Lock size={18} />}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="!rounded-2xl h-14 bg-slate-50 focus:bg-white text-[15px]"
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Verify your password"
                    icon={<Lock size={18} />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="!rounded-2xl h-14 bg-slate-50 focus:bg-white text-[15px]"
                    required
                  />

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isChanging}
                      className="!rounded-2xl py-4 font-bold bg-[#1c5d4a] hover:bg-[#154638] text-white shadow-lg shadow-[#1c5d4a]/20 transition-all"
                    >
                      {isChanging ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                      ) : (
                        "Update & Proceed"
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setShowFirstLoginModal(false); router.push('/dashboard'); }}
                      className="py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Maybe Later, Dashboard
                    </button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      )}

      <style jsx global>{`
        body {
          overflow: hidden;
        }
        @media (max-width: 1024px) {
          body {
            overflow: auto;
          }
        }
      `}</style>
    </main>
  );
}
