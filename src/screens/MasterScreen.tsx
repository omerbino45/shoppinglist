import { useState, useEffect } from 'react';
import { Trash2, Pencil, Plus, RotateCcw, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { MasterCategory, DeletedMasterItem, DeletedMasterCategory } from '../types';
import { saveMasterList, getMasterTrash, saveMasterTrash } from '../lib/db';
import { Header, Pill, FreqTag, CenterModal, Toast, EmptyState, inputClass } from '../components/ui';
import { useToast } from '../hooks/useToast';

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
  const [newCatColor, setNewCatColor] = useState('#607d8b');

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

  function permanentDeleteItem(item: DeletedMasterItem) { saveTrash(trashItems.filter(t => t !== item), trashCats); fire('נמחק לצמיתות'); }
  function permanentDeleteCat(cat: DeletedMasterCategory) {
    const names = new Set(cat.category.items.map(i => i.name));
    saveTrash(trashItems.filter(t => !(t.fromCategory === cat.category.name && names.has(t.item.name))), trashCats.filter(t => t !== cat));
    fire('נמחק לצמיתות');
  }

  function handleAddCategory() {
    if (!newCatName.trim()) { fire('צריך שם'); return; }
    save([...master, { id: 'cat-' + Date.now().toString(36), name: newCatName.trim(), icon: newCatIcon || '📦', color: newCatColor, items: [] }]);
    setAddCatOpen(false); setNewCatName(''); setNewCatIcon('📦'); fire('קטגוריה נוספה!');
  }

  function handleAddItem() {
    if (addItemCat === null || !newItemName.trim()) { fire('צריך שם'); return; }
    const updated = [...master];
    updated[addItemCat] = { ...updated[addItemCat], items: [...updated[addItemCat].items, { name: newItemName.trim(), freq: newItemFreq }] };
    save(updated); setAddItemCat(null); setNewItemName(''); fire('פריט נוסף!');
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

  const modalBtnPrimary = "flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer text-white active:scale-95 transition-all";
  const modalBtnSecondary = "flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-slate-100 text-slate-500 active:scale-95 transition-all";

  return (
    <div className="min-h-dvh bg-slate-50 pb-10">
      <Header title="רשימת מאסטר" subtitle="עריכת הפריטים הקבועים" onBack={onBack} />

      <div className="sticky top-[73px] z-40 bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex gap-2">
        <Pill active={!showTrash} onClick={() => setShowTrash(false)}>פעילים</Pill>
        <Pill active={showTrash}  onClick={() => setShowTrash(true)}>
          אשפה {totalTrash > 0 ? `(${totalTrash})` : ''}
        </Pill>
      </div>

      <div className="max-w-lg mx-auto px-4 py-3">
        {!showTrash ? (
          <>
            <div className="flex flex-col gap-2">
              {master.map((cat, ci) => {
                const isCol = collapsed[ci] !== false;
                return (
                  <div key={ci} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-3 py-3.5 px-4 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
                      onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: cat.color + '18', color: cat.color }}>{cat.icon}</div>
                      <div className="flex-1 font-bold text-[14px]" style={{ color: cat.color }}>{cat.name}</div>
                      <span className="text-[11px] py-0.5 px-2.5 rounded-full font-semibold"
                        style={{ background: cat.color + '18', color: cat.color }}>{cat.items.length}</span>
                      <button onClick={e => { e.stopPropagation(); deleteCategory(ci); }}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 flex items-center justify-center cursor-pointer transition-all border-none bg-transparent">
                        <Trash2 size={14} />
                      </button>
                      {isCol ? <ChevronDown size={16} className="text-slate-400 shrink-0" />
                             : <ChevronUp   size={16} className="text-slate-400 shrink-0" />}
                    </div>

                    {!isCol && (
                      <div className="px-3 pb-3 border-t border-slate-50">
                        {cat.items.map((item, ii) => (
                          <div key={ii} className="flex items-center gap-2.5 py-2 px-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex-1 text-sm text-slate-800">{item.name}</div>
                            <FreqTag freq={item.freq} />
                            <button onClick={() => { setEditItem({ ci, ii }); setEditName(item.name); setEditFreq(item.freq); }}
                              className="w-7 h-7 rounded-lg hover:bg-violet-50 text-slate-300 hover:text-violet-500 flex items-center justify-center cursor-pointer transition-all border-none bg-transparent">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => deleteItem(ci, ii)}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 flex items-center justify-center cursor-pointer transition-all border-none bg-transparent">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => { setAddItemCat(ci); setNewItemName(''); setNewItemFreq('monthly'); }}
                          className="mt-1.5 border-2 border-dashed border-slate-200 rounded-xl py-2 px-3.5 w-full bg-transparent text-[12px] text-slate-400 cursor-pointer font-semibold hover:border-violet-300 hover:text-violet-400 transition-all flex items-center justify-center gap-1.5"
                          style={{ fontFamily: 'inherit' }}>
                          <Plus size={13} /> הוסף פריט
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => { setAddCatOpen(true); setNewCatName(''); setNewCatIcon('📦'); setNewCatColor('#607d8b'); }}
              className="mt-3 border-2 border-dashed border-slate-200 rounded-2xl py-4 w-full bg-transparent text-sm text-slate-400 cursor-pointer font-bold hover:border-violet-300 hover:text-violet-500 transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: 'inherit' }}>
              <Plus size={16} /> קטגוריה חדשה
            </button>
          </>
        ) : (
          <>
            {trashCats.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">קטגוריות שנמחקו</p>
                <div className="flex flex-col gap-2">
                  {trashCats.map((tc, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{tc.category.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-slate-900">{tc.category.name}</div>
                          <div className="text-[11px] text-slate-400">{tc.category.items.length} פריטים</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => restoreCategory(tc)} className="flex-1 py-2.5 border-none rounded-xl font-bold text-xs cursor-pointer bg-emerald-50 text-emerald-600 flex items-center justify-center gap-1.5 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}><RotateCcw size={13} /> שחזר</button>
                        <button onClick={() => permanentDeleteCat(tc)} className="flex-1 py-2.5 border-none rounded-xl font-bold text-xs cursor-pointer bg-red-50 text-red-500 flex items-center justify-center gap-1.5 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}><Trash2 size={13} /> מחק לצמיתות</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trashItems.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">פריטים שנמחקו</p>
                <div className="flex flex-col gap-1.5">
                  {trashItems.map((ti, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 py-3 px-4 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{ti.item.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">מ-{ti.fromCategory}</div>
                      </div>
                      <button onClick={() => { setRestoreItem(ti); setRestoreCatIdx(0); }} className="border-none bg-emerald-50 text-emerald-600 py-1.5 px-3 rounded-lg text-[11px] font-semibold cursor-pointer flex items-center gap-1 active:scale-95 transition-all" style={{ fontFamily: 'inherit' }}><RotateCcw size={11} /> שחזר</button>
                      <button onClick={() => permanentDeleteItem(ti)} className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 flex items-center justify-center cursor-pointer transition-all border-none bg-transparent"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!trashItems.length && !trashCats.length && (
              <EmptyState icon={<Trash2 size={28} />} title="האשפה ריקה" sub="פריטים שנמחקו יופיעו כאן" />
            )}
          </>
        )}
      </div>

      {/* Add Category */}
      <CenterModal open={addCatOpen} onClose={() => setAddCatOpen(false)}>
        <h2 className="font-bold text-base mb-4 text-center text-slate-900">קטגוריה חדשה</h2>
        <div className="flex gap-2 mb-3">
          <input placeholder="אימוג׳י" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} className={inputClass + ' text-center'} style={{ flex: 0.28 }} />
          <input placeholder="שם הקטגוריה" value={newCatName} onChange={e => setNewCatName(e.target.value)} className={inputClass} style={{ flex: 1 }} />
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setAddCatOpen(false)} className={modalBtnSecondary} style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleAddCategory} className={modalBtnPrimary} style={{ background: 'linear-gradient(to right, #8b5cf6, #6366f1)', fontFamily: 'inherit' }}>הוסף</button>
        </div>
      </CenterModal>

      {/* Add Item */}
      <CenterModal open={addItemCat !== null} onClose={() => setAddItemCat(null)}>
        <h2 className="font-bold text-base mb-4 text-center text-slate-900">פריט חדש{addItemCat !== null ? ` ל${master[addItemCat]?.name}` : ''}</h2>
        <input placeholder="שם הפריט" value={newItemName} onChange={e => setNewItemName(e.target.value)} className={inputClass + ' mb-3'} />
        <div className="flex gap-2 mb-4">
          <Pill active={newItemFreq === 'monthly'}    onClick={() => setNewItemFreq('monthly')}>חודשי</Pill>
          <Pill active={newItemFreq === 'occasional'} onClick={() => setNewItemFreq('occasional')}>מדי פעם</Pill>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setAddItemCat(null)} className={modalBtnSecondary} style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleAddItem} className={modalBtnPrimary} style={{ background: 'linear-gradient(to right, #8b5cf6, #6366f1)', fontFamily: 'inherit' }}>הוסף</button>
        </div>
      </CenterModal>

      {/* Edit Item */}
      <CenterModal open={editItem !== null} onClose={() => setEditItem(null)}>
        <h2 className="font-bold text-base mb-4 text-center text-slate-900">עריכת פריט</h2>
        <input placeholder="שם הפריט" value={editName} onChange={e => setEditName(e.target.value)} className={inputClass + ' mb-3'} />
        <div className="flex gap-2 mb-4">
          <Pill active={editFreq === 'monthly'}    onClick={() => setEditFreq('monthly')}>חודשי</Pill>
          <Pill active={editFreq === 'occasional'} onClick={() => setEditFreq('occasional')}>מדי פעם</Pill>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setEditItem(null)} className={modalBtnSecondary} style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleEditItem} className={modalBtnPrimary} style={{ background: 'linear-gradient(to right, #8b5cf6, #6366f1)', fontFamily: 'inherit' }}>שמור</button>
        </div>
      </CenterModal>

      {/* Restore Item */}
      <CenterModal open={restoreItem !== null} onClose={() => setRestoreItem(null)}>
        <h2 className="font-bold text-base mb-2 text-center text-slate-900">שחזור פריט</h2>
        <p className="text-sm text-center text-slate-500 mb-4">לאיזה קטגוריה להחזיר את "<span className="font-bold text-slate-800">{restoreItem?.item.name}</span>"?</p>
        <div className="max-h-[40vh] overflow-auto mb-4 flex flex-col gap-1.5">
          {master.map((cat, ci) => (
            <div key={ci} onClick={() => setRestoreCatIdx(ci)}
              className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl cursor-pointer transition-all border-2 ${restoreCatIdx === ci ? 'bg-violet-50 border-violet-400' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setRestoreItem(null)} className={modalBtnSecondary} style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleRestore} className={modalBtnPrimary} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', fontFamily: 'inherit' }}>שחזר</button>
        </div>
      </CenterModal>

      <Toast msg={message} />
    </div>
  );
}
