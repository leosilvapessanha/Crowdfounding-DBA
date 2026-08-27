import { getSession } from '../data/authStore.js';
import { getCampaignById, isCampaignEnded } from '../data/campaigns.js';
import { CHECKPOINT_DECISION_DAYS } from '../data/creatorCampaigns.js';
import { getPledge, getPledges, isPledgeWithdrawn, setCheckpointDecision } from '../data/pledges.js';
import { Badge } from './Badge.js';
import { BottomSheet } from './BottomSheet.js';
import { CampaignHeader } from './CampaignHeader.js';
import { Footer } from './Footer.js';
import { Header } from './Header.js';
import { ProgressBar } from './ProgressBar.js';
import { RewardCard } from './RewardCard.js';
import { escapeHtml, formatBRL, formatMoney, icon, initMoneyInputs, parseMoney } from './utils.js';

/** The campaign's real rewards once a creator has written them in the wizard; the placeholder list
 * below only covers the seed campaigns that predate that field. `includes` is optional — rewards
 * authored in the wizard are a title/price/description triple. */
export const campaignRewards = (campaign) =>
  (campaign.rewards?.length ? campaign.rewards : defaultRewards(campaign));

/** Cheapest reward — what the hero shows as the campaign's entry price. */
export const campaignEntryPrice = (campaign) => {
  if (campaign.price) return campaign.price;
  const values = campaignRewards(campaign)
    .map((r) => Number(String(r.price).replace(/\D/g, '')) || Infinity);
  const min = Math.min(...values);
  return Number.isFinite(min) ? formatBRL(min) : '';
};

/** Placeholder rewards — used only when the campaign has none of its own. */
export const defaultRewards = (campaign) => [
  {
    id: 'apoiador-inicial',
    title: 'Apoiador Inicial',
    price: campaign.price,
    description:
      'Receba os arquivos digitais completos em PDF, menção nos agradecimentos e acesso aos diários de desenvolvimento.',
    includes: [
      'Arquivos digitais completos (PDF)',
      'Menção nos agradecimentos do livro',
      'Acesso aos diários de desenvolvimento',
    ],
    featured: true,
  },
  {
    id: 'pacote-colecionador',
    title: 'Pacote Colecionador',
    price: 'R$ 250',
    description:
      'Todas as recompensas digitais + versão física com capa dura de luxo + conjunto de dados personalizados do projeto.',
    includes: [
      'Tudo do Apoiador Inicial',
      'Versão física com capa dura de luxo',
      'Conjunto de dados personalizados do projeto',
    ],
    featured: false,
  },
  {
    id: 'edicao-de-luxo',
    title: 'Edição de Luxo',
    price: 'R$ 500',
    description:
      'Tudo dos pacotes anteriores + arte exclusiva autografada pelo criador, caixa premium e acesso ao grupo VIP de desenvolvimento.',
    includes: [
      'Tudo do Pacote Colecionador',
      'Arte exclusiva autografada pelo criador',
      'Caixa premium de armazenamento',
      'Acesso ao grupo VIP de desenvolvimento',
    ],
    featured: false,
  },
];

