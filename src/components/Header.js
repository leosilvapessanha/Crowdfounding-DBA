import { clearSession, getSession } from '../data/authStore.js';
import { getCreatorSession } from '../data/creatorStore.js';
import { DesktopSearchBar, MobileSearchTrigger } from './SearchBar.js';
import { Logo } from './Logo.js';
import { MobileMenu } from './MobileMenu.js';
import { escapeHtml, icon } from './utils.js';

export function Header() {
  const session = getSession();
  const creatorSession = getCreatorSession();
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  // Already has a creator account too — hand off straight to the dashboard instead of making them
  // log in again, and swap the copy from "become a creator" to "switch to that view".
  const creatorLink = creatorSession
    ? { href: '?creator=dashboard', icon: 'rocket', label: 'Ver como criador' }
    : { href: '?creator=login', icon: 'rocket', label: 'Me tornar criador' };
  const authLinks = session
    ? `<div class="hidden lg:block relative" id="header-user-menu">
        <button type="button" id="header-user-trigger" class="flex items-center gap-2 text-[13px] font-bold text-slate-700 font-inter pr-2 py-1 pl-1 rounded-full hover:bg-slate-100/70 transition-colors" aria-haspopup="true" aria-expanded="false">
          <span class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center text-[12px] font-bold font-outfit shrink-0">${escapeHtml(session.name.charAt(0).toUpperCase())}</span>
          <span>Olá, ${escapeHtml(session.name.split(' ')[0])}</span>
          ${icon('chevron-down', 'w-3.5 h-3.5 text-slate-400 transition-transform')}
        </button>
        <div id="header-user-dropdown" class="hidden absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-[0_12px_32px_rgba(15,23,42,0.12)] overflow-hidden py-1.5">
          <a href="?account=edit" class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            ${icon('settings', 'w-4 h-4')} Meus dados
          </a>
          <a href="?account=pledges" class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            ${icon('heart', 'w-4 h-4')} Minhas campanhas
          </a>
          <a href="${creatorLink.href}" class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
            ${icon(creatorLink.icon, 'w-4 h-4')} ${creatorLink.label}
          </a>
          <div class="h-px bg-slate-100 my-1"></div>
          <button type="button" id="header-logout-btn" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left">
            ${icon('log-out', 'w-4 h-4')} Sair
          </button>
        </div>
      </div>`
    : `<div class="hidden lg:flex items-center gap-6">
        <a href="?auth=signup&next=${next}" class="text-[12px] font-extrabold tracking-widest uppercase text-slate-600 hover:text-blue-600 transition-colors cursor-pointer relative z-10 pointer-events-auto">Cadastre-se</a>
        <a href="?auth=login&next=${next}" class="btn-hover-fx bg-gradient-to-r from-blue-600 to-sky-400 text-white font-semibold px-7 py-3 rounded-xl shadow-xl shadow-blue-500/20 text-[12px] tracking-widest uppercase flex items-center gap-2 cursor-pointer relative z-10 pointer-events-auto">
          Entrar ${icon('arrow-right', 'w-4 h-4')}
        </a>
      </div>`;

  return `<nav class="fixed top-0 z-50 w-full mt-3 md:mt-6 px-4 md:px-8 xl:px-[10%] 2xl:px-[256px] flex justify-center">
    <div class="w-full flex flex-col lg:flex-row items-center justify-between bg-white/60 md:bg-white/45 backdrop-blur-2xl backdrop-saturate-200 px-3 sm:px-4 md:px-8 py-3 rounded-3xl lg:rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_12px_40px_rgba(15,23,42,0.15)] border border-white/70 lg:border-white/60 gap-3 lg:gap-0">
      <div class="flex items-center justify-between w-full lg:w-auto px-1 lg:px-0">
        ${Logo()}
        <div class="flex items-center gap-2 sm:gap-3 lg:hidden">
          <button type="button" id="mobile-menu-btn" class="text-slate-800 hover:text-blue-600 p-1 sm:p-2" aria-label="Abrir menu" aria-controls="mobile-menu" aria-expanded="false">
            ${icon('menu', 'w-6 h-6')}
          </button>
        </div>
      </div>
      ${DesktopSearchBar()}
      ${MobileSearchTrigger()}
      ${authLinks}
    </div>
    ${MobileMenu()}
  </nav>`;
}

export function initHeaderAuth() {
  const menu = document.getElementById('header-user-menu');
  const trigger = document.getElementById('header-user-trigger');
  const dropdown = document.getElementById('header-user-dropdown');

  if (menu && trigger && dropdown) {
    const setOpen = (isOpen) => {
      dropdown.classList.toggle('hidden', !isOpen);
      trigger.setAttribute('aria-expanded', String(isOpen));
      trigger.querySelector('svg')?.classList.toggle('rotate-180', isOpen);
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(dropdown.classList.contains('hidden'));
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) setOpen(false);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  document.getElementById('header-logout-btn')?.addEventListener('click', () => {
    clearSession();
    window.location.href = '/';
  });
}
