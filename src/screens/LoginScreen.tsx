import { useState, useEffect } from 'react';
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

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="bg-gradient-to-bl from-[#1a1a2e] via-[#16213e] to-[#0f3460]
        text-white py-10 px-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
        <div className="text-5xl mb-2">🛒</div>
        <h1 className="text-2xl font-extrabold tracking-tight">רשימת קניות</h1>
        <p className="text-sm opacity-50 font-light mt-1">רמי לוי שיווק השקמה</p>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-base font-bold mb-3">מי אתה? 👋</div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">טוען...</div>
        ) : (
          <>
            {users.map(u => (
              <button key={u.id} onClick={() => onLogin(u)}
                className="flex items-center gap-3.5 bg-white rounded-2xl py-5 px-5
                  shadow-[0_2px_14px_rgba(0,0,0,0.05)] cursor-pointer border-none w-full
                  text-right mb-2.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow"
                style={{ fontFamily: 'inherit' }}>
                <div className="w-12 h-12 rounded-[14px] bg-[#e8f5e9] text-[#2d6a4f]
                  flex items-center justify-center text-xl font-bold shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base">{u.name}</div>
                </div>
                <div className="text-xl text-gray-300">←</div>
              </button>
            ))}

            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.05)] mt-6">
              <div className="text-xs font-semibold text-gray-500 mb-2">משתמש חדש</div>
              <div className="flex gap-2">
                <input
                  className="flex-1 py-3 px-3.5 border-2 border-[#e8e4df] rounded-xl text-sm
                    outline-none bg-white focus:border-[#e63946] transition-colors"
                  style={{ fontFamily: 'inherit' }}
                  placeholder="שם..."
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
                <button onClick={handleCreate}
                  className="bg-[#e63946] text-white py-3 px-5 rounded-xl border-none
                    font-bold text-sm cursor-pointer"
                  style={{ fontFamily: 'inherit' }}>
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