function formatPledgeDate(isoString) {
  const date = new Date(isoString);
  const dateStr = date.toLocaleDateString('pt-BR');
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} às ${timeStr}`;
}

/** Reminds a logged-in backer, right at the top of the page, when they backed this campaign. */
function PledgeAlert(campaign) {
  const session = getSession();
  if (!session) return '';

  const pledge = getPledges(session.email).find((p) => p.campaignId === campaign.id);
  if (!pledge?.pledgedAt) return '';

  return `
    <div class="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl px-5 py-4">
      ${icon('heart', 'w-5 h-5 text-blue-600 shrink-0')}
      <p class="text-[14px] font-inter"><strong class="font-bold">Você apoiou esta campanha</strong> em ${formatPledgeDate(pledge.pledgedAt)}.</p>
    </div>`;
}

/** The backer's side of a checkpoint: while a decision window is open, the person who pledged gets
 * an explicit choice right at the top of the campaign — continue, or take back the part of their
 * money that hasn't been used yet. Without this the timeline's promise ("você decide") is just copy. */
function CheckpointDecisionPanel(campaign) {
  const session = getSession();
  if (!session) return '';

  const pledge = getPledge(session.email, campaign.id);
  if (!pledge) return '';

  if (isPledgeWithdrawn(pledge)) {
    return `
      <div class="mb-6 flex items-start gap-3 bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4">
        ${icon('undo-2', 'w-5 h-5 text-slate-500 shrink-0 mt-0.5')}
        <p class="text-[14px] text-slate-600 font-inter">
          <strong class="font-bold text-slate-700">Você interrompeu seu apoio.</strong>
          ${pledge.refundedAmount ? ` ${formatBRL(pledge.refundedAmount)} foram devolvidos` : ''} e sua recompensa foi cancelada.
        </p>
      </div>`;
  }

  const open = campaignCheckpoints(campaign).find((cp) => checkpointDecisionState(cp).status === 'current');
  if (!open || pledge.decisions?.[open.id]) return '';

  const { decisionEnd } = checkpointDecisionState(open);
  // Checkout stores the pledge amount as the display string ("R$ 50"), older records as a number —
  // strip to digits so both arrive here as reais.
  const pledgeAmount = Number(String(pledge.amount ?? '').replace(/\D/g, '')) || 0;
  const refund = Math.round(pledgeAmount * refundableShare(campaign, open));

  return `
    <div class="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4" id="checkpoint-decision"
         data-campaign-id="${escapeHtml(campaign.id)}" data-checkpoint-id="${escapeHtml(open.id)}"
         data-checkpoint-title="${escapeHtml(open.title)}" data-refund="${refund}" data-reward="${escapeHtml(pledge.rewardTitle || '')}">
      <div class="flex items-start gap-3 mb-3">
        ${icon('flag', 'w-5 h-5 text-amber-500 shrink-0 mt-0.5')}
        <div>
          <p class="text-[14px] text-amber-900 font-inter"><strong class="font-bold">"${escapeHtml(open.title)}" chegou. A próxima etapa depende de você.</strong></p>
          <p class="text-[13px] text-amber-800 font-inter leading-relaxed mt-1">
            ${refund ? `<strong class="font-bold">${formatBRL(refund)}</strong> ainda não foram repassados.` : 'Parte do seu apoio ainda não foi repassada.'}
            Sem resposta, seguem para ${escapeHtml(campaign.creator)} em <strong class="font-bold">${decisionEnd.toLocaleDateString('pt-BR')}</strong>.
            Se parar agora, você pede esse valor de volta e sua recompensa é cancelada.
          </p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 pl-8">
        <button type="button" id="checkpoint-withdraw" class="text-amber-800 font-bold py-2.5 px-3 rounded-xl hover:bg-amber-100 transition-all text-[13px] font-inter underline underline-offset-2 decoration-amber-300">Retirar apoio</button>
        <a href="#campaign-creator-updates" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-[13px] font-inter inline-flex items-center gap-2">
          Ver atualizações ${icon('arrow-right', 'w-3.5 h-3.5')}
        </a>
      </div>
    </div>`;
}

/** Confirming a withdrawal is irreversible and cancels the reward — it gets its own step. */
/* Interromper não deve acontecer por impulso, mas o atrito tem que ser leve: uma frase com
 * a troca real e um aceite que destrava o botão. O aceite força a leitura e transforma o
 * clique reflexo em escolha; o botão seguro é o primário, então a hierarquia já recomenda
 * sem esconder a saída. */
function WithdrawPledgeModal() {
  return `
    <div id="withdraw-pledge-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">Interromper seu apoio?</h3>
        <p class="text-[13px] text-slate-500 font-inter leading-relaxed mb-4" id="withdraw-pledge-modal-body"></p>

        <label class="flex items-start gap-2.5 mb-5 cursor-pointer">
          <input type="checkbox" id="withdraw-pledge-ack" class="mt-0.5 w-4 h-4 rounded border-slate-300 shrink-0">
          <span class="text-[13px] text-slate-600 font-inter">Entendo que não dá pra desfazer.</span>
        </label>

        <div class="flex gap-3">
          <button type="button" id="withdraw-pledge-confirm" disabled class="flex-1 text-slate-300 font-bold py-3 rounded-xl text-[14px] font-inter transition-all cursor-not-allowed">Interromper</button>
          <button type="button" id="withdraw-pledge-cancel" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">Manter meu apoio</button>
        </div>
      </div>
    </div>`;
}



/** Tells every visitor, up front, that the deadline has passed — the donation form, reward cards
 * and mobile CTA below are all disabled for the same reason, so this is what explains why. */
function EndedAlert(campaign) {
  if (!isCampaignEnded(campaign)) return '';

  return `
    <div class="mb-6 flex items-center gap-3 bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl px-5 py-4">
      ${icon('clock', 'w-5 h-5 text-slate-500 shrink-0')}
      <p class="text-[14px] font-inter"><strong class="font-bold text-slate-700">Essa campanha já encerrou.</strong> O prazo para apoiar terminou e não é mais possível contribuir com este projeto.</p>
    </div>`;
}

/**
 * Hero / First Fold — Carousel left + Campaign info right.
 * Only one button: "Ver detalhes" that scrolls to #campaign-details.
 */
function CampaignHero(campaign) {
  const progress = Math.min(100, Math.max(0, Number(campaign.progress) || 0));

  // The creator uploads up to 3 photos in the wizard — those are the carousel. Seed campaigns
  // predate that field and only carry a single cover, which then fills all three slides.
  const slides = campaign.images?.length
    ? campaign.images
    : [campaign.image, campaign.image, campaign.image];

  return `<section class="w-full bg-white border-b border-slate-200 pt-20">
    <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] py-8 md:py-16">
      <!-- Back link -->
      <a href="/" class="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-blue-600 transition-colors mb-8 font-inter font-medium">
        ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para os projetos
      </a>

      ${EndedAlert(campaign)}
      ${PledgeAlert(campaign)}
      ${CheckpointDecisionPanel(campaign)}

      <div class="grid lg:grid-cols-2 gap-6 lg:gap-16 items-stretch">
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
          <h1 class="text-[24px] sm:text-[28px] lg:text-[40px] font-outfit font-bold text-slate-900 leading-tight mb-3 lg:mb-4">${escapeHtml(campaign.title)}</h1>
          <p class="text-[14px] lg:text-[15px] font-inter text-slate-500 leading-relaxed mb-6 lg:mb-8">
            ${campaign.shortDescription ? escapeHtml(campaign.shortDescription) : `Ao apoiar esta campanha, você ajuda a trazer mais uma grande ideia para a realidade. O universo de <em>${escapeHtml(campaign.title)}</em> aguarda novos aventureiros.`}
          </p>

          <!-- Funding Amount -->
          <div class="mb-2">
            <span class="text-[26px] lg:text-[38px] font-outfit font-bold text-blue-600 leading-none">${escapeHtml(campaignEntryPrice(campaign))}</span>
          </div>

          <!-- Progress Bar -->
          <div class="mb-2">${ProgressBar({ progress, height: 'h-[6px]' })}</div>
          <p class="text-[12px] lg:text-[13px] text-slate-500 font-inter mb-6 lg:mb-8">${progress}% financiado</p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-2 lg:gap-3 mb-8 lg:mb-10">
            <div class="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 lg:p-5 text-center">
              <div class="text-[18px] lg:text-[22px] font-bold text-slate-900 font-outfit leading-none">1.248</div>
              <div class="text-[11px] lg:text-[12px] text-slate-500 font-inter mt-1 lg:mt-1.5">apoiadores</div>
            </div>
            <div class="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 lg:p-5 text-center">
              <div id="campaign-countdown" class="text-[18px] lg:text-[22px] font-bold ${campaign.urgent ? 'text-red-500' : 'text-slate-900'} font-outfit leading-none" data-time="${escapeHtml(campaign.time)}">
                ${escapeHtml(campaign.time)}
              </div>
              <div class="text-[11px] lg:text-[12px] text-slate-500 font-inter mt-1 lg:mt-1.5">restantes</div>
            </div>
          </div>

          <!-- CTA + Share -->
          <div class="hidden lg:flex items-center gap-3 w-full">
            <a
              href="https://wa.me/?text=${encodeURIComponent(`Dá uma olhada nessa campanha: ${campaign.title} — ${window.location.origin}${window.location.pathname}?project=${campaign.id}`)}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-[16px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2Zm0 18.15c-1.48 0-2.93-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.32a8.24 8.24 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c-.01 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.41-.58 1.61-1.14.2-.56.2-1.03.14-1.13-.06-.1-.22-.16-.46-.28Z"/></svg>
              Compartilhar no WhatsApp
            </a>
            <a href="#campaign-details" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[16px]">
              Ver detalhes ${icon('arrow-right', 'w-5 h-5')}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

/** Fictional FAQ entries shown on the campaign details page. */
/** A campaign carries its own FAQ once the creator writes one in the wizard; these defaults only
 * cover the seed campaigns that predate that field. */
const faqItems = (campaign) => (campaign.faq?.length ? campaign.faq : defaultFaqItems(campaign));

