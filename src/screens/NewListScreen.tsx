import { useState } from 'react';
import type { MasterCategory, ShoppingItem, ShoppingList } from '../types';
import { generateListId, generateVisibleId, saveShoppingList } from '../lib/db';
import { Header, BottomBar, Btn, Pill, FreqTag, Checkbox, Toast, inputClass } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  userId: string;
  master: MasterCategory[];
  onCreated: (list: ShoppingList) => void;
  onBack: () => void;
}

export default function NewListScreen({ userId, master, onCreated, onBack }: Props) {
  const [date, setDate] = useState('');
  const [store, setStore] = useState('');
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>(() => {
    const c: Record<number, boolean> = {};
    master.forEach((_, i) => c[i] = true);
    return c;
  });
  const [filter, setFilter] = useState<'all' | 'monthly' | 'occasional'>('all');
  const [search, setSearch] = useState('');
  const { message, fire } = useToast();

  const selCount = Object.values(sel).filter(Boolean).length;

  async function handleCreate() {
    const items: ShoppingItem[] = [];
    master.forEach((cat, ci) => {
      cat.items.forEach((item, ii) => {
        if (sel[`${ci}-${ii}`]) {
          items.push({
            name: item.name, freq: item.freq,
            category: cat.name, catIcon: cat.icon, catColor: cat.color,
            checked: false
          });
        }
      });
    });
    if (!items.length) { fire('בחר לפחות פריט אחד'); return; }
    if (!date) { fire('בחר תאריך'); return; }

    const list: ShoppingList = {
      id: generateListId(),
      visibleId: generateVisibleId(),
      userId, date,
      store: store || 'רמי לוי',
      items, closed: false,
      createdAt: new Date().toISOString()
    };
    await saveShoppingList(list);
    onCreated(list);
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-28">
      <Header title="רשימה חדשה" subtitle={`${selCount} פריטים נבחרו`} onBack={onBack} />

      {/* Details section */}
      <div className="sticky top-[76px] z-40 bg-[#faf8f5] border-b border-[#e8e4df]">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2">
          <div className="flex gap-2 mb-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className={inputClass + ' flex-1'} />
            <input placeholder="🏪 חנות" value={store} onChange={e => setStore(e.target.value)}
              className={inputClass} style={{ flex: 0.7 }} />
          </div>

          <div className="h-px bg-[#e8e4df] my-2" />

          <input placeholder="🔍 חיפוש פריט..." value={search}
            onChange={e => setSearch(e.target.value)}
            className={inputClass + ' mb-2'} />
          <div className="flex gap-1.5 pb-1">
            {(['all', 'monthly', 'occasional'] as const).map(f => (
              <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === 'all' ? 'הכל' : f === 'monthly' ? '🔄 חודשי' : '📅 מדי פעם'}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-lg mx-auto px-4 py-2">
        {master.map((cat, ci) => {
          const items = cat.items
            .map((item, ii) => ({ ...item, key: `${ci}-${ii}`, checked: !!sel[`${ci}-${ii}`] }))
            .filter(i => (filter === 'all' || i.freq === filter) && (!search || i.name.includes(search)));
          if (!items.length) return null;
          const isCol = collapsed[ci] !== false;
          const catSel = items.filter(i => i.checked).length;

          return (
            <div key={ci} className="mb-2.5 rounded-[14px] overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}
                className="flex items-center gap-2.5 py-3.5 px-4 cursor-pointer select-none">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-xl shrink-0"
                  style={{ background: cat.color + '15', color: cat.color }}>{cat.icon}</div>
                <div className="flex-1 font-bold text-[15px]" style={{ color: cat.color }}>{cat.name}</div>
                <span className="text-[10px] py-0.5 px-2 rounded-md font-semibold bg-[#e8f5e9] text-[#2e7d32]">
                  {catSel} נבחרו
                </span>
                <span className="text-xs text-gray-400 transition-transform"
                  style={{ transform: isCol ? 'rotate(90deg)' : 'none' }}>◀</span>
              </div>
              {!isCol && (
                <div className="px-2.5 pb-2.5">
                  <div className="flex gap-2 mb-1.5 pr-1">
                    <button onClick={() => setSel(p => { const n = { ...p }; items.forEach(i => n[i.key] = true); return n; })}
                      className="border-none bg-[#e8f5e9] text-[#2e7d32] py-1 px-3 rounded-lg text-[11px] font-semibold cursor-pointer"
                      style={{ fontFamily: 'inherit' }}>בחר הכל</button>
                    <button onClick={() => setSel(p => { const n = { ...p }; items.forEach(i => delete n[i.key]); return n; })}
                      className="border-none bg-[#ffeaea] text-[#d32f2f] py-1 px-3 rounded-lg text-[11px] font-semibold cursor-pointer"
                      style={{ fontFamily: 'inherit' }}>נקה הכל</button>
                  </div>
                  {items.map(item => (
                    <div key={item.key}
                      onClick={() => setSel(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-[10px] cursor-pointer hover:bg-black/[0.02]">
                      <Checkbox checked={item.checked} color="#e63946" />
                      <div className="flex-1 text-sm">{item.name}</div>
                      <FreqTag freq={item.freq} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomBar>
        <Btn bg="#f0f0f0" fg="#666" onClick={onBack}>ביטול</Btn>
        <Btn bg="#e63946" fg="#fff" onClick={handleCreate} flex={1.5}>צור רשימה ({selCount}) ✨</Btn>
      </BottomBar>
      <Toast msg={message} />
    </div>
  );
}
