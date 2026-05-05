import { escapeHtml, icon } from './utils.js';

export function SectionHeader({ title, href = '#' }) {
  return `<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 md:mb-8">
    <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-manrope text-slate-800 mb-0 leading-tight">${escapeHtml(title)}</h2>
    <a href="${escapeHtml(href)}" class="group shrink-0 inline-flex items-center gap-1.5 text-[14px] sm:text-[15px] font-semibold text-slate-600 hover:text-blue-600 transition-colors self-start sm:self-auto">
      <span>Ver todos</span>
      ${icon('arrow-right', 'w-4 h-4 transition-all group-hover:translate-x-1')}
    </a>
  </div>`;
}
