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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
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
