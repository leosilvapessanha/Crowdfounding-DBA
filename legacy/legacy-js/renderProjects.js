(() => {
const creatorIcon = `<svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 12h8M12 2L8 12h8L12 2zM10 7h4M9 12v1c0 3 1.5 5 3 5s3-2 3-5v-1M10 14h4M4 10v11" /><circle cx="4" cy="7" r="2.5" /><path d="M1 5l1.5 1.5M4 1v2M7 5l-1.5 1.5M18 21c0-3-2-4-6-4s-6 1-6 4" /></svg>`;

const projectCardClasses = 'group relative flex-none w-[75vw] sm:w-[280px] lg:w-[270px] xl:w-[290px] 2xl:w-[310px] bg-white rounded-2xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-5px_rgba(37,99,235,0.15)] hover:-translate-y-1.5 cursor-pointer transition-all duration-300 snap-start flex flex-col overflow-hidden';
const ctaCardClasses = 'group relative flex-none w-[75vw] sm:w-[280px] lg:w-[270px] xl:w-[280px] 2xl:w-[310px] bg-slate-50/50 rounded-[20px] border-2 border-slate-200/80 hover:border-blue-400 border-dashed hover:border-solid hover:bg-white shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] hover:-translate-y-1.5 cursor-pointer transition-all duration-500 snap-start flex flex-col items-center justify-center text-center overflow-hidden';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function renderTime(project) {
  if (!project.urgent) {
    return `<span class="text-[12px] text-slate-500 font-medium">${escapeHtml(project.time)}</span>`;
  }

  return `<span class="text-[12px] text-red-500 font-semibold flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3" aria-hidden="true"></i> ${escapeHtml(project.time)}</span>`;
}

function renderProjectCard(project) {
  return `<a href="${escapeHtml(project.href)}" class="${projectCardClasses}" aria-label="Apoiar ${escapeHtml(project.title)}">
    <div class="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
      <div class="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold text-slate-800 shadow-sm uppercase tracking-widest leading-none">${escapeHtml(project.badge)}</div>
      <img src="${escapeHtml(project.image)}" class="w-full h-full object-cover" alt="${escapeHtml(project.alt)}">
    </div>
    <div class="px-5 py-4 flex flex-col flex-1">
      <h3 class="font-outfit text-[17px] sm:text-[18px] font-bold text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors mb-1.5">${escapeHtml(project.title)}</h3>
      <p class="text-[13px] text-slate-500 flex items-center gap-1.5 font-medium mb-3">${creatorIcon} ${escapeHtml(project.creator)}</p>
      <div class="w-full mb-3 mt-2">
        <div class="flex justify-between items-end mb-1.5">
          <span class="text-[13px] font-bold text-slate-900">${project.progress}% fundado</span>
          ${renderTime(project)}
        </div>
        <div class="w-full bg-slate-100 rounded-full h-[4px]"><div class="bg-blue-600 h-[4px] rounded-full" style="width: ${project.progress}%"></div></div>
      </div>
      <div class="mt-auto pt-2">
        <div class="w-full h-px bg-slate-100 block mb-3"></div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col"><span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Apoio a partir de</span><span class="text-[15px] font-bold text-slate-900 leading-none">${escapeHtml(project.price)}</span></div>
          <div class="flex items-center text-blue-600 text-[13px] font-bold group-hover:text-blue-700 transition-colors">Apoiar <i data-lucide="arrow-right" class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" aria-hidden="true"></i></div>
        </div>
      </div>
    </div>
  </a>`;
}

function renderCtaCard(cta) {
  return `<a href="${escapeHtml(cta.href)}" class="${ctaCardClasses}" aria-label="${escapeHtml(cta.title)}">
    <div class="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-5 text-slate-400 group-hover:text-blue-600 group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all duration-500 shadow-sm relative z-10"><i data-lucide="${escapeHtml(cta.icon)}" class="w-7 h-7" aria-hidden="true"></i></div>
    <h3 class="font-outfit text-[18px] font-bold text-slate-800 mb-2 relative z-10 transition-colors group-hover:text-blue-600">${escapeHtml(cta.title)}</h3>
    <p class="text-[13px] text-slate-500 px-6 relative z-10 leading-relaxed font-medium">${escapeHtml(cta.description)}</p>
    <div class="mt-6 font-bold text-slate-500 group-hover:text-blue-600 text-[13px] flex items-center gap-1.5 border border-slate-200 group-hover:border-blue-200 px-4 py-2 rounded-xl transition-all duration-300"><span>${escapeHtml(cta.label)}</span><i data-lucide="arrow-right" class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-500" aria-hidden="true"></i></div>
  </a>`;
}

function renderProjectCarousels() {
  const { carouselCtas, projectGroups } = window.TramaData;

  document.querySelectorAll('[data-project-carousel]').forEach((carousel) => {
    const groupName = carousel.dataset.projectCarousel;
    const projects = projectGroups[groupName] || [];
    const cta = carouselCtas[groupName];
    carousel.innerHTML = [...projects.map(renderProjectCard), cta ? renderCtaCard(cta) : ''].join('');
  });
}

window.TramaRenderProjects = {
  renderProjectCarousels,
};
})();
