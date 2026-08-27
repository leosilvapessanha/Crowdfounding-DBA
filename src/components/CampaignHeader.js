import { Logo } from './Logo.js';
import { escapeHtml, icon } from './utils.js';

const campaignTabs = [
  { label: 'Campanha', href: '#campaign-details', id: 'tab-campaign' },
  { label: 'Recompensas', href: '#campaign-rewards-list', id: 'tab-rewards' },
  { label: 'Criador', href: '#campaign-creator', id: 'tab-creator' },
  { label: 'Checkpoints', href: '#campaign-schedule', id: 'tab-schedule' },
  { label: 'Atualizações do criador', href: '#campaign-creator-updates', id: 'tab-creator-updates' },
  { label: 'FAQ', href: '#campaign-faq', id: 'tab-faq', badge: '5' },
  { label: 'Comentários', href: '#campaign-comments', id: 'tab-comments', badge: '10' },
];

function TabBadge(count) {
  if (!count || count === '0') return '';
  return `<span class="text-[10px] font-bold text-slate-400 ml-0.5 align-super">${escapeHtml(count)}</span>`;
}

export function CampaignHeader(campaign) {
  return `<nav class="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm -translate-y-full opacity-0 pointer-events-none transition-all duration-300" id="campaign-navbar">
    <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px]">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="shrink-0">
          ${Logo({ compact: true })}
        </div>

        <!-- Tab Navigation -->
        <div class="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide" role="tablist">
          ${campaignTabs.map((tab, i) => `
            <a
              href="${tab.href}"
              id="${tab.id}"
              role="tab"
              class="campaign-tab px-4 py-2 text-[13px] font-semibold whitespace-nowrap transition-all duration-200 rounded-lg ${i === 0 ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}"
            >${escapeHtml(tab.label)}${TabBadge(tab.badge)}</a>
          `).join('')}
        </div>

        <!-- CTA -->
        <div class="flex items-center gap-3 shrink-0">
          <a href="#campaign-rewards" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2">
            Apoiar projeto ${icon('arrow-right', 'w-4 h-4')}
          </a>
        </div>
      </div>
    </div>
  </nav>`;
}

/**
 * Initialize campaign header tab highlighting on scroll.
 */
export function initCampaignTabs() {
  const tabs = document.querySelectorAll('.campaign-tab');
  if (!tabs.length) return;

  // Smooth scroll for tab clicks
  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const target = document.querySelector(tab.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Highlight active tab on scroll
  const sections = Array.from(tabs)
    .map((tab) => {
      const href = tab.getAttribute('href');
      return href ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          tabs.forEach((tab) => {
            if (tab.getAttribute('href') === id) {
              tab.classList.add('text-blue-600', 'bg-blue-50');
              tab.classList.remove('text-slate-500');
            } else {
              tab.classList.remove('text-blue-600', 'bg-blue-50');
              tab.classList.add('text-slate-500');
            }
          });
        }
      });
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * Swap between the original Header and the CampaignHeader.
 * Original header is visible while the hero/carousel is on screen.
 * When the hero scrolls out of view, the campaign tab header takes over.
 */
export function initHeaderSwap() {
  const originalHeader = document.querySelector('nav:not(#campaign-navbar)');
  const campaignNavbar = document.getElementById('campaign-navbar');
  // The hero is the first <section> inside <main>
  const hero = document.querySelector('main > section:first-child');

  if (!originalHeader || !campaignNavbar || !hero) return;

  // Add transition classes to the original header
  originalHeader.classList.add('transition-all', 'duration-300');

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // Hero is visible — show original header
        originalHeader.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
        campaignNavbar.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
      } else {
        // Hero scrolled out — show campaign tab header
        originalHeader.classList.add('-translate-y-full', 'opacity-0', 'pointer-events-none');
        campaignNavbar.classList.remove('-translate-y-full', 'opacity-0', 'pointer-events-none');
      }
    },
    { threshold: 0 }
  );

  observer.observe(hero);
}
