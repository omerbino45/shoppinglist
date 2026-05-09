import { useState, useEffect, useCallback } from 'react';
import type { User, MasterCategory, ShoppingList, Screen } from './types';
import { getMasterList, getShoppingLists } from './lib/db';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import NewListScreen from './screens/NewListScreen';
import ListsScreen from './screens/ListsScreen';
import ShopScreen from './screens/ShopScreen';
import MasterScreen from './screens/MasterScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [screen, setScreen]   = useState<Screen>('login');
  const [user, setUser]       = useState<User | null>(null);
  const [master, setMaster]   = useState<MasterCategory[]>([]);
  const [lists, setLists]     = useState<ShoppingList[]>([]);
  const [shopId, setShopId]   = useState<string | null>(null);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    getMasterList().then(m => { setMaster(m); setLoaded(true); });
  }, []);

  useEffect(() => {
    if (!user) return;
    getShoppingLists(user.id).then(setLists);
  }, [user]);

  const handleLogin = useCallback((u: User) => { setUser(u); setScreen('home'); }, []);
  const handleSwitchUser = useCallback(() => { setUser(null); setLists([]); setScreen('login'); }, []);
  const handleNavigate = useCallback((s: Screen) => setScreen(s), []);

  if (!loaded) {
    return (
      <div className="min-h-dvh bg-[#f8f9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🛒</div>
          <div className="text-[#464554] font-semibold text-sm">טוען...</div>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!user) { setScreen('login'); return null; }

  const screenAnim: React.CSSProperties = { animation: 'fadeUp 0.22s ease both' };

  if (screen === 'home') {
    return (
      <div key="home" className="min-h-dvh bg-[#f8f9ff]" style={screenAnim}>
        <HomeScreen user={user} lists={lists} onNavigate={handleNavigate} />
      </div>
    );
  }

  if (screen === 'new') {
    return (
      <div key="new" className="min-h-dvh bg-[#f8f9ff]" style={screenAnim}>
        <NewListScreen
          userId={user.id}
          master={master}
          onCreated={(list) => { setLists(prev => [list, ...prev]); setScreen('home'); }}
          onBack={() => setScreen('home')}
        />
      </div>
    );
  }

  if (screen === 'lists') {
    return (
      <div key="lists" className="min-h-dvh bg-[#f8f9ff]" style={screenAnim}>
        <ListsScreen
          lists={lists}
          onUpdate={setLists}
          onOpenList={(id) => { setShopId(id); setScreen('shop'); }}
          onBack={() => handleNavigate('home')}
        />
      </div>
    );
  }

  if (screen === 'shop' && shopId) {
    const shopList = lists.find(l => l.id === shopId);
    if (!shopList) { setScreen('lists'); return null; }
    return (
      <div key={`shop-${shopId}`} className="min-h-dvh bg-[#f8f9ff]" style={screenAnim}>
        <ShopScreen
          list={shopList}
          master={master}
          allLists={lists}
          onUpdate={(updated) => setLists(prev => prev.map(l => l.id === updated.id ? updated : l))}
          onListsChange={setLists}
          onBack={() => setScreen('lists')}
        />
      </div>
    );
  }

  if (screen === 'master') {
    return (
      <div key="master" className="min-h-dvh bg-[#f8f9ff]" style={screenAnim}>
        <MasterScreen master={master} onUpdate={setMaster} onBack={() => handleNavigate('home')} />
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div key="settings" className="min-h-dvh bg-[#f8f9ff]" style={screenAnim}>
        <SettingsScreen user={user} onSwitchUser={handleSwitchUser} onBack={() => handleNavigate('home')} />
      </div>
    );
  }

  return null;
}
