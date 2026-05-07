import { useState } from 'react';
import { Search, Trash2, Lock, X } from 'lucide-react';
import type { ShoppingList } from '../types';
import { deleteShoppingList, updateShoppingList } from '../lib/db';
import { formatDate } from '../lib/utils';
import { Header, Pill, Toast, Card, SectionLabel, EmptyState } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  lists: ShoppingList[];
  onUpdate: (lists: ShoppingList[]) => void;
  onOpenList: (id: string) => void;
  onBack: () => void;
}

function progressGradient(pct: number): string {
  if (pct === 100) return 'linear-gradient(to right, #10b981, #059669)';
  if (pct >= 80)   return 'linear-gradient(to right, #6366f1, #10b981)';
  return                  'linear-gradient(to right, #8b5cf6, #6366f1)';
}

export default function ListsScreen({ lists, onUpdate, onOpenList, onBack }: Props) {
  const [search, setSearch]     = useState('');
  const [selMode, setSelMode]   = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { message, fire }       = useToast();

  const openLists   = lists.filter(l => !l.closed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const closedLists = lists.filter(l =>  l.closed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filterList = (l: ShoppingList) =>
    !search || l.visibleId.includes(search) || l.id.includes(search) ||
    formatDate(l.date).includes(search) || l.store.includes(search);

  const filteredOpen   = openLists.filter(filterList);
  const filteredClosed = closedLists.filter(filterList);
  const allSelOpen     = [...selected].every(id => openLists.find(l => l.id === id));

  function toggleSelect(id: string) {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  async function handleClose() {
    const updated = lists.map(l => selected.has(l.id) ? { ...l, closed: true } : l);
    for (const id of selected) await updateShoppingList(id, { closed: true });
    onUpdate(updated);
    setSelected(new Set()); setSelMode(false);
    fire('הרשימות נסגרו');
  }

  async function handleDelete() {
    for (const id of selected) await deleteShoppingList(id);
    onUpdate(lists.filter(l => !selected.has(l.id)));
    setSelected(new Set()); setSelMode(false);
    fire('נמחק!');
  }

  function ListCard({ list, isClosed }: { list: ShoppingList; isClosed?: boolean }) {
    const done = list.items.filter(i => i.checked).length;
    const pct  = list.items.length ? Math.round((done / list.items.length) * 100) : 0;
    const sel  = selected.has(list.id);

    return (
      <Card
        selected={sel}
        muted={isClosed}
        onClick={() => selMode ? toggleSelect(list.id) : onOpenList(list.id)}
        className="overflow-hidden"
      >
        <div className="py-3.5 px-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[14px] text-slate-900 flex items-center gap-1.5">
                <span>{formatDate(list.date)}</span>
                <span className="text-slate-300 font-normal">·</span>
                <span className="text-slate-500 font-medium text-[13px]">{list.store}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-normal">{list.visibleId}</div>
            </div>
            {isClosed ? (
              <span className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-full font-semibold bg-slate-100 text-slate-400 whitespace-nowrap shrink-0">
                <Lock size={9} /> סגורה
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-full font-semibold bg-emerald-50 text-emerald-600 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> פתוחה
              </span>
            )}
          </div>

          {!isClosed && list.items.length > 0 && (
            <div className="mt-2.5">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: progressGradient(pct) }} />
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5 font-normal">{done}/{list.items.length} פריטים</div>
            </div>
          )}
          {isClosed && (
            <div className="text-[11px] text-slate-400 mt-1 font-normal">{done}/{list.items.length} פריטים</div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 pb-28">
      <Header
        title="הרשימות שלי"
        subtitle={`${openLists.length} פתוחות · ${closedLists.length} סגורות`}
        onBack={onBack}
      />

      {/* Toolbar */}
      <div className="sticky top-[73px] z-40 bg-slate-50 border-b border-slate-100 px-4 py-2.5">
        <div className="relative mb-2">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400" />
          <input
            placeholder="חיפוש..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full py-2.5 pr-10 pl-4 border border-slate-200 rounded-xl text-sm
              outline-none bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100
              transition-all font-[inherit] placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2">
          <Pill active={selMode} onClick={() => { setSelMode(!selMode); setSelected(new Set()); }}>
            {selMode ? 'ביטול' : 'בחירה'}
          </Pill>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-3">
        {filteredOpen.length > 0 && (
          <>
            <SectionLabel label={`פתוחות (${filteredOpen.length})`} color="#10b981" dot="#10b981" />
            {filteredOpen.map(l => <ListCard key={l.id} list={l} />)}
          </>
        )}
        {filteredClosed.length > 0 && (
          <>
            <SectionLabel label={`סגורות (${filteredClosed.length})`} color="#94a3b8" dot="#94a3b8" />
            {filteredClosed.map(l => <ListCard key={l.id} list={l} isClosed />)}
          </>
        )}
        {!filteredOpen.length && !filteredClosed.length && (
          <EmptyState
            icon={<Search size={28} />}
            title={search ? 'לא נמצאו רשימות' : 'אין עדיין רשימות'}
            sub={search ? undefined : 'צור רשימה חדשה מהתפריט הראשי'}
          />
        )}
      </div>

      {/* Bulk action bar */}
      {selMode && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 py-3 px-4 flex gap-2.5 z-50"
          style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.07)', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          {allSelOpen && (
            <button onClick={handleClose}
              className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-amber-50 text-amber-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ fontFamily: 'inherit' }}>
              <Lock size={15} /> סגור ({selected.size})
            </button>
          )}
          <button onClick={handleDelete}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-red-50 text-red-600 flex items-center justify-center gap-2 active:scale-95 transition-all"
            style={{ fontFamily: 'inherit' }}>
            <Trash2 size={15} /> מחק ({selected.size})
          </button>
          <button onClick={() => { setSelMode(false); setSelected(new Set()); }}
            className="w-12 h-12 border-none rounded-xl cursor-pointer bg-slate-100 text-slate-500 flex items-center justify-center active:scale-95 transition-all shrink-0"
            style={{ fontFamily: 'inherit' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <Toast msg={message} />
    </div>
  );
}
