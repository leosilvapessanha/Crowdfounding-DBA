import { footerColumns, inspirationLinks, inspirationTabs } from '../data/categories.js';
import { escapeHtml, icon } from './utils.js';

function InspirationTabs() {
  return `<div class="flex gap-6 mb-8 overflow-x-auto border-b border-slate-200 scrollbar-hide">
    ${inspirationTabs.map((tab, index) => `
      <button type="button" class="pb-3 text-[14px] font-inter whitespace-nowrap transition-all duration-300 border-b-2 -mb-[1px] ${index === 0 ? 'text-blue-600 font-bold border-blue-600' : 'text-slate-500 font-medium border-transparent hover:text-blue-600 hover:border-blue-300'}">
        ${escapeHtml(tab)}
      </button>
    `).join('')}
  </div>`;
}

function InspirationLinks() {
  const links = inspirationLinks.map(([title, description]) => `
    <a href="#" class="flex flex-col group gap-1 transition-all">
      <span class="text-[14px] font-semibold text-slate-900 font-inter group-hover:text-blue-600 transition-colors">${escapeHtml(title)}</span>
      <span class="text-[14px] text-slate-500 font-inter group-hover:text-blue-400 transition-colors">${escapeHtml(description)}</span>
    </a>
  `).join('');
  
  return `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4 mb-12">
    ${links}
    <a href="#" class="flex items-center text-[14px] font-semibold font-inter text-slate-900 hover:text-blue-600 transition-colors group">
      Mostrar mais <span class="transform group-hover:translate-y-0.5 transition-transform">${icon('chevron-down', 'w-4 h-4 ml-1')}</span>
    </a>
  </div>`;
}

function FooterColumns() {
  return `<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
    ${footerColumns.map((column) => `
    <div class="flex flex-col gap-4">
      <h3 class="font-manrope font-bold text-[15px] text-slate-900 tracking-tight">${escapeHtml(column.title)}</h3>
      <ul class="flex flex-col gap-3">
        ${column.links.map((link) => `
        <li><a href="#" class="text-[14px] font-inter text-slate-500 hover:text-blue-600 transition-colors">${escapeHtml(link)}</a></li>
        `).join('')}
      </ul>
    </div>`).join('')}
  </div>`;
}

export function Footer() {
  return `<footer class="bg-slate-50 border-t border-slate-200 mt-16 relative z-10 selection:bg-blue-500/20 selection:text-blue-900">
    <div class="px-6 md:px-10 xl:px-20 max-w-[1440px] mx-auto py-12">
      
      <div class="mb-10 reveal visible">
        <h2 class="text-[24px] font-manrope font-bold text-slate-900 mb-6 tracking-tight">Inspiração para viagens futuras</h2>
        ${InspirationTabs()}
        ${InspirationLinks()}
      </div>

      <div class="w-full h-px bg-slate-200 mb-10 opacity-80"></div>
      
      <div class="reveal visible">
        ${FooterColumns()}
      </div>
      
      <div class="w-full h-px bg-slate-200 mb-6 opacity-80"></div>
      
      <div class="flex flex-col lg:flex-row justify-between items-center gap-6 reveal visible">
        <div class="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 text-[14px] font-inter text-slate-500">
          <span class="font-medium text-slate-600">© 2024 Trama RPG, Inc.</span>
          <span class="hidden sm:inline text-slate-300">·</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Privacidade</a>
          <span class="hidden sm:inline text-slate-300">·</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Termos</a>
          <span class="hidden sm:inline text-slate-300">·</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Mapa do site</a>
          <span class="hidden sm:inline text-slate-300">·</span>
          <a href="#" class="hover:text-blue-600 transition-colors">Informações da empresa</a>
        </div>
        
        <div class="flex flex-wrap items-center justify-center gap-6">
          <div class="flex items-center gap-2 text-[14px] font-semibold text-slate-700 font-inter">
            <button type="button" class="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              ${icon('globe', 'w-4 h-4')} Português (BR)
            </button>
            <button type="button" class="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              R$ BRL
            </button>
          </div>
          <div class="flex items-center gap-4 text-slate-400 border-l border-slate-200 pl-4">
            <a href="#" class="hover:text-blue-600 hover:scale-110 transform transition-all" aria-label="Facebook">${icon('facebook', 'w-[18px] h-[18px]')}</a>
            <a href="#" class="hover:text-blue-600 hover:scale-110 transform transition-all" aria-label="Twitter">${icon('twitter', 'w-[18px] h-[18px]')}</a>
            <a href="#" class="hover:text-blue-600 hover:scale-110 transform transition-all" aria-label="Instagram">${icon('instagram', 'w-[18px] h-[18px]')}</a>
          </div>
        </div>
      </div>
      
    </div>
  </footer>`;
}
