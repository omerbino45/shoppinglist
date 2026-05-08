import { useState, useRef } from 'react';
import { Settings2, Search, Copy, RotateCcw, Lock, LockOpen, Undo2, Plus, ChevronDown, ChevronUp, MoreVertical, Trash2 } from 'lucide-react';
import type { ShoppingList, ShoppingItem, MasterCategory } from '../types';
import { saveShoppingList, generateListId, generateVisibleId } from '../lib/db';
import { formatDate, copyListToWhatsApp } from '../lib/utils';
import { Header, Pill, Checkbox, BottomSheet, CenterModal, Toast, FAB, inputClass } from '../components/ui';
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
  const [itemMenuIdx, setItemMenuIdx] = useState<number | null>(null);
  const undoTimer               = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { message, fire }       = useToast();

  const total = list.items.length;
  const done  = list.items.filter(i => i.checked).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  function save(updated: ShoppingList) { onUpdate(updated); saveShoppingList(updated); }

  function toggleItem(idx: number) {
    const items = [...list.items];
    items[idx] = { ...items[idx], checked: !items[idx].checked };
    save({ ...list, items });
  }

  function removeItem(idx: number) {
    const removed = list.items[idx];
    save({ ...list, items: list.items.filter((_, i) => i !== idx) });
    setItemMenuIdx(null);
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
    if (list.items.find(i => i.name === item.name && i.category === cat.name)) { fire('הפריט כבר ברשימה'); return; }
    save({ ...list, items: [...list.items, { name: item.name, freq: item.freq, category: cat.name, catIcon: cat.icon, catColor: cat.color, checked: false }] });
    fire(`${item.name} נוסף!`);
  }

  async function handleCopy() {
    try { await copyListToWhatsApp(list); fire('הועתק!'); } catch { fire('שגיאה בהעתקה'); }
    setEditOpen(false);
  }

  async function handleDuplicate() {
    const newList: ShoppingList = {
      id: generateListId(), visibleId: generateVisibleId(), userId: list.userId,
      date: dupDate || new Date().toISOString().split('T')[0],
      store: list.store, items: list.items.map(i => ({ ...i, checked: false })),
      closed: false, createdAt: new Date().toISOString(),
    };
    await saveShoppingList(newList);
    onListsChange([...allLists, newList]);
    setDupOpen(false); setDupDate('');
    fire(`רשימה ${newList.visibleId} שוכפלה!`);
  }

  function handleReset()  { save({ ...list, items: list.items.map(i => ({ ...i, checked: false })) }); setEditOpen(false); fire('הרשימה אופסה'); }
  function handleClose()  { save({ ...list, closed: true });  setEditOpen(false); fire('הרשימה נסגרה'); }
  function handleReopen() { save({ ...list, closed: false }); setEditOpen(false); fire('הרשימה נפתחה'); }

  const grouped: Record<string, { icon: string; color: string; name: string; items: (ShoppingItem & { idx: number })[] }> = {};
  list.items.forEach((item, idx) => {
    if (!grouped[item.category]) grouped[item.category] = { icon: item.catIcon, color: item.catColor, name: item.category, items: [] };
    grouped[item.category].items.push({ ...item, idx });
  });
  const cats = Object.values(grouped);

  return (
    <div className="bg-[#f8f9ff]">
      <Header title={list.visibleId} subtitle={`${formatDate(list.date)} · ${list.store}${list.closed ? ' · סגורה' : ''}`} onBack={onBack}>
        {/* Progress */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[#0b1c30] text-[13px] font-bold whitespace-nowrap">התקדמות קנייה</span>
          <div className="flex-1 h-2.5 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(to left, #4648d4, #6cf8bb)' }} />
          </div>
          <span className="text-[#0b1c30] text-[13px] font-bold whitespace-nowrap">{done}/{total}</span>
        </div>
      </Header>

      {/* Filters */}
      <div className="sticky top-[97px] z-40 bg-[#f8f9ff] border-b border-[#e5eeff] px-4 py-2.5">
        <div className="relative mb-2">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#c7c4d7]" />
          <input placeholder="חיפוש..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full py-2.5 pr-10 pl-4 border border-[#c7c4d7] rounded-2xl text-sm
              outline-none bg-[#eff4ff] focus:border-[#4648d4] transition-all font-[inherit] placeholder:text-[#c7c4d7]" />
        </div>
        <div className="flex gap-1.5 items-center flex-wrap">
          {(['all', 'pending', 'done'] as const).map(f => {
            const labels = { all: `הכל (${total})`, pending: `נותר (${total - done})`, done: `בוצע (${done})` };
            return <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{labels[f]}</Pill>;
          })}
          <button onClick={() => setEditOpen(true)}
            className="mr-auto w-8 h-8 rounded-full bg-white border border-[#c7c4d7]
              flex items-center justify-center cursor-pointer text-[#464554]
              hover:border-[#4648d4] active:scale-95 transition-all">
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-lg mx-auto px-4 pt-3 pb-28 flex flex-col gap-2">
        {cats.map((cat, ci) => {
          const filtered = cat.items.filter(i => {
            const ms = !search || i.name.includes(search);
            const mf = filter === 'all' || (filter === 'done' ? i.checked : !i.checked);
            return ms && mf;
          });
          if (!filtered.length) return null;
          const cd    = filtered.filter(i => i.checked).length;
          const allDone = cd === filtered.length;
          const isCol = collapsed[ci] !== false;

          return (
            <div key={ci} className="bg-white rounded-2xl border border-[#e5eeff] overflow-hidden shadow-sm"
              style={{ borderRight: `4px solid ${cat.color}` }}>
              <button onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}
                className="w-full flex items-center gap-3 py-3 px-4 cursor-pointer border-none bg-transparent"
                style={{ fontFamily: 'inherit' }}>
                <span className="text-xl shrink-0">{cat.icon}</span>
                <div className="flex-1 font-bold text-[15px] text-right" style={{ color: cat.color }}>{cat.name}</div>
                <span className="text-[11px] py-0.5 px-2.5 rounded-full font-semibold"
                  style={{ background: allDone ? '#e6f4ea' : '#e5eeff', color: allDone ? '#006c49' : '#4648d4' }}>
                  {cd}/{filtered.length}
                </span>
                {isCol ? <ChevronDown size={16} className="text-[#c7c4d7] shrink-0" />
                       : <ChevronUp   size={16} className="text-[#c7c4d7] shrink-0" />}
              </button>

              {!isCol && (
                <div className="border-t border-[#f0f4ff]">
                  {filtered.map(item => (
                    <div key={item.idx}
                      className="flex items-center gap-3 py-3 px-4 border-b border-[#f8f9ff] last:border-b-0"
                      style={{ opacity: item.checked ? 0.5 : 1 }}>
                      <button onClick={() => toggleItem(item.idx)} className="cursor-pointer shrink-0 border-none bg-transparent active:scale-95 transition-transform">
                        <Checkbox checked={item.checked} />
                      </button>
                      <span onClick={() => toggleItem(item.idx)}
                        className="flex-1 text-[18px] font-medium text-[#0b1c30] cursor-pointer select-none text-right"
                        style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#464554' : '#0b1c30' }}>
                        {item.name}
                      </span>
                      <span className="text-lg shrink-0">{item.catIcon}</span>
                      {/* 3-dot menu */}
                      <button onClick={() => setItemMenuIdx(item.idx)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border-none
                          bg-transparent text-[#c7c4d7] cursor-pointer hover:bg-[#f0f4ff] hover:text-[#464554] transition-all shrink-0">
                        <MoreVertical size={14} />
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
              style={{ background: 'linear-gradient(135deg, #e1e0ff, #eff4ff)' }}>
              <Search size={24} className="text-[#4648d4]" />
            </div>
            <p className="text-[#464554] text-sm font-medium">{search ? 'לא נמצאו פריטים' : 'הרשימה ריקה'}</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <FAB onClick={() => { setAddSearch(''); setAddOpen(true); }} />

      {/* Undo bar */}
      {undo && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white
          py-3 px-5 rounded-2xl flex items-center gap-3 z-[300] shadow-2xl"
          style={{ animation: 'fadeUp .25s ease' }}>
          <span className="text-sm">"{undo.item.name}" הוסר</span>
          <button onClick={handleUndo}
            className="border-none py-1.5 px-4 rounded-xl font-bold text-xs cursor-pointer
              flex items-center gap-1.5 active:scale-95 transition-all text-white"
            style={{ background: '#4648d4', fontFamily: 'inherit' }}>
            <Undo2 size={12} /> בטל
          </button>
        </div>
      )}

      {/* Item delete confirmation */}
      <BottomSheet open={itemMenuIdx !== null} onClose={() => setItemMenuIdx(null)}>
        {itemMenuIdx !== null && (
          <>
            <p className="text-center font-bold text-[16px] text-[#0b1c30] mb-5">
              {list.items[itemMenuIdx]?.name}
            </p>
            <button onClick={() => removeItem(itemMenuIdx!)}
              className="w-full py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
                flex items-center justify-center gap-2 bg-[#fdecea] text-[#ba1a1a]
                active:scale-[0.98] transition-all mb-2.5"
              style={{ fontFamily: 'inherit' }}>
              <Trash2 size={16} /> מחק מהרשימה
            </button>
            <button onClick={() => setItemMenuIdx(null)}
              className="w-full py-3 rounded-2xl border-none font-semibold text-sm cursor-pointer
                bg-[#f0f4ff] text-[#464554] active:scale-[0.98] transition-all"
              style={{ fontFamily: 'inherit' }}>
              ביטול
            </button>
          </>
        )}
      </BottomSheet>

      {/* Settings sheet */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)}>
        <h2 className="font-bold text-[16px] text-[#0b1c30] text-center mb-5">הגדרות רשימה</h2>
        <label className="text-[12px] font-semibold text-[#464554] block mb-1.5">תאריך</label>
        <input type="date" value={list.date} onChange={e => save({ ...list, date: e.target.value })}
          className={inputClass + ' mb-5'} />
        <div className="flex flex-col gap-2.5">
          <button onClick={handleCopy}
            className="py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
              flex items-center justify-center gap-2 bg-[#eff4ff] text-[#0b1c30] active:scale-[0.98]"
            style={{ fontFamily: 'inherit' }}><Copy size={16} /> העתק לוואצאפ</button>
          <button onClick={handleReset}
            className="py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
              flex items-center justify-center gap-2 bg-[#fff8e1] text-[#825100] active:scale-[0.98]"
            style={{ fontFamily: 'inherit' }}><RotateCcw size={16} /> איפוס סימונים</button>
          <button onClick={() => { setDupDate(''); setDupOpen(true); setEditOpen(false); }}
            className="py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer text-white
              flex items-center justify-center gap-2 active:scale-[0.98]"
            style={{ background: '#4648d4', fontFamily: 'inherit' }}><Copy size={16} /> שכפל רשימה</button>
          {!list.closed
            ? <button onClick={handleClose}
                className="py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
                  flex items-center justify-center gap-2 bg-[#fdecea] text-[#ba1a1a] active:scale-[0.98]"
                style={{ fontFamily: 'inherit' }}><Lock size={16} /> סגור רשימה</button>
            : <button onClick={handleReopen}
                className="py-3.5 rounded-2xl border-none font-bold text-sm cursor-pointer
                  flex items-center justify-center gap-2 bg-[#e6f4ea] text-[#006c49] active:scale-[0.98]"
                style={{ fontFamily: 'inherit' }}><LockOpen size={16} /> פתח מחדש</button>
          }
        </div>
        <button onClick={() => setEditOpen(false)}
          className="mt-3 w-full py-3 border-none rounded-2xl bg-[#f0f4ff] text-[#464554]
            font-semibold text-sm cursor-pointer active:scale-[0.98]"
          style={{ fontFamily: 'inherit' }}>סגור</button>
      </BottomSheet>

      {/* Duplicate Modal */}
      <CenterModal open={dupOpen} onClose={() => setDupOpen(false)}>
        <h2 className="font-bold text-[16px] text-[#0b1c30] text-center mb-4">שכפול רשימה</h2>
        <label className="text-[12px] font-semibold text-[#464554] block mb-1.5">תאריך לרשימה החדשה</label>
        <input type="date" value={dupDate} onChange={e => setDupDate(e.target.value)}
          className={inputClass + ' mb-4'} />
        <div className="flex gap-2.5">
          <button onClick={() => setDupOpen(false)}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer bg-[#f0f4ff] text-[#464554]"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleDuplicate}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer text-white"
            style={{ background: '#4648d4', fontFamily: 'inherit' }}>שכפל</button>
        </div>
      </CenterModal>

      {/* Add Item Sheet */}
      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)}>
        <h2 className="font-bold text-[16px] text-[#0b1c30] text-center mb-4">הוסף פריט מהמאסטר</h2>
        <div className="relative mb-4">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-[#c7c4d7]" />
          <input placeholder="חיפוש..." value={addSearch} onChange={e => setAddSearch(e.target.value)}
            className="w-full py-2.5 pr-10 pl-4 border border-[#c7c4d7] rounded-2xl text-sm
              outline-none bg-[#eff4ff] focus:border-[#4648d4] transition-all font-[inherit] placeholder:text-[#c7c4d7]" />
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
                      className="flex items-center gap-2.5 py-2.5 px-2.5 rounded-xl hover:bg-[#f0f4ff] transition-colors"
                      style={{ opacity: exists ? 0.4 : 1, cursor: exists ? 'default' : 'pointer' }}>
                      <div className="flex-1 text-[14px] text-[#0b1c30] text-right">{item.name}</div>
                      {exists
                        ? <span className="text-[10px] py-1 px-2.5 rounded-full font-semibold bg-[#f0f4ff] text-[#464554]">ברשימה</span>
                        : <span className="text-[10px] py-1 px-2.5 rounded-full font-semibold bg-[#e1e0ff] text-[#4648d4] flex items-center gap-1"><Plus size={9} /> הוסף</span>
                      }
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
