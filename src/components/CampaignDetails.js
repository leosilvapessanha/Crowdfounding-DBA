import { getCampaignById } from '../data/campaigns.js';
import { Badge } from './Badge.js';
import { CampaignHeader } from './CampaignHeader.js';
import { Footer } from './Footer.js';
import { Header } from './Header.js';
import { ProgressBar } from './ProgressBar.js';
import { RewardCard } from './RewardCard.js';
import { escapeHtml, icon } from './utils.js';

/** Placeholder rewards — later these can come from campaign data. */
const defaultRewards = (campaign) => [
  {
    title: 'Apoiador Inicial',
    price: campaign.price,
    description:
      'Receba os arquivos digitais completos em PDF, menção nos agradecimentos e acesso aos diários de desenvolvimento.',
    featured: true,
  },
  {
    title: 'Pacote Colecionador',
    price: 'R$ 250',
    description:
      'Todas as recompensas digitais + versão física com capa dura de luxo + conjunto de dados personalizados do projeto.',
    featured: false,
  },
  {
    title: 'Edição de Luxo',
    price: 'R$ 500',
    description:
      'Tudo dos pacotes anteriores + arte exclusiva autografada pelo criador, caixa premium e acesso ao grupo VIP de desenvolvimento.',
    featured: false,
  },
];

/**
 * Hero / First Fold — Carousel left + Campaign info right.
 * Only one button: "Ver detalhes" that scrolls to #campaign-details.
 */
