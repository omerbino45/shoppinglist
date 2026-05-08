import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import type { User } from '../types';
import { getUsers, createUser } from '../lib/db';
import { Toast, Skeleton } from '../components/ui';
import { useToast } from '../hooks/useToast';

// Cycles through design-system container colors: primary → secondary → tertiary
const AVATAR_SLOTS = [
  { bg: '#6063ee', text: '#fffbff' },
  { bg: '#6cf8bb', text: '#005236' },
  { bg: '#a36700', text: '#fffbff' },
  { bg: '#e1e0ff', text: '#2f2ebe' },
  { bg: '#4edea3', text: '#002113' },
  { bg: '#ffddb8', text: '#2a1700' },
];

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
      {/* Sticky white header */}
      <header className="sticky top-0 z-10 bg-white text-center px-5 pt-12 pb-6">
        <h1 className="text-[28px] font-bold leading-[34px] text-[#4648d4]">רשימת הקניות שלי</h1>
      </header>

      <main className="flex-1 px-5 pb-10 overflow-y-auto">
        {/* User grid */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          {loading ? (
            <>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 flex flex-col items-center gap-4
                  border border-[#dce9ff] opacity-70">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-12 h-5 rounded" />
                </div>
              ))}
            </>
          ) : (
            users.map((u, idx) => {
              const slot = AVATAR_SLOTS[idx % AVATAR_SLOTS.length];
              return (
                <button
                  key={u.id}
                  onClick={() => onLogin(u)}
                  className="bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-4
                    border border-[#dce9ff] shadow-sm cursor-pointer
                    hover:bg-[#eff4ff] active:scale-[0.97] transition-all"
                  style={{ fontFamily: 'inherit' }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-bold"
                    style={{ background: slot.bg, color: slot.text }}
                  >
                    {u.name[0]}
                  </div>
                  <span className="text-[22px] font-semibold text-[#0b1c30] leading-[28px]">{u.name}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Divider */}
        {!loading && (
          <div className="flex items-center gap-4 my-12">
            <div className="flex-1 h-px bg-[#c7c4d7]" />
            <span className="text-[12px] font-semibold text-[#767586] tracking-[0.02em] px-2">או</span>
            <div className="flex-1 h-px bg-[#c7c4d7]" />
          </div>
        )}

        {/* New user card */}
        {!loading && (
          <div className="bg-white rounded-xl p-6 border border-[#dce9ff] shadow-sm">
            <h2 className="text-[22px] font-semibold text-[#0b1c30] leading-[28px] mb-6 flex items-center gap-2">
              <UserPlus size={22} className="text-[#4648d4] shrink-0" />
              משתמש חדש
            </h2>
            <div className="flex flex-col gap-6">
              <input
                placeholder="הכנס שם..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full bg-[#eff4ff] border-none rounded-lg px-4 py-4
                  text-[18px] text-[#0b1c30] placeholder:text-[#464554]
                  outline-none focus:ring-2 focus:ring-[#4648d4] focus:bg-white transition-colors"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                onClick={handleCreate}
                className="w-full bg-[#4648d4] text-white rounded-full py-4
                  text-[22px] font-semibold cursor-pointer border-none
                  active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(70,72,212,0.35)' }}
              >
                הצטרף ←
              </button>
            </div>
          </div>
        )}
      </main>

      <Toast msg={message} />
    </div>
  );
}
