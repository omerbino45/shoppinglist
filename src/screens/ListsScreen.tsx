import { useState } from 'react';
import type { ShoppingList } from '../types';
import { deleteShoppingList, updateShoppingList } from '../lib/db';
import { formatDate } from '../lib/utils';
import { Header, Pill, Toast, inputClass } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  lists: ShoppingList[];
  onUpdate: (lists: ShoppingList[]) => void;
  onOpenList: (id: string) => void;
  onBack: () => void;
}

export default function ListsScreen({ lists, onUpdate, onOpenList, onBack }: Props) {
  const [search, setSearch] = useState('');
  const [selMode, setSelMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { message, fire } = useToast();

  const openLists = lists.filter(l => !l.closed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const closedLists = lists.filter(l => l.closed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filterList = (l: ShoppingList) =>
    !search || l.visibleId.includes(search) || l.id.includes(search) ||
    formatDate(l.date).includes(search) || l.store.includes(search);

  const filteredOpen = openLists.filter(filterList);
  const filteredClosed = closedLists.filter(filterList);
  const allSelOpen = [...selected].every(id => openLists.find(l => l.id === id));

  function toggleSelect(id: string) {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  async function handleClose() {
    const updated = lists.map(l => selected.has(l.id) ? { ...l, closed: true } : l);
    for (const id of selected) {
      await updateShoppingList(id, { closed: true });
    }
    onUpdate(updated);
    setSelected(new Set());
    setSelMode(false);
    fire('הרשימות נסגרו ✅');
  }

  async function handleDelete() {
    for (const id of selected) {
      await deleteShoppingList(id);
    }
    onUpdate(lists.filter(l => !selected.has(l.id)));
    setSelected(new Set());
    setSelMode(false);
    fire('נמחק!');
  }

  function ListCard({ list, isClosed }: { list: ShoppingList; isClosed?: boolean }) {
    const done = list.items.filter(i => i.checked).length;
    const s = selected.has(list.id);

    return (
      <div
        className={`rounded-[14px] py-3.5 px-4 mb-2 cursor-pointer border-2 transition-all
          shadow-[0_2px_10px_rgba(0,0,0,0.04)]
          ${s ? 'bg-[#fff1f2] border-[#e63946]' : 'bg-white border-transparent'}
          ${isClosed ? 'opacity-60' : ''}`}
        onClick={() => {
          if (selMode) toggleSelect(list.id);
          else onOpenList(list.id);
        }}>
        <div className="flex justify-between items-start mb-1">
          <div>
            <div className="font-bold text-base">
              📅 {formatDate(list.date)}
              <span className="text-sm text-gray-400 font-medium mr-2">{list.store}</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{list.visibleId}</div>
          </div>
          <span className={`text-[10px] py-0.5 px-2 rounded-md font-semibold whitespace-nowrap ${
            isClosed ? 'bg-gray-100 text-gray-400' : 'bg-[#e8f5e9] text-[#2e7d32]'
          }`}>
            {isClosed ? 'סגורה 🔒' : 'פתוחה'}
          </span>
        </div>
        {!isClosed && (
          <>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-sm overflow-hidden">
              <div className="h-full rounded-sm transition-all duration-300"
                style={{
                  width: `${(done / list.items.length) * 100}%`,
                  background: 'linear-gradient(90deg, #2d6a4f, #52b788)'
                }} />
            </div>
            <div className="text-[11px] text-gray-400 mt-1">{done}/{list.items.length} פריטים</div>
          </>
        )}
        {isClosed && (
          <div className="text-[11px] text-gray-400 mt-1">
            {done}/{list.items.length} פריטים
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-28">
      <Header title="📋 הרשימות שלי"
        subtitle={`${openLists.length} פתוחות · ${closedLists.length} סגורות`}
        onBack={onBack} />

      <div className="sticky top-[76px] z-40 bg-[#faf8f5] border-b border-[#e8e4df] px-4 py-2.5 flex gap-2">
        <input placeholder="🔍 חיפוש מזהה / תאריך..." value={search}
          onChange={e => setSearch(e.target.value)} className={inputClass + ' flex-1'} />
        <Pill active={selMode} onClick={() => { setSelMode(!selMode); setSelected(new Set()); }}>
          {selMode ? '✕' : 'בחירה'}
        </Pill>
      </div>

      <div className="max-w-lg mx-auto px-4 py-2">
        {filteredOpen.length > 0 && (
          <>
            <div className="text-[13px] font-bold text-[#2d6a4f] mb-2 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2d6a4f]" />
              רשימות פתוחות ({filteredOpen.length})
            </div>
            {filteredOpen.map(l => <ListCard key={l.id} list={l} />)}
          </>
        )}
        {filteredClosed.length > 0 && (
          <>
            <div className="text-[13px] font-bold text-gray-400 mb-2 mt-5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              רשימות סגורות ({filteredClosed.length})
            </div>
            {filteredClosed.map(l => <ListCard key={l.id} list={l} isClosed />)}
          </>
        )}
        {!filteredOpen.length && !filteredClosed.length && (
          <div className="text-center py-10 text-gray-300">
            <div className="text-4xl mb-2">📝</div>
            <div className="font-semibold">{search ? 'לא נמצאו רשימות' : 'אין עדיין רשימות'}</div>
          </div>
        )}
      </div>

      {selMode && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e4df]
          py-3 px-5 flex gap-2.5 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {allSelOpen && (
            <button onClick={handleClose}
              className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#fff3e0] text-[#e65100]"
              style={{ fontFamily: 'inherit' }}>
              סגור ({selected.size})
            </button>
          )}
          <button onClick={handleDelete}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#ffeaea] text-[#d32f2f]"
            style={{ fontFamily: 'inherit' }}>
            מחק ({selected.size}) 🗑️
          </button>
        </div>
      )}
      <Toast msg={message} />
    </div>
  );
}
