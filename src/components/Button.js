import { escapeHtml, icon } from './utils.js';

const variants = {
  primary: 'btn-hover-fx cursor-pointer relative z-10 w-full sm:w-auto bg-blue-600 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-500/25 text-[15px] sm:text-sm flex items-center justify-center',
  secondary: 'btn-hover-fx cursor-pointer relative z-10 w-full sm:w-auto bg-white/95 backdrop-blur-md sm:bg-white text-slate-700 border border-slate-200 font-semibold px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-[15px] sm:text-sm flex items-center justify-center shadow-lg hover:bg-slate-50 animate-slide-up',
  navPrimary: 'btn-hover-fx bg-gradient-to-r from-blue-600 to-sky-400 text-white font-semibold px-7 py-3 rounded-xl shadow-xl shadow-blue-500/20 text-[12px] tracking-widest uppercase flex items-center gap-2 cursor-pointer relative z-10 pointer-events-auto',
};

export function Button({ label, variant = 'primary', iconName, extraClass = '', attrs = '' }) {
  const safeLabel = escapeHtml(label);
  const content = iconName ? `${safeLabel} ${icon(iconName, 'w-4 h-4')}` : safeLabel;
  return `<button type="button" ${attrs} class="${variants[variant]} ${extraClass}">${content}</button>`;
}
