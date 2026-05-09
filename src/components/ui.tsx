import React from 'react';
import { Plus, RefreshCw, Calendar, ChevronRight } from 'lucide-react';

// ═══ Toast ═══
export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white
      px-6 py-3 rounded-2xl text-sm font-semibold z-[999] shadow-2xl whitespace-nowrap"
      style={{ animation: 'bounceIn .3s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
      {msg}
    </div>
  );
}

// ═══ Header ═══
export function Header({ title, subtitle, onBack, children }: {
  title: string; subtitle?: string; onBack?: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="bg-[#dce9ff] px-5 sticky top-0 z-50"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: '0.75rem' }}>
      <div className="flex items-center gap-3 mb-1">
        {onBack && (
          <button onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl
              bg-white/60 border-none cursor-pointer text-[#0b1c30] active:scale-95 transition-all shrink-0">
            <ChevronRight size={18} />
          </button>
        )}
        <div className="flex-1 text-right">
          <h1 className="text-[22px] font-bold text-[#4648d4] leading-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-[#464554] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ═══ FAB ═══
export function FAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed z-40 w-14 h-14 rounded-full border-none cursor-pointer
        flex items-center justify-center text-white active:scale-90 transition-transform"
      style={{
        bottom: '1.5rem',
        left: 'calc(50% - 195px + 1.25rem)',
        background: '#4648d4',
        animation: 'pulseGlow 2.8s ease-in-out infinite',
        fontFamily: 'inherit',
      }}
    >
      {/* Ping ring */}
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: '#4648d4',
        animation: 'pingOnce 2.8s ease-out infinite',
        pointerEvents: 'none',
      }} />
      <Plus size={26} style={{ position: 'relative', zIndex: 1 }} />
    </button>
  );
}

// ═══ Skeleton ═══
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, #e5eeff 25%, #eff4ff 50%, #e5eeff 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// ═══ EmptyState ═══
export function EmptyState({ icon, title, sub }: {
  icon: React.ReactNode; title: string; sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center"
      style={{ animation: 'fadeUp 0.35s ease both' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 text-[#4648d4]"
        style={{ background: 'linear-gradient(135deg, #e1e0ff, #eff4ff)', animation: 'bounceIn 0.45s ease both' }}>
        {icon}
      </div>
      <p className="text-[#464554] font-semibold text-sm">{title}</p>
      {sub && <p className="text-[#c7c4d7] text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ═══ Pill ═══
export function Pill({ active, children, onClick }: {
  active: boolean; children: React.ReactNode; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="py-2 px-4 rounded-full text-xs font-semibold cursor-pointer
        whitespace-nowrap border transition-all active:scale-95"
      style={{
        background:  active ? '#4648d4' : '#ffffff',
        color:       active ? '#ffffff' : '#464554',
        borderColor: active ? 'transparent' : '#c7c4d7',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

// ═══ inputClass ═══
export const inputClass = `w-full py-3 px-4 border border-[#c7c4d7] rounded-2xl
  text-sm outline-none bg-[#eff4ff] focus:border-[#4648d4] focus:ring-2 focus:ring-[#e1e0ff]
  transition-all font-[inherit] placeholder:text-[#c7c4d7]`;

// ═══ Tag ═══
export function Tag({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span className="text-[10px] py-0.5 px-2 rounded-full font-semibold whitespace-nowrap"
      style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
}

// ═══ FreqTag ═══
export function FreqTag({ freq }: { freq: 'monthly' | 'occasional' }) {
  return freq === 'monthly'
    ? (
      <span className="inline-flex items-center gap-1 text-[10px] py-0.5 px-2 rounded-full font-semibold
        bg-[#e1e0ff] text-[#4648d4] whitespace-nowrap">
        <RefreshCw size={9} /> חודשי
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[10px] py-0.5 px-2 rounded-full font-semibold
        bg-[#fef3c7] text-[#825100] whitespace-nowrap">
        <Calendar size={9} /> מדי פעם
      </span>
    );
}

// ═══ Checkbox ═══
export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className="w-[24px] h-[24px] rounded-full flex items-center justify-center shrink-0"
      style={{
        border:     checked ? 'none' : '2px solid #c7c4d7',
        background: checked ? '#006c49' : '#ffffff',
        transition: 'background 0.18s ease, border 0.18s ease, transform 0.15s ease',
        transform:  checked ? 'scale(1.08)' : 'scale(1)',
      }}
    >
      {checked && (
        <svg width="13" height="10" viewBox="0 0 13 10" fill="none"
          style={{ animation: 'popIn 0.22s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
          <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ═══ SectionLabel ═══
export function SectionLabel({ label, color = '#464554', dot }: {
  label: string; color?: string; dot?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2 mt-3 px-1">
      {dot && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />}
      <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color }}>{label}</span>
    </div>
  );
}

// ═══ Card ═══
export function Card({ children, onClick, selected, muted, className = '', accentColor }: {
  children: React.ReactNode; onClick?: () => void; selected?: boolean;
  muted?: boolean; className?: string; accentColor?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border cursor-pointer transition-all ${
        selected ? 'border-[#4648d4] ring-2 ring-[#e1e0ff]' : 'border-[#e5eeff]'
      } ${muted ? 'opacity-55' : ''} ${className}`}
      style={accentColor ? { borderRightWidth: '4px', borderRightColor: accentColor } : undefined}
    >
      {children}
    </div>
  );
}

// ═══ BottomSheet ═══
export function BottomSheet({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-end justify-center"
      style={{ animation: 'fadeIn .2s ease both' }}
      onClick={onClose}>
      <div
        className="bg-white rounded-t-[24px] w-full max-w-[500px]"
        style={{
          padding: '24px 24px max(24px, env(safe-area-inset-bottom))',
          animation: 'slideUp .3s cubic-bezier(0.32,0.72,0,1)',
        }}
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-[#e5eeff] rounded-full mx-auto mb-5" />
        {children}
      </div>
    </div>
  );
}

// ═══ CenterModal ═══
export function CenterModal({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5"
      style={{ animation: 'fadeIn .2s ease both' }}
      onClick={onClose}>
      <div className="bg-white rounded-[24px] p-6 w-full max-w-[420px] shadow-xl"
        style={{ animation: 'scaleIn .22s cubic-bezier(0.175,0.885,0.32,1.275)' }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
