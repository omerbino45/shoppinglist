import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, UserPlus } from 'lucide-react';
import type { User } from '../types';
import { getUsers, createUser } from '../lib/db';
import { Toast, Skeleton, WaveBottom } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  onLogin: (user: User) => void;
}

const AVATAR_COLORS = [
  '#7c3aed', '#8b5cf6', '#6366f1', '#ec4899',
  '#f59e0b', '#10b981', '#3b82f6', '#14b8a6',
];

export default function LoginScreen({ onLogin }: Props) {
  const [users, setUsers]   = useState<User[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const { message, fire }   = useToast();

  useEffect(() => {
    getUsers().then(u => { setUsers(u); setLoading(false); });
  }, []);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) { fire('צריך להכניס שם'); return; }
    if (users.find(u => u.name === name)) { fire('השם הזה כבר קיים'); return; }
    const user = await createUser(name);
    setUsers(prev => [...prev, user]);
    setNewName('');
    fire(`${name} נוסף!`);
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Hero — deep gradient + double wave */}
      <div
        className="relative overflow-hidden pt-14 pb-14 px-5 text-center"
        style={{ background: 'linear-gradient(225deg, #6d28d9, #6366f1 55%, #3b82f6)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-60 h-60 rounded-full bg-white/6 pointer-events-none" />
        <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-violet-400/20 pointer-events-none" />

        <div className="relative z-10">
          <div className="w-18 h-18 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ width: 72, height: 72 }}>
            <ShoppingCart size={36} color="white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
            רשימת קניות
          </h1>
          <p className="text-sm text-white/60 font-normal mt-2">רמי לוי שיווק השקמה</p>
        </div>

        {/* Double wave */}
        <WaveBottom />
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <p className="text-[13px] font-semibold text-slate-500 mb-3">מי קונה היום?</p>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-[68px]" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {users.map((u, idx) => (
                <button
                  key={u.id}
                  onClick={() => onLogin(u)}
                  className="flex items-center gap-4 bg-white rounded-2xl py-4 px-5
                    border border-slate-100 shadow-sm w-full text-right
                    hover:border-violet-200 hover:shadow-md active:scale-[0.99]
                    transition-all"
                  style={{ fontFamily: 'inherit' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center
                      text-white text-base font-bold shrink-0"
                    style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                  >
                    {u.name[0]}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-bold text-[15px] text-slate-900">{u.name}</div>
                  </div>
                  <ChevronLeft size={18} className="text-slate-300" />
                </button>
              ))}
            </div>

            {/* Add new user */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mt-6">
              <div className="flex items-center gap-1.5 mb-3">
                <UserPlus size={14} className="text-slate-400" />
                <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">
                  משתמש חדש
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm
                    outline-none bg-slate-50 focus:bg-white focus:border-violet-400
                    focus:ring-2 focus:ring-violet-100 transition-all"
                  style={{ fontFamily: 'inherit' }}
                  placeholder="שם..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
                <button
                  onClick={handleCreate}
                  className="text-white py-3 px-5 rounded-xl border-none font-bold text-sm
                    cursor-pointer transition-all active:scale-95 active:brightness-90"
                  style={{
                    background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                    boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                    fontFamily: 'inherit',
                  }}
                >
                  הוסף
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Toast msg={message} />
    </div>
  );
}
