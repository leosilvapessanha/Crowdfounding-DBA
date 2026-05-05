import { Badge } from './Badge.js';
import { escapeHtml, icon } from './utils.js';

const creatorIcon = `<svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 12h8M12 2L8 12h8L12 2zM10 7h4M9 12v1c0 3 1.5 5 3 5s3-2 3-5v-1M10 14h4M4 10v11" /><circle cx="4" cy="7" r="2.5" /><path d="M1 5l1.5 1.5M4 1v2M7 5l-1.5 1.5M18 21c0-3-2-4-6-4s-6 1-6 4" /></svg>`;

const projectCardClasses = 'group relative flex-none w-[75vw] sm:w-[280px] lg:w-[270px] xl:w-[290px] 2xl:w-[310px] bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-5px_rgba(37,99,235,0.15)] hover:-translate-y-1.5 cursor-pointer transition-all duration-300 snap-start flex flex-col overflow-hidden';

function TimeLabel({ urgent, time }) {
  if (!urgent) {
    return `<span class="text-[12px] text-slate-500 font-medium">${escapeHtml(time)}</span>`;
  }

  return `<span class="text-[12px] text-red-500 font-semibold flex items-center gap-1">${icon('clock', 'w-3 h-3')} ${escapeHtml(time)}</span>`;
}

export function ProjectCard(campaign) {
  const progress = Math.min(100, Math.max(0, Number(campaign.progress) || 0));

  return `<a href="${escapeHtml(campaign.href)}" class="${projectCardClasses}" aria-label="Apoiar ${escapeHtml(campaign.title)}">
    <div class="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
      ${Badge({ label: campaign.badge })}
      <img src="${escapeHtml(campaign.image)}" class="w-full h-full object-cover" alt="${escapeHtml(campaign.alt)}" width="640" height="360" loading="lazy" decoding="async">
    </div>
    <div class="px-5 py-4 flex flex-col flex-1">
      <h3 class="font-outfit text-[17px] sm:text-[18px] font-bold text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors mb-1.5">${escapeHtml(campaign.title)}</h3>
      <p class="text-[13px] text-slate-500 flex items-center gap-1.5 font-medium mb-3">${creatorIcon} ${escapeHtml(campaign.creator)}</p>
      <div class="w-full mb-3 mt-2">
        <div class="flex justify-between items-end mb-1.5">
          <span class="text-[13px] font-bold text-slate-900">${progress}% fundado</span>
          ${TimeLabel(campaign)}
        </div>
        <div class="w-full bg-slate-100 rounded-full h-[4px]"><div class="bg-blue-600 h-[4px] rounded-full" style="width: ${progress}%"></div></div>
      </div>
      <div class="mt-auto pt-2">
        <div class="w-full h-px bg-slate-100 block mb-3"></div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Apoio a partir de</span><span class="text-[15px] font-bold text-slate-900 leading-none">${escapeHtml(campaign.price)}</span></div>
          <div class="flex items-center text-blue-600 text-[13px] font-bold group-hover:text-blue-700 transition-colors">Apoiar ${icon('arrow-right', 'w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform')}</div>
        </div>
      </div>
    </div>
  </a>`;
}
