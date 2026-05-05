import { escapeHtml, icon } from './utils.js';

export function Logo({ compact = false, href = '/' } = {}) {
  const iconSize = compact ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10';
  const glyphSize = compact ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm';
  const textSize = compact ? 'text-xl' : 'text-xl md:text-xl';
  const shadow = compact ? 'shadow-md' : 'shadow-lg shadow-blue-500/20 pulse-glow';

  return `<a href="${escapeHtml(href)}" aria-label="Página inicial Trama" class="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95 cursor-pointer">
    <div class="${iconSize} rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white ${shadow}">
      ${icon('hexagon', glyphSize)}
    </div>
    <span class="${textSize} font-bold tracking-tight text-slate-900 font-outfit uppercase drop-shadow-sm">TRAMA<span class="text-blue-600">.</span></span>
  </a>`;
}
