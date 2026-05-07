import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, UserPlus, Loader2 } from 'lucide-react';
import type { User } from '../types';
import { getUsers, createUser } from '../lib/db';
import { Toast } from '../components/ui';
import { useToast } from '../hooks/useToast';

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const { message, fire } = useToast();

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

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
  ];

  return (
    <div className="min-h-screen bg-f8fafc">
      {/* Hero */}
      <div className="bg-indigo-500 pt-14 pb-10 px-5 text-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -bottom-12 -left-10 w-52 h-52 rounded-full bg-white/6 pointer-events-none" />

        <div className="relative">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={32} color="white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">רשימת קניות</h1>
          <p className="text-sm text-white/60 font-normal mt-1.5">רמי לוי שיווק השקמה</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <p className="text-[13px] font-semibold text-slate-500 mb-3">מי קונה היום?</p>

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 size={24} className="text-indigo-400 animate-spin" />
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
                    hover:border-indigo-200 hover:shadow-md active:scale-[0.99]
                    transition-all"
                  style={{ fontFamily: 'inherit' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center
                      text-white text-base font-bold shrink-0"
                    style={{ background: colors[idx % colors.length] }}
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
                    outline-none bg-slate-50 focus:bg-white focus:border-indigo-400
                    focus:ring-2 focus:ring-indigo-100 transition-all"
                  style={{ fontFamily: 'inherit' }}
                  placeholder="שם..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
                <button
                  onClick={handleCreate}
                  className="bg-indigo-500 hover:bg-indigo-600 active:scale-95
                    text-white py-3 px-5 rounded-xl border-none font-bold text-sm
                    cursor-pointer transition-all"
                  style={{ fontFamily: 'inherit' }}
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
