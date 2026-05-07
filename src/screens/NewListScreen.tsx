import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { MasterCategory, ShoppingItem, ShoppingList } from '../types';
import { generateListId, generateVisibleId, saveShoppingList } from '../lib/db';
import { Header, BottomBar, Pill, FreqTag, Checkbox, Toast, inputClass } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  userId: string;
  master: MasterCategory[];
  onCreated: (list: ShoppingList) => void;
  onBack: () => void;
}

export default function NewListScreen({ userId, master, onCreated, onBack }: Props) {
  const [date, setDate]   = useState('');
  const [store, setStore] = useState('');
  const [sel, setSel]     = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>(() => {
    const c: Record<number, boolean> = {};
    master.forEach((_, i) => { c[i] = true; });
    return c;
  });
  const [filter, setFilter] = useState<'all' | 'monthly' | 'occasional'>('all');
  const [search, setSearch] = useState('');
  const { message, fire }   = useToast();

  const selCount = Object.values(sel).filter(Boolean).length;

  async function handleCreate() {
    const items: ShoppingItem[] = [];
    master.forEach((cat, ci) => {
      cat.items.forEach((item, ii) => {
        if (sel[`${ci}-${ii}`]) {
          items.push({ name: item.name, freq: item.freq, category: cat.name, catIcon: cat.icon, catColor: cat.color, checked: false });
        }
      });
    });
    if (!items.length) { fire('בחר לפחות פריט אחד'); return; }
    if (!date)         { fire('בחר תאריך');           return; }

    const list: ShoppingList = {
      id: generateListId(), visibleId: generateVisibleId(),
      userId, date, store: store || 'רמי לוי',
      items, closed: false, createdAt: new Date().toISOString(),
    };
    await saveShoppingList(list);
    onCreated(list);
  }

  return (
    <div className="min-h-dvh bg-slate-50 pb-28">
      <Header
        title="רשימה חדשה"
        subtitle={selCount ? `${selCount} פריטים נבחרו` : 'בחר פריטים'}
        onBack={onBack}
      />

      {/* Sticky filters */}
      <div className="sticky top-[73px] z-40 bg-slate-50 border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2.5">
          <div className="flex gap-2 mb-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass + ' flex-1'} />
            <input placeholder="חנות" value={store} onChange={e => setStore(e.target.value)} className={inputClass} style={{ flex: 0.65 }} />
          </div>
          <div className="relative mb-2.5">
            <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400" />
            <input
              placeholder="חיפוש פריט..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-2.5 pr-10 pl-4 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all font-[inherit] placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'monthly', 'occasional'] as const).map(f => (
              <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === 'all' ? 'הכל' : f === 'monthly' ? 'חודשי' : 'מדי פעם'}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-lg mx-auto px-4 py-3 flex flex-col gap-2">
        {master.map((cat, ci) => {
          const items = cat.items
            .map((item, ii) => ({ ...item, key: `${ci}-${ii}`, checked: !!sel[`${ci}-${ii}`] }))
            .filter(i => (filter === 'all' || i.freq === filter) && (!search || i.name.includes(search)));
          if (!items.length) return null;

          const isCol  = collapsed[ci] !== false;
          const catSel = items.filter(i => i.checked).length;
          const allSel = catSel === items.length && items.length > 0;

          return (
            <div key={ci} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}
                className="w-full flex items-center gap-3 py-3.5 px-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                style={{ fontFamily: 'inherit' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: cat.color + '18', color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="flex-1 font-bold text-[14px] text-right" style={{ color: cat.color }}>{cat.name}</div>
                {catSel > 0 && (
                  <span className="text-[11px] py-0.5 px-2.5 rounded-full font-semibold"
                    style={{ background: allSel ? '#d1fae5' : '#ede9fe', color: allSel ? '#059669' : '#7c3aed' }}>
                    {catSel} נבחרו
                  </span>
                )}
                {isCol ? <ChevronDown size={16} className="text-slate-400 shrink-0" />
                       : <ChevronUp   size={16} className="text-slate-400 shrink-0" />}
              </button>

              {!isCol && (
                <div className="px-3 pb-3 border-t border-slate-50">
                  <div className="flex gap-2 mb-2 pt-1">
                    <button onClick={() => setSel(p => { const n = { ...p }; items.forEach(i => { n[i.key] = true; }); return n; })}
                      className="flex items-center gap-1.5 border-none bg-violet-50 text-violet-600 py-1.5 px-3 rounded-lg text-[11px] font-semibold cursor-pointer active:scale-95 transition-all"
                      style={{ fontFamily: 'inherit' }}>
                      <Check size={11} /> בחר הכל
                    </button>
                    <button onClick={() => setSel(p => { const n = { ...p }; items.forEach(i => { delete n[i.key]; }); return n; })}
                      className="flex items-center gap-1.5 border-none bg-slate-100 text-slate-500 py-1.5 px-3 rounded-lg text-[11px] font-semibold cursor-pointer active:scale-95 transition-all"
                      style={{ fontFamily: 'inherit' }}>
                      נקה
                    </button>
                  </div>
                  {items.map(item => (
                    <div key={item.key}
                      onClick={() => setSel(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className="flex items-center gap-3 py-2.5 px-1.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <Checkbox checked={item.checked} color="#7c3aed" />
                      <div className="flex-1 text-sm text-slate-800">{item.name}</div>
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
        <button onClick={onBack}
          className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-slate-100 text-slate-600 active:scale-95 transition-all"
          style={{ fontFamily: 'inherit' }}>
          ביטול
        </button>
        <button onClick={handleCreate}
          className="font-bold text-sm text-white cursor-pointer rounded-xl py-3.5 border-none active:scale-95 active:brightness-90 transition-all"
          style={{
            flex: 1.5,
            background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
            boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
            fontFamily: 'inherit',
          }}>
          צור רשימה {selCount > 0 ? `(${selCount})` : ''}
        </button>
      </BottomBar>

      <Toast msg={message} />
    </div>
  );
}
