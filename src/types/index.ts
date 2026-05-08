export interface MasterItem {
  name: string;
  freq: 'monthly' | 'occasional';
}

export interface MasterCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: MasterItem[];
}

export interface DeletedMasterItem {
  item: MasterItem;
  fromCategory: string; // category name for display
  deletedAt: string;
}

export interface DeletedMasterCategory {
  category: MasterCategory;
  deletedAt: string;
}

export interface User {
  id: string;
  name: string;
  createdAt: string;
}

export interface ShoppingItem {
  name: string;
  freq: 'monthly' | 'occasional';
  category: string;
  catIcon: string;
  catColor: string;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  visibleId: string;
  userId: string;
  date: string;
  store: string;
  items: ShoppingItem[];
  closed: boolean;
  createdAt: string;
}

export type Screen = 'login' | 'home' | 'new' | 'lists' | 'shop' | 'master' | 'settings';
