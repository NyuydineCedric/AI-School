import React from 'react';
import { Bell } from 'lucide-react';

interface TopHeaderProps {
  greeting: string;
  subtitle: string;
  avatarInitial: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ greeting, subtitle, avatarInitial }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{greeting}</h1>
      <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">
      <button className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center">
        <Bell size={16} className="text-slate-500" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">
          2
        </span>
      </button>
      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
        {avatarInitial}
      </div>
    </div>
  </div>
);

export default TopHeader;
