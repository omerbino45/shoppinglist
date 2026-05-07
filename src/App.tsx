import { useState, useEffect, useCallback } from 'react';
import type { User, MasterCategory, ShoppingList, Screen } from './types';
import { getMasterList, getShoppingLists } from './lib/db';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NewListScreen from './screens/NewListScreen';
import ListsScreen from './screens/ListsScreen';
import ShopScreen from './screens/ShopScreen';
import MasterScreen from './screens/MasterScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [master, setMaster] = useState<MasterCategory[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load master on mount
  useEffect(() => {
    getMasterList().then(m => {
      setMaster(m);
      setLoaded(true);
    });
  }, []);

  // Load lists when user logs in
  useEffect(() => {
    if (!user) return;
    getShoppingLists(user.id).then(setLists);
  }, [user]);

  const handleLogin = useCallback((u: User) => {
    setUser(u);
    setScreen('home');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setLists([]);
    setScreen('login');
  }, []);

  const handleNavigate = useCallback((s: string) => {
    setScreen(s as Screen);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🛒</div>
          <div className="text-gray-400 font-semibold">טוען...</div>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (screen === 'home' && user) {
    return (
      <HomeScreen
        user={user}
        lists={lists}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'new' && user) {
    return (
      <NewListScreen
        userId={user.id}
        master={master}
        onCreated={(list) => {
          setLists(prev => [list, ...prev]);
          setScreen('home');
        }}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'lists' && user) {
    return (
      <ListsScreen
        lists={lists}
        onUpdate={setLists}
        onOpenList={(id) => { setShopId(id); setScreen('shop'); }}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'shop' && user && shopId) {
    const shopList = lists.find(l => l.id === shopId);
    if (!shopList) { setScreen('lists'); return null; }
    return (
      <ShopScreen
        list={shopList}
        master={master}
        allLists={lists}
        onUpdate={(updated) => {
          setLists(prev => prev.map(l => l.id === updated.id ? updated : l));
        }}
        onListsChange={setLists}
        onBack={() => setScreen('lists')}
      />
    );
  }

  if (screen === 'master') {
    return (
      <MasterScreen
        master={master}
        onUpdate={setMaster}
        onBack={() => setScreen('home')}
      />
    );
  }

  return null;
}
