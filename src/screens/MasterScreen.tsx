import { useState, useEffect } from 'react';
import { Trash2, Pencil, ChevronDown, ChevronUp, RotateCcw, Archive } from 'lucide-react';
import type { MasterCategory, DeletedMasterItem, DeletedMasterCategory } from '../types';
import { saveMasterList, getMasterTrash, saveMasterTrash } from '../lib/db';
import { Header, Pill, FreqTag, CenterModal, Toast, FAB, EmptyState, inputClass } from '../components/ui';
import { useToast } from '../hooks/useToast';

// Emoji → color map for new categories
const EMOJI_COLORS: Record<string, string> = {
  '🥩': '#ef4444', '🥛': '#3b82f6', '🍞': '#f59e0b', '🥦': '#22c55e',
  '🍎': '#ef4444', '🐾': '#8b5cf6', '👶': '#f59e0b', '🧻': '#64748b',
  '🧼': '#06b6d4', '🐟': '#0ea5e9', '📦': '#607d8b', '🍝': '#f97316',
  '🥚': '#eab308', '🧅': '#84cc16', '🥤': '#06b6d4', '🍫': '#92400e',
};
const PRESET_EMOJIS = Object.keys(EMOJI_COLORS);

interface Props {
  master: MasterCategory[];
  onUpdate: (master: MasterCategory[]) => void;
  onBack: () => void;
}

