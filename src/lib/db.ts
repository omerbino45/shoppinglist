import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc, updateDoc,
  query, where
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User, MasterCategory, ShoppingList,
  DeletedMasterItem, DeletedMasterCategory
} from '../types';
import { DEFAULT_MASTER } from './defaultMaster';

// ═══ Collections ═══
const usersCol = () => collection(db, 'users');
const masterDoc = () => doc(db, 'config', 'masterList');
const trashDoc = () => doc(db, 'config', 'masterTrash');
const listsCol = () => collection(db, 'shoppingLists');

// ═══ Users ═══
export async function getUsers(): Promise<User[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map(d => d.data() as User);
}

export async function createUser(name: string): Promise<User> {
  const id = 'U' + Date.now().toString(36).toUpperCase().slice(-5);
  const user: User = { id, name, createdAt: new Date().toISOString() };
  await setDoc(doc(db, 'users', id), user);
  return user;
}

// ═══ Master List ═══
export async function getMasterList(): Promise<MasterCategory[]> {
  const snap = await getDoc(masterDoc());
  if (snap.exists()) return snap.data().categories as MasterCategory[];
  // First time — seed with defaults
  await setDoc(masterDoc(), { categories: DEFAULT_MASTER });
  return DEFAULT_MASTER;
}

export async function saveMasterList(categories: MasterCategory[]): Promise<void> {
  await setDoc(masterDoc(), { categories });
}

// ═══ Master Trash ═══
interface TrashData {
  items: DeletedMasterItem[];
  categories: DeletedMasterCategory[];
}

export async function getMasterTrash(): Promise<TrashData> {
  const snap = await getDoc(trashDoc());
  if (snap.exists()) return snap.data() as TrashData;
  return { items: [], categories: [] };
}

export async function saveMasterTrash(data: TrashData): Promise<void> {
  await setDoc(trashDoc(), data);
}

// ═══ Shopping Lists ═══
export async function getShoppingLists(userId: string): Promise<ShoppingList[]> {
  const q = query(listsCol(), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as ShoppingList);
}

export async function saveShoppingList(list: ShoppingList): Promise<void> {
  await setDoc(doc(db, 'shoppingLists', list.id), list);
}

export async function deleteShoppingList(id: string): Promise<void> {
  await deleteDoc(doc(db, 'shoppingLists', id));
}

export async function updateShoppingList(id: string, data: Partial<ShoppingList>): Promise<void> {
  await updateDoc(doc(db, 'shoppingLists', id), data);
}

// ═══ Helpers ═══
export function generateListId(): string {
  return 'SL-' + Date.now().toString(36).toUpperCase().slice(-6);
}

export function generateVisibleId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `#${num}`;
}
