import { escapeHtml } from './utils.js';

export function Badge({ label }) {
  return `<div class="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold text-slate-800 shadow-sm uppercase tracking-widest leading-none">${escapeHtml(label)}</div>`;
}
