import { Logo } from './Logo.js';
import { icon } from './utils.js';

export function Footer() {
  return `<footer class="bg-slate-50 border-t border-slate-200 mt-16 relative z-10 selection:bg-blue-500/20 selection:text-blue-900">
    <div class="h-1 w-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600"></div>
    <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] py-10">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
        <div class="flex flex-col gap-2">
          ${Logo({ compact: true })}
          <p class="text-[13px] leading-relaxed text-slate-500 font-inter whitespace-nowrap">
            Financiamento coletivo feito por criadores para aventureiros.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <nav class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-inter font-medium text-slate-600">
            <a href="#" class="hover:text-blue-600 transition-colors">Central de Ajuda</a>
            <a href="#" class="hover:text-blue-600 transition-colors">Termos de Uso</a>
            <a href="#" class="hover:text-blue-600 transition-colors">Privacidade</a>
          </nav>
          <div class="flex items-center gap-3 text-slate-400">
            <a href="#" class="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all" aria-label="Instagram">${icon('instagram', 'w-4 h-4')}</a>
            <a href="#" class="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all" aria-label="Twitter">${icon('twitter', 'w-4 h-4')}</a>
          </div>
        </div>
      </div>

      <div class="w-full h-px bg-slate-200 mb-6"></div>

      <p class="text-[12px] text-slate-400 font-inter text-center md:text-left">© 2026 Trama RPG, Inc.</p>

    </div>
  </footer>`;
}
