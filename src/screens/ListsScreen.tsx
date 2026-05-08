import { useState } from 'react';
import { MoreVertical, Lock, Trash2, List } from 'lucide-react';
import type { ShoppingList } from '../types';
import { deleteShoppingList, updateShoppingList } from '../lib/db';
import { formatDate, formatDateShort } from '../lib/utils';
import { Header, Toast, EmptyState, BottomSheet } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  lists: ShoppingList[];
  onUpdate: (lists: ShoppingList[]) => void;
  onOpenList: (id: string) => void;
}

export default function ListsScreen({ lists, onUpdate, onOpenList }: Props) {
  const [tab, setTab]           = useState<'open' | 'closed'>('open');
  const [menuList, setMenuList] = useState<ShoppingList | null>(null);
  const { message, fire }       = useToast();

  const openLists   = lists.filter(l => !l.closed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const closedLists = lists.filter(l =>  l.closed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const shown = tab === 'open' ? openLists : closedLists;

  async function handleClose(list: ShoppingList) {
    await updateShoppingList(list.id, { closed: true });
    onUpdate(lists.map(l => l.id === list.id ? { ...l, closed: true } : l));
    setMenuList(null);
    fire('הרשימה נסגרה');
  }

  async function handleReopen(list: ShoppingList) {
    await updateShoppingList(list.id, { closed: false });
    onUpdate(lists.map(l => l.id === list.id ? { ...l, closed: false } : l));
    setMenuList(null);
    fire('הרשימה נפתחה');
  }

  async function handleDelete(list: ShoppingList) {
    await deleteShoppingList(list.id);
    onUpdate(lists.filter(l => l.id !== list.id));
    setMenuList(null);
    fire('נמחק');
  }

  function uniqueCatCount(list: ShoppingList) {
    return new Set(list.items.map(i => i.category)).size;
  }

  return (
    <div className="bg-[#f8f9ff]">
      <Header title="הרשימות שלי" />

      {/* Segmented control */}
      <div className="px-5 pt-3 pb-0">
        <div className="flex bg-[#e5eeff] rounded-2xl p-1">
          <button
            onClick={() => setTab('open')}
            className="flex-1 py-2.5 rounded-xl border-none cursor-pointer font-bold text-[14px] transition-all"
            style={{
              background:   tab === 'open' ? '#ffffff' : 'transparent',
              color:        tab === 'open' ? '#0b1c30' : '#464554',
              boxShadow:    tab === 'open' ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
              fontFamily:   'inherit',
            }}
          >
            פתוחות ({openLists.length})
          </button>
          <button
            onClick={() => setTab('closed')}
            className="flex-1 py-2.5 rounded-xl border-none cursor-pointer font-bold text-[14px] transition-all"
            style={{
              background:   tab === 'closed' ? '#ffffff' : 'transparent',
              color:        tab === 'closed' ? '#0b1c30' : '#464554',
              boxShadow:    tab === 'closed' ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
              fontFamily:   'inherit',
            }}
          >
            סגורות ({closedLists.length})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-w-lg mx-auto px-5 py-3 flex flex-col gap-2.5">
        {shown.length === 0 ? (
          <EmptyState
            icon={<List size={26} />}
            title={tab === 'open' ? 'אין רשימות פתוחות' : 'אין רשימות סגורות'}
            sub={tab === 'open' ? 'צור רשימה חדשה מהתפריט הראשי' : undefined}
          />
        ) : shown.map(list => {
          const done     = list.items.filter(i => i.checked).length;
          const catCount = uniqueCatCount(list);
          const isClosed = list.closed;
          const accentColor = isClosed ? '#c7c4d7' : '#006c49';

          return (
            <div
              key={list.id}
              className="bg-white rounded-2xl border border-[#e5eeff] overflow-hidden shadow-sm"
              style={{ borderRight: `4px solid ${accentColor}` }}
            >
              {/* Main row */}
              <div
                className="flex items-start gap-3 px-4 pt-4 pb-2 cursor-pointer"
                onClick={() => onOpenList(list.id)}
              >
                {/* Store icon */}
                <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-2xl shrink-0">
                  🛒
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] text-[#0b1c30] leading-tight">{list.store}</div>
                  <div className="text-[12px] text-[#464554] mt-0.5">
                    {list.visibleId} · {formatDateShort(list.date)}
                  </div>
                </div>
                {/* 3-dot menu */}
                <button
                  onClick={e => { e.stopPropagation(); setMenuList(list); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border-none
                    bg-transparent text-[#c7c4d7] cursor-pointer hover:bg-[#f0f4ff] hover:text-[#464554] transition-all shrink-0"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Info strip */}
              <div className="mx-4 mb-3 bg-[#eff4ff] rounded-xl px-3 py-2">
                <span className="text-[12px] text-[#464554] font-medium">
                  {list.items.length} פריטים · {catCount} קטגוריות
                  {!isClosed && list.items.length > 0 && (
                    <span className="mr-2 text-[#006c49] font-semibold">· {done} נלקחו</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-list action sheet */}
      <BottomSheet open={menuList !== null} onClose={() => setMenuList(null)}>
        {menuList && (
          <>
            <p className="text-center font-bold text-[16px] text-[#0b1c30] mb-1">{menuList.store}</p>
            <p className="text-center text-[13px] text-[#464554] mb-5">
              {menuList.visibleId} · {formatDate(menuList.date)}
            </p>
            <div className="flex flex-col gap-2.5">
              {!menuList.closed ? (
                <button
                  onClick={() => handleClose(menuList)}
                  className="w-full py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
                    flex items-center justify-center gap-2 active:scale-[0.98] transition-all
                    bg-[#fff8e1] text-[#825100]"
                  style={{ fontFamily: 'inherit' }}
                >
                  <Lock size={16} /> סגור רשימה
                </button>
              ) : (
                <button
                  onClick={() => handleReopen(menuList)}
                  className="w-full py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
                    flex items-center justify-center gap-2 active:scale-[0.98] transition-all
                    bg-[#e6f4ea] text-[#006c49]"
                  style={{ fontFamily: 'inherit' }}
                >
                  פתח מחדש
                </button>
              )}
              <button
                onClick={() => handleDelete(menuList)}
                className="w-full py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
                  flex items-center justify-center gap-2 active:scale-[0.98] transition-all
                  bg-[#fdecea] text-[#ba1a1a]"
                style={{ fontFamily: 'inherit' }}
              >
                <Trash2 size={16} /> מחק רשימה
              </button>
              <button
                onClick={() => setMenuList(null)}
                className="w-full py-3 rounded-2xl border-none font-semibold text-sm cursor-pointer
                  bg-[#f0f4ff] text-[#464554] active:scale-[0.98] transition-all"
                style={{ fontFamily: 'inherit' }}
              >
                ביטול
              </button>
            </div>
          </>
        )}
      </BottomSheet>

      <Toast msg={message} />
    </div>
  );
}
