import { ProjectCard } from './ProjectCard.js';
import { escapeHtml, icon } from './utils.js';

const ctaCardClasses = 'group relative flex-none w-[75vw] sm:w-[280px] lg:w-[270px] xl:w-[280px] 2xl:w-[310px] bg-slate-50/50 rounded-[20px] border-2 border-slate-200/80 hover:border-blue-400 border-dashed hover:border-solid hover:bg-white shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:-translate-y-1.5 cursor-pointer transition-all duration-500 snap-start flex flex-col items-center justify-center text-center overflow-hidden';

function CarouselCta(cta) {
  return `<a href="${escapeHtml(cta.href)}" class="${ctaCardClasses}" aria-label="${escapeHtml(cta.title)}">
    <div class="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-5 text-slate-400 group-hover:text-blue-600 group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-500 shadow-sm relative z-10">${icon(cta.icon, 'w-7 h-7')}</div>
    <h3 class="font-outfit text-[18px] font-bold text-slate-800 mb-2 relative z-10 transition-colors group-hover:text-blue-600">${escapeHtml(cta.title)}</h3>
    <p class="text-[13px] text-slate-500 px-6 relative z-10 leading-relaxed font-medium">${escapeHtml(cta.description)}</p>
    <div class="mt-6 font-bold text-slate-500 group-hover:text-blue-600 text-[13px] flex items-center gap-1.5 border border-slate-200 group-hover:border-blue-200 px-4 py-2 rounded-xl transition-all duration-300"><span>${escapeHtml(cta.label)}</span>${icon('arrow-right', 'w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-500')}</div>
  </a>`;
}

export function ProjectCarousel({ campaigns, cta }) {
  return `<div class="-mx-5 px-5 md:mx-0 md:px-0 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:gap-5 pt-2 pb-10 relative z-10 w-[100vw] md:w-auto items-stretch">
    ${campaigns.map(ProjectCard).join('')}
    ${cta ? CarouselCta(cta) : ''}
  </div>`;
}
