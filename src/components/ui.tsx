import React from 'react';
import { ChevronRight, RefreshCw, Calendar } from 'lucide-react';

// ─── Toast ───────────────────────────────────────────────────────────────────
export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div
      className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-slate-900 text-white
        px-5 py-3 rounded-2xl text-sm font-semibold z-[999] shadow-2xl whitespace-nowrap"
      style={{ animation: 'fadeUp .25s ease' }}
    >
      {msg}
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
export function Header({
  title, subtitle, onBack, children,
}: {
  title: string; subtitle?: string; onBack?: () => void; children?: React.ReactNode;
}) {
  return (
    <div
      className="bg-indigo-500 text-white sticky top-0 z-50"
      style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.22)' }}
    >
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center
                hover:bg-white/25 active:scale-95 transition-all shrink-0"
            >
              <ChevronRight size={20} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-bold tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-white/65 mt-0.5 font-normal">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

// ─── BottomBar ────────────────────────────────────────────────────────────────
export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm
        border-t border-slate-100 py-3 px-4 flex gap-2.5 z-50"
      style={{
        boxShadow: '0 -4px 20px rgba(0,0,0,0.07)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({
  bg, fg, children, onClick, className = '', flex = 1,
}: {
  bg: string; fg: string; children: React.ReactNode; onClick?: () => void;
  className?: string; flex?: number | string;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer
        transition-all active:scale-[0.97] active:opacity-90 ${className}`}
      style={{ background: bg, color: fg, flex, fontFamily: 'inherit' }}
    >
      {children}
    </button>
  );
}

// ─── Pill Filter ──────────────────────────────────────────────────────────────
export function Pill({
  active, children, onClick,
}: { active: boolean; children: React.ReactNode; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      className={`py-1.5 px-4 rounded-full text-xs font-semibold cursor-pointer
        whitespace-nowrap transition-all ${
        active
          ? 'bg-indigo-500 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
      }`}
      style={{ fontFamily: 'inherit' }}
    >
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export const inputClass = `w-full py-3 px-4 border border-slate-200 rounded-xl text-sm
  outline-none bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
  transition-all font-[inherit] placeholder:text-slate-400`;

// ─── Tag ─────────────────────────────────────────────────────────────────────
export function Tag({
  bg, fg, children,
}: { bg: string; fg: string; children: React.ReactNode; }) {
  return (
    <span
      className="text-[10px] py-1 px-2.5 rounded-full font-semibold whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

// ─── BottomSheet ─────────────────────────────────────────────────────────────
export function BottomSheet({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 z-[200] flex items-end justify-center"
      style={{ animation: 'fadeIn .2s ease' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[24px] p-6 pb-10 w-full max-w-[520px]"
        style={{ animation: 'slideUp .28s cubic-bezier(0.32,0.72,0,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
        {children}
      </div>
    </div>
  );
}

// ─── CenterModal ─────────────────────────────────────────────────────────────
export function CenterModal({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode; }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5"
      style={{ animation: 'fadeIn .2s ease' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-2xl"
        style={{ animation: 'scaleIn .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── FreqTag ─────────────────────────────────────────────────────────────────
export function FreqTag({ freq }: { freq: 'monthly' | 'occasional'; }) {
  return freq === 'monthly' ? (
    <span className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-full
      font-semibold bg-indigo-50 text-indigo-500 whitespace-nowrap">
      <RefreshCw size={9} />
      חודשי
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-full
      font-semibold bg-amber-50 text-amber-600 whitespace-nowrap">
      <Calendar size={9} />
      מדי פעם
    </span>
  );
}

// ─── Checkbox ────────────────────────────────────────────────────────────────
export function Checkbox({
  checked, color = '#6366f1',
}: { checked: boolean; color?: string; }) {
  return (
    <div
      className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center shrink-0 transition-all"
      style={{
        border: checked ? 'none' : '2px solid #cbd5e1',
        background: checked ? color : 'transparent',
      }}
    >
      {checked && (
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path
            d="M1 3.5L4 6.5L10 1"
            stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

// ─── Section Divider ─────────────────────────────────────────────────────────
export function SectionLabel({
  label, color = '#64748b', dot,
}: { label: string; color?: string; dot?: string; }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-1">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: dot ?? color }}
      />
      <span className="text-[12px] font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children, onClick, selected, muted, className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border transition-all mb-2 ${
        selected
          ? 'border-indigo-400 ring-2 ring-indigo-100'
          : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
      } ${muted ? 'opacity-55' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