const defaultFaqItems = (campaign) => [
  {
    q: 'Como funciona o financiamento coletivo aqui?',
    a: `O valor é debitado na hora, mas o criador recebe por etapa, nos checkpoints da campanha. Em cada um, você decide se segue ou pede o restante de volta.`,
  },
  {
    q: 'Quando as recompensas serão entregues?',
    a: `A previsão de entrega de <em>${escapeHtml(campaign.title)}</em> é de 4 a 6 meses após o encerramento da campanha, dependendo da recompensa escolhida. O andamento da produção é publicado na aba "Checkpoints".`,
  },
  {
    q: 'Posso alterar minha recompensa depois de apoiar?',
    a: 'Sim. Enquanto a campanha estiver ativa, você pode trocar de recompensa ou ajustar o valor a qualquer momento na sua área de apoiador.',
  },
  {
    q: 'E se o projeto não entregar o que prometeu?',
    a: `Você tem ${CHECKPOINT_DECISION_DAYS} dias a partir de cada checkpoint para interromper. O que já foi entregue fica com o criador, o restante volta para você. Sem resposta, seu apoio segue.`,
  },
  {
    q: 'Vocês fazem envio internacional?',
    a: `Sim, ${escapeHtml(campaign.creator)} envia para todo o Brasil e também para outros países. O frete internacional é calculado à parte, no checkout final.`,
  },
];

/** The campaign's checkpoints, as the backer sees them. Public campaigns are static seed data, so
 * these are generated from the campaign's own goal and remaining days — the shape mirrors exactly
 * what a creator fills in on the wizard (título, data, valor, e no que o dinheiro vai ser usado). */
const CHECKPOINT_BLUEPRINT = [
  { title: 'Pré-produção e roteiro', share: 0.25, description: (c) => `Fechamento do roteiro, do worldbuilding e do texto de regras de <em>${escapeHtml(c.title)}</em>, incluindo a rodada de playtest com a comunidade.` },
  { title: 'Arte e ilustrações', share: 0.3, description: (c) => `Contratação da equipe de ilustração da ${escapeHtml(c.creator)} para a arte de capa, o miolo e os materiais de apoio.` },
  { title: 'Diagramação e revisão', share: 0.25, description: () => 'Diagramação final, revisão editorial e preparação dos arquivos para a gráfica.' },
  { title: 'Produção e envio', share: 0.2, description: () => 'Impressão, controle de qualidade e despacho das recompensas físicas para todos os apoiadores.' },
];

const CAMPAIGN_WINDOW_DAYS = 60;

function parseDaysRemaining(time) {
  const match = String(time).match(/\d+/);
  return match ? Number(match[0]) : 0;
}

/** The campaign's checkpoints, normalized to one shape whether the creator wrote them in the
 * wizard or they're generated for a seed campaign. Single source of truth for both the timeline
 * and the backer's decision panel — so what the page shows and what the backer acts on can't drift.
 * Dates for generated ones are laid out across the campaign's own window: it started
 * (CAMPAIGN_WINDOW_DAYS − dias restantes) ago, and the checkpoints divide what's left of it. */
export function campaignCheckpoints(campaign) {
  if (campaign.checkpoints?.length) {
    return [...campaign.checkpoints]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((cp) => ({ ...cp, date: new Date(cp.date), amount: Number(cp.amount) || 0 }));
  }

  const goal = Number(campaign.goal) || 0;
  const startedDaysAgo = CAMPAIGN_WINDOW_DAYS - parseDaysRemaining(campaign.time);
  const now = new Date();
  const step = CAMPAIGN_WINDOW_DAYS / CHECKPOINT_BLUEPRINT.length;

  return CHECKPOINT_BLUEPRINT.map((cp, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - startedDaysAgo + Math.round((i + 1) * step));
    return {
      id: `auto-cp${i + 1}`,
      title: cp.title,
      date,
      amount: Math.round(goal * cp.share),
      description: cp.description(campaign),
    };
  });
}

/** 'done' once the decision window closed, 'current' while it's open, 'upcoming' before the date. */
export function checkpointDecisionState(checkpoint, now = new Date()) {
  const decisionEnd = new Date(checkpoint.date);
  decisionEnd.setDate(decisionEnd.getDate() + CHECKPOINT_DECISION_DAYS);
  const status = now >= decisionEnd ? 'done' : now >= checkpoint.date ? 'current' : 'upcoming';
  return { status, decisionEnd };
}

/** The slice of a pledge that hasn't been spent yet — everything from this checkpoint forward.
 * That's exactly what comes back if the backer withdraws here. */
export function refundableShare(campaign, checkpoint) {
  const all = campaignCheckpoints(campaign);
  const index = all.findIndex((c) => c.id === checkpoint.id);
  const goal = Number(campaign.goal) || 0;
  if (!goal || index < 0) return 0;
  const remaining = all.slice(index).reduce((sum, c) => sum + c.amount, 0);
  return remaining / goal;
}

const checkpointItems = (campaign) => campaignCheckpoints(campaign).map((cp) => {
  const { status, decisionEnd } = checkpointDecisionState(cp);
  const statusLine = status === 'done'
    ? 'Concluída. Valor repassado ao criador.'
    : status === 'current'
    ? `Você pode pedir de volta até ${decisionEnd.toLocaleDateString('pt-BR')}.`
    : 'Você decide nessa data.';

  return {
    title: cp.title,
    status,
    description: `${cp.date.toLocaleDateString('pt-BR')} · <strong class="font-bold text-slate-700">${formatBRL(cp.amount)}</strong>${cp.description ? `<br>${escapeHtml(cp.description)}` : ''}<br><span class="text-slate-400">${statusLine}</span>`,
  };
});

/**
 * Fictional posts written by the creator, shown in the Atualizações do criador
 * section. Chronological (oldest first) — the most recent post is 'current'.
 */
const creatorUpdateItems = (campaign) => [
  {
    title: 'Primeiras ilustrações do bestiário reveladas',
    description: `A equipe de arte da ${escapeHtml(campaign.creator)} compartilhou os primeiros rascunhos das criaturas de <em>${escapeHtml(campaign.title)}</em>. O feedback da comunidade já está ajudando a refinar os designs.`,
    status: 'done',
  },
  {
    title: 'Fechamos parceria com gráfica nacional',
    description: 'Após avaliar propostas, escolhemos uma gráfica com experiência em livros de capa dura para garantir o acabamento premium prometido nas recompensas.',
    status: 'done',
  },
  {
    title: 'Prévia do miolo do livro liberada para apoiadores',
    description: 'Publicamos um capítulo de amostra na área do apoiador, com o layout quase final das páginas.',
    status: 'done',
  },
  {
    title: 'Ultrapassamos 1.000 apoiadores',
    description: `Obrigado a cada um dos apoiadores que já embarcaram nessa jornada com a ${escapeHtml(campaign.creator)}. Com a meta batida, já estamos avaliando recompensas extras para todos.`,
    status: 'done',
  },
  {
    title: 'Arte final da caixa aprovada!',
    description: `Depois de algumas rodadas de ajuste com a equipe de ilustração, fechamos a arte final da capa de <em>${escapeHtml(campaign.title)}</em>. Em breve mostramos o mockup impresso por aqui.`,
    status: 'current',
  },
];

