import { ShoppingCart, List, Archive, ChevronLeft } from 'lucide-react';
import type { User, ShoppingList, Screen } from '../types';
import { formatDate } from '../lib/utils';

const AVATAR_COLORS = ['#4648d4','#006c49','#825100','#c0392b','#2980b9','#8e44ad','#16a085','#d35400'];

interface Props {
  user: User;
  lists: ShoppingList[];
  onNavigate: (screen: Screen) => void;
}

export default function HomeScreen({ user, lists, onNavigate }: Props) {
  const openLists   = lists.filter(l => !l.closed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const closedCount = lists.filter(l =>  l.closed).length;
  const avatarColor = AVATAR_COLORS[user.name.charCodeAt(0) % AVATAR_COLORS.length];
  const nextList    = openLists[0] ?? null;

  return (
    <div className="min-h-dvh bg-[#f8f9ff]">
      {/* Flat header */}
      <div className="bg-[#dce9ff] px-5 flex items-center justify-between"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: '0.75rem' }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: avatarColor }}
        >
          {user.name[0]}
        </div>
        <h1 className="text-[20px] font-bold text-[#4648d4]"
          style={{ animation: 'bounceIn 0.42s ease both' }}>רשימת הקניות שלי</h1>
        <div className="w-9" />
      </div>

      <div className="max-w-lg mx-auto px-5 py-5 flex flex-col gap-3">
        {/* New List — primary CTA */}
        <button
          onClick={() => onNavigate('new')}
          className="w-full rounded-2xl border-none cursor-pointer
            flex flex-col items-center justify-center py-8 gap-2
            active:scale-[0.97] transition-transform"
          style={{
            background: '#4648d4',
            animation: 'fadeUp 0.3s ease 0.05s both, pulseGlow 3s ease-in-out 0.35s infinite',
            fontFamily: 'inherit',
          }}
        >
          <ShoppingCart size={36} color="white" />
          <span className="text-[17px] font-bold text-white">רשימה חדשה</span>
        </button>

        {/* My Lists */}
        <button
          onClick={() => onNavigate('lists')}
          className="w-full bg-white rounded-2xl border border-[#e5eeff] cursor-pointer
            flex flex-col items-center justify-center py-7 gap-2
            shadow-sm active:scale-[0.97] transition-transform"
          style={{ fontFamily: 'inherit', animation: 'fadeUp 0.3s ease 0.12s both' }}
        >
          <List size={32} color="#4648d4" />
          <span className="text-[16px] font-bold text-[#0b1c30]">הרשימות שלי</span>
          <span className="text-[12px] text-[#464554]">{openLists.length} פתוחות · {closedCount} סגורות</span>
        </button>

        {/* Master List */}
        <button
          onClick={() => onNavigate('master')}
          className="w-full bg-white rounded-2xl border border-[#e5eeff] cursor-pointer
            flex flex-col items-center justify-center py-7 gap-2
            shadow-sm active:scale-[0.97] transition-transform"
          style={{ fontFamily: 'inherit', animation: 'fadeUp 0.3s ease 0.19s both' }}
        >
          <Archive size={32} color="#825100" />
          <span className="text-[16px] font-bold text-[#0b1c30]">רשימת מאסטר</span>
        </button>

        {/* הקניות הקרובות widget */}
        {nextList && (
          <div className="mt-1" style={{ animation: 'fadeUp 0.3s ease 0.26s both' }}>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <button
                onClick={() => onNavigate('lists')}
                className="text-[13px] font-semibold text-[#4648d4] border-none bg-transparent cursor-pointer"
                style={{ fontFamily: 'inherit' }}
              >
                הצג הכל
              </button>
              <span className="text-[15px] font-bold text-[#0b1c30]">הקניות הקרובות</span>
            </div>

            <div
              className="w-full bg-white rounded-2xl border border-[#e5eeff] text-right
                cursor-pointer shadow-sm overflow-hidden"
              style={{ borderRight: '4px solid #006c49' }}
              onClick={() => onNavigate('lists')}
            >
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white shrink-0"
                  style={{ background: '#4648d4' }}
                >
                  {nextList.items.length} פריטים
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[15px] font-bold text-[#0b1c30]">{nextList.store}</span>
                    <div className="w-9 h-9 rounded-full bg-[#e5eeff] flex items-center justify-center shrink-0">
                      <ShoppingCart size={18} color="#4648d4" />
                    </div>
                  </div>
                  <div className="text-[12px] text-[#464554] mt-0.5 text-right">
                    {nextList.visibleId} · {formatDate(nextList.date)}
                  </div>
                </div>
              </div>

              {nextList.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 border-t border-[#f0f4ff]">
                  <ChevronLeft size={14} color="#c7c4d7" className="shrink-0" />
                  <span className="text-[13px] text-[#464554] flex-1 text-right">{item.catIcon} {item.name}</span>
                </div>
              ))}
              {nextList.items.length > 3 && (
                <div className="px-4 py-2 border-t border-[#f0f4ff]">
                  <span className="text-[12px] text-[#c7c4d7]">ועוד {nextList.items.length - 3} פריטים...</span>
                </div>
              )}
              <div className="h-3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
