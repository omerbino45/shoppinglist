import { useState, useEffect } from 'react';
import type { MasterCategory, DeletedMasterItem, DeletedMasterCategory } from '../types';
import { saveMasterList, getMasterTrash, saveMasterTrash } from '../lib/db';
import { Header, Pill, FreqTag, CenterModal, Toast, inputClass } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  master: MasterCategory[];
  onUpdate: (master: MasterCategory[]) => void;
  onBack: () => void;
}

export default function MasterScreen({ master, onUpdate, onBack }: Props) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>(() => {
    const c: Record<number, boolean> = {};
    master.forEach((_, i) => c[i] = true);
    return c;
  });
  const [trashItems, setTrashItems] = useState<DeletedMasterItem[]>([]);
  const [trashCats, setTrashCats] = useState<DeletedMasterCategory[]>([]);
  const [showTrash, setShowTrash] = useState(false);

  // Add category
  const [addCatOpen, setAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#607d8b');

  // Add item to category
  const [addItemCat, setAddItemCat] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemFreq, setNewItemFreq] = useState<'monthly' | 'occasional'>('monthly');

  // Edit item
  const [editItem, setEditItem] = useState<{ ci: number; ii: number } | null>(null);
  const [editName, setEditName] = useState('');
  const [editFreq, setEditFreq] = useState<'monthly' | 'occasional'>('monthly');

  // Restore item
  const [restoreItem, setRestoreItem] = useState<DeletedMasterItem | null>(null);
  const [restoreCatIdx, setRestoreCatIdx] = useState(0);

  const { message, fire } = useToast();

  useEffect(() => {
    getMasterTrash().then(t => {
      setTrashItems(t.items || []);
      setTrashCats(t.categories || []);
    });
  }, []);

  function save(updated: MasterCategory[]) {
    onUpdate(updated);
    saveMasterList(updated);
  }

  function saveTrash(items: DeletedMasterItem[], cats: DeletedMasterCategory[]) {
    setTrashItems(items);
    setTrashCats(cats);
    saveMasterTrash({ items, categories: cats });
  }

  // Delete item → trash
  function deleteItem(ci: number, ii: number) {
    const item = master[ci].items[ii];
    const catName = master[ci].name;
    const updated = [...master];
    updated[ci] = { ...updated[ci], items: updated[ci].items.filter((_, i) => i !== ii) };
    save(updated);

    const newTrashItems = [...trashItems, { item, fromCategory: catName, deletedAt: new Date().toISOString() }];
    saveTrash(newTrashItems, trashCats);
    fire('הפריט הועבר לאשפה');
  }

  // Delete category → trash
  function deleteCategory(ci: number) {
    const cat = master[ci];
    const updated = [...master];
    updated.splice(ci, 1);
    save(updated);

    const newTrashCats = [...trashCats, { category: cat, deletedAt: new Date().toISOString() }];
    // Also add all items to trash individually for flexibility
    const newTrashItems = [
      ...trashItems,
      ...cat.items.map(item => ({
        item,
        fromCategory: cat.name,
        deletedAt: new Date().toISOString()
      }))
    ];
    saveTrash(newTrashItems, newTrashCats);
    fire(`"${cat.name}" הועברה לאשפה`);
  }

  // Restore item
  function handleRestore() {
    if (!restoreItem) return;
    const updated = [...master];
    updated[restoreCatIdx] = {
      ...updated[restoreCatIdx],
      items: [...updated[restoreCatIdx].items, restoreItem.item]
    };
    save(updated);

    const newTrashItems = trashItems.filter(t => t !== restoreItem);
    saveTrash(newTrashItems, trashCats);
    setRestoreItem(null);
    fire('הפריט הוחזר!');
  }

  // Restore entire category
  function restoreCategory(trashCat: DeletedMasterCategory) {
    const updated = [...master, trashCat.category];
    save(updated);

    // Remove category from trash
    const newTrashCats = trashCats.filter(t => t !== trashCat);
    // Remove associated items from trash
    const catItemNames = new Set(trashCat.category.items.map(i => i.name));
    const newTrashItems = trashItems.filter(t => !(t.fromCategory === trashCat.category.name && catItemNames.has(t.item.name)));
    saveTrash(newTrashItems, newTrashCats);
    fire(`"${trashCat.category.name}" הוחזרה!`);
  }

  // Permanent delete from trash
  function permanentDeleteItem(item: DeletedMasterItem) {
    saveTrash(trashItems.filter(t => t !== item), trashCats);
    fire('נמחק לצמיתות');
  }

  function permanentDeleteCat(cat: DeletedMasterCategory) {
    const catItemNames = new Set(cat.category.items.map(i => i.name));
    const newTrashItems = trashItems.filter(t => !(t.fromCategory === cat.category.name && catItemNames.has(t.item.name)));
    saveTrash(newTrashItems, trashCats.filter(t => t !== cat));
    fire('נמחק לצמיתות');
  }

  // Add category
  function handleAddCategory() {
    if (!newCatName.trim()) { fire('צריך שם'); return; }
    const id = 'cat-' + Date.now().toString(36);
    save([...master, { id, name: newCatName.trim(), icon: newCatIcon || '📦', color: newCatColor, items: [] }]);
    setAddCatOpen(false);
    setNewCatName(''); setNewCatIcon('📦');
    fire('קטגוריה נוספה!');
  }

  // Add item
  function handleAddItem() {
    if (addItemCat === null || !newItemName.trim()) { fire('צריך שם'); return; }
    const updated = [...master];
    updated[addItemCat] = {
      ...updated[addItemCat],
      items: [...updated[addItemCat].items, { name: newItemName.trim(), freq: newItemFreq }]
    };
    save(updated);
    setAddItemCat(null);
    setNewItemName('');
    fire('פריט נוסף!');
  }

  // Edit item
  function handleEditItem() {
    if (!editItem || !editName.trim()) { fire('צריך שם'); return; }
    const updated = [...master];
    const items = [...updated[editItem.ci].items];
    items[editItem.ii] = { name: editName.trim(), freq: editFreq };
    updated[editItem.ci] = { ...updated[editItem.ci], items };
    save(updated);
    setEditItem(null);
    fire('הפריט עודכן');
  }

  const totalTrash = trashItems.length + trashCats.length;

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-12">
      <Header title="⚙️ רשימת מאסטר" subtitle="עריכת הפריטים הקבועים" onBack={onBack} />

      {/* Trash toggle */}
      <div className="sticky top-[76px] z-40 bg-[#faf8f5] border-b border-[#e8e4df] px-4 py-2.5 flex gap-2">
        <Pill active={!showTrash} onClick={() => setShowTrash(false)}>📋 פריטים פעילים</Pill>
        <Pill active={showTrash} onClick={() => setShowTrash(true)}>
          🗑️ נמחקו לאחרונה {totalTrash > 0 ? `(${totalTrash})` : ''}
        </Pill>
      </div>

      <div className="max-w-lg mx-auto px-4 py-2">
        {!showTrash ? (
          <>
            {/* Active items */}
            {master.map((cat, ci) => {
              const isCol = collapsed[ci] !== false;
              return (
                <div key={ci} className="mb-2.5 rounded-[14px] overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2.5 py-3 px-4 cursor-pointer select-none"
                    onClick={() => setCollapsed(p => ({ ...p, [ci]: !isCol }))}>
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-xl shrink-0"
                      style={{ background: cat.color + '15', color: cat.color }}>{cat.icon}</div>
                    <div className="flex-1 font-bold text-[15px]" style={{ color: cat.color }}>{cat.name}</div>
                    <span className="text-[10px] py-0.5 px-2 rounded-md font-semibold"
                      style={{ background: cat.color + '15', color: cat.color }}>
                      {cat.items.length} פריטים
                    </span>
                    <button onClick={e => { e.stopPropagation(); deleteCategory(ci); }}
                      className="border-none bg-transparent text-gray-300 text-sm cursor-pointer hover:text-red-400 transition-colors">
                      🗑️
                    </button>
                    <span className="text-xs text-gray-400 transition-transform"
                      style={{ transform: isCol ? 'rotate(90deg)' : 'none' }}>◀</span>
                  </div>
                  {!isCol && (
                    <div className="px-2.5 pb-2.5">
                      {cat.items.map((item, ii) => (
                        <div key={ii} className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-black/[0.02]">
                          <div className="flex-1 text-[13px]">{item.name}</div>
                          <FreqTag freq={item.freq} />
                          <button onClick={() => { setEditItem({ ci, ii }); setEditName(item.name); setEditFreq(item.freq); }}
                            className="border-none bg-transparent text-gray-300 text-sm cursor-pointer hover:text-blue-400 transition-colors">
                            ✏️
                          </button>
                          <button onClick={() => deleteItem(ci, ii)}
                            className="border-none bg-transparent text-gray-300 text-sm cursor-pointer hover:text-red-400 transition-colors">
                            ✕
                          </button>
                        </div>
                      ))}
                      <button onClick={() => { setAddItemCat(ci); setNewItemName(''); setNewItemFreq('monthly'); }}
                        className="mt-1.5 border-2 border-dashed border-gray-200 rounded-[10px] py-2 px-3.5
                          w-full bg-transparent text-[13px] text-gray-400 cursor-pointer font-semibold
                          hover:border-gray-300 transition-colors"
                        style={{ fontFamily: 'inherit' }}>
                        + הוסף פריט
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={() => { setAddCatOpen(true); setNewCatName(''); setNewCatIcon('📦'); setNewCatColor('#607d8b'); }}
              className="mt-2 border-2 border-dashed border-gray-300 rounded-[14px] py-4 w-full
                bg-transparent text-sm text-gray-400 cursor-pointer font-bold
                hover:border-gray-400 transition-colors"
              style={{ fontFamily: 'inherit' }}>
              + הוסף קטגוריה חדשה
            </button>
          </>
        ) : (
          <>
            {/* Trash */}
            {trashCats.length > 0 && (
              <>
                <div className="text-[13px] font-bold text-gray-500 mb-2 mt-2">קטגוריות שנמחקו</div>
                {trashCats.map((tc, i) => (
                  <div key={i} className="bg-white rounded-[14px] p-4 mb-2 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-xl">{tc.category.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{tc.category.name}</div>
                        <div className="text-[11px] text-gray-400">{tc.category.items.length} פריטים</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => restoreCategory(tc)}
                        className="flex-1 py-2.5 border-none rounded-xl font-bold text-xs cursor-pointer bg-[#e8f5e9] text-[#2e7d32]"
                        style={{ fontFamily: 'inherit' }}>
                        ↩️ שחזר קטגוריה
                      </button>
                      <button onClick={() => permanentDeleteCat(tc)}
                        className="flex-1 py-2.5 border-none rounded-xl font-bold text-xs cursor-pointer bg-[#ffeaea] text-[#d32f2f]"
                        style={{ fontFamily: 'inherit' }}>
                        מחק לצמיתות 🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {trashItems.length > 0 && (
              <>
                <div className="text-[13px] font-bold text-gray-500 mb-2 mt-4">פריטים שנמחקו</div>
                {trashItems.map((ti, i) => (
                  <div key={i} className="bg-white rounded-xl py-3 px-4 mb-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                    flex items-center gap-2.5">
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{ti.item.name}</div>
                      <div className="text-[10px] text-gray-400">מ-{ti.fromCategory}</div>
                    </div>
                    <button onClick={() => { setRestoreItem(ti); setRestoreCatIdx(0); }}
                      className="border-none bg-[#e8f5e9] text-[#2e7d32] py-1.5 px-3 rounded-lg text-[11px]
                        font-semibold cursor-pointer"
                      style={{ fontFamily: 'inherit' }}>
                      ↩️ שחזר
                    </button>
                    <button onClick={() => permanentDeleteItem(ti)}
                      className="border-none bg-transparent text-gray-300 text-sm cursor-pointer
                        hover:text-red-400 transition-colors">
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}

            {!trashItems.length && !trashCats.length && (
              <div className="text-center py-10 text-gray-300">
                <div className="text-4xl mb-2">♻️</div>
                <div className="font-semibold">האשפה ריקה</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Category Modal */}
      <CenterModal open={addCatOpen} onClose={() => setAddCatOpen(false)}>
        <div className="font-bold text-base mb-3.5 text-center">➕ קטגוריה חדשה</div>
        <div className="flex gap-2 mb-2.5">
          <input placeholder="אימוג׳י" value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)}
            className={inputClass + ' text-center'} style={{ flex: 0.3 }} />
          <input placeholder="שם הקטגוריה" value={newCatName} onChange={e => setNewCatName(e.target.value)}
            className={inputClass} style={{ flex: 1 }} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddCatOpen(false)}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-gray-100 text-gray-400"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleAddCategory}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#e63946] text-white"
            style={{ fontFamily: 'inherit' }}>הוסף ✨</button>
        </div>
      </CenterModal>

      {/* Add Item Modal */}
      <CenterModal open={addItemCat !== null} onClose={() => setAddItemCat(null)}>
        <div className="font-bold text-base mb-3.5 text-center">
          ➕ פריט חדש ל{addItemCat !== null ? master[addItemCat]?.name : ''}
        </div>
        <input placeholder="שם הפריט" value={newItemName} onChange={e => setNewItemName(e.target.value)}
          className={inputClass + ' mb-2.5'} />
        <div className="flex gap-2 mb-3.5">
          <Pill active={newItemFreq === 'monthly'} onClick={() => setNewItemFreq('monthly')}>🔄 חודשי</Pill>
          <Pill active={newItemFreq === 'occasional'} onClick={() => setNewItemFreq('occasional')}>📅 מדי פעם</Pill>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddItemCat(null)}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-gray-100 text-gray-400"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleAddItem}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#e63946] text-white"
            style={{ fontFamily: 'inherit' }}>הוסף ✨</button>
        </div>
      </CenterModal>

      {/* Edit Item Modal */}
      <CenterModal open={editItem !== null} onClose={() => setEditItem(null)}>
        <div className="font-bold text-base mb-3.5 text-center">✏️ עריכת פריט</div>
        <input placeholder="שם הפריט" value={editName} onChange={e => setEditName(e.target.value)}
          className={inputClass + ' mb-2.5'} />
        <div className="flex gap-2 mb-3.5">
          <Pill active={editFreq === 'monthly'} onClick={() => setEditFreq('monthly')}>🔄 חודשי</Pill>
          <Pill active={editFreq === 'occasional'} onClick={() => setEditFreq('occasional')}>📅 מדי פעם</Pill>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditItem(null)}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-gray-100 text-gray-400"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleEditItem}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#e63946] text-white"
            style={{ fontFamily: 'inherit' }}>שמור ✨</button>
        </div>
      </CenterModal>

      {/* Restore Item → Choose Category */}
      <CenterModal open={restoreItem !== null} onClose={() => setRestoreItem(null)}>
        <div className="font-bold text-base mb-3.5 text-center">↩️ שחזור פריט</div>
        <div className="text-sm text-center mb-3 text-gray-600">
          לאיזה קטגוריה להחזיר את "<span className="font-bold">{restoreItem?.item.name}</span>"?
        </div>
        <div className="max-h-[40vh] overflow-auto mb-3.5">
          {master.map((cat, ci) => (
            <div key={ci}
              onClick={() => setRestoreCatIdx(ci)}
              className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl cursor-pointer mb-1 transition-all
                ${restoreCatIdx === ci ? 'bg-[#e8f5e9] border-2 border-[#2d6a4f]' : 'bg-gray-50 border-2 border-transparent'}`}>
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-semibold">{cat.name}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRestoreItem(null)}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-gray-100 text-gray-400"
            style={{ fontFamily: 'inherit' }}>ביטול</button>
          <button onClick={handleRestore}
            className="flex-1 py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer bg-[#2d6a4f] text-white"
            style={{ fontFamily: 'inherit' }}>שחזר ↩️</button>
        </div>
      </CenterModal>

      <Toast msg={message} />
    </div>
  );
}