function CampaignHero(campaign) {
  const progress = Math.min(100, Math.max(0, Number(campaign.progress) || 0));

  // We use 3 images for the carousel; in production these would come from campaign data.
  // For now we repeat the campaign image with slight visual variation via the carousel dots.
  const slides = [campaign.image, campaign.image, campaign.image];

  return `<section class="w-full bg-white border-b border-slate-200 pt-20">
    <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] py-10 md:py-16">
      <!-- Back link -->
      <a href="/" class="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-blue-600 transition-colors mb-8 font-inter font-medium">
        ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para os projetos
      </a>

      <div class="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
        <!-- LEFT: Image Carousel -->
        <div class="relative w-full flex flex-col">
          <div class="rounded-2xl overflow-hidden bg-slate-100 relative shadow-sm border border-slate-200 flex-1 min-h-[360px]" id="hero-carousel">
            ${slides.map((src, i) => `
              <img
                src="${escapeHtml(src)}"
                alt="${escapeHtml(campaign.title)} — Imagem ${i + 1}"
                class="carousel-slide absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === 0 ? 'opacity-100' : 'opacity-0'}"
                width="960"
                height="720"
                ${i === 0 ? 'loading="eager"' : 'loading="lazy"'}
                decoding="async"
                data-slide="${i}"
              >
            `).join('')}
            <!-- Carousel Dots (inside image) -->
            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              ${slides.map((_, i) => `
                <button
                  type="button"
                  class="carousel-dot w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${i === 0 ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}"
                  data-slide="${i}"
                  aria-label="Ir para imagem ${i + 1}"
                ></button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- RIGHT: Campaign Info -->
        <div class="flex flex-col justify-center">
          <span class="inline-block bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-5 border border-blue-100 w-fit">
            ${escapeHtml(campaign.badge)}
          </span>
          <h1 class="text-[28px] sm:text-[36px] lg:text-[40px] font-outfit font-bold text-slate-900 leading-tight mb-4">${escapeHtml(campaign.title)}</h1>
          <p class="text-[15px] font-inter text-slate-500 leading-relaxed mb-8 max-w-lg">
            Ao apoiar esta campanha, você ajuda a trazer mais uma grande ideia para a realidade. O universo de <em>${escapeHtml(campaign.title)}</em> aguarda novos aventureiros.
          </p>

          <!-- Funding Amount -->
          <div class="mb-2">
            <span class="text-[32px] lg:text-[38px] font-outfit font-bold text-blue-600 leading-none">${escapeHtml(campaign.price)}</span>
          </div>

          <!-- Progress Bar -->
          <div class="mb-2 max-w-md">${ProgressBar({ progress, height: 'h-[6px]' })}</div>
          <p class="text-[13px] text-slate-500 font-inter mb-8">${progress}% financiado</p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-3 gap-3 mb-10">
            <div class="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-center">
              <div class="text-[22px] font-bold text-slate-900 font-outfit leading-none">1.248</div>
              <div class="text-[12px] text-slate-500 font-inter mt-1.5">apoiadores</div>
            </div>
            <div class="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-center">
              <div class="text-[22px] font-bold text-slate-900 font-outfit leading-none">R$ 42.4k</div>
              <div class="text-[12px] text-slate-500 font-inter mt-1.5">arrecadados</div>
            </div>
            <div class="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 text-center">
              <div class="text-[22px] font-bold ${campaign.urgent ? 'text-red-500' : 'text-slate-900'} font-outfit leading-none">${escapeHtml(campaign.time)}</div>
              <div class="text-[12px] text-slate-500 font-inter mt-1.5">restantes</div>
            </div>
          </div>

          <!-- Single CTA -->
          <a href="#campaign-details" class="w-fit bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[16px]">
            Ver detalhes ${icon('arrow-right', 'w-5 h-5')}
          </a>
        </div>
      </div>
    </div>
  </section>`;
}

/**
 * Below-the-fold: description left, unified donation + rewards panel right.
 * No duplicated support box — hero already covers campaign stats.
 */
function CampaignContent(campaign) {
  const rewards = defaultRewards(campaign);

  return `<section id="campaign-details" class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] pt-12 md:pt-20 pb-0">
    <div class="flex flex-col lg:flex-row gap-12 relative">
      <!-- LEFT: All scrollable content -->
      <div class="lg:w-[58%] shrink-0">
        <div class="prose prose-slate max-w-none font-inter text-slate-600 mb-16" id="campaign-creator">
          <h2 class="text-[24px] font-manrope font-bold text-slate-900 mb-6">Sobre o projeto</h2>
          <p class="mb-4 text-[16px] leading-relaxed">Este é um projeto incrível criado por <strong class="text-slate-900">${escapeHtml(campaign.creator)}</strong>. Ao apoiar esta campanha, você ajuda a trazer mais uma grande ideia para a realidade. O universo de <em>${escapeHtml(campaign.title)}</em> aguarda novos aventureiros e você pode ser o próximo a moldar o seu destino.</p>
          <p class="text-[16px] leading-relaxed mb-8">Os fundos arrecadados serão utilizados diretamente na produção de materiais gráficos, distribuição logística e na expansão do universo criativo que idealizamos.</p>
          <p class="text-[16px] leading-relaxed mb-4"><strong>Por que apoiar agora?</strong><br>O financiamento coletivo é a única forma de garantir que este projeto saia do papel com a qualidade que ele merece. Apoiadores garantem não apenas recompensas exclusivas, mas preços que não serão praticados posteriormente no varejo.</p>
          <p class="text-[16px] leading-relaxed">Nossa equipe trabalhou nos últimos 2 anos afinando as regras, as ilustrações e o mundo. Agora, o poder está em suas mãos. Faça parte da história.</p>
        </div>

        <!-- FAQ -->
        <div id="campaign-faq" class="py-10 border-t border-slate-100">
          <h2 class="text-[24px] font-manrope font-bold text-slate-900 mb-4">Perguntas frequentes</h2>
          <p class="text-slate-500 font-inter">Em breve...</p>
        </div>

        <!-- Updates -->
        <div id="campaign-updates" class="py-10 border-t border-slate-100">
          <h2 class="text-[24px] font-manrope font-bold text-slate-900 mb-4">Atualizações</h2>
          <p class="text-slate-500 font-inter">Em breve...</p>
        </div>

        <!-- Comments -->
        <div id="campaign-comments" class="pt-10 pb-16 border-t border-slate-100">
          <h2 class="text-[24px] font-manrope font-bold text-slate-900 mb-4">Comentários</h2>
          <p class="text-slate-500 font-inter">Em breve...</p>
        </div>
      </div>

      <!-- RIGHT: Unified Donation + Rewards Panel -->
      <div class="lg:flex-1 w-full lg:w-auto" id="campaign-rewards">
        <div id="rewards-sticky-wrapper" class="lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide rounded-[2rem]">
          <div class="bg-white border border-slate-200 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">

            <!-- Free Donation Section -->
            <div class="p-8 pb-0">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  ${icon('sparkles', 'w-5 h-5')}
                </div>
                <div>
                  <h3 class="text-[18px] font-manrope font-bold text-slate-900 leading-tight">Apoie com qualquer valor</h3>
                  <p class="text-[13px] text-slate-500 font-inter">Contribua livremente, sem recompensa vinculada</p>
                </div>
              </div>

              <div class="relative mb-4">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-slate-400 font-outfit select-none pointer-events-none">R$</span>
                <input
                  type="number"
                  id="donation-amount"
                  min="1"
                  step="1"
                  placeholder="0,00"
                  class="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[22px] font-outfit font-bold text-slate-900 placeholder-slate-300"
                >
              </div>

              <!-- Quick-pick amounts -->
              <div class="flex gap-2 mb-6">
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="25">R$ 25</button>
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="50">R$ 50</button>
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="100">R$ 100</button>
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all" data-amount="250">R$ 250</button>
              </div>

              <button type="button" class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[15px] mb-2">
                Apoiar este projeto ${icon('arrow-right', 'w-5 h-5')}
              </button>
              <p class="text-center text-[12px] text-slate-400 font-inter mb-6">Você não será cobrado até o fim da campanha.</p>
            </div>

            <!-- Divider with label -->
            <div class="relative px-8 my-4">
              <div class="w-full h-px bg-slate-100"></div>
              <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-extrabold whitespace-nowrap">ou escolha uma recompensa</span>
            </div>

            <!-- Reward Tiers -->
            <div class="p-8 pt-6 flex flex-col gap-4">
              ${rewards.map((r) => RewardCard(r)).join('')}
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function NotFoundPage() {
  return `
    ${Header()}
    <main class="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold font-outfit text-slate-900 mb-4">Campanha não encontrada</h1>
      <a href="/" class="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
        ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para a home
      </a>
    </main>
    ${Footer()}
  `;
}

