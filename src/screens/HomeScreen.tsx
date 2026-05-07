import { ShoppingCart, ClipboardList, Settings, LogOut, ChevronLeft } from 'lucide-react';
import { WaveBottom } from '../components/ui';
import type { User, ShoppingList } from '../types';

interface Props {
  user: User;
  lists: ShoppingList[];
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function HomeScreen({ user, lists, onNavigate, onLogout }: Props) {
  const openCount  = lists.filter(l => !l.closed).length;
  const closedCount = lists.filter(l =>  l.closed).length;

  const menuItems = [
    {
      icon: <ShoppingCart size={22} />,
      iconStyle: { background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' },
      title: 'רשימה חדשה',
      sub: 'בחר פריטים מהמאסטר',
      action: () => onNavigate('new'),
    },
    {
      icon: <ClipboardList size={22} />,
      iconStyle: { background: 'linear-gradient(135deg, #10b981, #0ea5e9)' },
      title: 'הרשימות שלי',
      sub: `${openCount} פתוחות · ${closedCount} סגורות`,
      action: () => onNavigate('lists'),
    },
    {
      icon: <Settings size={22} />,
      iconStyle: { background: 'linear-gradient(135deg, #64748b, #475569)' },
      title: 'רשימת מאסטר',
      sub: 'עריכת הפריטים הקבועים',
      action: () => onNavigate('master'),
    },
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Hero header */}
      <div
        className="relative overflow-hidden pb-12 px-5 text-white"
        style={{
          background: 'linear-gradient(225deg, #6d28d9, #6366f1 55%, #3b82f6)',
          boxShadow: '0 4px 32px rgba(109,40,217,0.3)',
          paddingTop: 'max(3.5rem, env(safe-area-inset-top))',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-6 -left-6 w-36 h-36 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute top-4 -right-10 w-44 h-44 rounded-full bg-white/6 pointer-events-none" />

        <div className="relative flex items-start justify-between">
          <button
            onClick={onLogout}
            className="w-9 h-9 bg-white/15 hover:bg-white/25 active:scale-95
              rounded-xl flex items-center justify-center transition-all mt-0.5"
          >
            <LogOut size={16} color="white" />
          </button>

          <div className="text-right">
            <p className="text-white/65 text-sm font-normal">שלום,</p>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              {user.name}
            </h1>
          </div>
        </div>

        {openCount > 0 && (
          <div
            className="relative mt-5 rounded-2xl py-3 px-4 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            <span className="text-white text-sm font-medium">
              {openCount} רשימ{openCount === 1 ? 'ה פתוחה' : 'ות פתוחות'} ממתינות
            </span>
            <ChevronLeft size={16} className="text-white/60 mr-auto" />
          </div>
        )}

        <WaveBottom />
      </div>

      {/* Menu cards */}
      <div className="max-w-lg mx-auto px-4 py-5 flex flex-col gap-3">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="flex items-center gap-4 bg-white rounded-2xl py-5 px-5
              border border-slate-100 shadow-sm w-full text-right
              hover:border-r-4 hover:border-r-violet-200 hover:shadow-md
              active:scale-[0.99] transition-all"
            style={{ fontFamily: 'inherit', animation: `fadeUp .3s ease ${i * 60}ms both` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
              style={item.iconStyle}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-[15px] text-slate-900">{item.title}</div>
              <div className="text-xs text-slate-400 mt-0.5 font-normal">{item.sub}</div>
            </div>
            <ChevronLeft size={18} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