/** Accent palette per call site — the public campaign page uses blue throughout; the creator's own
 * pages (checkpoint journey) reuse this exact stepper structure but in violet, to match the rest
 * of the creator flow instead of clashing with it. */
const STEPPER_THEMES = {
  blue: { dot: 'bg-blue-600', ring: 'ring-blue-100', line: 'border-blue-200', card: 'bg-blue-50/70 border-blue-100', text: 'text-blue-600', badgeBg: 'bg-blue-50' },
  violet: { dot: 'bg-violet-600', ring: 'ring-violet-100', line: 'border-violet-200', card: 'bg-violet-50/70 border-violet-100', text: 'text-violet-600', badgeBg: 'bg-violet-50' },
};

/** Renders a single stepper row, styled by status so progress is readable at a glance. */
function stepperRow(step, hiddenByDefault, { isLast = false, currentLabel = 'Etapa atual', color = 'blue' } = {}) {
  const theme = STEPPER_THEMES[color] || STEPPER_THEMES.blue;
  const isDone = step.status === 'done';
  const isCurrent = step.status === 'current';

  const dotClasses = isDone
    ? `${theme.dot} ring-4 ring-white`
    : isCurrent
    ? `${theme.dot} ring-4 ${theme.ring}`
    : 'bg-white border-2 border-slate-300 ring-4 ring-white';

  const dotContent = isDone
    ? icon('check', 'w-3 h-3 text-white')
    : isCurrent
    ? '<span class="block w-2 h-2 rounded-full bg-white"></span>'
    : '';

  // The last item has nothing below it, so it gets no connector line.
  const lineClasses = isLast ? 'border-transparent' : isDone ? theme.line : 'border-slate-200';
  const titleClasses = isCurrent ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400';
  const descClasses = isDone || isCurrent ? 'text-slate-500' : 'text-slate-400';
  const cardClasses = isCurrent ? `${theme.card} border rounded-xl px-4 py-3 -ml-4` : '';

  // The dot is animated on its own (opacity/scale) — it must stay a sibling
  // of the collapsible content, never a descendant of it, or the content's
  // overflow:hidden during the height animation would clip it mid-shape.
  return `
    <div class="stepper-item relative pl-8 border-l-2 ${lineClasses} ${hiddenByDefault ? 'hidden' : ''}" data-collapsed-hidden="${hiddenByDefault}">
      <span class="stepper-item-dot absolute -left-[14px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${dotClasses}">${dotContent}</span>
      <div class="stepper-item-content pb-6">
        <div class="${cardClasses}">
          ${isCurrent ? `<span class="inline-block text-caption font-bold ${theme.text} uppercase tracking-widest mb-1">${currentLabel}</span>` : ''}
          <h3 class="font-manrope font-bold text-body mb-1 ${titleClasses}">${escapeHtml(step.title)}</h3>
          <p class="font-inter text-body leading-relaxed ${descClasses}">${step.description}</p>
        </div>
      </div>
    </div>`;
}

/**
 * Builds a stepper section's markup: title, optional counter badge, the
 * default 3-item window (last done + current + next, or the last two items
 * when the current step is also the last), and a "Ver tudo" toggle.
 */
export function Stepper({ items, listId, title, badgeLabel, currentLabel, color = 'blue', intro = '', showAll = false }) {
  const theme = STEPPER_THEMES[color] || STEPPER_THEMES.blue;
  const currentIndex = items.findIndex((s) => s.status === 'current');
  const start = Math.max(0, currentIndex - 1);
  const end = Math.min(items.length - 1, currentIndex + 1);
  // `showAll` opts out of the 3-item window entirely — used where every step is itself a
  // commitment the reader needs to see up front, not a progress indicator they can skim.
  const hasMore = !showAll && items.length > end - start + 1;

  return `
    ${title ? `
    <div class="flex items-center justify-between gap-3 ${intro ? 'mb-2' : 'mb-4'}">
      <h2 class="text-[20px] lg:text-[24px] font-manrope font-bold text-slate-900">${title}</h2>
      ${badgeLabel ? `<span class="shrink-0 text-[11px] lg:text-[12px] font-bold ${theme.text} ${theme.badgeBg} px-3 py-1 rounded-full font-inter">${badgeLabel}</span>` : ''}
    </div>` : ''}
    ${intro ? `<p class="text-body text-slate-500 font-inter leading-relaxed mb-5">${intro}</p>` : ''}
    <div class="flex flex-col pl-3" id="${listId}">
      ${items.map((step, i) => stepperRow(step, !showAll && (i < start || i > end), { isLast: i === items.length - 1, currentLabel, color })).join('')}
    </div>
    ${hasMore ? `
    <button type="button" class="stepper-toggle text-body font-bold ${theme.text} hover:opacity-80 font-inter flex items-center gap-1" data-expanded="false" data-list-id="${listId}">
      <span class="stepper-toggle-label">Ver tudo</span>
      ${icon('chevron-down', 'w-4 h-4 transition-transform')}
    </button>` : ''}
  `;
}

function ScheduleSection(campaign) {
  const items = checkpointItems(campaign);
  const doneCount = items.filter((s) => s.status === 'done').length;
  return Stepper({
    items,
    listId: 'schedule-stepper-list',
    title: 'Cronograma de checkpoints',
    badgeLabel: `${doneCount} de ${items.length} concluídos`,
    currentLabel: 'Decisão aberta',
    intro: `A campanha é entregue por etapas. Em cada checkpoint você vê o que foi feito e decide se segue ou pede o restante de volta. Sem resposta, seu apoio continua.`,
    showAll: true,
  });
}

function CreatorUpdatesSection(campaign) {
  const items = creatorUpdateItems(campaign);
  return Stepper({
    items,
    listId: 'creator-updates-stepper-list',
    title: 'Atualizações do criador',
    badgeLabel: items.length === 1 ? '1 atualização' : `${items.length} atualizações`,
    currentLabel: 'Atualização mais recente',
  });
}

