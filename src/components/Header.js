import { Button } from './Button.js';
import { DesktopSearchBar, MobileSearchTrigger } from './SearchBar.js';
import { Logo } from './Logo.js';
import { MobileMenu } from './MobileMenu.js';
import { icon } from './utils.js';

export function Header() {
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
      <div class="hidden lg:flex items-center gap-6">
        <button type="button" class="text-[12px] font-extrabold tracking-widest uppercase text-slate-600 hover:text-blue-600 transition-colors cursor-pointer relative z-10 pointer-events-auto">Cadastre-se</button>
        ${Button({ label: 'Entrar', variant: 'navPrimary', iconName: 'arrow-right' })}
      </div>
    </div>
    ${MobileMenu()}
  </nav>`;
}
