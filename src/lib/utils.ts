import type { ShoppingList } from '../types';

export function formatDate(d: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

export function formatDateShort(d: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'short'
  });
}

export function copyListToWhatsApp(list: ShoppingList): Promise<void> {
  let text = `🛒 *רשימת קניות ${list.visibleId}*\n`;
  text += `📅 ${formatDate(list.date)} | 🏪 ${list.store}\n`;
  text += '━'.repeat(22) + '\n\n';

  const grouped: Record<string, { icon: string; items: typeof list.items }> = {};
  list.items.forEach(i => {
    if (!grouped[i.category]) grouped[i.category] = { icon: i.catIcon, items: [] };
    grouped[i.category].items.push(i);
  });

  Object.entries(grouped).forEach(([cat, data]) => {
    text += `${data.icon} *${cat}*\n`;
    data.items.forEach(i => {
      text += `  ${i.checked ? '✅' : '☐'} ${i.name}\n`;
    });
    text += '\n';
  });

  const done = list.items.filter(i => i.checked).length;
  text += `📊 ${done}/${list.items.length} נלקחו`;

  return navigator.clipboard.writeText(text);
}