/** Comment box shown only to logged-in supporters, above the fictional comment list. */
function CommentForm() {
  const session = getSession();
  if (!session) return '';

  const initials = session.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return `
    <form id="comment-form" class="flex gap-3 lg:gap-4 mb-6 lg:mb-8">
      <div class="w-9 h-9 lg:w-10 lg:h-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-[13px] font-outfit">
        ${escapeHtml(initials)}
      </div>
      <div class="flex-1 min-w-0">
        <textarea name="comment" rows="2" placeholder="Deixe um comentário..." class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter resize-none"></textarea>
        <div class="flex justify-end mt-2">
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-[13px] font-inter">Comentar</button>
        </div>
      </div>
    </form>`;
}

/** Fictional comments shown on the campaign details page. */
const commentItems = () => [
  {
    initials: 'MC',
    name: 'Marina Castro',
    time: 'há 2 dias',
    color: 'bg-blue-500',
    text: 'Já apoiei no pacote colecionador! Ansiosa pra ver o material final, a arte divulgada até agora está incrível.',
  },
  {
    initials: 'RA',
    name: 'Rafael Almeida',
    time: 'há 3 dias',
    color: 'bg-emerald-500',
    text: 'Vocês pretendem liberar uma versão digital (PDF) antes do envio físico? Ficaria ótimo pra já começar a mesa com o grupo.',
  },
  {
    initials: 'JS',
    name: 'Juliana Santos',
    time: 'há 5 dias',
    color: 'bg-violet-500',
    text: 'Segunda campanha que apoio dessa equipe, a primeira chegou certinho no prazo. Confiança total!',
  },
  {
    initials: 'PT',
    name: 'Pedro Teixeira',
    time: 'há 1 semana',
    color: 'bg-orange-500',
    text: 'Alguma previsão de frete para fora do Brasil? Vi que vai ter envio internacional mas não achei o valor estimado.',
  },
  {
    initials: 'CL',
    name: 'Camila Lopes',
    time: 'há 1 semana',
    color: 'bg-pink-500',
    text: 'A prévia do livro de regras que vocês postaram no update anterior ficou show. Mal posso esperar pra jogar.',
  },
  {
    initials: 'DF',
    name: 'Diego Ferreira',
    time: 'há 2 semanas',
    color: 'bg-slate-500',
    text: 'Apoiado! Torcendo pra bater a meta estendida e desbloquear as miniaturas extras.',
  },
];

/**
 * Below-the-fold: description left, unified donation + rewards panel right.
 * No duplicated support box — hero already covers campaign stats.
 */
