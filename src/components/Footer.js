import { footerColumns, inspirationLinks, inspirationTabs } from '../data/categories.js';
import { escapeHtml, icon } from './utils.js';

function InspirationTabs() {
  return `<div class="flex gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
    ${inspirationTabs.map((tab, index) => `<button type="button" class="px-5 py-2.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${index === 0 ? 'bg-slate-900 text-white shadow-lg shadow-slate-200/50' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}">${escapeHtml(tab)}</button>`).join('')}
  </div>`;
}

function InspirationLinks() {
  const links = inspirationLinks.map(([title, description]) => `<a href="#" class="flex flex-col group gap-0.5"><span class="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">${escapeHtml(title)}</span><span class="text-[13px] text-slate-500">${escapeHtml(description)}</span></a>`).join('');
  return `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-8 gap-x-6">
    ${links}
    <a href="#" class="flex items-center text-[14px] font-bold text-slate-900 hover:text-blue-600 transition-all">Mostrar mais ${icon('chevron-down', 'w-4 h-4 ml-1')}</a>
  </div>`;
}

function FooterColumns() {
  return `<div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
    ${footerColumns.map((column) => `<div class="flex flex-col gap-5">
      <h3 class="font-outfit font-bold text-[15px] text-slate-900 uppercase tracking-wider">${escapeHtml(column.title)}</h3>
      <ul class="flex flex-col gap-4">
        ${column.links.map((link) => `<li><a href="#" class="text-[14px] text-slate-500 hover:text-blue-600 transition-colors">${escapeHtml(link)}</a></li>`).join('')}
      </ul>
    </div>`).join('')}
  </div>`;
}

export function Footer() {
  return `<footer class="bg-white border-t border-slate-100 mt-24">
    <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] py-20">
      <div class="mb-16">
        <h2 class="font-outfit text-[22px] sm:text-[24px] font-bold text-slate-900 mb-8 tracking-tight">Incentive projetos intependentes!</h2>
        ${InspirationTabs()}
        ${InspirationLinks()}
      </div>
      <div class="w-full h-px bg-slate-100 mb-16"></div>
      ${FooterColumns()}
      <div class="w-full h-px bg-slate-100 mb-10"></div>
      <div class="flex flex-col lg:flex-row justify-between items-center gap-8">
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-[13px] text-slate-500">
          <span class="font-medium">© 2024 Trama RPG, Inc.</span>
          <span class="hidden sm:inline text-slate-300">•</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Privacidade</a>
          <span class="hidden sm:inline text-slate-300">•</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Termos</a>
          <span class="hidden sm:inline text-slate-300">•</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Mapa do site</a>
          <span class="hidden sm:inline text-slate-300">•</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Informações da empresa</a>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-6">
          <div class="flex items-center gap-6">
            <button type="button" class="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all text-[13px] font-bold text-slate-900 border border-transparent hover:border-slate-100">${icon('globe', 'w-4 h-4')} Português (BR)</button>
            <button type="button" class="flex items-center gap-2 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-all text-[13px] font-bold text-slate-900 border border-transparent hover:border-slate-100">R$ BRL</button>
          </div>
          <div class="flex items-center gap-5 border-l border-slate-100 pl-6 text-slate-900">
            <a href="#" class="hover:text-blue-600 transition-all hover:scale-110 transform" aria-label="Facebook">${icon('facebook', 'w-4 h-4')}</a>
            <a href="#" class="hover:text-blue-600 transition-all hover:scale-110 transform" aria-label="Twitter">${icon('twitter', 'w-4 h-4')}</a>
            <a href="#" class="hover:text-blue-600 transition-all hover:scale-110 transform" aria-label="Instagram">${icon('instagram', 'w-4 h-4')}</a>
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}