export default function MasterScreen({ master, onUpdate, onBack }: Props) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>(() => {
    const c: Record<number, boolean> = {};
    master.forEach((_, i) => { c[i] = true; });
    return c;
  });
  const [trashItems, setTrashItems] = useState<DeletedMasterItem[]>([]);
  const [trashCats,  setTrashCats]  = useState<DeletedMasterCategory[]>([]);
  const [showTrash,  setShowTrash]  = useState(false);

  const [addCatOpen,  setAddCatOpen]  = useState(false);
  const [newCatName,  setNewCatName]  = useState('');
  const [newCatIcon,  setNewCatIcon]  = useState('📦');

  const [addItemCat,  setAddItemCat]  = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemFreq, setNewItemFreq] = useState<'monthly' | 'occasional'>('monthly');

  const [editItem, setEditItem] = useState<{ ci: number; ii: number } | null>(null);
  const [editName, setEditName] = useState('');
  const [editFreq, setEditFreq] = useState<'monthly' | 'occasional'>('monthly');

  const [restoreItem,   setRestoreItem]   = useState<DeletedMasterItem | null>(null);
  const [restoreCatIdx, setRestoreCatIdx] = useState(0);

  const { message, fire } = useToast();

  useEffect(() => {
    getMasterTrash().then(t => { setTrashItems(t.items || []); setTrashCats(t.categories || []); });
  }, []);

  function save(updated: MasterCategory[]) { onUpdate(updated); saveMasterList(updated); }
  function saveTrash(items: DeletedMasterItem[], cats: DeletedMasterCategory[]) {
    setTrashItems(items); setTrashCats(cats); saveMasterTrash({ items, categories: cats });
  }

  function deleteItem(ci: number, ii: number) {
    const item = master[ci].items[ii];
    const updated = [...master];
    updated[ci] = { ...updated[ci], items: updated[ci].items.filter((_, i) => i !== ii) };
    save(updated);
    saveTrash([...trashItems, { item, fromCategory: master[ci].name, deletedAt: new Date().toISOString() }], trashCats);
    fire('הפריט הועבר לאשפה');
  }

  function deleteCategory(ci: number) {
    const cat = master[ci];
    const updated = [...master]; updated.splice(ci, 1); save(updated);
    saveTrash(
      [...trashItems, ...cat.items.map(item => ({ item, fromCategory: cat.name, deletedAt: new Date().toISOString() }))],
      [...trashCats, { category: cat, deletedAt: new Date().toISOString() }],
    );
    fire(`"${cat.name}" הועברה לאשפה`);
  }

  function handleRestore() {
    if (!restoreItem) return;
    const updated = [...master];
    updated[restoreCatIdx] = { ...updated[restoreCatIdx], items: [...updated[restoreCatIdx].items, restoreItem.item] };
    save(updated);
    saveTrash(trashItems.filter(t => t !== restoreItem), trashCats);
    setRestoreItem(null); fire('הפריט הוחזר!');
  }

  function restoreCategory(trashCat: DeletedMasterCategory) {
    save([...master, trashCat.category]);
    const catItemNames = new Set(trashCat.category.items.map(i => i.name));
    saveTrash(
      trashItems.filter(t => !(t.fromCategory === trashCat.category.name && catItemNames.has(t.item.name))),
      trashCats.filter(t => t !== trashCat),
    );
    fire(`"${trashCat.category.name}" הוחזרה!`);
  }

  function permanentDeleteItem(item: DeletedMasterItem) {
    saveTrash(trashItems.filter(t => t !== item), trashCats);
    fire('נמחק לצמיתות');
  }

  function permanentDeleteCat(cat: DeletedMasterCategory) {
    const catItemNames = new Set(cat.category.items.map(i => i.name));
    saveTrash(
      trashItems.filter(t => !(t.fromCategory === cat.category.name && catItemNames.has(t.item.name))),
      trashCats.filter(t => t !== cat),
    );
    fire('נמחק לצמיתות');
  }

  function handleAddCategory() {
    if (!newCatName.trim()) { fire('צריך שם'); return; }
    const color = EMOJI_COLORS[newCatIcon] ?? '#607d8b';
    save([...master, { id: 'cat-' + Date.now().toString(36), name: newCatName.trim(), icon: newCatIcon, color, items: [] }]);
    setAddCatOpen(false); setNewCatName(''); setNewCatIcon('📦');
    fire('קטגוריה נוספה!');
  }

  function handleAddItem() {
    if (addItemCat === null || !newItemName.trim()) { fire('צריך שם'); return; }
    const updated = [...master];
    updated[addItemCat] = { ...updated[addItemCat], items: [...updated[addItemCat].items, { name: newItemName.trim(), freq: newItemFreq }] };
    save(updated);
    setAddItemCat(null); setNewItemName('');
    fire('פריט נוסף!');
  }

  function handleEditItem() {
    if (!editItem || !editName.trim()) { fire('צריך שם'); return; }
    const updated = [...master];
    const items = [...updated[editItem.ci].items];
    items[editItem.ii] = { name: editName.trim(), freq: editFreq };
    updated[editItem.ci] = { ...updated[editItem.ci], items };
    save(updated); setEditItem(null); fire('הפריט עודכן');
  }

  const totalTrash = trashItems.length + trashCats.length;

  return (
    <div className="min-h-dvh bg-[#f8f9ff] pb-28">
      <Header title="רשימת מאסטר" onBack={onBack} />

      {/* Tabs */}
      <div className="sticky top-[73px] z-40 bg-[#f8f9ff] border-b border-[#e5eeff] px-4 py-2.5 flex gap-2">
        <Pill active={!showTrash} onClick={() => setShowTrash(false)}>פריטים פעילים</Pill>
        <Pill active={showTrash}  onClick={() => setShowTrash(true)}>
          נמחקו לאחרונה {totalTrash > 0 ? `(${totalTrash})` : ''}
        </Pill>
      </div>

      <div className="max-w-lg mx-auto px-4 py-3 flex flex-col gap-2">
        {!showTrash ? (
          <>
            {master.map((cat, ci) => {
              const isCol = collapsed[ci] !== false;
              return (
                <div key={ci} className="bg-white rounded-2xl border border-[#e5eeff] overflow-hidden shadow-sm"
                  style={{ borderRight: `4px solid ${cat.color}`, animation: `fadeUp 0.28s ease ${ci * 45}ms both` }}>
                  <div className="flex items-center gap-2.5 py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: cat.color + '18', color: cat.color }}>{cat.icon}</div>
                    <div className="flex-1 font-bold text-[15px]" style={{ color: cat.color }}>{cat.name}</div>
                    <span className="text-[11px] py-0.5 px-2.5 rounded-full font-semibold"
                      style={{ background: cat.color + '18', color: cat.color }}>
                      {cat.items.length} פריטים
                    </span>
                    <button onClick={e => { e.stopPropagation(); deleteCategory(ci); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border-none
                        bg-transparent text-[#c7c4d7] cursor-pointer hover:bg-[#fdecea] hover:text-[#ba1a1a] transition-all">
                      <Trash2 size={14} />
                    </button>
                    {isCol ? <ChevronDown size={16} className="text-[#c7c4d7] shrink-0" />
                           : <ChevronUp   size={16} className="text-[#c7c4d7] shrink-0" />}
                  </div>

                  {!isCol && (
                    <div className="px-3 pb-3 border-t border-[#f0f4ff]">
                      {cat.items.map((item, ii) => (
                        <div key={ii} className="flex items-center gap-2.5 py-2.5 px-2 rounded-xl hover:bg-[#f0f4ff] transition-colors">
                          <div className="flex-1 text-[14px] text-[#0b1c30]">{item.name}</div>
                          <FreqTag freq={item.freq} />
                          <button onClick={() => { setEditItem({ ci, ii }); setEditName(item.name); setEditFreq(item.freq); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border-none
                              bg-transparent text-[#c7c4d7] cursor-pointer hover:bg-[#e1e0ff] hover:text-[#4648d4] transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteItem(ci, ii)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border-none
                              bg-transparent text-[#c7c4d7] cursor-pointer hover:bg-[#fdecea] hover:text-[#ba1a1a] transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => { setAddItemCat(ci); setNewItemName(''); setNewItemFreq('monthly'); }}
                        className="mt-1.5 w-full py-2 px-3.5 rounded-xl border-none
                          text-[13px] text-[#4648d4] font-semibold cursor-pointer
                          bg-[#e1e0ff]/50 hover:bg-[#e1e0ff] transition-colors text-center"
                        style={{ fontFamily: 'inherit' }}>
                        + הוסף פריט
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <>
            {trashCats.length > 0 && (
              <>
                <p className="text-[13px] font-bold text-[#464554] mb-1 mt-1 px-1">קטגוריות שנמחקו</p>
                {trashCats.map((tc, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#e5eeff] p-4 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-2xl">{tc.category.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-[14px] text-[#0b1c30]">{tc.category.name}</div>
                        <div className="text-[11px] text-[#464554]">{tc.category.items.length} פריטים</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => restoreCategory(tc)}
                        className="flex-1 py-2.5 border-none rounded-2xl font-bold text-xs cursor-pointer
                          bg-[#e6f4ea] text-[#006c49] flex items-center justify-center gap-1.5"
                        style={{ fontFamily: 'inherit' }}>
                        <RotateCcw size={12} /> שחזר קטגוריה
                      </button>
                      <button onClick={() => permanentDeleteCat(tc)}
                        className="flex-1 py-2.5 border-none rounded-2xl font-bold text-xs cursor-pointer
                          bg-[#fdecea] text-[#ba1a1a] flex items-center justify-center gap-1.5"
                        style={{ fontFamily: 'inherit' }}>
                        <Trash2 size={12} /> מחק לצמיתות
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {trashItems.length > 0 && (
              <>
                <p className="text-[13px] font-bold text-[#464554] mb-1 mt-3 px-1">פריטים שנמחקו</p>
                {trashItems.map((ti, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#e5eeff] py-3 px-4 shadow-sm flex items-center gap-2.5">
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[#0b1c30]">{ti.item.name}</div>
                      <div className="text-[11px] text-[#464554]">מ-{ti.fromCategory}</div>
                    </div>
                    <button onClick={() => { setRestoreItem(ti); setRestoreCatIdx(0); }}
                      className="border-none bg-[#e6f4ea] text-[#006c49] py-1.5 px-3 rounded-xl text-[11px]
                        font-semibold cursor-pointer flex items-center gap-1.5"
                      style={{ fontFamily: 'inherit' }}>
                      <RotateCcw size={10} /> שחזר
                    </button>
                    <button onClick={() => permanentDeleteItem(ti)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border-none
                        bg-transparent text-[#c7c4d7] cursor-pointer hover:bg-[#fdecea] hover:text-[#ba1a1a] transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </>
            )}

            {!trashItems.length && !trashCats.length && (
              <EmptyState icon={<Archive size={26} />} title="האשפה ריקה" />
            )}
          </>
        )}
      </div>

      {/* FAB — add category */}
      {!showTrash && <FAB onClick={() => { setAddCatOpen(true); setNewCatName(''); setNewCatIcon('📦'); }} />}

      {/* Add Category Modal */}
      <CenterModal open={addCatOpen} onClose={() => setAddCatOpen(false)}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setAddCatOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border-none
              bg-[#f0f4ff] text-[#464554] cursor-pointer text-lg"
            style={{ fontFamily: 'inherit' }}>✕</button>
          <h2 className="font-bold text-[16px] text-[#0b1c30]">קטגוריה חדשה</h2>
          <div className="w-8" />
        </div>
        <div className="h-px bg-[#e5eeff] mb-4" />
        <label className="text-[12px] font-semibold text-[#464554] block mb-1.5">שם הקטגוריה</label>
        <input placeholder="לדוגמה: ירקות ופירות" value={newCatName} onChange={e => setNewCatName(e.target.value)}
          className={inputClass + ' mb-4'} />
        <label className="text-[12px] font-semibold text-[#464554] block mb-2">בחר סמל (אייקון)</label>
        <div className="grid grid-cols-5 gap-2 mb-5 bg-[#f8f9ff] rounded-2xl p-3">
          {PRESET_EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => setNewCatIcon(emoji)}
              className="w-full aspect-square rounded-xl text-2xl flex items-center justify-center
                border-2 cursor-pointer transition-all active:scale-95"
              style={{
                background:   newCatIcon === emoji ? '#e1e0ff' : 'white',
                borderColor:  newCatIcon === emoji ? '#4648d4' : 'transparent',
                fontFamily:   'inherit',
              }}>
              {emoji}
            </button>
          ))}
        </div>
        <div className="h-px bg-[#e5eeff] mb-4" />
        <div className="flex gap-2.5">
          <button onClick={() => setAddCatOpen(false)}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer bg-[#f0f4ff] text-[#464554]"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleAddCategory}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer text-white flex items-center justify-center gap-1.5"
            style={{ background: '#4648d4', fontFamily: 'inherit' }}>✓ אישור</button>
        </div>
      </CenterModal>

      {/* Add Item Modal */}
      <CenterModal open={addItemCat !== null} onClose={() => setAddItemCat(null)}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setAddItemCat(null)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border-none
              bg-[#f0f4ff] text-[#464554] cursor-pointer text-lg"
            style={{ fontFamily: 'inherit' }}>✕</button>
          <h2 className="font-bold text-[16px] text-[#0b1c30]">פריט חדש</h2>
          <div className="w-8" />
        </div>
        <div className="h-px bg-[#e5eeff] mb-4" />
        <label className="text-[12px] font-semibold text-[#464554] block mb-1.5">שם הפריט</label>
        <input placeholder="לדוגמה: חלב סויה" value={newItemName} onChange={e => setNewItemName(e.target.value)}
          className={inputClass + ' mb-4'} />
        <label className="text-[12px] font-semibold text-[#464554] block mb-2">קטגוריה</label>
        <div className="bg-[#eff4ff] border border-[#c7c4d7] rounded-2xl py-3 px-4 text-sm text-[#0b1c30] mb-4 text-right">
          {addItemCat !== null ? master[addItemCat]?.name : ''}
        </div>
        <div className="flex gap-2 mb-4">
          <Pill active={newItemFreq === 'monthly'}    onClick={() => setNewItemFreq('monthly')}>חודשי</Pill>
          <Pill active={newItemFreq === 'occasional'} onClick={() => setNewItemFreq('occasional')}>מדי פעם</Pill>
        </div>
        <div className="h-px bg-[#e5eeff] mb-4" />
        <div className="flex gap-2.5">
          <button onClick={() => setAddItemCat(null)}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer bg-[#f0f4ff] text-[#464554]"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleAddItem}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer text-white flex items-center justify-center gap-1.5"
            style={{ background: '#4648d4', fontFamily: 'inherit' }}>✓ אישור</button>
        </div>
      </CenterModal>

      {/* Edit Item Modal */}
      <CenterModal open={editItem !== null} onClose={() => setEditItem(null)}>
        <h2 className="font-bold text-[16px] text-[#0b1c30] text-center mb-4">עריכת פריט</h2>
        <input placeholder="שם הפריט" value={editName} onChange={e => setEditName(e.target.value)}
          className={inputClass + ' mb-3'} />
        <div className="flex gap-2 mb-4">
          <Pill active={editFreq === 'monthly'}    onClick={() => setEditFreq('monthly')}>חודשי</Pill>
          <Pill active={editFreq === 'occasional'} onClick={() => setEditFreq('occasional')}>מדי פעם</Pill>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setEditItem(null)}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer bg-[#f0f4ff] text-[#464554]"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleEditItem}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer text-white"
            style={{ background: '#4648d4', fontFamily: 'inherit' }}>שמור</button>
        </div>
      </CenterModal>

      {/* Restore Item Modal */}
      <CenterModal open={restoreItem !== null} onClose={() => setRestoreItem(null)}>
        <h2 className="font-bold text-[16px] text-[#0b1c30] text-center mb-2">שחזור פריט</h2>
        <p className="text-[13px] text-center text-[#464554] mb-4">
          לאיזה קטגוריה להחזיר את "<span className="font-bold">{restoreItem?.item.name}</span>"?
        </p>
        <div className="max-h-[40vh] overflow-auto mb-4 flex flex-col gap-1.5">
          {master.map((cat, ci) => (
            <div key={ci} onClick={() => setRestoreCatIdx(ci)}
              className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl cursor-pointer transition-all border-2"
              style={{
                background:   restoreCatIdx === ci ? '#e1e0ff' : '#f8f9ff',
                borderColor:  restoreCatIdx === ci ? '#4648d4' : 'transparent',
              }}>
              <span className="text-lg">{cat.icon}</span>
              <span className="text-[14px] font-semibold text-[#0b1c30]">{cat.name}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setRestoreItem(null)}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer bg-[#f0f4ff] text-[#464554]"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleRestore}
            className="flex-1 py-3.5 border-none rounded-2xl font-bold text-sm cursor-pointer text-white"
            style={{ background: '#4648d4', fontFamily: 'inherit' }}>שחזר</button>
        </div>
      </CenterModal>

      <Toast msg={message} />
    </div>
  );
}