function CampaignContent(campaign) {
  const rewards = campaignRewards(campaign);
  const ended = isCampaignEnded(campaign);

  return `<section id="campaign-details" class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] pt-10 md:pt-20 pb-0">
    <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
      <!-- LEFT: All scrollable content -->
      <div class="lg:w-[58%] shrink-0">
        <div class="prose prose-slate max-w-none font-inter text-slate-600 mb-3" id="campaign-about">
          <h2 class="text-[20px] lg:text-[24px] font-manrope font-bold text-slate-900 mb-4">Sobre o projeto</h2>
          ${campaign.description
            ? `<p class="mb-6 lg:mb-8 text-[15px] lg:text-[16px] leading-relaxed" style="white-space: pre-line">${escapeHtml(campaign.description)}</p>`
            : `<p class="mb-4 text-[15px] lg:text-[16px] leading-relaxed">Este é um projeto incrível criado por <strong class="text-slate-900">${escapeHtml(campaign.creator)}</strong>. Ao apoiar esta campanha, você ajuda a trazer mais uma grande ideia para a realidade. O universo de <em>${escapeHtml(campaign.title)}</em> aguarda novos aventureiros e você pode ser o próximo a moldar o seu destino.</p>
          <p class="text-[15px] lg:text-[16px] leading-relaxed mb-6 lg:mb-8">Os fundos arrecadados serão utilizados diretamente na produção de materiais gráficos, distribuição logística e na expansão do universo criativo que idealizamos.</p>`}
          <p class="text-[15px] lg:text-[16px] leading-relaxed mb-4"><strong>Por que apoiar agora?</strong><br>${campaign.whySupport ? escapeHtml(campaign.whySupport) : 'O financiamento coletivo é a única forma de garantir que este projeto saia do papel com a qualidade que ele merece. Apoiadores garantem não apenas recompensas exclusivas, mas preços que não serão praticados posteriormente no varejo.'}</p>
          ${campaign.description ? '' : `<p class="text-[15px] lg:text-[16px] leading-relaxed">Nossa equipe trabalhou nos últimos 2 anos afinando as regras, as ilustrações e o mundo. Agora, o poder está em suas mãos. Faça parte da história.</p>`}
        </div>

        <!-- Rewards -->
        <div id="campaign-rewards-list" class="py-3">
          <h2 class="text-[20px] lg:text-[24px] font-manrope font-bold text-slate-900 mb-4">Recompensas</h2>
          <div class="flex flex-col gap-4">
            ${campaignRewards(campaign).map((reward) => `
              <div class="bg-white border border-slate-200 rounded-2xl p-6">
                <div class="flex justify-between items-start gap-4 mb-3">
                  <h3 class="font-manrope font-bold text-slate-900 text-[16px] lg:text-[17px] leading-tight">${escapeHtml(reward.title)}</h3>
                  <span class="text-blue-600 font-outfit font-bold text-[18px] shrink-0">${escapeHtml(reward.price)}</span>
                </div>
                <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-4">${escapeHtml(reward.description)}</p>
                ${reward.includes?.length ? `
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter mb-3">O que está incluso</p>
                <ul class="flex flex-col gap-2 mb-5">
                  ${reward.includes.map((item) => `
                    <li class="flex items-start gap-2 text-[14px] text-slate-600 font-inter">
                      <span class="mt-0.5 text-blue-600 shrink-0">${icon('check', 'w-4 h-4')}</span>
                      ${escapeHtml(item)}
                    </li>
                  `).join('')}
                </ul>` : ''}
                ${ended
                  ? `<span class="inline-flex items-center gap-1.5 text-slate-400 font-semibold text-[14px]">Campanha encerrada</span>`
                  : `<a href="?project=${escapeHtml(campaign.id)}&checkout=reward&reward=${escapeHtml(reward.id)}" class="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-[14px] hover:text-blue-700 transition-colors">
                  Selecionar recompensa ${icon('arrow-right', 'w-3.5 h-3.5')}
                </a>`}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Creator -->
        <div id="campaign-creator" class="prose prose-slate max-w-none font-inter text-slate-600 py-3">
          <h2 class="text-[20px] lg:text-[24px] font-manrope font-bold text-slate-900 mb-4">Criador</h2>
          <p class="text-[15px] lg:text-[16px] leading-relaxed">
            Esta campanha é criada e conduzida por <strong class="text-slate-900">${escapeHtml(campaign.creator)}</strong>, responsável por toda a concepção, produção e entrega deste projeto.
          </p>
        </div>

        <!-- Schedule -->
        <div id="campaign-schedule" class="py-3">
          ${ScheduleSection(campaign)}
        </div>

        <!-- Creator Updates -->
        <div id="campaign-creator-updates" class="py-3">
          ${CreatorUpdatesSection(campaign)}
        </div>

        <!-- FAQ -->
        <div id="campaign-faq" class="py-3">
          <h2 class="text-[20px] lg:text-[24px] font-manrope font-bold text-slate-900 mb-4">Perguntas frequentes</h2>
          <div class="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            ${faqItems(campaign).map((f) => `
              <div class="faq-item">
                <button type="button" class="faq-toggle w-full flex items-center justify-between gap-4 p-5 lg:p-6 text-left cursor-pointer font-manrope font-semibold text-[14px] lg:text-[15px] text-slate-900" data-expanded="false">
                  <span>${escapeHtml(f.q)}</span>
                  ${icon('chevron-down', 'w-4 h-4 text-slate-400 shrink-0 transition-transform')}
                </button>
                <div class="faq-answer px-5 lg:px-6 pb-5 lg:pb-6">
                  <p class="text-slate-500 font-inter text-[14px] lg:text-[15px] leading-relaxed">${f.a}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Comments -->
        <div id="campaign-comments" class="pt-3 pb-10 lg:pb-12">
          <h2 class="text-[20px] lg:text-[24px] font-manrope font-bold text-slate-900 mb-4">Comentários</h2>
          ${CommentForm()}
          <div class="flex flex-col gap-5 lg:gap-6" id="comment-list">
            ${commentItems().map((c) => `
              <div class="flex gap-3 lg:gap-4">
                <div class="w-9 h-9 lg:w-10 lg:h-10 shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[13px] font-outfit ${c.color}">
                  ${escapeHtml(c.initials)}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-manrope font-bold text-slate-900 text-[13px] lg:text-[14px]">${escapeHtml(c.name)}</span>
                    <span class="text-slate-400 text-[12px] font-inter">${escapeHtml(c.time)}</span>
                  </div>
                  <p class="text-slate-600 font-inter text-[13px] lg:text-[14px] leading-relaxed">${c.text}</p>
                </div>
              </div>
            `).join('')}
          </div>
          <button type="button" class="mt-6 text-[13px] lg:text-[14px] font-bold text-blue-600 hover:text-blue-700 font-inter">Ver todos os 10 comentários</button>
        </div>
      </div>

      <!-- RIGHT: Unified Donation + Rewards Panel -->
      <div class="hidden lg:block lg:flex-1 w-full lg:w-auto" id="campaign-rewards">
        <div id="rewards-sticky-wrapper" class="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide rounded-[2rem]">
          <div class="bg-white border border-slate-200 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden">

            <!-- Free Donation Section -->
            <div class="p-8 pb-0">
              <div class="mb-6">
                <h3 class="text-[18px] font-manrope font-bold text-slate-900 leading-tight">Apoie com qualquer valor</h3>
                <p class="text-[13px] text-slate-500 font-inter">Contribua livremente, sem recompensa vinculada</p>
              </div>

              <div class="relative mb-4">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-slate-400 font-outfit select-none pointer-events-none">R$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  data-money
                  id="donation-amount"
                  min="1"
                  step="1"
                  placeholder="0,00"
                  ${ended ? 'disabled' : ''}
                  class="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[22px] font-outfit font-bold text-slate-900 placeholder-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
              </div>
              <p id="donation-amount-error" class="hidden text-[12px] text-red-500 font-inter -mt-2.5 mb-4"></p>

              <!-- Quick-pick amounts -->
              <div class="flex gap-2 mb-6">
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-600" data-amount="25" ${ended ? 'disabled' : ''}>R$ 25</button>
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-600" data-amount="50" ${ended ? 'disabled' : ''}>R$ 50</button>
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-600" data-amount="100" ${ended ? 'disabled' : ''}>R$ 100</button>
                <button type="button" class="donation-quick flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-600" data-amount="250" ${ended ? 'disabled' : ''}>R$ 250</button>
              </div>

              <button type="button" id="donation-submit" data-project-id="${escapeHtml(campaign.id)}" ${ended ? 'disabled' : ''} class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 text-[15px] mb-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:translate-y-0 disabled:from-slate-400 disabled:to-slate-400">
                ${ended ? 'Campanha encerrada' : `Apoiar este projeto ${icon('arrow-right', 'w-5 h-5')}`}
              </button>
              <p class="text-center text-[12px] text-slate-400 font-inter mb-6">${ended ? 'O prazo para apoiar esta campanha já terminou.' : 'O criador recebe por etapa. A cada checkpoint, você pode pedir o resto de volta.'}</p>
            </div>

            <!-- Divider with label -->
            <div class="relative px-8 my-4">
              <div class="w-full h-px bg-slate-100"></div>
              <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-extrabold whitespace-nowrap">ou escolha uma recompensa</span>
            </div>

            <!-- Reward Tiers -->
            <div class="p-8 pt-6 flex flex-col gap-4">
              ${rewards.map((r) => RewardCard({ ...r, href: `?project=${campaign.id}&checkout=reward&reward=${r.id}`, disabled: ended })).join('')}
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
/** Push a new URL into the SPA router without a full page reload. */
function navigateTo(url) {
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

/** Validates a free-donation amount. Returns an error message, or null if valid. */
function validateDonationAmount(rawValue) {
  if (!String(rawValue).trim()) return 'Digite um valor para apoiar.';
  // O campo é mascarado, então o valor chega como "1.234,56".
  const amount = parseMoney(rawValue);
  if (amount <= 0) return 'Digite um valor válido.';
  if (amount > 100000) return 'Valores acima de R$ 100.000 precisam de contato direto com o criador.';
  return null;
}

/** Wire one donation form's quick-pick buttons, input, and submit button. */
function wireDonationForm({ inputId, quickSelector, submitId, errorId }) {
  const input = document.getElementById(inputId);
  const quickBtns = document.querySelectorAll(quickSelector);
  const submitBtn = document.getElementById(submitId);
  const errorEl = errorId ? document.getElementById(errorId) : null;
  if (!input) return;

  function showError(message) {
    input.classList.toggle('border-red-400', !!message);
    input.classList.toggle('border-slate-200', !message);
    if (errorEl) {
      errorEl.textContent = message || '';
      errorEl.classList.toggle('hidden', !message);
    }
  }

  quickBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // A máscara lê o campo em centavos, então o atalho precisa escrever "50,00" — mandar
      // "50" cru faria o campo virar R$ 0,50.
      input.value = formatMoney(Number(btn.dataset.amount));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
      showError(null);

      // Active state: highlight selected, reset others
      quickBtns.forEach((b) => {
        b.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-200', '!bg-blue-50');
        b.classList.add('bg-slate-100', 'text-slate-600');
      });
      btn.classList.remove('bg-slate-100', 'text-slate-600');
      btn.classList.add('bg-blue-50', 'text-blue-600', 'border-blue-200');
    });
  });

  // Reset active state when user types a custom value, and clear a stale error as they fix it
  input.addEventListener('input', () => {
    quickBtns.forEach((b) => {
      b.classList.remove('bg-blue-50', 'text-blue-600', 'border-blue-200');
      b.classList.add('bg-slate-100', 'text-slate-600');
    });
    if (input.classList.contains('border-red-400') && !validateDonationAmount(input.value)) {
      showError(null);
    }
  });

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const error = validateDonationAmount(input.value);
      if (error) {
        input.focus();
        showError(error);
        return;
      }
      showError(null);
      const amount = Math.round(parseMoney(input.value));
      navigateTo(`?project=${submitBtn.dataset.projectId}&checkout=donation&amount=${amount}`);
    });
  }
}

