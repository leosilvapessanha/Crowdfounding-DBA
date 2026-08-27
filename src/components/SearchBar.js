import { getCategories, SORT_OPTIONS } from '../data/campaigns.js';
import { escapeHtml, icon, navigate } from './utils.js';

function CategoryOptions(selected) {
  return `<option value="">Todas</option>
    ${getCategories().map((c) => `<option value="${escapeHtml(c)}" ${c === selected ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}`;
}

function SortOptions(selected) {
  return SORT_OPTIONS.map((o) => `<option value="${o.value}" ${o.value === selected ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
}

export function DesktopSearchBar() {
  return `<div class="hidden lg:flex items-center flex-1 mx-6">
    <div class="relative w-full flex items-center bg-white/60 rounded-full border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
      <div class="flex-1 group">
        <div class="px-5 py-2 rounded-full hover:bg-white/80 transition-colors cursor-pointer">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider" for="desktop-search-input">O que busca</label>
          <input id="desktop-search-input" type="text" class="w-full bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 font-medium" placeholder="Projetos, criadores...">
        </div>
      </div>
      <div class="w-px h-8 bg-slate-200/60"></div>
      <div class="flex-shrink-0 group">
        <div class="px-5 py-2 rounded-full hover:bg-white/80 transition-colors cursor-pointer">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider" for="desktop-category-select">Categoria</label>
          <select id="desktop-category-select" class="block max-w-[130px] truncate bg-transparent outline-none border-none appearance-none text-sm text-slate-600 font-medium cursor-pointer">
            ${CategoryOptions('')}
          </select>
        </div>
      </div>
      <div class="w-px h-8 bg-slate-200/60"></div>
      <div class="flex-shrink-0 group">
        <div class="px-5 py-2 rounded-full hover:bg-white/80 transition-colors cursor-pointer">
          <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider" for="desktop-sort-select">Ordenar</label>
          <select id="desktop-sort-select" class="block max-w-[150px] truncate bg-transparent outline-none border-none appearance-none text-sm text-slate-600 font-medium cursor-pointer">
            ${SortOptions('populares')}
          </select>
        </div>
      </div>
      <div class="pr-2">
        <button type="button" id="desktop-search-btn" class="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm active:scale-95 text-lg" aria-label="Buscar projetos">
          ${icon('search', 'w-4 h-4')}
        </button>
      </div>
    </div>
  </div>`;
}

export function MobileSearchTrigger() {
  return `<div class="lg:hidden w-full mt-3 px-1 relative z-20">
    <button type="button" id="mobile-search-trigger" class="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 rounded-[1.5rem] shadow-lg border border-slate-200 py-3.5 transition-all text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100" aria-controls="mobile-search-modal" aria-expanded="false">
      ${icon('search', 'w-5 h-5 text-slate-800')}
      <span class="text-[15px] font-bold text-slate-800 tracking-tight">Iniciar sua busca</span>
    </button>
  </div>`;
}

export function SearchModal() {
  return `<div id="mobile-search-modal" class="hidden fixed inset-0 z-[100] bg-slate-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="mobile-search-title">
    <div class="bg-white px-4 pt-10 pb-4 shadow-sm relative sticky top-0 z-20 flex justify-center items-center">
      <button type="button" id="close-search-modal" class="absolute top-1/2 -translate-y-1/2 left-4 p-2 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors" aria-label="Fechar busca">
        ${icon('x', 'w-5 h-5')}
      </button>
      <div class="flex items-center gap-2 pointer-events-none" aria-hidden="true">
        <div class="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          ${icon('hexagon', 'w-4 h-4')}
        </div>
        <span class="text-lg font-bold tracking-tight text-slate-900 font-outfit uppercase">TRAMA<span class="text-blue-600">.</span></span>
      </div>
    </div>
    <div class="p-4 flex flex-col gap-4 pb-[100px]">
      <div class="bg-white rounded-[24px] p-5 shadow-sm border border-slate-200/70">
        <h2 id="mobile-search-title" class="text-[22px] font-bold text-slate-900 mb-4 font-outfit">O que você busca?</h2>
        <div class="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-xl px-4 py-3.5 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          ${icon('search', 'w-5 h-5 text-slate-700')}
          <input id="mobile-search-input" type="text" class="flex-1 outline-none font-medium text-[15px] text-slate-800 placeholder-slate-400" placeholder="Buscar projetos inovadores..." aria-label="Buscar projetos">
        </div>
      </div>
      <label class="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200/70 flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
        <span class="text-slate-500 font-semibold text-[15px]">Categoria</span>
        <select id="mobile-category-select" class="bg-transparent outline-none border-none appearance-none text-right text-slate-900 font-bold text-[15px] cursor-pointer">
          ${CategoryOptions('')}
        </select>
      </label>
      <label class="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200/70 flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
        <span class="text-slate-500 font-semibold text-[15px]">Ordenar</span>
        <select id="mobile-sort-select" class="bg-transparent outline-none border-none appearance-none text-right text-slate-900 font-bold text-[15px] cursor-pointer">
          ${SortOptions('populares')}
        </select>
      </label>
    </div>
    <div class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 flex justify-between items-center z-20 pb-8">
      <button type="button" id="mobile-search-clear-btn" class="text-slate-900 underline font-bold text-[15px]">Limpar tudo</button>
      <button type="button" id="mobile-search-submit-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all">
        ${icon('search', 'w-[18px] h-[18px] text-white')} Buscar
      </button>
    </div>
  </div>`;
}

export function initSearch() {
  const mobileSearchTrigger = document.getElementById('mobile-search-trigger');
  const mobileSearchModal = document.getElementById('mobile-search-modal');
  const closeSearchModalBtn = document.getElementById('close-search-modal');

  const searchInput = document.getElementById('desktop-search-input');
  const categorySelect = document.getElementById('desktop-category-select');
  const sortSelect = document.getElementById('desktop-sort-select');
  const searchBtn = document.getElementById('desktop-search-btn');

  const mobileSearchInput = document.getElementById('mobile-search-input');
  const mobileCategorySelect = document.getElementById('mobile-category-select');
  const mobileSortSelect = document.getElementById('mobile-sort-select');
  const mobileSearchBtn = document.getElementById('mobile-search-submit-btn');
  const mobileClearBtn = document.getElementById('mobile-search-clear-btn');

  let lastFocusedElement = null;

  const setSearchOpen = (isOpen) => {
    if (!mobileSearchModal) return;
    if (isOpen) {
      lastFocusedElement = document.activeElement;
    }

    mobileSearchModal.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    mobileSearchTrigger?.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      mobileSearchInput?.focus({ preventScroll: true });
      return;
    }

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  };

  const goToResults = ({ term, category, sort }) => {
    const params = new URLSearchParams();
    if (term) params.set('search', term);
    if (category) params.set('category', category);
    if (sort && sort !== 'populares') params.set('sort', sort);
    navigate(`/?${params.toString()}`);
  };

  const performSearch = () => {
    goToResults({
      term: searchInput ? searchInput.value.trim() : '',
      category: categorySelect ? categorySelect.value : '',
      sort: sortSelect ? sortSelect.value : 'populares',
    });
  };

  const performMobileSearch = () => {
    goToResults({
      term: mobileSearchInput ? mobileSearchInput.value.trim() : '',
      category: mobileCategorySelect ? mobileCategorySelect.value : '',
      sort: mobileSortSelect ? mobileSortSelect.value : 'populares',
    });
    setSearchOpen(false);
  };

  mobileSearchTrigger?.addEventListener('click', () => setSearchOpen(true));
  closeSearchModalBtn?.addEventListener('click', () => setSearchOpen(false));

  searchBtn?.addEventListener('click', performSearch);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') performSearch();
  });

  mobileSearchBtn?.addEventListener('click', performMobileSearch);
  mobileSearchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') performMobileSearch();
  });
  mobileClearBtn?.addEventListener('click', () => {
    if (mobileSearchInput) mobileSearchInput.value = '';
    if (mobileCategorySelect) mobileCategorySelect.value = '';
    if (mobileSortSelect) mobileSortSelect.value = 'populares';
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileSearchModal && !mobileSearchModal.classList.contains('hidden')) {
      setSearchOpen(false);
    }
  });
}
