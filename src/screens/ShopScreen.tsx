import { useState, useRef } from 'react';
import {
  Search, Settings2, Plus, X, Lock, LockOpen,
  Copy, RotateCcw, ChevronDown, ChevronUp, Undo2,
} from 'lucide-react';
import type { ShoppingList, ShoppingItem, MasterCategory } from '../types';
import { saveShoppingList, generateListId, generateVisibleId } from '../lib/db';
import { formatDate, copyListToWhatsApp } from '../lib/utils';
import { Header, Pill, Checkbox, BottomSheet, CenterModal, Toast, inputClass } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  list: ShoppingList;
  master: MasterCategory[];
  allLists: ShoppingList[];
  onUpdate: (list: ShoppingList) => void;
  onListsChange: (lists: ShoppingList[]) => void;
  onBack: () => void;
}

interface UndoState { item: ShoppingItem; index: number; }

function progressGradient(pct: number): string {
  if (pct === 100) return 'linear-gradient(to right, #10b981, #059669)';
  if (pct >= 80)   return 'linear-gradient(to right, #6366f1, #10b981)';
  return                  'linear-gradient(to right, #8b5cf6, #6366f1)';
}

export default function ShopScreen({ list, master, allLists, onUpdate, onListsChange, onBack }: Props) {
  const [filter, setFilter]     = useState<'all' | 'pending' | 'done'>('all');
  const [search, setSearch]     = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [dupOpen, setDupOpen]   = useState(false);
  const [dupDate, setDupDate]   = useState('');
  const [addOpen, setAddOpen]   = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [undo, setUndo]         = useState<UndoState | null>(null);
  const undoTimer               = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { message, fire }       = useToast();

  const total = list.items.length;
  const done  = list.items.filter(i => i.checked).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  function save(updated: ShoppingList) {
    onUpdate(updated);
    saveShoppingList(updated);
  }

  function toggleItem(idx: number) {
    const items = [...list.items];
    items[idx] = { ...items[idx], checked: !items[idx].checked };
    save({ ...list, items });
  }

  function removeItem(idx: number) {
    const removed = list.items[idx];
    save({ ...list, items: list.items.filter((_, i) => i !== idx) });
    setUndo({ item: removed, index: idx });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  }

  function handleUndo() {
    if (!undo) return;
    const items = [...list.items];
    items.splice(undo.index, 0, undo.item);
    save({ ...list, items });
    setUndo(null);
    clearTimeout(undoTimer.current);
    fire('הפריט הוחזר!');
  }

  function addItemFromMaster(item: { name: string; freq: 'monthly' | 'occasional' }, cat: MasterCategory) {
    if (list.items.find(i => i.name === item.name && i.category === cat.name)) {
      fire('הפריט כבר ברשימה'); return;
    }
    save({
      ...list,
      items: [...list.items, {
        name: item.name, freq: item.freq,
        category: cat.name, catIcon: cat.icon, catColor: cat.color,
        checked: false,
      }],
    });
    fire(`${item.name} נוסף!`);
  }

  async function handleCopy() {
    try { await copyListToWhatsApp(list); fire('הועתק!'); }
    catch { fire('שגיאה בהעתקה'); }
    setEditOpen(false);
  }

  async function handleDuplicate() {
    const newList: ShoppingList = {
      id: generateListId(), visibleId: generateVisibleId(),
      userId: list.userId, date: dupDate || new Date().toISOString().split('T')[0],
      store: list.store, items: list.items.map(i => ({ ...i, checked: false })),
      closed: false, createdAt: new Date().toISOString(),
    };
    await saveShoppingList(newList);
    onListsChange([...allLists, newList]);
    setDupOpen(false); setDupDate('');
    fire(`רשימה ${newList.visibleId} שוכפלה!`);
  }

  function handleReset()  { save({ ...list, items: list.items.map(i => ({ ...i, checked: false })) }); setEditOpen(false); fire('הרשימה אופסה'); }
  function handleClose()  { save({ ...list, closed: true  }); setEditOpen(false); fire('הרשימה נסגרה'); }
  function handleReopen() { save({ ...list, closed: false }); setEditOpen(false); fire('הרשימה נפתחה'); }

  const grouped: Record<string, { icon: string; color: string; name: string; items: (ShoppingItem & { idx: number })[] }> = {};
  list.items.forEach((item, idx) => {
    if (!grouped[item.category]) grouped[item.category] = { icon: item.catIcon, color: item.catColor, name: item.category, items: [] };
    grouped[item.category].items.push({ ...item, idx });
  });
  const cats = Object.values(grouped);

  return (
    <div className="min-h-dvh bg-slate-50 pb-10">
      <Header
        title={list.visibleId}
        subtitle={`${formatDate(list.date)} · ${list.store}${list.closed ? ' · סגורה' : ''}`}
        onBack={onBack}
      >
        {/* Contextual progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: pct === 100 ? 'white' : 'rgba(255,255,255,0.75)' }}
            />
          </div>
          <span className="text-white/80 text-xs font-medium whitespace-nowrap">{done}/{total}</span>
          <span className="text-white text-xs font-bold">{pct}%</span>
        </div>
      </Header>

      {/* Filters */}
      <div className="sticky top-[93px] z-40 bg-slate-50 border-b border-slate-100 px-4 py-2.5">
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
        <div className="flex gap-1.5 flex-wrap items-center">
          {(['all', 'pending', 'done'] as const).map(f => {
            const labels = { all: `הכל (${total})`, pending: `נשאר (${total - done})`, done: `נלקח (${done})` };
            return <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{labels[f]}</Pill>;
          })}
          <div className="flex gap-1.5 mr-auto">
            <button
              onClick={() => { setAddSearch(''); setAddOpen(true); }}
              className="py-1.5 px-3.5 rounded-full text-xs font-semibold cursor-pointer
                text-white flex items-center gap-1 active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                boxShadow: '0 2px 8px rgba(139,92,246,0.35)',
                fontFamily: 'inherit',
              }}
            >
              <Plus size={12} /> פריט
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500
                flex items-center justify-center cursor-pointer hover:border-violet-300
                active:scale-95 transition-all"
            >
              <Settings2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-lg mx-auto px-4 py-3 flex flex-col gap-2">
        {cats.map((cat, ci) => {
          const filtered = cat.items.filter(i => {
            const ms = !search || i.name.includes(search);
            const mf = filter === 'all' || (filter === 'done' ? i.checked : !i.checked);
            return ms && mf;
          });
          if (!filtered.length) return null;

          const cd      = filtered.filter(i => i.checked).length;
          const allDone = cd === filtered.length;
          const isCol   = collapsed[ci] !== false;

          return (
            <div key={ci} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}
                className="w-full flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                style={{ fontFamily: 'inherit' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: cat.color + '18', color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="flex-1 font-bold text-[14px] text-right" style={{ color: cat.color }}>
                  {cat.name}
                </div>
                <span className="text-[11px] py-0.5 px-2.5 rounded-full font-semibold"
                  style={{
                    background: allDone ? '#d1fae5' : cat.color + '18',
                    color:      allDone ? '#059669' : cat.color,
                  }}>
                  {cd}/{filtered.length}
                </span>
                {isCol ? <ChevronDown size={16} className="text-slate-400 shrink-0" />
                       : <ChevronUp   size={16} className="text-slate-400 shrink-0" />}
              </button>

              {!isCol && (
                <div className="px-3 pb-3 border-t border-slate-50">
                  {filtered.map(item => (
                    <div key={item.idx}
                      className="flex items-center gap-3 py-2.5 px-1 rounded-xl transition-all"
                      style={{ opacity: item.checked ? 0.45 : 1 }}>
                      <button onClick={() => toggleItem(item.idx)} className="cursor-pointer shrink-0 active:scale-95 transition-transform">
                        <Checkbox checked={item.checked} />
                      </button>
                      <span onClick={() => toggleItem(item.idx)}
                        className="flex-1 text-sm text-slate-800 cursor-pointer select-none"
                        style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>
                        {item.name}
                      </span>
                      <button onClick={() => removeItem(item.idx)}
                        className="w-7 h-7 rounded-lg bg-transparent hover:bg-red-50
                          text-slate-300 hover:text-red-400 flex items-center justify-center
                          cursor-pointer transition-all border-none shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {cats.length === 0 && (
          <div className="text-center py-14">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)' }}>
              <Search size={24} className="text-violet-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              {search ? 'לא נמצאו פריטים' : 'הרשימה ריקה'}
            </p>
          </div>
        )}
      </div>

      {/* Undo bar */}
      {undo && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white
          py-3 px-5 rounded-2xl flex items-center gap-3 z-[300] shadow-2xl"
          style={{ animation: 'fadeUp .25s ease' }}>
          <span className="text-sm">"{undo.item.name}" הוסר</span>
          <button onClick={handleUndo}
            className="text-white border-none py-1.5 px-4 rounded-xl font-bold text-xs
              cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(to right, #8b5cf6, #6366f1)', fontFamily: 'inherit' }}>
            <Undo2 size={12} /> בטל
          </button>
        </div>
      )}

      {/* Edit Sheet */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)}>
        <h2 className="font-bold text-base mb-5 text-center text-slate-900">הגדרות רשימה</h2>
        <label className="text-[12px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wide">תאריך</label>
        <input type="date" value={list.date} onChange={e => save({ ...list, date: e.target.value })} className={inputClass + ' mb-5'} />
        <div className="flex flex-col gap-2.5">
          <button onClick={handleCopy} className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-slate-100 text-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}><Copy size={16} /> העתק לוואצאפ</button>
          <button onClick={handleReset} className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-amber-50 text-amber-700 flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}><RotateCcw size={16} /> איפוס סימונים</button>
          <button onClick={() => { setDupDate(''); setDupOpen(true); setEditOpen(false); }} className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer text-white flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ background: 'linear-gradient(to right, #8b5cf6, #6366f1)', fontFamily: 'inherit' }}><Copy size={16} /> שכפל רשימה</button>
          {!list.closed
            ? <button onClick={handleClose}  className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-red-50 text-red-500 flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}><Lock size={16} /> סגור רשימה</button>
            : <button onClick={handleReopen} className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-emerald-50 text-emerald-600 flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}><LockOpen size={16} /> פתח מחדש</button>
          }
        </div>
        <button onClick={() => setEditOpen(false)} className="mt-3.5 w-full py-3 border-none rounded-xl bg-slate-100 text-slate-400 font-semibold text-sm cursor-pointer active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}>סגור</button>
      </BottomSheet>

      {/* Duplicate Modal */}
      <CenterModal open={dupOpen} onClose={() => setDupOpen(false)}>
        <h2 className="font-bold text-base mb-4 text-center text-slate-900">שכפול רשימה</h2>
        <label className="text-[12px] font-semibold text-slate-400 block mb-1.5">תאריך לרשימה החדשה</label>
        <input type="date" value={dupDate} onChange={e => setDupDate(e.target.value)} className={inputClass + ' mb-4'} />
        <div className="flex gap-2.5">
          <button onClick={() => setDupOpen(false)} className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-slate-100 text-slate-500 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleDuplicate} className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer text-white active:scale-95 transition-all" style={{ background: 'linear-gradient(to right, #8b5cf6, #6366f1)', fontFamily: 'inherit' }}>שכפל</button>
        </div>
      </CenterModal>

      {/* Add Item Sheet */}
      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)}>
        <h2 className="font-bold text-base mb-4 text-center text-slate-900">הוסף פריט מהמאסטר</h2>
        <div className="relative mb-4">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400" />
          <input placeholder="חיפוש..." value={addSearch} onChange={e => setAddSearch(e.target.value)}
            className="w-full py-2.5 pr-10 pl-4 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all font-[inherit] placeholder:text-slate-400" />
        </div>
        <div className="max-h-[52vh] overflow-auto -mx-1 px-1">
          {master.map((cat, ci) => {
            const items = cat.items.filter(i => !addSearch || i.name.includes(addSearch));
            if (!items.length) return null;
            return (
              <div key={ci} className="mb-3">
                <div className="text-[12px] font-bold mb-1.5 flex items-center gap-1.5" style={{ color: cat.color }}>
                  <span>{cat.icon}</span>{cat.name}
                </div>
                {items.map((item, ii) => {
                  const exists = list.items.find(i => i.name === item.name && i.category === cat.name);
                  return (
                    <div key={ii} onClick={() => !exists && addItemFromMaster(item, cat)}
                      className="flex items-center gap-2.5 py-2 px-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      style={{ opacity: exists ? 0.4 : 1, cursor: exists ? 'default' : 'pointer' }}>
                      <div className="flex-1 text-sm text-slate-800">{item.name}</div>
                      {exists
                        ? <span className="text-[10px] py-1 px-2.5 rounded-full font-semibold bg-slate-100 text-slate-400">ברשימה</span>
                        : <span className="text-[10px] py-1 px-2.5 rounded-full font-semibold bg-violet-50 text-violet-500 flex items-center gap-1"><Plus size={9} /> הוסף</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      <Toast msg={message} />
    </div>
  );
}