/**
 * Initialize the image carousel after DOM is ready.
 * Call this from main.js after rendering the campaign page.
 */
export function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  if (!slides.length) return;

  let current = 0;
  let autoplayTimer = null;

  function goTo(index) {
    slides.forEach((s, i) => {
      s.style.opacity = i === index ? '1' : '0';
    });
    dots.forEach((d, i) => {
      if (i === index) {
        d.classList.add('bg-white', 'w-6');
        d.classList.remove('bg-white/50');
      } else {
        d.classList.remove('bg-white', 'w-6');
        d.classList.add('bg-white/50');
      }
    });
    current = index;
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.slide));
      resetAutoplay();
    });
  });

  function nextSlide() {
    goTo((current + 1) % slides.length);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, 4000);
  }

  resetAutoplay();
}

/**
 * Initialize the quick-pick donation buttons.
 * Call this from main.js after rendering the campaign page.
 */
export function initDonation() {
  const input = document.getElementById('donation-amount');
  const quickBtns = document.querySelectorAll('.donation-quick');
  if (!input || !quickBtns.length) return;

  quickBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      input.value = amount;
      input.focus();

      // Active state: highlight selected, reset others
      quickBtns.forEach((b) => {
        b.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-200', '!bg-blue-50');
        b.classList.add('bg-slate-100', 'text-slate-600');
      });
      btn.classList.remove('bg-slate-100', 'text-slate-600');
      btn.classList.add('bg-blue-50', 'text-blue-600', 'border-blue-200');
    });
  });

  // Reset active state when user types a custom value
  input.addEventListener('input', () => {
    quickBtns.forEach((b) => {
      b.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-200');
      b.classList.add('bg-slate-100', 'text-slate-600');
    });
  });
}

export function CampaignDetails(projectId) {
  const campaign = getCampaignById(projectId);
  if (!campaign) return NotFoundPage();

  return `
    ${Header()}
    ${CampaignHeader(campaign)}
    <main class="min-h-screen">
      ${CampaignHero(campaign)}
      ${CampaignContent(campaign)}
    </main>
    ${Footer()}
  `;
}
