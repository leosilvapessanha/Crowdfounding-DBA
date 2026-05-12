import { RewardCard } from './RewardCard.js';
import { escapeHtml, icon } from './utils.js';

/**
 * Bottom Sheet overlay for mobile donation / reward selection.
 * Appears when the sticky CTA is tapped on mobile.
 * Pattern mirrors MobileMenu.js for accessibility & body-scroll-lock.
 *
 * @param {{ rewards: Array, campaign: object }} opts
 */
export function BottomSheet({ rewards, campaign }) {
  return `<div id="bottom-sheet-overlay" class="bottom-sheet-overlay hidden fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm" aria-hidden="true"></div>
  <div id="bottom-sheet" class="bottom-sheet hidden fixed inset-x-0 bottom-0 z-[95] lg:hidden" role="dialog" aria-modal="true" aria-label="Apoiar projeto">
    <div class="bottom-sheet-container bg-white rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] max-h-[95vh] flex flex-col overflow-hidden">

      <!-- Handle bar + close -->
      <div class="bottom-sheet-header flex-shrink-0 pt-3 pb-2 px-6" id="bottom-sheet-handle">
        <div class="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3"></div>
        <div class="flex items-center justify-between">
          <h3 class="text-[17px] font-manrope font-bold text-slate-900 leading-tight">Apoiar projeto</h3>
          <button type="button" id="bottom-sheet-close" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors" aria-label="Fechar">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>
      </div>

      <!-- Scrollable content -->
      <div class="bottom-sheet-body flex-1 overflow-y-auto hide-scrollbar px-6 pb-8">

        <!-- Free Donation Section -->
        <div class="pt-4 pb-2">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              ${icon('sparkles', 'w-4 h-4')}
            </div>
            <div>
              <p class="text-[15px] font-manrope font-bold text-slate-900 leading-tight">Apoie com qualquer valor</p>
              <p class="text-[12px] text-slate-500 font-inter">Contribua livremente</p>
            </div>
          </div>

          <div class="relative mb-3">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] font-bold text-slate-400 font-outfit select-none pointer-events-none">R$</span>
            <input
              type="number"
              id="bs-donation-amount"
              min="1"
              step="1"
              placeholder="0,00"
              class="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[20px] font-outfit font-bold text-slate-900 placeholder-slate-300"
            >
          </div>

          <!-- Quick-pick amounts -->
          <div class="flex gap-2 mb-5">
            <button type="button" class="bs-donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="25">R$ 25</button>
            <button type="button" class="bs-donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="50">R$ 50</button>
            <button type="button" class="bs-donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="100">R$ 100</button>
            <button type="button" class="bs-donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="250">R$ 250</button>
          </div>

          <button type="button" class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-[15px]">
            Apoiar este projeto ${icon('arrow-right', 'w-5 h-5')}
          </button>
          <p class="text-center text-[11px] text-slate-400 font-inter mt-2">Você não será cobrado até o fim da campanha.</p>
        </div>

        <!-- Divider -->
        <div class="relative my-5">
          <div class="w-full h-px bg-slate-100"></div>
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-5 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-extrabold whitespace-nowrap">ou escolha uma recompensa</span>
        </div>

        <!-- Reward Tiers -->
        <div class="flex flex-col gap-3 pb-4">
          ${rewards.map((r) => RewardCard(r)).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Initialize the Bottom Sheet open/close interactions.
 * Mirrors MobileMenu.js patterns for body scroll lock & ESC key.
 */
export function initBottomSheet() {
  const overlay = document.getElementById('bottom-sheet-overlay');
  const sheet = document.getElementById('bottom-sheet');
  const closeBtn = document.getElementById('bottom-sheet-close');
  const openBtn = document.getElementById('mobile-support-cta');
  const handle = document.getElementById('bottom-sheet-handle');

  if (!sheet || !overlay) return;

  let isOpen = false;

  function open() {
    if (isOpen) return;
    isOpen = true;

    // Show elements
    overlay.classList.remove('hidden');
    sheet.classList.remove('hidden');

    // Force reflow before adding animation classes
    void sheet.offsetHeight;

    overlay.classList.add('bottom-sheet-overlay--active');
    sheet.classList.add('bottom-sheet--active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    overlay.classList.remove('bottom-sheet-overlay--active');
    sheet.classList.remove('bottom-sheet--active');
    sheet.classList.add('bottom-sheet--closing');

    // Wait for animation to finish before hiding
    const onEnd = () => {
      sheet.classList.remove('bottom-sheet--closing');
      overlay.classList.add('hidden');
      sheet.classList.add('hidden');
      document.body.style.overflow = '';
      sheet.removeEventListener('animationend', onEnd);
    };
    sheet.addEventListener('animationend', onEnd, { once: true });

    // Fallback: if animationend doesn't fire (e.g. reduced motion)
    setTimeout(() => {
      if (!isOpen && !sheet.classList.contains('hidden')) {
        sheet.classList.remove('bottom-sheet--closing');
        overlay.classList.add('hidden');
        sheet.classList.add('hidden');
        document.body.style.overflow = '';
      }
    }, 400);
  }

  // Open from sticky CTA
  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  });

  // Close triggers
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  // Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  // Swipe-to-dismiss on handle
  if (handle) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const container = sheet.querySelector('.bottom-sheet-container');

    handle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
      if (container) container.style.transition = 'none';
    }, { passive: true });

    handle.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0 && container) {
        container.style.transform = `translateY(${diff}px)`;
      }
    }, { passive: true });

    handle.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      const diff = currentY - startY;
      if (container) {
        container.style.transition = '';
        container.style.transform = '';
      }
      if (diff > 80) {
        close();
      }
      startY = 0;
      currentY = 0;
    }, { passive: true });
  }

  // Quick-pick donation buttons inside bottom sheet
  const bsInput = document.getElementById('bs-donation-amount');
  const bsQuickBtns = document.querySelectorAll('.bs-donation-quick');

  if (bsInput && bsQuickBtns.length) {
    bsQuickBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        bsInput.value = btn.dataset.amount;
        bsInput.focus();

        bsQuickBtns.forEach((b) => {
          b.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-200');
          b.classList.add('bg-slate-100', 'text-slate-600');
        });
        btn.classList.remove('bg-slate-100', 'text-slate-600');
        btn.classList.add('bg-blue-50', 'text-blue-600', 'border-blue-200');
      });
    });

    bsInput.addEventListener('input', () => {
      bsQuickBtns.forEach((b) => {
        b.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-200');
        b.classList.add('bg-slate-100', 'text-slate-600');
      });
    });
  }
}
