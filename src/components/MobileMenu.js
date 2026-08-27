import { clearSession, getSession } from '../data/authStore.js';
import { getCreatorSession } from '../data/creatorStore.js';
import { Logo } from './Logo.js';
import { escapeHtml, icon } from './utils.js';

export function MobileMenu() {
  const session = getSession();
  const creatorSession = getCreatorSession();
  const creatorLink = creatorSession
    ? { href: '?creator=dashboard', label: 'Ver como criador' }
    : { href: '?creator=login', label: 'Me tornar criador' };
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  const authSection = session
    ? `<div class="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-4 py-3.5">
          <div class="flex items-center gap-2.5 text-[14px] font-bold text-slate-700 font-inter min-w-0">
            <span class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center text-[12px] font-bold font-outfit shrink-0">${escapeHtml(session.name.charAt(0).toUpperCase())}</span>
            <span class="truncate">Olá, ${escapeHtml(session.name.split(' ')[0])}</span>
          </div>
          <button type="button" id="mobile-logout-btn" class="text-[13px] font-bold text-slate-500 hover:text-red-500 shrink-0">Sair</button>
        </div>
        <div class="border-t border-slate-200">
          <a href="?account=edit" class="flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            ${icon('settings', 'w-4 h-4')} Meus dados
          </a>
          <a href="?account=pledges" class="flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            ${icon('heart', 'w-4 h-4')} Minhas campanhas
          </a>
          <a href="${creatorLink.href}" class="flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-slate-700 hover:text-blue-600 transition-colors">
            ${icon('rocket', 'w-4 h-4')} ${creatorLink.label}
          </a>
        </div>
      </div>`
    : `<a href="?auth=login&next=${next}" class="btn-hover-fx cursor-pointer relative z-10 w-full bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-500/25 text-[15px] flex items-center justify-center">Entrar</a>
      <a href="?auth=signup&next=${next}" class="btn-hover-fx cursor-pointer relative z-10 w-full bg-white text-slate-700 border border-slate-200 font-semibold px-6 py-3.5 rounded-2xl text-[15px] flex items-center justify-center shadow-lg hover:bg-slate-50">Cadastre-se</a>`;

  return `<div id="mobile-menu" class="hidden fixed inset-0 z-[100] bg-white overflow-y-auto lg:hidden" role="dialog" aria-modal="true" aria-label="Menu principal">
    <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
      <button type="button" id="close-mobile-menu" class="p-2 -ml-2 rounded-xl text-slate-900 hover:bg-slate-100 transition-colors border border-transparent" aria-label="Fechar menu">
        ${icon('x', 'w-8 h-8')}
      </button>
      ${Logo({ compact: true })}
      <div class="w-10"></div>
    </div>
    <div class="flex flex-col bg-white px-6 py-6">
      <div class="flex flex-col gap-6">
        <a href="#" class="text-slate-900 font-bold text-[24px] font-outfit flex justify-between items-center group cursor-pointer hover:text-blue-600 transition-colors">Explore ${icon('chevron-down', 'w-6 h-6 text-slate-800 transition-transform')}</a>
        <a href="#" class="text-slate-900 font-bold text-[24px] font-outfit flex justify-between items-center group cursor-pointer hover:text-blue-600 transition-colors">Projetos ${icon('chevron-down', 'w-6 h-6 text-slate-800 transition-transform')}</a>
        <a href="#" class="text-slate-900 font-bold text-[24px] font-outfit flex justify-between items-center group cursor-pointer hover:text-blue-600 transition-colors">Comunidade ${icon('chevron-down', 'w-6 h-6 text-slate-800 transition-transform')}</a>
        <a href="${creatorLink.href}" class="text-blue-600 font-bold text-[16px] hover:text-blue-700 transition-colors mt-2 flex items-center gap-2">Começar projeto ${icon('arrow-right', 'w-4 h-4')}</a>
      </div>
      <div class="mt-16 flex flex-col gap-4 border-t border-slate-100 pt-8 pb-8">
        ${authSection}
      </div>
    </div>
  </div>`;
}

export function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  let lastFocusedElement = null;

  if (!mobileMenu) return;

  const setMenuOpen = (isOpen) => {
    if (isOpen) {
      lastFocusedElement = document.activeElement;
    }

    mobileMenu.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    mobileMenuBtn?.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      closeMobileMenuBtn?.focus({ preventScroll: true });
      return;
    }

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus({ preventScroll: true });
    }
  };

  mobileMenuBtn?.addEventListener('click', () => setMenuOpen(true));
  closeMobileMenuBtn?.addEventListener('click', () => setMenuOpen(false));

  document.getElementById('mobile-logout-btn')?.addEventListener('click', () => {
    clearSession();
    window.location.href = '/';
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      setMenuOpen(false);
    }
  });
}

export function initNavScrollEffect() {
  const navContainer = document.querySelector('nav > div');
  if (!navContainer) return;

  const updateNavState = () => {
    if (window.scrollY > 10) {
      navContainer.classList.add('bg-white/90', 'backdrop-blur-3xl');
      navContainer.classList.remove('bg-white/60', 'md:bg-white/45');
      return;
    }

    navContainer.classList.remove('bg-white/90', 'backdrop-blur-3xl');
    navContainer.classList.add('bg-white/60', 'md:bg-white/45');
  };

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });
}
