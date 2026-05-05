import { escapeHtml } from './utils.js';

/**
 * Reusable reward tier card for the campaign details sidebar.
 * @param {{ title: string, price: string, description: string, featured?: boolean }} reward
 */
export function RewardCard({ title, price, description, featured = false }) {
  const bg = featured
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-slate-50 border-slate-200';

  return `<div class="${bg} border rounded-2xl p-6 hover:border-blue-300 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
    <div class="flex justify-between items-start mb-3">
      <h4 class="font-bold text-slate-900 font-inter text-[16px] group-hover:text-blue-600 transition-colors">${escapeHtml(title)}</h4>
      <span class="${featured ? 'text-blue-600' : 'text-slate-900'} font-bold text-[16px] shrink-0 ml-4">${escapeHtml(price)}</span>
    </div>
    <p class="text-[14px] text-slate-500 mb-5 leading-relaxed">${escapeHtml(description)}</p>
    <button class="text-blue-600 font-semibold text-[14px] hover:text-blue-700 transition-colors">Selecionar recompensa</button>
  </div>`;
}
