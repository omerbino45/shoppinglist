import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import type { User } from '../types';
import { getUsers, createUser } from '../lib/db';
import { Toast, Skeleton } from '../components/ui';
import { useToast } from '../hooks/useToast';

const AVATAR_COLORS = ['#4648d4','#006c49','#825100','#c0392b','#2980b9','#8e44ad','#16a085','#d35400'];

interface Props {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [users, setUsers]     = useState<User[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const { message, fire }     = useToast();

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
    <div className="min-h-dvh bg-[#f8f9ff] flex flex-col">
      {/* Title */}
      <div className="pt-14 pb-8 text-center px-5">
        <h1 className="text-[28px] font-bold text-[#0b1c30]">רשימת הקניות שלי</h1>
        <p className="text-[14px] text-[#464554] mt-1">מי קונה היום?</p>
      </div>

      <div className="max-w-md mx-auto w-full px-5 flex-1">
        {/* User grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} className="h-[110px]" />
            ))}
          </div>
        ) : (
          <>
            {users.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {users.map((u, idx) => {
                  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <button
                      key={u.id}
                      onClick={() => onLogin(u)}
                      className="bg-white rounded-2xl border border-[#e5eeff] p-4
                        flex flex-col items-center gap-2 cursor-pointer border-none
                        shadow-sm active:scale-[0.97] transition-all"
                      style={{ fontFamily: 'inherit' }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center
                          text-white text-2xl font-bold"
                        style={{ background: color }}
                      >
                        {u.name[0]}
                      </div>
                      <span className="text-[15px] font-bold text-[#0b1c30]">{u.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Divider */}
        {!loading && (
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e5eeff]" />
            <span className="text-[13px] text-[#c7c4d7] font-medium">או</span>
            <div className="flex-1 h-px bg-[#e5eeff]" />
          </div>
        )}

        {/* New user card */}
        {!loading && (
          <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus size={16} className="text-[#4648d4] shrink-0" />
              <span className="text-[14px] font-bold text-[#0b1c30]">משתמש חדש</span>
            </div>
            <input
              placeholder="הכנס שם..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full py-3 px-4 border border-[#c7c4d7] rounded-2xl text-sm
                outline-none bg-[#eff4ff] focus:border-[#4648d4] focus:ring-2 focus:ring-[#e1e0ff]
                transition-all font-[inherit] placeholder:text-[#c7c4d7] mb-3 text-right"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              onClick={handleCreate}
              className="w-full py-3.5 rounded-full border-none font-bold text-sm
                text-white cursor-pointer active:scale-[0.98] transition-all"
              style={{
                background: '#4648d4',
                fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(70,72,212,0.3)',
              }}
            >
              ← הצטרף
            </button>
          </div>
        )}
      </div>

      <Toast msg={message} />
    </div>
  );
}
