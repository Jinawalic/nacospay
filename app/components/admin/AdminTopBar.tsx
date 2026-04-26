import Image from 'next/image';
import { Bell, User, LogOut } from 'lucide-react';

export function AdminTopBar({
  title,
  subtitle,
  profileName,
  profileHandle,
}: {
  title: string;
  subtitle: string;
  profileName: string;
  profileHandle: string;
}) {
  return (
    <div className="w-full bg-white px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 sm:block">
            <h1 className="text-[1.35rem] font-bold text-slate-800 sm:text-[1.65rem] shrink-0">
              {title}
            </h1>
            
            {/* Mobile View: Icons and name next to title */}
            <div className="flex items-center gap-2 sm:hidden border-l border-slate-200 pl-3">
              <button
                type="button"
                className="relative flex h-8 w-8 items-center justify-center"
              >
                <Bell size={18} className="text-slate-700" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#e9685f]" />
              </button>
              
              <div className="flex items-center gap-2">
                <User size={18} className="text-slate-700" />
                <p className="text-[14px] font-bold text-slate-800 truncate max-w-[100px]">
                  {profileName.split(' ')[0]}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-1 text-sm leading-relaxed text-slate-500 sm:mt-1.5 sm:block sm:text-[0.95rem] hidden">
            {subtitle}
          </p>
        </div>

        {/* Desktop View: Right side actions */}
        <div className="hidden items-center gap-3 sm:flex">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center transition-all hover:bg-gray-50 sm:h-12 sm:w-12"
          >
            <Bell size={19} className="text-slate-700" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#e9685f]" />
          </button>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden sm:h-10 sm:w-10">
              <User size={20} className="text-slate-700" />
            </div>

            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-bold text-slate-800">{profileName}</p>
              <p className="truncate text-xs text-slate-500">{profileHandle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
