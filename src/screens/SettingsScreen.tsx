import { LogOut } from 'lucide-react';
import type { User } from '../types';
import { Header } from '../components/ui';

const AVATAR_COLORS = ['#4648d4','#006c49','#825100','#c0392b','#2980b9','#8e44ad','#16a085','#d35400'];

interface Props {
  user: User;
  onSwitchUser: () => void;
  onBack: () => void;
}

export default function SettingsScreen({ user, onSwitchUser, onBack }: Props) {
  const colorIdx = user.name.charCodeAt(0) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIdx];

  return (
    <div className="min-h-dvh bg-[#f8f9ff]">
      <Header title="הגדרות" onBack={onBack} />

      <div className="max-w-md mx-auto px-5 py-5">
        {/* Current user card */}
        <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 flex items-center gap-4 mb-6 shadow-sm"
          style={{ animation: 'fadeUp 0.32s ease 0.05s both' }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: avatarColor }}
          >
            {user.name[0]}
          </div>
          <div className="flex-1">
            <p className="text-[12px] text-[#464554] font-medium">משתמש נוכחי</p>
            <p className="text-[18px] font-bold text-[#0b1c30]">{user.name}</p>
          </div>
        </div>

        {/* Switch user */}
        <button
          onClick={onSwitchUser}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-none
            font-bold text-sm cursor-pointer active:scale-[0.97] transition-transform"
          style={{
            background: '#4648d4',
            color: '#ffffff',
            fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(70,72,212,0.3)',
            animation: 'fadeUp 0.32s ease 0.15s both',
          }}
        >
          <LogOut size={18} />
          החלף משתמש
        </button>
      </div>
    </div>
  );
}
