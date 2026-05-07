import React from 'react';
import { ChevronRight, RefreshCw, Calendar } from 'lucide-react';

// ─── Wave decoration ─────────────────────────────────────────────────────────
export function WaveBottom({ fill = '#f8fafc' }: { fill?: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden" style={{ height: 40 }}>
      {/* Primary wave */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
      >
        <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill={fill} />
      </svg>
      {/* Secondary wave — animated drift */}
      <svg
        className="absolute bottom-0 left-0 w-full h-full opacity-30"
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ animation: 'wave-drift 6s ease-in-out infinite' }}
      >
        <path d="M0,28 C480,8 960,40 1440,24 L1440,40 L0,40 Z" fill={fill} />
      </svg>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, #f1f5f9 25%, #ede9fe 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon, title, sub,
}: { icon: React.ReactNode; title: string; sub?: string; }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)' }}>
        <span className="text-violet-400">{icon}</span>
      </div>
      <p className="font-semibold text-slate-400 text-sm">{title}</p>
      {sub && <p className="text-slate-300 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Header ───────────────────────────────────────────────────────────────────
export function Header({
  title, subtitle, onBack, children,
}: {
  title: string; subtitle?: string; onBack?: () => void; children?: React.ReactNode;
}) {
  return (
    <div
      className="text-white sticky top-0 z-50 relative overflow-hidden"
      style={{
        background: 'linear-gradient(225deg, #6d28d9, #6366f1 55%, #3b82f6)',
        boxShadow: '0 4px 32px rgba(109,40,217,0.3)',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
      }}
    >
      <div className="px-4 pb-10 pt-2">
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
            <h1 className="text-[17px] font-bold tracking-tight leading-tight truncate">{title}</h1>
            {subtitle && <p className="text-xs text-white/65 mt-0.5 font-normal">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
      <WaveBottom />
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
  bg, fg, children, onClick, className = '', flex = 1, variant,
}: {
  bg?: string; fg?: string; children: React.ReactNode; onClick?: () => void;
  className?: string; flex?: number | string; variant?: 'primary' | 'secondary' | 'danger';
}) {
  let style: React.CSSProperties = { flex, fontFamily: 'inherit' };
  let cls = `py-3.5 border-none rounded-xl font-bold text-sm cursor-pointer
    transition-all active:scale-[0.97] ${className}`;

  if (variant === 'primary') {
    cls += ' text-white active:brightness-90 active:shadow-inner';
    style = {
      ...style,
      background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
      boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
    };
  } else if (variant === 'secondary') {
    cls += ' bg-slate-100 text-slate-600';
  } else if (variant === 'danger') {
    cls += ' bg-red-50 text-red-500';
  } else {
    style = { ...style, background: bg, color: fg };
  }

  return (
    <button onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────
export function Pill({
  active, children, onClick,
}: { active: boolean; children: React.ReactNode; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      className={`py-1.5 px-4 rounded-full text-xs font-semibold cursor-pointer
        whitespace-nowrap transition-all ${
        active
          ? 'text-white shadow-sm'
          : 'text-slate-600 border border-white/60 hover:border-slate-300'
      }`}
      style={active
        ? { background: 'linear-gradient(to right, #8b5cf6, #6366f1)', fontFamily: 'inherit' }
        : { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', fontFamily: 'inherit' }
      }
    >
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export const inputClass = `w-full py-3 px-4 border border-slate-200 rounded-xl text-sm
  outline-none bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100
  transition-all font-[inherit] placeholder:text-slate-400`;

// ─── Tag ──────────────────────────────────────────────────────────────────────
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

// ─── BottomSheet ──────────────────────────────────────────────────────────────
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

// ─── CenterModal ──────────────────────────────────────────────────────────────
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

// ─── FreqTag ──────────────────────────────────────────────────────────────────
export function FreqTag({ freq }: { freq: 'monthly' | 'occasional'; }) {
  return freq === 'monthly' ? (
    <span className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-full
      font-semibold bg-violet-50 text-violet-500 whitespace-nowrap">
      <RefreshCw size={9} />חודשי
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] py-1 px-2.5 rounded-full
      font-semibold bg-amber-50 text-amber-600 whitespace-nowrap">
      <Calendar size={9} />מדי פעם
    </span>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export function Checkbox({
  checked, color = '#7c3aed',
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
          <path d="M1 3.5L4 6.5L10 1" stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
export function SectionLabel({
  label, color = '#64748b', dot,
}: { label: string; color?: string; dot?: string; }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-1">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot ?? color }} />
      <span className="text-[12px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children, onClick, selected, muted, className = '',
}: {
  children: React.ReactNode; onClick?: () => void;
  selected?: boolean; muted?: boolean; className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border transition-all mb-2 ${
        selected
          ? 'border-violet-400 ring-2 ring-violet-100'
          : 'border-slate-100 hover:border-r-4 hover:border-r-violet-200 hover:shadow-sm'
      } ${muted ? 'opacity-55' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
