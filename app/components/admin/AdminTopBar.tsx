import Image from 'next/image';
import { Bell, User } from 'lucide-react';

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
    <div className="w-full bg-white px-4 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-[1.65rem]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 sm:text-[0.95rem]">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center transition-all hover:bg-gray-50 sm:h-12 sm:w-12"
          >
            <Bell size={19} className="text-slate-700" />
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#e9685f]" />
          </button>

          <div className="flex items-center gap-3 px-3 py-2 ">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden sm:h-10 sm:w-10">
              <User size={20} className="text-slate-700"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">{profileName}</p>
              <p className="truncate text-xs text-slate-500">{profileHandle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
