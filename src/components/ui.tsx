import React from 'react';

// ═══ Toast ═══
export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white
      px-7 py-3 rounded-2xl text-sm font-semibold z-[999] shadow-2xl whitespace-nowrap"
      style={{ animation: 'fadeUp .3s ease' }}>
      {msg}
    </div>
  );
}

// ═══ Header ═══
export function Header({ title, subtitle, onBack, children }: {
  title: string; subtitle?: string; onBack?: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-bl from-[#1a1a2e] via-[#16213e] to-[#0f3460]
      text-white py-7 px-5 text-center sticky top-0 z-50 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
      {onBack && (
        <button onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/15 border-none
            text-white w-9 h-9 rounded-xl text-lg cursor-pointer flex items-center justify-center
            hover:bg-white/25 transition-colors">
          →
        </button>
      )}
      <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs opacity-60 font-light mt-0.5">{subtitle}</p>}
      {children}
    </div>
  );
}

// ═══ BottomBar ═══
export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e4df]
      py-3 px-5 flex gap-2.5 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      {children}
    </div>
  );
}

// ═══ Button ═══
export function Btn({ bg, fg, children, onClick, className = '', flex = 1 }: {
  bg: string; fg: string; children: React.ReactNode; onClick?: () => void;
  className?: string; flex?: number | string;
}) {
  return (
    <button onClick={onClick}
      className={`py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer
        transition-transform active:scale-[0.97] ${className}`}
      style={{ background: bg, color: fg, flex, fontFamily: 'inherit' }}>
      {children}
    </button>
  );
}

// ═══ Pill Filter ═══
export function Pill({ active, children, onClick }: {
  active: boolean; children: React.ReactNode; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`py-2 px-3.5 rounded-xl text-xs font-semibold cursor-pointer
        whitespace-nowrap border-2 transition-all ${
        active
          ? 'border-[#e63946] bg-[#e63946] text-white'
          : 'border-[#e8e4df] bg-white text-[#1a1a1a] hover:border-[#ccc]'
      }`} style={{ fontFamily: 'inherit' }}>
      {children}
    </button>
  );
}

// ═══ Input ═══
export const inputClass = `w-full py-3 px-3.5 border-2 border-[#e8e4df] rounded-xl
  text-sm outline-none bg-white focus:border-[#e63946] transition-colors font-[inherit]`;

// ═══ Tag ═══
export function Tag({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span className="text-[10px] py-0.5 px-2 rounded-md font-semibold whitespace-nowrap"
      style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
}

// ═══ Modal (bottom sheet) ═══
export function BottomSheet({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end justify-center"
      onClick={onClose}>
      <div className="bg-white rounded-t-[20px] p-6 pb-10 w-full max-w-[500px]"
        onClick={e => e.stopPropagation()}>
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
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-[400px]"
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ═══ FreqTag ═══
export function FreqTag({ freq }: { freq: 'monthly' | 'occasional' }) {
  return freq === 'monthly'
    ? <Tag bg="#e8f5e9" fg="#2e7d32">🔄</Tag>
    : <Tag bg="#fff3e0" fg="#e65100">📅</Tag>;
}

// ═══ Checkbox ═══
export function Checkbox({ checked, color = '#2d6a4f' }: { checked: boolean; color?: string }) {
  return (
    <div className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center
      text-[11px] shrink-0 transition-all"
      style={{
        border: checked ? 'none' : '2.5px solid #e0dcd7',
        background: checked ? color : 'transparent',
        color: checked ? '#fff' : 'transparent',
      }}>
      ✓
    </div>
  );
}
