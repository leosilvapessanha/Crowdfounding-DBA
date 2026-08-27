import { escapeHtml } from './utils.js';

/**
 * Reusable reward tier card for the campaign details sidebar.
 * @param {{ title: string, price: string, description: string, featured?: boolean, href?: string, disabled?: boolean }} reward
 */
export function RewardCard({ title, price, description, featured = false, href = '#', disabled = false }) {
  const bg = featured
    ? 'bg-white border-slate-200 shadow-sm'
    : 'bg-slate-50 border-slate-200';

  // Ended campaigns render as a plain <div>, not a link — there's nowhere for it to take
  // the backer, so it shouldn't look or behave like something you can click.
  const tag = disabled ? 'div' : 'a';
  const hrefAttr = disabled ? '' : `href="${escapeHtml(href)}"`;
  const interactionClasses = disabled
    ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
    : `${bg} hover:border-blue-300 hover:bg-white hover:shadow-md cursor-pointer group`;

  return `<${tag} ${hrefAttr} class="${interactionClasses} border rounded-2xl p-6 transition-all block">
    <div class="flex justify-between items-start mb-3">
      <h4 class="font-bold text-slate-900 font-inter text-[16px] ${disabled ? '' : 'group-hover:text-blue-600'} transition-colors">${escapeHtml(title)}</h4>
      <span class="${featured && !disabled ? 'text-blue-600' : 'text-slate-900'} font-bold text-[16px] shrink-0 ml-4">${escapeHtml(price)}</span>
    </div>
    <p class="text-[14px] text-slate-500 mb-5 leading-relaxed">${escapeHtml(description)}</p>
    ${disabled
      ? `<span class="text-slate-400 font-semibold text-[14px]">Campanha encerrada</span>`
      : `<span class="text-blue-600 font-semibold text-[14px] group-hover:text-blue-700 transition-colors">Selecionar recompensa</span>`}
  </${tag}>`;
}