/**
 * Initialize the free-donation forms (desktop sidebar + mobile bottom sheet):
 * quick-pick amounts and the "Apoiar este projeto" buttons that route to checkout.
 */
export function initDonation() {
  initMoneyInputs();
  wireDonationForm({ inputId: 'donation-amount', quickSelector: '.donation-quick', submitId: 'donation-submit', errorId: 'donation-amount-error' });
  wireDonationForm({ inputId: 'bs-donation-amount', quickSelector: '.bs-donation-quick', submitId: 'bs-donation-submit', errorId: 'bs-donation-amount-error' });
}

/**
 * Toggle the "Ver tudo / Ver menos" button for every stepper on the page
 * (Cronograma, Atualizações do criador, ...). Hidden items animate open/closed
 * (height + fade + slide) instead of snapping via display:none.
 *
 * Only .stepper-item-content collapses via max-height/overflow. The dot
 * (.stepper-item-dot) is a sibling animated with its own opacity/scale —
 * it must never sit inside the clipped content, or the height animation
 * would crop it mid-shape instead of fading it.
 */
export function initSteppers() {
  document.querySelectorAll('.stepper-toggle').forEach((btn) => {
    const list = document.getElementById(btn.dataset.listId);
    if (!list) return;

    const label = btn.querySelector('.stepper-toggle-label');
    const chevron = btn.querySelector('[data-lucide="chevron-down"]');
    const hiddenItems = Array.from(list.querySelectorAll('.stepper-item[data-collapsed-hidden="true"]'));

    // Un-hide the row, then collapse its content to 0 height and fade its
    // dot so the first expand can animate in. Padding-bottom is animated
    // separately from max-height: with box-sizing:border-box a box can
    // never render shorter than its own padding, so max-height alone would
    // floor out at pb-6 (24px) instead of reaching 0.
    const rows = hiddenItems.map((item) => {
      const content = item.querySelector('.stepper-item-content');
      const dot = item.querySelector('.stepper-item-dot');
      item.classList.remove('hidden');

      const naturalHeight = content.scrollHeight;
      const naturalPb = getComputedStyle(content).paddingBottom;

      content.style.overflow = 'hidden';
      content.style.maxHeight = '0px';
      content.style.paddingBottom = '0px';
      content.style.opacity = '0';
      content.style.transform = 'translateY(-6px)';
      content.style.transition = 'max-height 350ms ease, padding-bottom 350ms ease, opacity 250ms ease, transform 250ms ease';

      dot.style.opacity = '0';
      dot.style.transform = 'scale(0.5)';
      dot.style.transition = 'opacity 250ms ease, transform 250ms ease';

      return { content, dot, naturalHeight, naturalPb };
    });

    btn.addEventListener('click', () => {
      const expanded = btn.dataset.expanded === 'true';
      const next = !expanded;
      btn.dataset.expanded = String(next);
      label.textContent = next ? 'Ver menos' : 'Ver tudo';
      if (chevron) chevron.classList.toggle('rotate-180', next);

      rows.forEach(({ content, dot, naturalHeight, naturalPb }) => {
        if (next) {
          content.style.maxHeight = `${naturalHeight}px`;
          content.style.paddingBottom = naturalPb;
          content.style.opacity = '1';
          content.style.transform = 'translateY(0)';
          dot.style.opacity = '1';
          dot.style.transform = 'scale(1)';
        } else {
          content.style.maxHeight = '0px';
          content.style.paddingBottom = '0px';
          content.style.opacity = '0';
          content.style.transform = 'translateY(-6px)';
          dot.style.opacity = '0';
          dot.style.transform = 'scale(0.5)';
        }
      });
    });
  });
}

/**
 * FAQ accordion — same collapse animation as the steppers' "Ver tudo"
 * (height + padding + fade), instead of the instant snap of native
 * <details>/<summary>. Each question toggles independently.
 */
export function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-toggle');
    const answer = item.querySelector('.faq-answer');
    const chevron = btn ? btn.querySelector('[data-lucide="chevron-down"]') : null;
    if (!btn || !answer) return;

    const naturalHeight = answer.scrollHeight;
    const naturalPb = getComputedStyle(answer).paddingBottom;

    answer.style.overflow = 'hidden';
    answer.style.maxHeight = '0px';
    answer.style.paddingBottom = '0px';
    answer.style.opacity = '0';
    answer.style.transform = 'translateY(-6px)';
    answer.style.transition = 'max-height 350ms ease, padding-bottom 350ms ease, opacity 250ms ease, transform 250ms ease';

    btn.addEventListener('click', () => {
      const expanded = btn.dataset.expanded === 'true';
      const next = !expanded;
      btn.dataset.expanded = String(next);
      item.classList.toggle('bg-slate-50/60', next);
      if (chevron) chevron.classList.toggle('rotate-180', next);

      if (next) {
        answer.style.maxHeight = `${naturalHeight}px`;
        answer.style.paddingBottom = naturalPb;
        answer.style.opacity = '1';
        answer.style.transform = 'translateY(0)';
      } else {
        answer.style.maxHeight = '0px';
        answer.style.paddingBottom = '0px';
        answer.style.opacity = '0';
        answer.style.transform = 'translateY(-6px)';
      }
    });
  });
}

