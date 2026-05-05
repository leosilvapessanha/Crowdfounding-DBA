import { Button } from './Button.js';
import { Logo } from './Logo.js';
import { icon } from './utils.js';

export function MobileMenu() {
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
        <a href="#" class="text-blue-600 font-bold text-[16px] hover:text-blue-700 transition-colors mt-2 flex items-center gap-2">Começar projeto ${icon('arrow-right', 'w-4 h-4')}</a>
      </div>
      <div class="mt-16 flex flex-col gap-4 border-t border-slate-100 pt-8 pb-8">
        ${Button({ label: 'Entrar', variant: 'primary', extraClass: '!w-full sm:!w-full !rounded-2xl !py-3.5 !px-8 !text-[15px]' })}
        ${Button({ label: 'Cadastre-se', variant: 'secondary', extraClass: '!w-full sm:!w-full !rounded-2xl !py-3.5 !px-6 !text-[15px] !animate-none' })}
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
