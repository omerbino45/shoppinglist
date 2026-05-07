import type { User, ShoppingList } from '../types';
import { Header, Toast } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  user: User;
  lists: ShoppingList[];
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function HomeScreen({ user, lists, onNavigate, onLogout }: Props) {
  const openCount = lists.filter(l => !l.closed).length;
  const closedCount = lists.filter(l => l.closed).length;
  const { message } = useToast();

  const buttons = [
    {
      icon: '➕', bg: '#e8f5e9', fg: '#2d6a4f',
      title: 'רשימה חדשה', sub: 'בחר פריטים מהמאסטר',
      action: () => onNavigate('new')
    },
    {
      icon: '📋', bg: '#e3f2fd', fg: '#0077b6',
      title: 'הרשימות שלי', sub: `${openCount} פתוחות · ${closedCount} סגורות`,
      action: () => onNavigate('lists')
    },
    {
      icon: '⚙️', bg: '#fff3e0', fg: '#e65100',
      title: 'רשימת מאסטר', sub: 'עריכת הפריטים הקבועים',
      action: () => onNavigate('master')
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Header title={`🛒 שלום, ${user.name}`} subtitle="מה בתפריט היום?" onBack={onLogout} />

      <div className="max-w-lg mx-auto px-4 py-4">
        {buttons.map((b, i) => (
          <button key={i} onClick={b.action}
            className="flex items-center gap-3.5 bg-white rounded-2xl py-5 px-5
              shadow-[0_2px_14px_rgba(0,0,0,0.05)] cursor-pointer border-none w-full
              text-right mb-2.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow"
            style={{ fontFamily: 'inherit' }}>
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-xl shrink-0"
              style={{ background: b.bg, color: b.fg }}>
              {b.icon}
            </div>
            <div>
              <div className="font-bold text-base">{b.title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{b.sub}</div>
            </div>
          </button>
        ))}
      </div>
      <Toast msg={message} />
    </div>
  );
}