/** Client-side only — a posted comment is prepended to the list, nothing is persisted. */
export function initComments() {
  const form = document.getElementById('comment-form');
  const list = document.getElementById('comment-list');
  if (!form || !list) return;

  const session = getSession();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const textarea = form.querySelector('textarea[name="comment"]');
    const text = textarea.value.trim();
    if (!text) return;

    const initials = (session?.name || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();

    const item = document.createElement('div');
    item.className = 'flex gap-3 lg:gap-4';
    item.innerHTML = `
      <div class="w-9 h-9 lg:w-10 lg:h-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-[13px] font-outfit">${escapeHtml(initials)}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-manrope font-bold text-slate-900 text-[13px] lg:text-[14px]">${escapeHtml(session?.name || 'Você')}</span>
          <span class="text-slate-400 text-[12px] font-inter">agora</span>
        </div>
        <p class="text-slate-600 font-inter text-[13px] lg:text-[14px] leading-relaxed">${escapeHtml(text)}</p>
      </div>`;

    list.prepend(item);
    textarea.value = '';
  });
}

/**
 * Initialize dynamic countdown timer.
 */
export function initCountdown() {
  const countdownEl = document.getElementById('campaign-countdown');
  if (!countdownEl) return;

  const timeStr = countdownEl.getAttribute('data-time') || '';
  // Already over — leave the static "Encerrado" label alone instead of starting a fake
  // countdown from 23:59:59 (there's no digit in "Encerrado" for the days-remaining regex
  // below to find, so without this check `days` would default to 0 and the timer would
  // "start" a brand new day, directly contradicting the label).
  if (/^encerrad/i.test(timeStr.trim())) {
    countdownEl.textContent = 'Encerrado';
    return;
  }

  const daysMatch = timeStr.match(/\d+/);
  let days = daysMatch ? parseInt(daysMatch[0], 10) : 0;
  
  // Fake remaining hours, mins, secs for effect
  let hours = 23;
  let minutes = 59;
  let seconds = 59;
  
  function updateTimer() {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
      if (minutes < 0) {
        minutes = 59;
        hours--;
        if (hours < 0) {
          hours = 23;
          days--;
          if (days < 0) {
            countdownEl.textContent = 'Encerrado';
            return;
          }
        }
      }
    }
    
    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${hours.toString().padStart(2, '0')}h`;
    } else if (hours > 0) {
      formatted = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
    } else {
      formatted = `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }
    countdownEl.textContent = formatted;
  }
  
  // Initial call
  updateTimer();
  
  // Set interval and store ID to avoid multiple intervals if re-rendered
  if (window.campaignTimer) clearInterval(window.campaignTimer);
  window.campaignTimer = setInterval(updateTimer, 1000);
}

export function CampaignDetails(projectId) {
  const campaign = getCampaignById(projectId);
  if (!campaign) return NotFoundPage();

  const ended = isCampaignEnded(campaign);
  const rewards = campaignRewards(campaign).map((r) => ({
    ...r,
    href: `?project=${campaign.id}&checkout=reward&reward=${r.id}`,
    disabled: ended,
  }));

  return `
    ${Header()}
    ${CampaignHeader(campaign)}
    <main class="min-h-screen pb-24 lg:pb-0">
      ${CampaignHero(campaign)}
      ${CampaignContent(campaign)}
    </main>
    ${Footer()}

    <!-- Mobile Sticky CTA -->
    <div class="fixed bottom-0 inset-x-0 z-[80] lg:hidden sticky-cta-bar bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-5 pt-3" id="mobile-sticky-cta">
      <button type="button" id="mobile-support-cta" ${ended ? 'disabled' : ''} class="w-full bg-gradient-to-r from-blue-600 to-sky-400 hover:from-blue-700 hover:to-sky-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400">
        ${ended ? 'Campanha encerrada' : 'Apoiar esse projeto'}
      </button>
    </div>

    <!-- Mobile Bottom Sheet -->
    ${BottomSheet({ rewards, campaign, ended })}
    ${WithdrawPledgeModal()}
  `;
}

/** Wires the checkpoint decision panel. There's no "continuar" button on purpose: staying is the
 * default, so silence already means continuing — only leaving needs an explicit act, and it goes
 * through a modal first because it's irreversible and cancels the reward. */
export function initCheckpointDecision() {
  const panel = document.getElementById('checkpoint-decision');
  if (!panel) return;

  const { campaignId, checkpointId, refund, reward } = panel.dataset;
  const session = getSession();
  const modal = document.getElementById('withdraw-pledge-modal');
  const ack = document.getElementById('withdraw-pledge-ack');
  const confirm = document.getElementById('withdraw-pledge-confirm');

  const reload = () => {
    window.history.replaceState({}, '', window.location.search);
    window.location.reload();
  };

  /* O confirmar nasce desabilitado e só ganha peso visual quando o aceite é marcado.
   * Trocar a classe (e não só o atributo) evita um botão que parece clicável e não é. */
  const setConfirmEnabled = (on) => {
    if (!confirm) return;
    confirm.disabled = !on;
    confirm.className = on
      ? 'flex-1 text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl text-[14px] font-inter transition-all'
      : 'flex-1 text-slate-300 font-bold py-3 rounded-xl text-[14px] font-inter transition-all cursor-not-allowed';
  };

  ack?.addEventListener('change', () => setConfirmEnabled(ack.checked));

  document.getElementById('checkpoint-withdraw')?.addEventListener('click', () => {
    const body = document.getElementById('withdraw-pledge-modal-body');
    if (body) {
      const back = Number(refund) ? `${formatBRL(refund)} voltam para você` : 'O valor ainda não repassado volta para você';
      const lost = reward ? `A recompensa "${reward}" é cancelada` : 'Sua recompensa é cancelada';
      body.textContent = `${back}. ${lost} e o que já foi entregue fica com o criador.`;
    }
    if (ack) ack.checked = false;
    setConfirmEnabled(false);
    modal?.classList.remove('hidden');
  });

  const close = () => modal?.classList.add('hidden');
  document.getElementById('withdraw-pledge-cancel')?.addEventListener('click', close);
  modal?.querySelector('[data-modal-dismiss]')?.addEventListener('click', close);

  confirm?.addEventListener('click', () => {
    if (!session || !ack?.checked) return;
    setCheckpointDecision(session.email, campaignId, checkpointId, 'withdrawn', Number(refund) || 0);
    reload();
  });
}

