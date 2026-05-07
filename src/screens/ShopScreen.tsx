import { useState, useRef } from 'react';
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

interface UndoState {
  item: ShoppingItem;
  index: number;
}

export default function ShopScreen({ list, master, allLists, onUpdate, onListsChange, onBack }: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [editOpen, setEditOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [dupDate, setDupDate] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [undo, setUndo] = useState<UndoState | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { message, fire } = useToast();

  const total = list.items.length;
  const done = list.items.filter(i => i.checked).length;

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
    const items = list.items.filter((_, i) => i !== idx);
    save({ ...list, items });

    // Undo
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
    if (undoTimer.current) clearTimeout(undoTimer.current);
    fire('הפריט הוחזר!');
  }

  function addItemFromMaster(item: { name: string; freq: 'monthly' | 'occasional' }, cat: MasterCategory) {
    const exists = list.items.find(i => i.name === item.name && i.category === cat.name);
    if (exists) { fire('הפריט כבר ברשימה'); return; }
    const newItem: ShoppingItem = {
      name: item.name, freq: item.freq,
      category: cat.name, catIcon: cat.icon, catColor: cat.color,
      checked: false
    };
    save({ ...list, items: [...list.items, newItem] });
    fire(`${item.name} נוסף!`);
  }

  async function handleCopy() {
    try {
      await copyListToWhatsApp(list);
      fire('הועתק! 📋');
    } catch {
      fire('שגיאה בהעתקה');
    }
    setEditOpen(false);
  }

  async function handleDuplicate() {
    const newList: ShoppingList = {
      id: generateListId(),
      visibleId: generateVisibleId(),
      userId: list.userId,
      date: dupDate || new Date().toISOString().split('T')[0],
      store: list.store,
      items: list.items.map(i => ({ ...i, checked: false })),
      closed: false,
      createdAt: new Date().toISOString()
    };
    await saveShoppingList(newList);
    onListsChange([...allLists, newList]);
    setDupOpen(false);
    setDupDate('');
    fire(`רשימה ${newList.visibleId} שוכפלה!`);
  }

  function handleReset() {
    save({ ...list, items: list.items.map(i => ({ ...i, checked: false })) });
    setEditOpen(false);
    fire('הרשימה אופסה');
  }

  function handleClose() {
    save({ ...list, closed: true });
    setEditOpen(false);
    fire('הרשימה נסגרה ✅');
  }

  function handleReopen() {
    save({ ...list, closed: false });
    setEditOpen(false);
    fire('הרשימה נפתחה');
  }

  // Group items by category
  const grouped: Record<string, { icon: string; color: string; name: string; items: (ShoppingItem & { idx: number })[] }> = {};
  list.items.forEach((item, idx) => {
    if (!grouped[item.category]) grouped[item.category] = { icon: item.catIcon, color: item.catColor, name: item.category, items: [] };
    grouped[item.category].items.push({ ...item, idx });
  });
  const cats = Object.values(grouped);

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-12">
      <Header
        title={`${list.visibleId}`}
        subtitle={`${formatDate(list.date)} · ${list.store} ${list.closed ? '🔒' : ''}`}
        onBack={onBack}
      >
        <div className="flex justify-center gap-3.5 mt-2 text-xs font-medium">
          <div className="bg-white/10 py-1 px-3.5 rounded-2xl">
            נשאר: <span className="font-bold text-[#ffd166]">{total - done}</span>
          </div>
          <div className="bg-white/10 py-1 px-3.5 rounded-2xl">
            נלקח: <span className="font-bold text-[#a7f3d0]">{done}</span>
          </div>
        </div>
      </Header>

      {/* Filters */}
      <div className="sticky top-[102px] z-40 bg-[#faf8f5] border-b border-[#e8e4df] px-4 py-2">
        <input placeholder="🔍 חיפוש..." value={search}
          onChange={e => setSearch(e.target.value)}
          className={inputClass + ' mb-1.5'} />
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'done'] as const).map(f => {
            const label = f === 'all' ? `הכל (${total})` : f === 'pending' ? `טרם נלקח (${total - done})` : `נלקח (${done})`;
            return <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{label}</Pill>;
          })}
          <div className="mr-auto flex gap-1.5">
            <Pill active={false} onClick={() => setEditOpen(true)}>⚙️</Pill>
            <Pill active={false} onClick={() => { setAddSearch(''); setAddOpen(true); }}>+ פריט</Pill>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-lg mx-auto px-4 py-2">
        {cats.map((cat, ci) => {
          const filtered = cat.items.filter(i => {
            const ms = !search || i.name.includes(search);
            const mf = filter === 'all' || (filter === 'done' ? i.checked : !i.checked);
            return ms && mf;
          });
          if (!filtered.length) return null;
          const cd = filtered.filter(i => i.checked).length;
          const ad = cd === filtered.length;
          const isCol = collapsed[ci] !== false;

          return (
            <div key={ci} className="mb-2.5 rounded-[14px] overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}
                className="flex items-center gap-2.5 py-3 px-4 cursor-pointer select-none">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-xl shrink-0"
                  style={{ background: cat.color + '15', color: cat.color }}>{cat.icon}</div>
                <div className="flex-1 font-bold text-[15px]" style={{ color: cat.color }}>{cat.name}</div>
                <div className="text-[11px] py-0.5 px-2.5 rounded-full font-semibold"
                  style={{
                    background: ad ? '#d8f3dc' : cat.color + '15',
                    color: ad ? '#2d6a4f' : cat.color
                  }}>{cd}/{filtered.length}</div>
                <span className="text-xs text-gray-400 transition-transform"
                  style={{ transform: isCol ? 'rotate(90deg)' : 'none' }}>◀</span>
              </div>
              {!isCol && (
                <div className="px-2.5 pb-2.5">
                  {filtered.map(item => (
                    <div key={item.idx}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-[10px] transition-all"
                      style={{ opacity: item.checked ? 0.4 : 1 }}>
                      <div onClick={() => toggleItem(item.idx)} className="cursor-pointer">
                        <Checkbox checked={item.checked} />
                      </div>
                      <div onClick={() => toggleItem(item.idx)}
                        className="flex-1 text-sm cursor-pointer"
                        style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>
                        {item.name}
                      </div>
                      <button onClick={() => removeItem(item.idx)}
                        className="border-none bg-transparent text-gray-300 text-base cursor-pointer px-1.5
                          hover:text-red-400 transition-colors">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Undo bar */}
      {undo && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white
          py-3 px-5 rounded-2xl flex items-center gap-3 z-[300] shadow-2xl"
          style={{ animation: 'fadeUp .3s ease' }}>
          <span className="text-sm">הפריט "{undo.item.name}" הוסר</span>
          <button onClick={handleUndo}
            className="bg-[#ffd166] text-[#1a1a2e] border-none py-1.5 px-4 rounded-xl
              font-bold text-xs cursor-pointer"
            style={{ fontFamily: 'inherit' }}>
            בטל
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="font-bold text-lg mb-4 text-center">⚙️ עריכת רשימה</div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">📅 תאריך</label>
        <input type="date" value={list.date}
          onChange={e => save({ ...list, date: e.target.value })}
          className={inputClass + ' mb-3'} />
        <div className="flex flex-col gap-2">
          <button onClick={handleCopy}
            className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#e3f2fd] text-[#0077b6]"
            style={{ fontFamily: 'inherit' }}>📋 העתק לוואצאפ</button>
          <button onClick={handleReset}
            className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#fff3e0] text-[#e65100]"
            style={{ fontFamily: 'inherit' }}>🔄 איפוס סימונים</button>
          <button onClick={() => { setDupDate(''); setDupOpen(true); setEditOpen(false); }}
            className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#e8f5e9] text-[#2e7d32]"
            style={{ fontFamily: 'inherit' }}>📑 שכפל רשימה</button>
          {!list.closed ? (
            <button onClick={handleClose}
              className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#ffeaea] text-[#d32f2f]"
              style={{ fontFamily: 'inherit' }}>🔒 סגור רשימה</button>
          ) : (
            <button onClick={handleReopen}
              className="py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#d8f3dc] text-[#2d6a4f]"
              style={{ fontFamily: 'inherit' }}>🔓 פתח מחדש</button>
          )}
        </div>
        <button onClick={() => setEditOpen(false)}
          className="mt-3 w-full py-3 border-none rounded-xl bg-gray-100 text-gray-400
            font-semibold text-sm cursor-pointer"
          style={{ fontFamily: 'inherit' }}>סגור</button>
      </BottomSheet>

      {/* Duplicate Modal */}
      <CenterModal open={dupOpen} onClose={() => setDupOpen(false)}>
        <div className="font-bold text-base mb-3.5 text-center">📑 שכפול רשימה</div>
        <label className="text-xs font-semibold text-gray-500">תאריך לרשימה החדשה</label>
        <input type="date" value={dupDate} onChange={e => setDupDate(e.target.value)}
          className={inputClass + ' mt-1 mb-3.5'} />
        <div className="flex gap-2">
          <button onClick={() => setDupOpen(false)}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-gray-100 text-gray-400"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleDuplicate}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#e63946] text-white"
            style={{ fontFamily: 'inherit' }}>שכפל ✨</button>
        </div>
      </CenterModal>

      {/* Add Item Modal */}
      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)}>
        <div className="font-bold text-base mb-3 text-center">➕ הוסף פריט מהמאסטר</div>
        <input placeholder="🔍 חיפוש..." value={addSearch}
          onChange={e => setAddSearch(e.target.value)}
          className={inputClass + ' mb-3'} />
        <div className="max-h-[50vh] overflow-auto">
          {master.map((cat, ci) => {
            const items = cat.items.filter(i => !addSearch || i.name.includes(addSearch));
            if (!items.length) return null;
            return (
              <div key={ci} className="mb-2">
                <div className="text-[13px] font-bold mb-1" style={{ color: cat.color }}>
                  {cat.icon} {cat.name}
                </div>
                {items.map((item, ii) => {
                  const exists = list.items.find(i => i.name === item.name && i.category === cat.name);
                  return (
                    <div key={ii}
                      onClick={() => !exists && addItemFromMaster(item, cat)}
                      className="flex items-center gap-2.5 py-2 px-2 rounded-lg cursor-pointer"
                      style={{ opacity: exists ? 0.4 : 1, cursor: exists ? 'default' : 'pointer' }}>
                      <div className="flex-1 text-[13px]">{item.name}</div>
                      {exists
                        ? <span className="text-[10px] py-0.5 px-2 rounded-md font-semibold bg-gray-100 text-gray-400">ברשימה</span>
                        : <span className="text-[10px] py-0.5 px-2 rounded-md font-semibold bg-[#e8f5e9] text-[#2e7d32]">+ הוסף</span>
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
