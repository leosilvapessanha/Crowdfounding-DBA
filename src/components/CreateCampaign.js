import { getCategories } from '../data/campaigns.js';
import {
  addCreatorCampaignUpdate,
  cancelCampaignAndRefundAll,
  createCreatorCampaign,
  ensureSimulatedBackers,
  getAvailableToWithdraw,
  getCheckpointAvailableToWithdraw,
  getCheckpointNetAmount,
  getCheckpointStatus,
  getCheckpointSummary,
  getCheckpointWithdrawnTotal,
  getCreatorCampaignById,
  getWithdrawnBackers,
  getWithdrawnTotal,
  hasAnyCheckpointWithdrawal,
  isCheckpointNoticeWindow,
  updateCreatorCampaign,
  updateCreatorCampaignStatus,
  withdrawCampaignFunds,
  withdrawCheckpointFunds,
} from '../data/creatorCampaigns.js';
import {
  addPayoutAccount,
  clearCreatorSession,
  describePayoutAccount,
  getCreatorSession,
  getPayoutAccount,
  getPayoutAccounts,
  payoutAccountTypeLabel,
  PAYOUT_ACCOUNT_TYPES,
  PAYOUT_BANKS,
} from '../data/creatorStore.js';
import { initSteppers, Stepper } from './CampaignDetails.js';
import { formatBRL, formatDate, StatusBadge } from './CreatorDashboard.js';
import { CreatorNotLoggedIn, CreatorTopBar, EditPublishedWarningModal, initEditWarningModal, wireCreatorUserMenu } from './CreatorLayout.js';
import { Footer } from './Footer.js';
import { ProgressBar } from './ProgressBar.js';
import { escapeHtml, formatMoney, icon, initDocumentInputs, initMoneyInputs, navigate, parseMoney } from './utils.js';

const DEFAULT_IMAGE = '/assets/Img/card_tormenta.png';
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function parsePriceToNumber(price) {
  const digits = String(price || '').replace(/\D/g, '');
  return digits ? Number(digits) : '';
}

/** One of the 3 photo tiles. All three are the same size in one row — the cover isn't a giant hero
 * box, just the first tile with a "Capa" badge, since making it big only ate vertical space without
 * telling the creator anything extra. The whole empty tile is the drop target (it's a <label> over
 * the file input), so there's no separate "Escolher" button to aim at. */
function ImageSlot(index, url) {
  const hasImg = !!url;
  const label = index === 0 ? 'Capa' : `Foto ${index + 1}`;
  return `
    <div class="campaign-image-slot group relative aspect-video rounded-xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-300 hover:border-violet-400 transition-colors" data-image-slot="${index}">
      <img class="campaign-image-preview w-full h-full object-cover ${hasImg ? '' : 'hidden'}" src="${hasImg ? escapeHtml(url) : ''}" alt="">

      <label for="campaign-image-input-${index}" class="campaign-image-placeholder absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-400 group-hover:text-violet-500 cursor-pointer transition-colors ${hasImg ? 'hidden' : ''}">
        ${icon('image', 'w-5 h-5')}
        <span class="text-[11px] font-inter font-semibold">${label}</span>
      </label>

      <span class="campaign-image-badge absolute top-2 left-2 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${hasImg && index === 0 ? '' : 'hidden'}">Capa</span>
      <button type="button" class="campaign-image-remove ${hasImg ? 'flex' : 'hidden'} absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/60 text-white text-[12px] font-bold items-center justify-center hover:bg-slate-900/80" aria-label="Remover ${label}">✕</button>

      <input type="file" accept="image/*" id="campaign-image-input-${index}" class="campaign-image-input hidden">
      <input type="hidden" class="campaign-image-value" value="${hasImg ? escapeHtml(url) : ''}">
    </div>`;
}

/** A reward tier, using the same editable-row pattern as CheckpointRow: collapsed it's a one-line
 * summary with pencil/trash; open it's a highlighted form closed by an explicit "Salvar". Keeping
 * both lists on one pattern means a creator learns the interaction once. */
function RewardRow(index, prefill, expanded = false) {
  const title = prefill?.title || '';
  const priceValue = prefill?.price ? parsePriceToNumber(prefill.price) : '';
  const description = prefill?.description || '';
  const summaryMeta = priceValue ? formatBRL(priceValue) : 'Toque no lápis para preencher';

  return `
    <div class="reward-row relative pl-9 border-l-2 border-violet-100 pb-5 last:border-transparent last:pb-0" data-reward-row data-expanded="${expanded}">
      <span class="absolute -left-[15px] top-0 w-7 h-7 rounded-full bg-violet-600 text-white text-[12px] font-bold font-outfit flex items-center justify-center ring-4 ring-white">${index + 1}</span>

      <div class="reward-summary flex items-start justify-between gap-3 py-0.5">
        <div class="min-w-0">
          <p class="reward-summary-title font-bold text-slate-900 text-[14px] font-manrope truncate">${title ? escapeHtml(title) : `Recompensa ${index + 1}`}</p>
          <p class="reward-summary-meta text-[12px] text-slate-500 font-inter">${escapeHtml(summaryMeta)}</p>
          <p class="reward-summary-desc text-[12px] text-slate-500 font-inter leading-relaxed mt-1 line-clamp-2 ${description ? '' : 'hidden'}">${escapeHtml(description)}</p>
        </div>
        ${RowActions('Editar recompensa', 'Remover recompensa')}
      </div>

      <div class="reward-body" ${expanded ? '' : 'style="display:none"'}>
        <div class="flex flex-col gap-2.5 bg-violet-50/60 border border-violet-100 rounded-xl p-4 mt-3">
          <div class="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_140px] gap-2.5">
            <label class="block col-span-2 sm:col-span-1">
              <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">Título</span>
              <input type="text" class="reward-title w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter" placeholder="Ex: Apoiador Digital" data-validate="required" value="${escapeHtml(title)}">
              <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
            </label>
            <label class="block col-span-2 sm:col-span-1">
              <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">Valor (R$)</span>
              <input type="text" inputmode="numeric" data-money="symbol" placeholder="R$ 0,00" class="reward-price w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter"  data-validate="required,positiveNumber" value="${priceValue ? escapeHtml(formatMoney(priceValue)) : ''}">
              <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
            </label>
          </div>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">O que inclui</span>
            <input type="text" class="reward-description w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter" placeholder="PDF completo do livro" data-validate="required" value="${escapeHtml(description)}">
            <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
          </label>
          <div class="mt-1">${SaveRowButton('Salvar recompensa')}</div>
        </div>
      </div>
    </div>`;
}

/** Checkpoint rows are inserted by JS after main.js's one-time createIcons() pass, so any icon()
 * placeholder inside them would stay an empty <i>. These two are inlined as raw SVG instead —
 * same approach paintWizardSteps() already uses for its check mark. */
const ALERT_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
const CHECK_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const ARROW_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
const CHEVRON_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
const INFO_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

const PLUS_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const PENCIL_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`;
const TRASH_SVG = (cls) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

/** Edit / delete affordances for an item in an editable list (checkpoints, recompensas). A pencil
 * says "open this to change it" far more directly than a chevron, which reads as "there is hidden
 * text below" — and the trash keeps deletion at the same level instead of buried in the open form. */
function RowActions(editLabel, removeLabel) {
  return `
    <div class="flex items-center gap-1 shrink-0">
      <button type="button" class="row-edit p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors" aria-label="${editLabel}" title="${editLabel}">
        ${PENCIL_SVG('w-4 h-4')}
      </button>
      <button type="button" class="row-remove p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="${removeLabel}" title="${removeLabel}">
        ${TRASH_SVG('w-4 h-4')}
      </button>
    </div>`;
}

/** Closes the open form of an editable row. Paired with RowActions' pencil: you open with the
 * pencil, you close with an explicit "Salvar" — never by hunting for the same control again. */
function SaveRowButton(label = 'Salvar') {
  return `
    <button type="button" class="row-save inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-[13px] font-inter">
      ${label}
    </button>`;
}

/** A single checkpoint node in the wizard's "Meta e checkpoints" step — a numbered dot on a
 * vertical timeline, the same visual language as the Cronograma stepper on the public campaign
 * page. Collapsed nodes show a compact one-line summary (like a "done" Cronograma step); the node
 * being edited expands into a highlighted card with the actual fields (like Cronograma's "current"
 * step) — only one form is open at a time, so adding checkpoints doesn't turn the page into a wall
 * of stacked inputs. The goal isn't typed in separately: it's the sum of every checkpoint's amount. */
function CheckpointRow(index, prefill, expanded = false) {
  const title = prefill?.title || '';
  const date = prefill?.date ? String(prefill.date).slice(0, 10) : '';
  const amount = prefill?.amount ?? '';
  const description = prefill?.description || '';
  const summaryMeta = [date ? formatDate(date) : null, amount ? formatBRL(amount) : null].filter(Boolean).join(' · ') || 'Toque para preencher';

  return `
    <div class="checkpoint-row relative pl-9 border-l-2 border-violet-100 pb-5 last:border-transparent last:pb-0" data-checkpoint-row data-expanded="${expanded}">
      <span class="checkpoint-row-dot absolute -left-[15px] top-0 w-7 h-7 rounded-full bg-violet-600 text-white text-[12px] font-bold font-outfit flex items-center justify-center ring-4 ring-white">${index + 1}</span>

      <div class="checkpoint-summary flex items-start justify-between gap-3 py-0.5">
        <div class="min-w-0">
          <p class="checkpoint-summary-title font-bold text-slate-900 text-[14px] font-manrope truncate">${title ? escapeHtml(title) : `Checkpoint ${index + 1}`}</p>
          <p class="checkpoint-summary-meta text-[12px] text-slate-500 font-inter">${escapeHtml(summaryMeta)}</p>
          <p class="checkpoint-summary-desc text-[12px] text-slate-500 font-inter leading-relaxed mt-1 line-clamp-2 ${description ? '' : 'hidden'}">${escapeHtml(description)}</p>
          <button type="button" class="checkpoint-desc-toggle hidden text-[12px] font-bold text-violet-600 hover:text-violet-700 mt-0.5">Ver mais</button>
        </div>
        ${RowActions('Editar checkpoint', 'Remover checkpoint')}
      </div>

      <div class="checkpoint-body" ${expanded ? '' : 'style="display:none"'}>
        <div class="flex flex-col gap-2.5 bg-violet-50/60 border border-violet-100 rounded-xl p-4 mt-3">
          <!-- Título, data e valor na mesma linha: no desktop as três colunas cabem lado a lado;
               no mobile o título ocupa a linha inteira e data/valor dividem a linha de baixo, que
               é a única forma dos três caberem sem espremer o campo de data. -->
          <div class="grid grid-cols-2 sm:grid-cols-[minmax(0,1fr)_170px_140px] gap-2.5">
            <label class="block col-span-2 sm:col-span-1">
              <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">Título do marco</span>
              <input type="text" class="checkpoint-title w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter" placeholder="Ex: Arte da capa finalizada" data-validate="required" value="${escapeHtml(title)}">
              <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
            </label>
            <label class="block">
              <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">Data</span>
              <input type="date" class="checkpoint-date w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter" data-validate="required" value="${escapeHtml(date)}">
              <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
            </label>
            <label class="block">
              <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">Valor (R$)</span>
              <input type="text" inputmode="numeric" data-money="symbol" placeholder="R$ 0,00" class="checkpoint-amount w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter"  data-validate="required,positiveNumber" value="${amount ? escapeHtml(formatMoney(amount)) : ''}">
              <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
            </label>
          </div>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">O que você vai fazer com esse dinheiro?</span>
            <textarea rows="2" class="checkpoint-description w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter resize-none" placeholder="Ex: Contratar o ilustrador para fechar a arte da capa e das cartas." data-validate="required">${escapeHtml(description)}</textarea>
            <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
          </label>
          <!-- Uma ação só: salvar este checkpoint já abre o próximo. -->
          <div class="mt-1">${SaveRowButton('Salvar checkpoint')}</div>
        </div>
      </div>
    </div>`;
}

/** One FAQ entry of the campaign — the questions the backer reads on the project page were, until
 * now, a fixed fictional list; this is where the creator actually writes them. Same editable-row
 * pattern as CheckpointRow/RewardRow. */
function FaqRow(index, prefill, expanded = false) {
  const question = prefill?.q || '';
  const answer = prefill?.a || '';

  return `
    <div class="faq-row relative pl-9 border-l-2 border-violet-100 pb-5 last:border-transparent last:pb-0" data-faq-row data-expanded="${expanded}">
      <span class="absolute -left-[15px] top-0 w-7 h-7 rounded-full bg-violet-600 text-white text-[12px] font-bold font-outfit flex items-center justify-center ring-4 ring-white">${index + 1}</span>

      <div class="faq-summary flex items-start justify-between gap-3 py-0.5">
        <div class="min-w-0">
          <p class="faq-summary-title font-bold text-slate-900 text-[14px] font-manrope truncate">${question ? escapeHtml(question) : `Pergunta ${index + 1}`}</p>
          <p class="faq-summary-meta text-[12px] text-slate-500 font-inter ${question ? 'hidden' : ''}">Toque no lápis para preencher</p>
          <p class="faq-summary-desc text-[12px] text-slate-500 font-inter leading-relaxed mt-1 line-clamp-2 ${answer ? '' : 'hidden'}">${escapeHtml(answer)}</p>
        </div>
        ${RowActions('Editar pergunta', 'Remover pergunta')}
      </div>

      <div class="faq-body" ${expanded ? '' : 'style="display:none"'}>
        <div class="flex flex-col gap-2.5 bg-violet-50/60 border border-violet-100 rounded-xl p-4 mt-3">
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">Pergunta</span>
            <input type="text" class="faq-question w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter" placeholder="Ex: Quando as recompensas serão entregues?" data-validate="required" value="${escapeHtml(question)}">
            <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
          </label>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1 block">Resposta</span>
            <textarea rows="3" class="faq-answer-input w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter resize-none" placeholder="Responda de forma direta. Essa resposta aparece na página da campanha." data-validate="required">${escapeHtml(answer)}</textarea>
            <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1"></p>
          </label>
          <div class="mt-1">${SaveRowButton('Salvar pergunta')}</div>
        </div>
      </div>
    </div>`;
}

/* ── Conferência antes de publicar ───────────────────────────────────────────
   O resumo não existe para enfeitar: existe para pegar erro antes de virar
   página pública. Cada pendência sabe a que etapa pertence, então ela deixa de
   ser aviso e vira atalho. Enquanto houver bloqueio, publicar não é possível:
   é mais barato travar aqui do que corrigir com apoiador na página. */

/* Três faixas, não uma régua contínua: o criador não precisa saber a diferença entre 71 e 76,
   precisa saber em qual dos três lugares ele está. O rótulo carrega o tom e a linha de baixo
   carrega o fato, então "Pode melhorar" pode ser gentil sem esconder que a publicação está
   travada. */
const OK_AT = 50;
const CHAMPION_AT = 80;

/* "Ok" era um dar de ombros: interjeição solta numa escada de avaliações em português, sem dizer
   em que estado a campanha está nem para onde ela vai. "Campanha sólida" resolve as três coisas.
   Diz o estado (aguenta ir ao ar), tem a mesma forma de "Campanha campeã", então as duas leem
   como degraus da mesma escada, e não soa prêmio de consolação. A escada fica assim: a primeira
   faixa é uma instrução ("Pode melhorar"), as duas seguintes são identidades que se conquistam. */
const TIERS = {
  melhorar: { label: 'Pode melhorar', stroke: 'text-amber-500', text: 'text-amber-600' },
  ok: { label: 'Campanha sólida', stroke: 'text-blue-500', text: 'text-blue-600' },
  campea: { label: 'Campanha campeã', stroke: 'text-emerald-500', text: 'text-emerald-600' },
};

function checkpointComplete(cp) {
  return !!cp.title && !!cp.date && Number(cp.amount) > 0 && !!cp.description;
}

function rewardComplete(r) {
  return !!r.title && !!parsePriceToNumber(r.price) && !!r.description;
}

/** Fotos que a pessoa realmente enviou. `collectFormData` sempre grava `image` com o placeholder
 *  quando ninguém subiu nada, então contar por ali dava sempre pelo menos uma e o bloqueio de
 *  capa nunca disparava. */
function uploadedImages(data) {
  if (data.images?.length) return data.images.length;
  return data.image && data.image !== DEFAULT_IMAGE ? 1 : 0;
}

/* Boas práticas: a mesma lista que o checklist mostra e que a nota soma.
 *
 * Antes eram dois sistemas paralelos, cada um com os próprios testes. Dava para marcar "o título
 * diz o que é" no checklist e ver a nota parada, porque a nota nem olhava para isso. Checklist
 * que promete pontos e não entrega é pior do que não ter checklist: ensina a pessoa a não
 * confiar no número. Agora existe uma lista só. Cada prática tem um teste e um peso, e a nota é
 * a soma do que passou, então marcar um item e ver o ponteiro andar é a mesma operação.
 *
 * Nenhuma prática repete um item obrigatório: "tem capa" já é bloqueio, então a prática cobra o
 * carrossel completo. Pagar duas vezes pelo mesmo trabalho inflaria a nota.
 *
 * Os pesos seguem impacto em conversão, não esforço. O carrossel vale mais que o FAQ porque a
 * decisão de clicar acontece antes da de ler. */
const TIP_GROUPS = {
  1: [
    ['Carrossel com as três fotos', 'A capa decide o clique, e as outras duas sustentam. Foto real da mesa, das peças ou da arte: logo em fundo branco some no meio do catálogo.',
      (d) => uploadedImages(d) >= 3, 8],
    ['"Por que apoiar agora" respondido', 'Tiragem limitada, preço de pré-venda, prazo de fecho. Urgência inventada queima a campanha na primeira dúvida.',
      (d) => !!d.whySupport, 6],
    ['Descrição completa desenvolvida', 'Perto de 600 caracteres ela já respondeu o que o apoiador ia perguntar antes de decidir.',
      (d) => (d.description || '').trim().length >= 600, 4],
    ['Título que diz o que é, não só o nome', 'Quem vê o card não conhece seu projeto. "Crônicas do Vale Sombrio: horror gótico para d20" trabalha sozinho.',
      (d) => (d.title || '').trim().length >= 20, 4],
    ['Descrição curta que promete algo', '"10 sessões prontas para jogar" convence. "Uma experiência única" não diz nada.',
      (d) => (d.shortDescription || '').trim().length >= 40, 4],
  ],
  2: [
    ['Três a cinco marcos', 'Menos que isso parece promessa vaga. Mais que isso vira burocracia para quem lê.',
      (d) => (d.checkpoints || []).length >= 3 && (d.checkpoints || []).length <= 5, 7],
    ['Todo marco diz o que o dinheiro faz', '"Contratar o ilustrador da capa" mostra plano. "Custos de produção" mostra que não tem.',
      (d) => (d.checkpoints || []).length > 0 && (d.checkpoints || []).every((c) => (c.description || '').trim().length >= 20), 6],
    ['Primeiro marco perto', 'Quanto mais longe a primeira entrega, maior o risco que o apoiador enxerga antes de decidir.',
      (d) => {
        const primeiro = [...(d.checkpoints || [])].filter((c) => c.date).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        return !!primeiro && (new Date(primeiro.date) - Date.now()) / 86400000 <= 120;
      }, 5],
  ],
  3: [
    ['Três ou mais faixas de recompensa', 'Uma barata para entrar, uma completa para a maioria, uma alta para quem quer bancar.',
      (d) => (d.rewards || []).length >= 3, 5],
    ['Faixa de entrada acessível', 'A primeira contribuição é a decisão difícil, e uma faixa até R$ 100 abre a porta. O resto da escada é só upgrade.',
      (d) => {
        const precos = (d.rewards || []).map((r) => parsePriceToNumber(r.price)).filter(Boolean);
        return precos.length > 0 && Math.min(...precos) <= 100;
      }, 4],
    ['Três perguntas frequentes', 'Prazo, frete, e o que acontece se atrasar. FAQ responde objeção, não curiosidade.',
      (d) => (d.faq || []).length >= 3, 4],
    ['Recompensa descreve o que chega na mão', '"PDF completo e mapas em alta" é concreto. "Acesso exclusivo" não é nada.',
      (d) => (d.rewards || []).length > 0 && (d.rewards || []).every((r) => (r.description || '').trim().length >= 20), 3],
  ],
};

/** No resumo a trilha mostra a lista inteira: é o momento de conferência, e ver de uma vez o que
 *  foi seguido e o que ficou para trás vale mais do que repetir o painel de pendências ao lado. */
const WIZARD_TIPS = { ...TIP_GROUPS, 4: [...TIP_GROUPS[1], ...TIP_GROUPS[2], ...TIP_GROUPS[3]] };

const ALL_TIPS = WIZARD_TIPS[4];

/* Como a nota é montada.
 *
 * Uma versão anterior dava 60 dos 100 pontos pelos itens obrigatórios. O efeito colateral era o
 * pior possível numa tela de conferência: quem fazia só o mínimo tirava ~70 e via "Ok". A nota
 * elogiava o piso, e o criador ia embora achando que estava pronto.
 *
 * Agora o obrigatório vale 40 e não é conquista, é ingresso: sem ele nada publica. Os 60 que
 * sobram são exatamente as boas práticas acima, uma por uma. Campanha mínima fecha perto de 40,
 * que é "Pode melhorar", exatamente o que ela é. */
function scoreCampaign(data) {
  const images = uploadedImages(data);
  const checkpoints = data.checkpoints || [];
  const rewards = data.rewards || [];
  const descLen = (data.description || '').trim().length;

  const essentials = [
    { points: 4, ok: !!data.title },
    { points: 3, ok: !!data.category },
    { points: 5, ok: !!data.shortDescription },
    { points: 7, ok: images > 0 },
    { points: 7, ok: descLen > 0 },
    { points: 8, ok: checkpoints.length > 0 && checkpoints.every(checkpointComplete) },
    { points: 6, ok: rewards.length > 0 && rewards.every(rewardComplete) },
  ];

  const earned = essentials.reduce((sum, e) => sum + (e.ok ? e.points : 0), 0)
    + ALL_TIPS.reduce((sum, [, , teste, pontos]) => sum + (teste(data) ? pontos : 0), 0);
  const score = Math.round(earned);

  const blockers = getPublishBlockers(data);
  /* Campanha que não pode ir ao ar não é campeã, por mais completo que esteja o resto: um único
     essencial faltando derruba a faixa. Sem esse teto, uma campanha a 96 pontos sem categoria
     seria anunciada como campeã ao lado de um botão de publicar travado, e o rótulo contradiria
     a tela. */
  const key = blockers.length ? 'melhorar' : score >= CHAMPION_AT ? 'campea' : score >= OK_AT ? 'ok' : 'melhorar';

  return { score, tier: TIERS[key], blockers };
}

/* Obrigatório é o que deixa a campanha quebrada sem ele, não o que seria bom ter. Campo exigido
   sem essa régua só produz preenchimento de fachada, e uma resposta escrita para destravar botão
   é pior para o apoiador do que campo vazio. Por isso "Por que apoiar agora?" saiu daqui: a
   página já sabe não renderizar a seção quando ela não existe, e a nota cobra o item com 10
   pontos, que convence sem obrigar. */
function getPublishBlockers(data) {
  const blockers = [];
  const add = (step, label) => blockers.push({ step, label });

  if (!data.title) add(1, 'A campanha está sem título.');
  if (!data.category) add(1, 'Escolha uma categoria.');
  if (!data.shortDescription) add(1, 'Falta a descrição curta, que é o que aparece nos cards e na busca.');
  if (!uploadedImages(data)) add(1, 'Falta a foto de capa.');
  if (!data.description) add(1, 'Falta a descrição completa do projeto.');

  const checkpoints = data.checkpoints || [];
  if (!checkpoints.length) {
    add(2, 'Nenhum checkpoint cadastrado. A meta é a soma deles, então ela está em R$ 0.');
  } else {
    checkpoints.forEach((cp, i) => {
      const n = `Checkpoint ${i + 1}`;
      if (!cp.title) add(2, `${n} está sem título.`);
      if (!cp.date) add(2, `${n} está sem data.`);
      if (!(Number(cp.amount) > 0)) add(2, `${n} está sem valor.`);
      if (!cp.description) add(2, `${n} não diz o que será feito com o dinheiro.`);
    });
  }

  const rewards = data.rewards || [];
  if (!rewards.length) {
    add(3, 'Nenhuma recompensa cadastrada. O apoiador não tem o que escolher.');
  } else {
    rewards.forEach((r, i) => {
      const n = `Recompensa ${i + 1}`;
      if (!r.title) add(3, `${n} está sem título.`);
      if (!parsePriceToNumber(r.price)) add(3, `${n} está sem valor.`);
      if (!r.description) add(3, `${n} está sem descrição.`);
    });
  }

  // O nome vem da conta, não do wizard, então esta não tem etapa para onde pular.
  if (!(data.creatorName || data.creator)) add(null, 'Sua conta de criador está sem nome, e é ele que assina a seção "Criador".');

  return blockers;
}

/** Mesma leitura que a prévia faz: registros antigos guardam só `image`, os novos guardam
 *  `images[]`. Contar de um jeito só evita a pendência acusar falta de foto que existe. */
function summaryImages(data) {
  return (data.images?.length ? data.images : [data.image]).filter(Boolean);
}

function ScoreRow(item, tone) {
  const icone = tone === 'blocker'
    ? `<span class="shrink-0 text-danger">${ALERT_SVG('w-4 h-4')}</span>`
    : `<span class="shrink-0 text-ink-subtle">${INFO_SVG('w-4 h-4')}</span>`;

  const corpo = `
    ${icone}
    <span class="flex-1 text-body font-body ${tone === 'blocker' ? 'text-ink' : 'text-ink-muted'} leading-snug">${escapeHtml(item.label)}</span>
    ${tone === 'improvement' ? `<span class="shrink-0 text-caption font-bold text-ink-muted bg-surface-subtle border border-line rounded-full px-2 py-0.5 tabular-nums">+${item.missing}</span>` : ''}
    ${item.step ? `<span class="shrink-0 text-ink-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all">${ARROW_SVG('w-4 h-4')}</span>` : ''}`;

  // O cabeçalho do grupo já diz o que a linha faz, então o rótulo "Corrigir"/"Revisar" repetido
  // em toda linha só engordava a lista. A seta sozinha carrega a affordance.
  return item.step
    ? `<button type="button" class="readiness-jump group w-full flex items-center gap-3 text-left px-5 py-2.5 hover:bg-surface-subtle transition-colors" data-step="${item.step}">${corpo}</button>`
    : `<div class="w-full flex items-center gap-3 px-5 py-2.5">${corpo}</div>`;
}

/** Grupo sempre aberto: bloqueio não é algo que se guarda numa gaveta. */
function ScoreGroup(titulo, cor, itens, tone) {
  if (!itens.length) return '';
  return `
    <div class="border-t border-line">
      <p class="px-5 pt-3 pb-1 text-caption font-bold uppercase tracking-widest font-body ${cor}">${titulo}</p>
      ${itens.map((i) => ScoreRow(i, tone)).join('')}
      <div class="h-1.5"></div>
    </div>`;
}

/** Medidor circular da nota. Um só desenho para o resumo e para a trilha lateral: se cada tela
 *  tivesse o seu, a mesma nota apareceria com duas caras. `size` muda a escala, nada mais. */
function ScoreGauge(score, tier, size = 72) {
  const r = size / 2 - 6;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - Math.min(100, Math.max(0, score)) / 100);
  const grande = size >= 64;

  return `
    <div class="relative shrink-0" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}" class="-rotate-90" style="width:${size}px;height:${size}px" aria-hidden="true">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="currentColor" stroke-width="${grande ? 6 : 5}" class="text-line"></circle>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="currentColor" stroke-width="${grande ? 6 : 5}" stroke-linecap="round"
                class="${tier.stroke} transition-all duration-500" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"></circle>
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="${grande ? 'text-title' : 'text-body'} font-display font-bold text-ink-strong leading-none">${score}</span>
        ${grande ? '<span class="text-caption font-body text-ink-subtle leading-none mt-0.5">/100</span>' : ''}
      </div>
    </div>`;
}

/** A frase de baixo é sempre instrução ou permissão, nunca diagnóstico solto: quem lê quer saber
 *  o que fazer agora. Fora da faixa campeã ela mostra a distância exata até a próxima, porque uma
 *  meta com número tem tração e "melhore sua campanha" não. */
function scoreConsequence({ score, blockers }) {
  const pontos = (n) => `<strong class="text-ink font-bold">${n} ${n === 1 ? 'ponto' : 'pontos'}</strong>`;

  if (blockers.length) {
    return `<span class="text-danger font-bold">Resolva ${blockers.length} ${blockers.length === 1 ? 'pendência' : 'pendências'} para publicar.</span>`;
  }
  if (score >= CHAMPION_AT) {
    return `<span class="text-ink-muted">${score === 100 ? 'Nota cheia.' : 'Está tudo no lugar.'} Publique quando quiser.</span>`;
  }
  if (score >= OK_AT) {
    return `<span class="text-ink-muted">Você já pode publicar. Mais ${pontos(Math.max(1, CHAMPION_AT - score))} e ela vira campanha campeã.</span>`;
  }
  return `<span class="text-ink-muted">Você já pode publicar, mas ela está no mínimo. Mais ${pontos(Math.max(1, OK_AT - score))} e ela vira campanha sólida.</span>`;
}

/** O painel que abre o resumo. Responde as duas perguntas desta tela, nesta ordem: quão pronta
 *  a campanha está, e o que exatamente falta.
 *
 *  O medidor carrega a cor sozinho. A primeira versão tinha o cabeçalho inteiro tingido do tom da
 *  faixa, e o efeito colateral era que nota boa gritava tanto quanto nota ruim: um painel verde
 *  chapado tem o mesmo peso visual de um vermelho chapado. Com fundo neutro, a cor vira sinal em
 *  vez de ruído, e sobra contraste para o que de fato precisa de atenção. */
function ScorePanel(data) {
  const resultado = scoreCampaign(data);
  const { score, tier, blockers } = resultado;

  return `
    <div id="wizard-readiness" class="rounded-card border border-line bg-surface overflow-hidden mb-6">
      <div class="flex items-center gap-4 px-5 py-4">
        ${ScoreGauge(score, tier, 72)}

        <!-- A faixa virou título, não etiqueta ao lado do título. Com "Nota da campanha" em
             destaque e um chip "CAMPANHA CAMPEÃ" colado nele, a palavra campanha aparecia duas
             vezes em quatro palavras. Como sobretítulo discreto, ela nomeia o número sem disputar
             espaço, e a resposta que o criador veio buscar fica no lugar mais forte. -->
        <div class="min-w-0 flex-1">
          <p class="text-caption font-bold uppercase tracking-widest font-body text-ink-subtle">Nota da campanha</p>
          <h4 class="text-lead font-heading font-bold ${tier.text} leading-tight mt-0.5 mb-1">${tier.label}</h4>
          <p class="text-body font-body leading-snug">${scoreConsequence(resultado)}</p>
        </div>
      </div>

      <!-- Só os bloqueios. A lista de melhorias saiu daqui: a trilha lateral já mostra o
           checklist inteiro nesta mesma tela, e repetir a mesma orientação em duas colunas lado
           a lado não informa duas vezes, só divide a atenção. -->
      ${ScoreGroup('Impedem publicar', 'text-danger', blockers, 'blocker')}
    </div>`;
}

/** O selo de pontos muda de papel conforme o estado, e é isso que faz a lista puxar ação:
 *  pendente ele é a recompensa em aberto, em destaque; cumprido ele é recibo, e recua. Sem essa
 *  troca, "+8" numa linha já marcada leria como se ainda houvesse algo a ganhar ali. */
function TipItem([titulo, corpo, feito, pontos], data) {
  const ok = feito(data);
  return `
    <li class="flex items-start gap-2.5">
      <span class="shrink-0 mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${ok ? 'bg-accent border-accent text-white' : 'border-line-strong text-transparent'}">
        ${CHECK_SVG('w-3 h-3')}
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex items-start justify-between gap-2">
          <span class="block text-body font-heading font-bold leading-snug transition-colors ${ok ? 'text-ink-subtle' : 'text-ink-strong'}">${escapeHtml(titulo)}</span>
          <span class="shrink-0 text-caption font-bold font-body rounded-full px-2 py-0.5 tabular-nums transition-colors ${ok ? 'bg-surface-subtle text-ink-subtle' : 'bg-accent/10 text-accent'}">+${pontos}</span>
        </span>
        <span class="block text-caption font-body leading-relaxed mt-1 ${ok ? 'text-ink-subtle' : 'text-ink-muted'}">${escapeHtml(corpo)}</span>
      </span>
    </li>`;
}

/** Trilha lateral: a nota ao vivo, do lado, o tempo todo.
 *
 *  Nota que só aparece no fim é boletim, não ferramenta: chega quando o trabalho já foi feito e
 *  refazer custa caro. Do lado, ela vira retorno imediato — cada campo preenchido move o medidor
 *  na mesma tela, e a diferença entre o mínimo e uma campanha boa fica visível enquanto ainda dá
 *  para agir sobre ela.
 *
 *  Fica à esquerda porque é o que se lê primeiro: a nota enquadra o trabalho, o formulário é a
 *  consequência dela. À direita ela era rodapé de página, a última parada do olho.
 *
 *  A largura mora na <aside> (não aqui), então recolher anima os dois blocos de uma vez: a trilha
 *  encolhe e o card cresce no mesmo movimento, em vez de um saltar e o outro reagir depois. */
function WizardRail(data, step, collapsed) {
  const { score, tier } = scoreCampaign(data);
  const tips = WIZARD_TIPS[step] || WIZARD_TIPS[1];
  const cumpridas = tips.filter(([, , feito]) => feito(data)).length;
  const emAberto = tips.reduce((total, [, , feito, pontos]) => total + (feito(data) ? 0 : pontos), 0);

  /* Recolhida.
   *
   * A primeira versão empilhava medidor, seta e a palavra "Nota" girada 90 graus numa tira
   * quase vazia. Texto na vertical é ilegível de relance, e era justamente ele que carregava o
   * significado da tira. Aqui o número faz esse trabalho sozinho: ele já é o assunto, e a única
   * coisa que precisava sobreviver ao recolhimento. A seta sobe para o topo, onde controle de
   * painel se espera, e a contagem de práticas entra embaixo do medidor porque é a segunda
   * pergunta que o criador faz depois de ver a nota.
   *
   * E não ocupa a altura toda: uma tira de 700px com três elementos no meio parece painel que
   * quebrou, não painel recolhido. Encolhida para o próprio conteúdo e ancorada no topo, a nota
   * fica na mesma altura em que estava aberta, então recolher lê como o painel dobrando de lado
   * em vez de tudo se reorganizar. */
  if (collapsed) {
    return `
      <button type="button" id="wizard-rail-toggle"
              class="group w-full flex flex-col items-center gap-2.5 rounded-card border border-line bg-surface py-3.5 transition-all duration-200 hover:border-accent/40 hover:bg-accent/[0.03]"
              aria-expanded="false" aria-label="Mostrar nota e boas práticas" title="Mostrar nota e boas práticas">
        <span class="w-7 h-7 rounded-full flex items-center justify-center text-ink-subtle group-hover:text-accent group-hover:bg-accent/10 transition-colors">
          ${CHEVRON_SVG('w-4 h-4 -rotate-90')}
        </span>
        ${ScoreGauge(score, tier, 44)}
        <span class="text-caption font-bold font-body text-ink-subtle tabular-nums">${cumpridas}/${tips.length}</span>
      </button>`;
  }

  return `
    <div class="h-full w-full flex flex-col rounded-card border border-line bg-surface overflow-hidden">
      <div class="shrink-0 flex items-start gap-3 px-4 py-4 border-b border-line">
        ${ScoreGauge(score, tier, 56)}
        <div class="min-w-0 flex-1">
          <p class="text-caption font-bold uppercase tracking-widest font-body text-ink-subtle">Nota da campanha</p>
          <p class="text-body font-heading font-bold ${tier.text} leading-tight mt-0.5">${tier.label}</p>
        </div>
        <button type="button" id="wizard-rail-toggle" class="shrink-0 -mr-1 -mt-1 p-1.5 rounded-control text-ink-subtle hover:text-accent hover:bg-accent/10 transition-colors" aria-expanded="true" title="Recolher">
          ${CHEVRON_SVG('w-4 h-4 rotate-90')}
        </button>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <div class="flex items-baseline justify-between gap-2 mb-1">
          <p class="text-caption font-bold uppercase tracking-widest font-body text-ink-subtle">Boas práticas</p>
          <p class="text-caption font-bold font-body tabular-nums ${cumpridas === tips.length ? 'text-success' : 'text-ink-muted'}">${cumpridas} de ${tips.length}</p>
        </div>
        <p class="text-caption font-body text-ink-subtle mb-4 leading-relaxed">
          ${emAberto > 0
            ? `Cada item marcado soma na nota. Faltam <strong class="text-ink-muted font-bold">${emAberto} pontos</strong> aqui.`
            : 'Todos os pontos desta etapa já estão na nota.'}
        </p>
        <ul class="flex flex-col gap-4">
          ${tips.map((t) => TipItem(t, data)).join('')}
        </ul>
      </div>
    </div>`;
}

/** A scaled-down replica of the public campaign page, section for section: same hero split, same
 * sticky rewards sidebar, same tab bar, same order (Sobre → Recompensas → Criador → Checkpoints →
 * FAQ). The wizard's last step is an approval moment, so anything the preview shows has to be
 * something the real page actually renders — see campaignRewards/campaignEntryPrice in
 * CampaignDetails.js, which now read the creator's own data. Type and images shrink to fit the
 * wizard column, never below reading size. */
function SummaryMarkup(data, { showCheckpointsList = true, showSupportBox = true } = {}) {
  const rewards = data.rewards || [];
  const checkpoints = [...(data.checkpoints || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const faq = data.faq || [];
  const images = summaryImages(data);
  const cover = images[0] || DEFAULT_IMAGE;

  const raised = Number(data.raised) || 0;
  const goal = Number(data.goal) || 0;
  const progress = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const prices = rewards.map((r) => Number(parsePriceToNumber(r.price)) || Infinity);
  const entryPrice = prices.length && Number.isFinite(Math.min(...prices)) ? Math.min(...prices) : 0;
  const creator = data.creatorName || data.creator || '';

  const checkpointItems = checkpoints.map((cp, i) => ({
    title: cp.title,
    status: i === 0 ? 'current' : 'upcoming',
    description: `${formatDate(cp.date)} · <strong class="font-bold text-slate-700">${formatBRL(cp.amount)}</strong>${cp.description ? `<br>${escapeHtml(cp.description)}` : ''}`,
  }));

  const sectionTitle = (t) => `<h4 class="text-lead font-heading font-bold text-slate-900 mb-3">${t}</h4>`;

  return `
    <!-- Sem cromo de navegador falso e sem barra de abas: as três bolinhas de macOS não diziam
         nada que a legenda já não dissesse, e a barra listava sete destinos que não levavam a
         lugar nenhum (nada aqui é clicável). Prometer navegação que não existe é pior do que
         não prometer. -->
    <div class="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div class="p-5 md:p-7">
        <!-- HERO -->
        <div class="grid lg:grid-cols-2 gap-5 lg:gap-7 mb-8">
          <div class="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3]">
            <img src="${escapeHtml(cover)}" alt="" class="w-full h-full object-cover">
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              ${(images.length ? images : [cover]).map((_, i) => `<span class="h-1.5 rounded-full ${i === 0 ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}"></span>`).join('')}
            </div>
          </div>

          <div class="flex flex-col justify-center">
            ${data.category ? `<span class="inline-block bg-blue-50 text-blue-600 text-caption font-bold px-2.5 py-1 rounded-full uppercase tracking-widest mb-3 border border-blue-100 w-fit">${escapeHtml(data.category)}</span>` : ''}
            <h3 class="text-title font-display font-bold text-slate-900 leading-tight mb-2">${escapeHtml(data.title || 'Sem título')}</h3>
            ${data.shortDescription ? `<p class="text-body font-body text-slate-500 leading-relaxed mb-4">${escapeHtml(data.shortDescription)}</p>` : ''}
            ${entryPrice ? `<div class="text-headline font-display font-bold text-blue-600 leading-none mb-3">${formatBRL(entryPrice)}</div>` : ''}
            <div class="mb-1.5">${ProgressBar({ progress, height: 'h-[5px]' })}</div>
            <p class="text-caption text-slate-500 font-body mb-4">${progress}% financiado · meta de ${formatBRL(goal)}</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
                <div class="text-lead font-bold text-slate-900 font-display leading-none">${Number(data.backers) || 0}</div>
                <div class="text-caption text-slate-500 font-body mt-1">apoiadores</div>
              </div>
              <div class="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
                <div class="text-lead font-bold text-slate-900 font-display leading-none">${Number(data.durationDays) || 0} dias</div>
                <div class="text-caption text-slate-500 font-body mt-1">restantes</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Corpo: conteúdo à esquerda + painel de apoio à direita, como na página real -->
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="lg:w-[58%] shrink-0">
            ${sectionTitle('Sobre o projeto')}
            ${data.description ? `<p class="text-slate-600 font-body text-body leading-relaxed mb-4" style="white-space: pre-line">${escapeHtml(data.description)}</p>` : ''}
            ${data.whySupport ? `<p class="text-slate-600 font-body text-body leading-relaxed mb-6"><strong class="text-slate-900">Por que apoiar agora?</strong><br>${escapeHtml(data.whySupport)}</p>` : ''}

            ${rewards.length ? `
              ${sectionTitle('Recompensas')}
              <div class="flex flex-col gap-3 mb-6">
                ${rewards.map((r) => `
                  <div class="bg-white border border-slate-200 rounded-2xl p-4">
                    <div class="flex justify-between items-start gap-3 mb-1.5">
                      <h5 class="font-heading font-bold text-slate-900 text-body leading-tight">${escapeHtml(r.title)}</h5>
                      <span class="text-blue-600 font-display font-bold text-lead shrink-0">${escapeHtml(r.price)}</span>
                    </div>
                    <p class="text-caption text-slate-500 font-body leading-relaxed mb-2">${escapeHtml(r.description)}</p>
                    <span class="text-blue-600 font-semibold text-caption">Selecionar recompensa →</span>
                  </div>
                `).join('')}
              </div>` : ''}

            ${sectionTitle('Criador')}
            <!-- Mesma frase da página real (CampaignDetails.js). A prévia jura mostrar o que o
                 apoiador vê, então não pode inventar um texto próprio, muito menos em segunda
                 pessoa: "Você é quem está por trás" é o sistema falando com o criador, não com
                 quem vai ler a página. Sem nome, a prévia admite o buraco em vez de preenchê-lo. -->
            ${creator
              ? `<p class="text-slate-600 font-body text-body leading-relaxed mb-6">Esta campanha é criada e conduzida por <strong class="text-slate-900">${escapeHtml(creator)}</strong>, responsável por toda a concepção, produção e entrega deste projeto.</p>`
              : `<p class="text-body font-body text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-6">Sua conta de criador está sem nome, então esta seção sairia em branco na página publicada.</p>`}

            ${checkpoints.length && showCheckpointsList ? `
              ${sectionTitle('Cronograma de checkpoints')}
              <p class="text-caption text-slate-500 font-body mb-4">Em cada marco o apoiador decide se continua. Quem sai recebe de volta o que ainda não foi usado.</p>
              <div class="mb-6">
                ${Stepper({ items: checkpointItems, listId: 'preview-checkpoint-stepper', title: '', currentLabel: 'Próximo', showAll: true })}
              </div>` : ''}

            ${faq.length ? `
              ${sectionTitle('Perguntas frequentes')}
              <div class="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                ${faq.map((f) => `
                  <div class="p-4">
                    <p class="font-heading font-semibold text-slate-900 text-body mb-1">${escapeHtml(f.q)}</p>
                    <p class="text-caption text-slate-500 font-body leading-relaxed">${escapeHtml(f.a)}</p>
                  </div>
                `).join('')}
              </div>` : ''}
          </div>

          <!-- Painel lateral de apoio (fixo na página real).
               O bloco de apoiar só existe enquanto isto é uma prévia de publicação: na página de
               gestão da campanha, quem está lendo é o dono dela, e um botão de apoiar o próprio
               projeto é ruído. As recompensas ficam nos dois casos, porque são conteúdo da campanha. -->
          <div class="lg:flex-1">
            <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              ${showSupportBox ? `
                <p class="text-body font-heading font-bold text-slate-900 mb-1">Apoie com qualquer valor</p>
                <p class="text-caption text-slate-500 font-body mb-4">Contribua livremente</p>
                <div class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50/60 text-lead font-display font-bold text-slate-300 mb-3">R$ 0,00</div>
                <div class="flex gap-2 mb-4">
                  ${[25, 50, 100, 250].map((v) => `<span class="flex-1 py-1.5 rounded-lg text-caption font-bold text-slate-500 bg-slate-100 text-center">R$ ${v}</span>`).join('')}
                </div>
                <div class="bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-2.5 rounded-xl text-center text-body font-body mb-2">Apoiar este projeto</div>
                <p class="text-center text-caption text-slate-400 font-body">O criador recebe por etapa. A cada checkpoint, você pode pedir o resto de volta.</p>
              ` : `
                <p class="text-body font-heading font-bold text-slate-900 mb-1">Recompensas</p>
                <p class="text-caption text-slate-500 font-body mb-4">O que o apoiador escolhe na página da campanha.</p>
              `}

              ${rewards.length ? `
                ${showSupportBox ? `
                  <div class="relative my-4">
                    <div class="w-full h-px bg-slate-100"></div>
                    <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-caption text-slate-400 uppercase tracking-[0.15em] font-extrabold whitespace-nowrap">ou escolha uma recompensa</span>
                  </div>` : ''}
                <div class="flex flex-col gap-2">
                  ${rewards.map((r) => `
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div class="flex justify-between items-start gap-2 mb-1">
                        <span class="font-bold text-slate-900 text-caption font-body">${escapeHtml(r.title)}</span>
                        <span class="text-slate-900 font-bold text-caption shrink-0">${escapeHtml(r.price)}</span>
                      </div>
                      <p class="text-caption text-slate-500 leading-relaxed">${escapeHtml(r.description)}</p>
                    </div>
                  `).join('')}
                </div>` : `${showSupportBox ? '' : '<p class="text-caption text-slate-400 font-body">Nenhuma recompensa cadastrada.</p>'}`}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

const WIZARD_STEP_LABELS = ['Sobre a campanha', 'Meta e checkpoints', 'Recompensas e FAQ', 'Resumo'];

/** The dots + connecting lines always fit (they're compact and shrink-0 protected), but the
 * whitespace-nowrap labels side-by-side don't fit a mobile viewport. Labels show only from sm: up;
 * mobile gets a single "Passo X de N — Label" caption instead, kept in sync by paintWizardSteps(). */
function WizardSteps() {
  return `
    <p class="sm:hidden text-center text-[13px] font-bold text-slate-700 font-inter mb-4" id="wizard-step-caption">Passo 1 de ${WIZARD_STEP_LABELS.length} — ${WIZARD_STEP_LABELS[0]}</p>
    <div class="w-full max-w-[560px] flex items-start" id="wizard-steps">
      ${WIZARD_STEP_LABELS.map((label, i) => {
        const n = i + 1;
        return `
          ${i > 0 ? '<div class="wizard-step-line flex-1 h-0.5 mx-2 mt-[13px] bg-slate-200"></div>' : ''}
          <div class="flex flex-col items-center gap-2 shrink-0">
            <span class="wizard-step-dot w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-outfit shrink-0 ${n === 1 ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-400'}" data-step="${n}">${n}</span>
            <span class="wizard-step-label hidden sm:block text-[11px] font-bold font-inter text-center whitespace-nowrap ${n === 1 ? 'text-slate-900' : 'text-slate-400'}" data-step="${n}">${label}</span>
          </div>
        `;
      }).join('')}
    </div>`;
}

/** `search` may carry "?...&id=<campaignId>" — when present and the campaign belongs to this
 * creator, the wizard opens in edit mode, every field prefilled from the saved record. */
export function CreateCampaign(search = '') {
  const session = getCreatorSession();
  if (!session) return CreatorNotLoggedIn();

  const editId = new URLSearchParams(search).get('id');
  const editingCampaign = editId ? getCreatorCampaignById(session.email, editId) : null;
  if (editId && !editingCampaign) return CreatorNotFoundCampaign();

  const isEditing = !!editingCampaign;
  const isEditingPublished = isEditing && editingCampaign.status !== 'draft';
  const categories = getCategories();
  const rewardRows = isEditing && editingCampaign.rewards?.length ? editingCampaign.rewards : [null];
  const checkpointRows = isEditing && editingCampaign.checkpoints?.length ? editingCampaign.checkpoints : [null];
  const faqRows = isEditing && editingCampaign.faq?.length ? editingCampaign.faq : [null];
  // Older campaigns only ever stored a single `image` — fall back to it for slot 0 so editing one
  // doesn't appear to have silently lost its cover photo.
  const images = isEditing
    ? [0, 1, 2].map((i) => editingCampaign.images?.[i] || (i === 0 ? editingCampaign.image : '') || '')
    : ['', '', ''];

  return `
    ${CreatorTopBar(session)}
    <!-- O wizard passou a ocupar a altura da janela em vez de crescer para baixo. A régua de
         progresso e os botões de avançar precisam estar visíveis o tempo todo: a régua responde
         "onde estou" e os botões respondem "como saio daqui", e as duas perguntas aparecem no
         meio do preenchimento, não no fim dele. Com a página rolando inteira, as duas sumiam
         justamente nos passos mais longos. Agora só o miolo do card rola, e o card guarda os
         cantos arredondados nas duas pontas porque a barra de ações vive dentro dele. -->
    <main class="h-[100dvh] overflow-hidden bg-slate-50 pt-28 md:pt-32 flex flex-col">
      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] flex flex-col flex-1 min-h-0 pb-5 md:pb-8">
          <a href="?creator=dashboard" id="wizard-leave-link" class="shrink-0 inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-violet-600 transition-colors mb-4 font-inter font-medium w-fit">
            ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para minhas campanhas
          </a>

          <h1 class="shrink-0 font-manrope font-bold text-slate-900 text-[24px] md:text-[28px] mb-1">${isEditing ? 'Editar campanha' : 'Criar campanha'}</h1>
          <p class="shrink-0 text-[14px] text-slate-500 font-inter mb-4">Preencha as etapas abaixo. Seu progresso é salvo automaticamente ao chegar no resumo.</p>

          <!-- Progresso: seção própria, sem título, centralizada no box -->
          <div class="shrink-0 bg-white border border-slate-200 rounded-2xl px-6 py-5 mb-4 flex flex-col items-center" id="wizard-steps-section">
            ${WizardSteps()}
          </div>

          <div class="flex gap-4 flex-1 min-h-0">
          <!-- A nota vem antes do formulário: é ela que enquadra o trabalho. A largura vive aqui,
               e não no conteúdo, para que recolher anime a trilha e o card no mesmo movimento em
               vez de um saltar e o outro reagir depois. -->
          <aside id="wizard-rail" class="hidden lg:block shrink-0 transition-[width] duration-300 ease-out"></aside>

          <div class="bg-surface border border-line rounded-card flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden" id="wizard-card" data-editing-id="${isEditing ? escapeHtml(editingCampaign.id) : ''}" data-editing-status="${isEditing ? escapeHtml(editingCampaign.status) : ''}" data-editing-created-at="${isEditing ? escapeHtml(editingCampaign.createdAt) : ''}">
           <div class="flex-1 min-h-0 overflow-y-auto p-6 md:p-8" id="wizard-scroll">
            <h2 class="font-manrope font-bold text-slate-900 text-[18px] md:text-[20px] mb-6" id="wizard-step-heading">${WIZARD_STEP_LABELS[0]}</h2>

            <!-- Step 1: informações básicas -->
            <div class="wizard-step-panel" data-step-panel="1">
              <section class="mb-8">
                <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Sobre a campanha</h3>
                <p class="text-[13px] text-slate-500 font-inter mb-4">O nome e o resumo que aparecem nos cards, na busca e no topo da página do projeto.</p>
                <div class="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4">
                  <label class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Título da campanha</span>
                    <input type="text" name="title" data-validate="required" placeholder="Ex: Guardiões de Aethermoor" value="${isEditing ? escapeHtml(editingCampaign.title) : ''}" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter">
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                  <label class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Categoria</span>
                    <select name="category" data-validate="required" data-searchable="true" data-search-placeholder="Buscar categoria..." class="select-field w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter">
                      <option value="">Selecione ou busque</option>
                      ${categories.map((c) => `<option value="${escapeHtml(c)}" ${isEditing && editingCampaign.category === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
                    </select>
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                  <label class="block md:col-span-2">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Descrição curta</span>
                    <textarea name="shortDescription" rows="2" data-validate="required" maxlength="140" placeholder="Uma frase que resume o projeto (aparece nos cards e na busca)." class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter resize-none">${isEditing ? escapeHtml(editingCampaign.shortDescription) : ''}</textarea>
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                </div>
              </section>

              <section class="mb-8">
                <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Fotos da campanha</h3>
                <p class="text-[13px] text-slate-500 font-inter mb-4">Até 3 fotos. A primeira é a capa, usada como imagem principal em todos os lugares onde a campanha aparece.</p>
                <div class="grid grid-cols-3 gap-3 max-w-[480px]">
                  ${[0, 1, 2].map((i) => ImageSlot(i, images[i])).join('')}
                </div>
                <p id="campaign-image-error" class="hidden text-red-500 text-[12px] font-inter mt-3"></p>
              </section>

              <section class="mb-8">
                <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Sobre o projeto</h3>
                <p class="text-[13px] text-slate-500 font-inter mb-4">O texto completo que o apoiador lê antes de decidir apoiar.</p>
                <div class="flex flex-col gap-4">
                  <label class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Descrição completa</span>
                    <textarea name="description" rows="6" data-validate="required" placeholder="Conte a história do projeto, o que os apoiadores vão receber e por que ele merece apoio." class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter resize-none">${isEditing ? escapeHtml(editingCampaign.description) : ''}</textarea>
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                  <label class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Por que apoiar agora? <span class="font-normal text-slate-400">Opcional</span></span>
                    <textarea name="whySupport" rows="3" placeholder="O argumento que aparece em destaque na página: por que vale a pena entrar agora e não depois." class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter resize-none">${isEditing ? escapeHtml(editingCampaign.whySupport || '') : ''}</textarea>
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                </div>
              </section>

            </div>

            <!-- Step 2: meta e checkpoints -->
            <div class="wizard-step-panel hidden" data-step-panel="2">
              <section class="mb-8">
                <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Meta e checkpoints</h3>
                <p class="text-[13px] text-slate-500 font-inter mb-4">A meta e a duração são calculadas a partir dos checkpoints que você criar abaixo.</p>
              <div class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-3 max-w-[520px]">
                  <div class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Meta de arrecadação</span>
                    <div class="w-full px-4 py-3 rounded-xl bg-violet-50 border border-violet-100 text-[15px] font-outfit font-bold text-violet-700" id="checkpoint-goal-total">R$ 0</div>
                    <p class="text-[11px] text-slate-400 font-inter mt-1.5">Soma dos checkpoints abaixo</p>
                  </div>
                  <div class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Duração (dias)</span>
                    <div class="w-full px-4 py-3 rounded-xl bg-violet-50 border border-violet-100 text-[15px] font-outfit font-bold text-violet-700" id="checkpoint-duration-total">0 dias</div>
                    <p class="text-[11px] text-slate-400 font-inter mt-1.5">Até o último checkpoint</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                  ${icon('flag', 'w-4 h-4 text-violet-500 shrink-0 mt-0.5')}
                  <div>
                    <p class="text-[13px] font-bold text-violet-900 font-manrope">A meta é a soma dos checkpoints</p>
                    <p class="text-[12px] text-violet-700 font-inter leading-relaxed mt-0.5">Na data de cada marco o apoiador decide se continua. Quem sai recebe de volta só o que ainda não foi usado.</p>
                  </div>
                </div>

                <div class="flex flex-col" id="checkpoints-list">
                  ${checkpointRows.map((c, i) => CheckpointRow(i, c, i === checkpointRows.length - 1)).join('')}
                </div>
                <!-- Com todos os checkpoints fechados o "Adicionar" de dentro do card some junto;
                     este fallback existe só para essa situação, para a lista nunca virar beco sem saída. -->
                <button type="button" id="checkpoints-add-fallback" class="hidden self-start items-center gap-1.5 text-[13px] font-bold text-violet-600 hover:text-violet-700">
                  ${icon('plus', 'w-4 h-4')} Adicionar checkpoint
                </button>
              </div>
              </section>

            </div>

            <!-- Step 3: recompensas -->
            <div class="wizard-step-panel hidden" data-step-panel="3">
              <section class="mb-8">
                <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Recompensas</h3>
                <p class="text-[13px] text-slate-500 font-inter mb-4">O que o apoiador recebe em cada faixa de valor. Ele escolhe uma delas na hora de apoiar.</p>
                <div class="flex flex-col" id="rewards-list">
                  ${rewardRows.map((r, i) => RewardRow(i, r, i === rewardRows.length - 1)).join('')}
                </div>
                <button type="button" id="rewards-add-fallback" class="hidden items-center gap-1.5 text-[13px] font-bold text-violet-600 hover:text-violet-700">
                  ${icon('plus', 'w-4 h-4')} Adicionar recompensa
                </button>
              </section>

              <section class="mb-8">
                <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Perguntas frequentes</h3>
                <p class="text-[13px] text-slate-500 font-inter mb-4">As dúvidas que aparecem respondidas na página da campanha: prazo de entrega, frete, troca de recompensa, o que acontece se a meta não for atingida.</p>
                <div class="flex flex-col" id="faq-list">
                  ${faqRows.map((f, i) => FaqRow(i, f, i === faqRows.length - 1)).join('')}
                </div>
                <button type="button" id="faq-add-fallback" class="hidden items-center gap-1.5 text-[13px] font-bold text-violet-600 hover:text-violet-700">
                  ${icon('plus', 'w-4 h-4')} Adicionar pergunta
                </button>
              </section>
            </div>

            <!-- Step 4: resumo — as ações vivem no rodapé do card, como as dos outros passos. -->
            <div class="wizard-step-panel hidden" data-step-panel="4">
              <div id="wizard-summary"></div>
            </div>

            <!-- Success -->
            <div class="wizard-step-panel hidden text-center py-6" data-step-panel="success">
              <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">${icon('check', 'w-6 h-6')}</div>
              <h3 class="font-manrope font-bold text-slate-900 text-[19px] mb-2" id="wizard-success-title">${isEditing ? 'Campanha atualizada!' : 'Campanha criada!'}</h3>
              <p id="wizard-success-message" class="text-[14px] text-slate-500 font-inter leading-relaxed mb-7"></p>
              <a href="?creator=dashboard" class="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
                Ver minhas campanhas
              </a>
            </div>
           </div>

            <!-- Rodapé único do wizard.
                 Antes cada passo carregava o próprio rodapé dentro do painel, e o resumo tinha
                 ainda um quarto: uma barra fixa na largura da janela. Quatro rodapés com quatro
                 marcações diferentes nunca iam ficar iguais entre si, e o do resumo era o mais
                 destoante de todos porque nem morava no card. Agora existe um só, fora da área
                 que rola, e o que muda entre os passos é só qual grupo de botões aparece. -->
            <div class="shrink-0 border-t border-slate-200 bg-white px-6 md:px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap" id="wizard-footer">
              <!-- O que a validação de campo não alcança (foto que ninguém enviou, lista vazia)
                   aparece aqui, ao lado do botão que a pessoa acabou de apertar, em vez de no fim
                   de um conteúdo que ela teria que rolar de volta para achar. -->
              <div class="wizard-step-alert hidden items-start gap-2 text-[13px] font-inter text-red-600 leading-snug max-w-[52ch]"></div>
              <!-- Duas ações, não quatro. "Cancelar" saía do resumo sem cancelar nada (o rascunho
                   já foi salvo ao chegar lá) e ficava ao lado de "Salvar rascunho" fingindo ser o
                   oposto dele: dois rótulos contrários para o mesmo resultado. O salvamento virou
                   estado, que é o que ele sempre foi. -->
              <span id="wizard-draft-state" class="hidden items-center gap-1.5 text-[12px] font-inter text-slate-500"></span>

              <div class="flex justify-end gap-3 ml-auto">
                <div class="wizard-footer-actions flex gap-3" data-footer-step="1">
                  <button type="button" class="wizard-next-1 px-8 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 text-[15px]">Continuar ${icon('arrow-right', 'w-4 h-4')}</button>
                </div>
                <div class="wizard-footer-actions hidden gap-3" data-footer-step="2">
                  <button type="button" class="wizard-back-2 shrink-0 px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[14px] font-inter hover:border-slate-300 transition-all">Voltar</button>
                  <button type="button" class="wizard-next-2 px-8 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 text-[15px]">Continuar ${icon('arrow-right', 'w-4 h-4')}</button>
                </div>
                <div class="wizard-footer-actions hidden gap-3" data-footer-step="3">
                  <button type="button" class="wizard-back-3 shrink-0 px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[14px] font-inter hover:border-slate-300 transition-all">Voltar</button>
                  <button type="button" class="wizard-next-3 px-8 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 text-[15px]">Ver resumo ${icon('arrow-right', 'w-4 h-4')}</button>
                </div>
                <div class="wizard-footer-actions hidden gap-3" data-footer-step="4">
                  <button type="button" class="wizard-back-4 shrink-0 px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[14px] font-inter hover:border-slate-300 transition-all">Voltar e editar</button>
                  ${isEditingPublished ? `
                    <button type="button" id="wizard-save-changes" class="px-8 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 text-[15px]">Salvar alterações ${icon('arrow-right', 'w-4 h-4')}</button>
                  ` : `
                    <button type="button" id="wizard-publish" class="px-8 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 text-[15px] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">Publicar campanha ${icon('arrow-right', 'w-4 h-4')}</button>
                  `}
                </div>
              </div>
            </div>
          </div>

          </div>
      </div>
    </main>

    <!-- Leave without saving -->
    <div id="wizard-leave-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">${isEditing ? 'Suas alterações ainda não foram salvas' : 'Sua campanha ainda não foi salva'}</h3>
        <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-6">${isEditing ? 'Se você sair agora, as mudanças que fez aqui se perdem e não tem como recuperar depois.' : 'Se você sair agora, tudo que preencheu até aqui (título, descrição, recompensas) se perde. Não tem como recuperar depois.'}</p>
        <div class="flex gap-3">
          <button type="button" id="wizard-leave-modal-stay" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-[14px] font-inter hover:border-slate-300 transition-all">
            ${isEditing ? 'Continuar editando' : 'Continuar criando'}
          </button>
          <button type="button" id="wizard-leave-modal-leave" class="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">
            Sair sem salvar
          </button>
        </div>
      </div>
    </div>

  `;
}

const validators = {
  required: (v) => (v.trim().length > 0 ? null : 'Campo obrigatório.'),
  // Aceita tanto número cru quanto valor mascarado ("R$ 2.500,00").
  positiveNumber: (v) => ((/[.,]/.test(v) ? parseMoney(v) : Number(v)) > 0 ? null : 'Digite um valor maior que zero.'),
};

function validateField(input) {
  const rules = (input.dataset.validate || '').split(',').filter(Boolean);
  const errorEl = input.closest('label')?.querySelector('.field-error');
  const message = rules.map((rule) => validators[rule]?.(input.value)).find(Boolean) || null;

  input.classList.toggle('border-red-400', !!message);
  input.classList.toggle('border-slate-300', !message);
  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.classList.toggle('hidden', !message);
  }
  return !message;
}

function validatePanel(panelEl) {
  const fields = Array.from(panelEl.querySelectorAll('[data-validate]')).filter((el) => !el.closest('.hidden'));
  let firstInvalid = null;
  fields.forEach((el) => {
    if (!validateField(el) && !firstInvalid) firstInvalid = el;
  });
  firstInvalid?.focus();
  return !firstInvalid;
}

function collectRewards() {
  // A trailing untouched row (the one "Salvar" offers up next) must never reach the saved record.
  return Array.from(document.querySelectorAll('.reward-row'))
    .filter((row) => row.querySelector('.reward-title').value.trim())
    .map((row, i) => ({
      id: `r${i + 1}`,
      title: row.querySelector('.reward-title').value.trim(),
      price: formatBRL(parseMoney(row.querySelector('.reward-price').value)),
      description: row.querySelector('.reward-description').value.trim(),
    }));
}

function collectCheckpoints() {
  return Array.from(document.querySelectorAll('.checkpoint-row'))
    .filter((row) => row.querySelector('.checkpoint-title').value.trim())
    .map((row, i) => ({
      id: `cp${i + 1}`,
      title: row.querySelector('.checkpoint-title').value.trim(),
      date: row.querySelector('.checkpoint-date').value,
      amount: Math.round(parseMoney(row.querySelector('.checkpoint-amount').value)),
      description: row.querySelector('.checkpoint-description').value.trim(),
    }));
}

function collectFaq() {
  return Array.from(document.querySelectorAll('.faq-row')).map((row) => ({
    q: row.querySelector('.faq-question').value.trim(),
    a: row.querySelector('.faq-answer-input').value.trim(),
  })).filter((f) => f.q && f.a);
}

function collectImages() {
  return Array.from(document.querySelectorAll('.campaign-image-value')).map((el) => el.value).filter(Boolean);
}

/** Duration isn't typed in either — like the goal, it's read off the checkpoints: the campaign
 * runs from `startDate` (today, or the original creation date when editing) through its last
 * checkpoint. Clamped to at least 1 day so an empty/single-checkpoint draft never shows 0. */
function computeDurationDays(checkpoints, startDate) {
  const dates = checkpoints.map((cp) => new Date(cp.date)).filter((d) => !Number.isNaN(d.getTime()));
  if (!dates.length) return 0;
  const lastDate = new Date(Math.max(...dates));
  return Math.max(1, Math.ceil((lastDate - startDate) / (1000 * 60 * 60 * 24)));
}

function collectFormData(startDate) {
  // Scoped to #wizard-card, not document — "description" collides with index.html's
  // <meta name="description">, which a bare document.querySelector would match instead.
  const wizard = document.getElementById('wizard-card');
  const images = collectImages();
  const checkpoints = collectCheckpoints();
  return {
    image: images[0] || DEFAULT_IMAGE,
    images,
    title: wizard.querySelector('[name="title"]').value.trim(),
    category: wizard.querySelector('[name="category"]').value,
    shortDescription: wizard.querySelector('[name="shortDescription"]').value.trim(),
    // No standalone goal input — the goal IS the sum of the checkpoints' amounts.
    goal: checkpoints.reduce((sum, cp) => sum + (Number(cp.amount) || 0), 0),
    durationDays: computeDurationDays(checkpoints, startDate),
    description: wizard.querySelector('[name="description"]').value.trim(),
    whySupport: wizard.querySelector('[name="whySupport"]').value.trim(),
    creatorName: getCreatorSession()?.name || '',
    checkpoints,
    rewards: collectRewards(),
    faq: collectFaq(),
  };
}

function paintWizardSteps(activeStep) {
  Array.from(document.querySelectorAll('.wizard-step-dot')).forEach((dot) => {
    const step = Number(dot.dataset.step);
    const state = step < activeStep ? 'done' : step === activeStep ? 'current' : 'upcoming';
    dot.className = 'wizard-step-dot w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-outfit shrink-0 ' +
      (state === 'upcoming' ? 'bg-slate-100 text-slate-400' : 'bg-violet-600 text-white');
    dot.innerHTML = state === 'done'
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : String(step);
  });

  Array.from(document.querySelectorAll('.wizard-step-label')).forEach((label) => {
    const step = Number(label.dataset.step);
    label.className = 'wizard-step-label hidden sm:block text-[11px] font-bold font-inter text-center whitespace-nowrap ' + (step <= activeStep ? 'text-slate-900' : 'text-slate-400');
  });

  Array.from(document.querySelectorAll('.wizard-step-line')).forEach((line, i) => {
    line.className = 'wizard-step-line flex-1 h-0.5 mx-2 mt-[13px] ' + (activeStep >= i + 2 ? 'bg-violet-600' : 'bg-slate-200');
  });

  const caption = document.getElementById('wizard-step-caption');
  if (caption) caption.textContent = `Passo ${activeStep} de ${WIZARD_STEP_LABELS.length} — ${WIZARD_STEP_LABELS[activeStep - 1]}`;

  const heading = document.getElementById('wizard-step-heading');
  if (heading) heading.textContent = WIZARD_STEP_LABELS[activeStep - 1];
}

/** O aviso do rodapé é sobre o passo que estava na tela; ao trocar de passo ele perde o sentido. */
function clearStepAlert() {
  const box = document.querySelector('#wizard-footer .wizard-step-alert');
  box?.classList.add('hidden');
  box?.classList.remove('flex');
}

let wizardCurrentStep = 1;
/** Preenchido pelo init. As dicas da trilha são por etapa, então trocar de painel também troca
 *  o conteúdo dela, e goToWizardPanel é o único ponto por onde toda troca passa. */
let wizardRailRefresh = null;

function goToWizardPanel(name) {
  if (/^[1-4]$/.test(name)) wizardCurrentStep = Number(name);
  document.querySelectorAll('.wizard-step-panel').forEach((p) => p.classList.toggle('hidden', p.dataset.stepPanel !== name));

  // Um rodapé só, com um grupo de botões por passo. A tela de sucesso tem o próprio CTA no
  // meio do card, então ali o rodapé inteiro sai de cena.
  document.querySelectorAll('.wizard-footer-actions').forEach((group) => {
    const on = group.dataset.footerStep === name;
    group.classList.toggle('hidden', !on);
    group.classList.toggle('flex', on);
  });
  document.getElementById('wizard-footer')?.classList.toggle('hidden', name === 'success');

  // Trocar de passo com o miolo rolado deixaria o painel novo começando pelo meio.
  document.getElementById('wizard-scroll')?.scrollTo({ top: 0 });
  clearStepAlert();
  wizardRailRefresh?.();
}

export function initCreateCampaign() {
  const wizardCard = document.getElementById('wizard-card');
  if (!wizardCard) return;

  initMoneyInputs();
  wireCreatorUserMenu();

  let editingId = wizardCard.dataset.editingId || null;
  const editingStatus = wizardCard.dataset.editingStatus || null;
  const isEditingPublished = !!editingId && editingStatus !== 'draft';
  const session = getCreatorSession();
  // Duration runs from here through the last checkpoint — "here" is the campaign's original
  // creation date when editing, or today when it's brand new.
  const editingCreatedAt = wizardCard.dataset.editingCreatedAt || null;
  const campaignStartDate = editingCreatedAt ? new Date(editingCreatedAt) : new Date();

  // Deliberately NOT calling the shared initCreatorTopBar() here — its logout button needs to be
  // routed through the leave-guard below instead of logging out immediately.
  const panel1 = document.querySelector('.wizard-step-panel[data-step-panel="1"]');
  const panel2 = document.querySelector('.wizard-step-panel[data-step-panel="2"]');
  const panelRewards = document.querySelector('.wizard-step-panel[data-step-panel="3"]');

  let wizardIsSaved = false;

  // Photo slots (up to 3) — same FileReader pattern as the account profile photo, with a 10MB
  // cap per file so a huge photo can't eat into localStorage's ~5-10MB origin quota. Delegated
  // to the wizard card since there are 3 independent slots sharing one file-choose/remove pattern.
  const imageError = document.getElementById('campaign-image-error');

  wizardCard.addEventListener('change', (e) => {
    const input = e.target.closest('.campaign-image-input');
    if (!input) return;
    const slot = input.closest('.campaign-image-slot');
    const preview = slot.querySelector('.campaign-image-preview');
    const placeholder = slot.querySelector('.campaign-image-placeholder');
    const value = slot.querySelector('.campaign-image-value');
    const removeBtn = slot.querySelector('.campaign-image-remove');
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      imageError.textContent = 'Esse arquivo não é uma imagem.';
      imageError.classList.remove('hidden');
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      imageError.textContent = `Essa imagem tem ${(file.size / (1024 * 1024)).toFixed(1)} MB. O máximo é 10 MB.`;
      imageError.classList.remove('hidden');
      input.value = '';
      return;
    }
    imageError.classList.add('hidden');

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      value.value = dataUrl;
      preview.src = dataUrl;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
      removeBtn.classList.remove('hidden');
      removeBtn.classList.add('flex');
      if (slot.dataset.imageSlot === '0') slot.querySelector('.campaign-image-badge')?.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  wizardCard.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.campaign-image-remove');
    if (!removeBtn) return;
    const slot = removeBtn.closest('.campaign-image-slot');
    slot.querySelector('.campaign-image-value').value = '';
    slot.querySelector('.campaign-image-input').value = '';
    slot.querySelector('.campaign-image-preview').classList.add('hidden');
    slot.querySelector('.campaign-image-placeholder').classList.remove('hidden');
    slot.querySelector('.campaign-image-badge')?.classList.add('hidden');
    removeBtn.classList.add('hidden');
    removeBtn.classList.remove('flex');
  });

  /** Both editable lists (checkpoints and recompensas) share one interaction: pencil opens a row,
   * trash deletes it, "Salvar" closes it, and only one row is open at a time. `editableList` wires
   * that once and takes just the bits that differ between the two. */
  function editableList({ listEl, rowClass, bodyClass, buildRow, refreshSummary, fallbackBtn, onChange, optional = false }) {
    if (!listEl) return { add: () => {}, expand: () => {}, pruneEmpty: () => {} };
    const rows = () => Array.from(listEl.querySelectorAll(`.${rowClass}`));

    function syncAffordances() {
      const all = rows();
      // A single remaining row can't be deleted — the list would have nothing to fall back to.
      // Salvo em listas opcionais (o FAQ), onde lista vazia é uma resposta legítima.
      all.forEach((row) => row.querySelector('.row-remove').classList.toggle('hidden', !optional && all.length <= 1));
      // Saving the last row opens the next one automatically, so this only surfaces in the one
      // case that chain can't cover: everything is closed and the creator wants one more.
      const anyOpen = all.some((row) => row.dataset.expanded === 'true');
      fallbackBtn?.classList.toggle('hidden', anyOpen);
      fallbackBtn?.classList.toggle('flex', !anyOpen);
    }

    function setExpanded(targetRow) {
      rows().forEach((row) => {
        const expanded = row === targetRow;
        row.dataset.expanded = String(expanded);
        row.querySelector(`.${bodyClass}`).style.display = expanded ? '' : 'none';
        if (!expanded) refreshSummary(row);
      });
      syncAffordances();
    }

    function add() {
      listEl.insertAdjacentHTML('beforeend', buildRow(rows().length));
      initMoneyInputs(); // linhas novas nascem com a máscara
      const all = rows();
      setExpanded(all[all.length - 1]);
      onChange?.();
      all[all.length - 1].querySelector('input')?.focus();
    }

    listEl.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.row-remove');
      if (removeBtn) {
        if (!optional && rows().length <= 1) return;
        removeBtn.closest(`.${rowClass}`).remove();
        syncAffordances();
        onChange?.();
        return;
      }
      if (e.target.closest('.row-edit')) return setExpanded(e.target.closest(`.${rowClass}`));
      if (e.target.closest('.row-save')) {
        const row = e.target.closest(`.${rowClass}`);
        // Don't let a half-filled row collapse into a summary that hides its own errors.
        const invalid = Array.from(row.querySelectorAll('[data-validate]')).filter((el) => !validateField(el));
        if (invalid.length) return invalid[0].focus();

        const wasLast = row === rows()[rows().length - 1];
        setExpanded(null);
        // Finishing the last row means the creator is building the list forward — hand them the
        // next one instead of a dead end. Editing a row in the middle just closes it.
        // A trailing untouched row is dropped on "Continuar" (see pruneEmptyRows).
        if (wasLast) add();
      }
    });

    fallbackBtn?.addEventListener('click', add);
    syncAffordances();

    /** Drops rows the creator never touched — the empty row that "Salvar" hands them is an offer,
     * not an obligation, so ignoring it and moving on must not trip validation.
     *
     * Listas obrigatórias guardam sempre uma linha; a opcional (FAQ) pode ficar em zero. Guardar
     * a última linha em branco no FAQ travava o passo 3 para sempre: os campos são `required`, a
     * linha nunca era removida, e o criador que não quer perguntas frequentes não tinha saída e
     * nem mensagem dizendo o que fazer. Quem cobra FAQ agora é a nota, com incentivo, não bloqueio. */
    function pruneEmpty() {
      const all = rows();
      all.forEach((row) => {
        if (!optional && rows().length <= 1) return;
        const blank = Array.from(row.querySelectorAll('input, textarea')).every((el) => !el.value.trim());
        if (blank) row.remove();
      });
      syncAffordances();
      onChange?.();
    }

    return { add, expand: setExpanded, pruneEmpty };
  }

  const rewardsList = document.getElementById('rewards-list');

  function refreshRewardSummary(row) {
    const index = Array.from(rewardsList.children).indexOf(row);
    const title = row.querySelector('.reward-title').value.trim();
    const price = row.querySelector('.reward-price').value;
    const description = row.querySelector('.reward-description').value.trim();
    row.querySelector('.reward-summary-title').textContent = title || `Recompensa ${index + 1}`;
    row.querySelector('.reward-summary-meta').textContent = price ? formatBRL(price) : 'Toque no lápis para preencher';
    const descEl = row.querySelector('.reward-summary-desc');
    descEl.textContent = description;
    descEl.classList.toggle('hidden', !description);
  }

  const rewardsCtl = editableList({
    listEl: rewardsList,
    rowClass: 'reward-row',
    bodyClass: 'reward-body',
    buildRow: (count) => RewardRow(count, null, true),
    refreshSummary: refreshRewardSummary,
    fallbackBtn: document.getElementById('rewards-add-fallback'),
  });

  const faqList = document.getElementById('faq-list');

  function refreshFaqSummary(row) {
    const index = Array.from(faqList.children).indexOf(row);
    const question = row.querySelector('.faq-question').value.trim();
    const answer = row.querySelector('.faq-answer-input').value.trim();
    row.querySelector('.faq-summary-title').textContent = question || `Pergunta ${index + 1}`;
    row.querySelector('.faq-summary-meta').classList.toggle('hidden', !!question);
    const descEl = row.querySelector('.faq-summary-desc');
    descEl.textContent = answer;
    descEl.classList.toggle('hidden', !answer);
  }

  const faqCtl = editableList({
    listEl: faqList,
    rowClass: 'faq-row',
    bodyClass: 'faq-body',
    buildRow: (count) => FaqRow(count, null, true),
    refreshSummary: refreshFaqSummary,
    fallbackBtn: document.getElementById('faq-add-fallback'),
    // Campanha sem perguntas frequentes é uma campanha válida. Quem pressiona por elas é a nota.
    optional: true,
  });

  // Checkpoints use the same editable-list wiring, plus live "Meta de arrecadação" and "Duração"
  // totals (both are read off the checkpoints, not typed in).
  const checkpointsList = document.getElementById('checkpoints-list');
  const goalTotalEl = document.getElementById('checkpoint-goal-total');
  const durationTotalEl = document.getElementById('checkpoint-duration-total');

  function updateCheckpointTotals() {
    const amountInputs = Array.from(checkpointsList.querySelectorAll('.checkpoint-amount'));
    const goal = amountInputs.reduce((sum, input) => sum + parseMoney(input.value), 0);
    if (goalTotalEl) goalTotalEl.textContent = formatBRL(goal);

    const dateInputs = Array.from(checkpointsList.querySelectorAll('.checkpoint-date'));
    const duration = computeDurationDays(dateInputs.map((input) => ({ date: input.value })), campaignStartDate);
    if (durationTotalEl) durationTotalEl.textContent = `${duration} dias`;

    return goal;
  }

  // Refreshing a row's summary text on collapse keeps it in sync with whatever was just typed,
  // since the summary markup is otherwise only rendered once, on creation.
  function refreshCheckpointSummary(row) {
    const titleEl = row.querySelector('.checkpoint-summary-title');
    const metaEl = row.querySelector('.checkpoint-summary-meta');
    const descEl = row.querySelector('.checkpoint-summary-desc');
    const descToggle = row.querySelector('.checkpoint-desc-toggle');
    const index = Array.from(checkpointsList.children).indexOf(row);
    const title = row.querySelector('.checkpoint-title').value.trim();
    const date = row.querySelector('.checkpoint-date').value;
    const amount = row.querySelector('.checkpoint-amount').value;
    const description = row.querySelector('.checkpoint-description').value.trim();

    if (titleEl) titleEl.textContent = title || `Checkpoint ${index + 1}`;
    if (metaEl) {
      const parts = [date ? formatDate(date) : null, amount ? formatBRL(amount) : null].filter(Boolean);
      metaEl.textContent = parts.length ? parts.join(' · ') : 'Toque para preencher';
    }
    if (descEl) {
      descEl.textContent = description;
      descEl.classList.toggle('hidden', !description);
      // Re-clamp on every refresh so an edited description starts collapsed again, then reveal
      // "Ver mais" only when the clamp is actually hiding something (scrollHeight > clientHeight).
      descEl.classList.add('line-clamp-2');
      if (descToggle) {
        descToggle.textContent = 'Ver mais';
        const overflows = description && descEl.scrollHeight > descEl.clientHeight + 1;
        descToggle.classList.toggle('hidden', !overflows);
      }
    }
  }

  const checkpointsCtl = editableList({
    listEl: checkpointsList,
    rowClass: 'checkpoint-row',
    bodyClass: 'checkpoint-body',
    buildRow: (count) => CheckpointRow(count, null, true),
    refreshSummary: refreshCheckpointSummary,
    fallbackBtn: document.getElementById('checkpoints-add-fallback'),
    onChange: updateCheckpointTotals,
  });

  // "Ver mais" on a collapsed checkpoint's description — expands the text in place, without
  // opening the row's form (which is what the pencil is for).
  checkpointsList?.addEventListener('click', (e) => {
    const descToggle = e.target.closest('.checkpoint-desc-toggle');
    if (!descToggle) return;
    e.stopPropagation();
    const descEl = descToggle.closest('.checkpoint-summary').querySelector('.checkpoint-summary-desc');
    const clamped = descEl.classList.toggle('line-clamp-2');
    descToggle.textContent = clamped ? 'Ver mais' : 'Ver menos';
  });

  checkpointsList?.addEventListener('input', (e) => {
    if (e.target.classList.contains('checkpoint-amount') || e.target.classList.contains('checkpoint-date')) updateCheckpointTotals();
  });

  updateCheckpointTotals();

  /* ── Trilha lateral ───────────────────────────────────────────────────────
     A nota é recalculada do zero a cada redesenho, a partir do formulário inteiro. É barato
     (são dezenas de campos, não milhares) e elimina a classe de bug em que o placar guardado
     discorda do que está na tela. */
  const railEl = document.getElementById('wizard-rail');
  const RAIL_KEY = 'trama_wizard_rail';
  let railCollapsed = (() => {
    try { return localStorage.getItem(RAIL_KEY) === 'collapsed'; } catch { return false; }
  })();

  const RAIL_OPEN_PX = 320;
  const RAIL_SHUT_PX = 60;

  /** A largura fica na <aside>, então a transição de CSS dela empurra o card junto: os dois
   *  blocos se movem no mesmo gesto.
   *
   *  Via style inline, não por classe utilitária: largura é estado que o JS decide em tempo de
   *  execução, e classe arbitrária depende de o Tailwind ter encontrado aquela string exata na
   *  varredura do código. Quando não encontra, a classe entra no elemento e não existe no CSS —
   *  foi o que aconteceu aqui, e o painel ficava preso na largura do conteúdo. */
  function applyRailWidth() {
    if (railEl) railEl.style.width = `${railCollapsed ? RAIL_SHUT_PX : RAIL_OPEN_PX}px`;
  }

  function refreshRail({ fade = false } = {}) {
    if (!railEl) return;
    railEl.innerHTML = WizardRail(collectFormData(campaignStartDate), wizardCurrentStep, railCollapsed);
    const inner = railEl.firstElementChild;
    if (!inner) return;
    inner.classList.add('transition-opacity', 'duration-200');
    if (fade) {
      inner.classList.add('opacity-0');
      requestAnimationFrame(() => inner.classList.remove('opacity-0'));
    }
  }

  // Delegado: a trilha se redesenha inteira a cada tecla, e um listener no botão morreria junto.
  railEl?.addEventListener('click', (e) => {
    if (!e.target.closest('#wizard-rail-toggle')) return;
    railCollapsed = !railCollapsed;
    try { localStorage.setItem(RAIL_KEY, railCollapsed ? 'collapsed' : 'open'); } catch { /* modo privado */ }

    /* O conteúdo apaga antes, a largura anima, e o conteúdo novo acende no meio do caminho.
       Trocar o innerHTML junto com a largura faria o texto da versão antiga ser espremido na
       frente do usuário, que é o efeito de janela quebrada que se quer evitar. */
    railEl.firstElementChild?.classList.add('opacity-0');
    applyRailWidth();
    setTimeout(() => refreshRail({ fade: true }), 150);
  });

  /* Um quadro por rajada de digitação. Sem isso, cada tecla dispararia um collectFormData e o
     medidor ficaria tremendo enquanto a pessoa escreve. */
  let railFrame = null;
  const scheduleRail = () => {
    if (railFrame) return;
    railFrame = requestAnimationFrame(() => { railFrame = null; refreshRail(); });
  };
  wizardCard?.addEventListener('input', scheduleRail);
  wizardCard?.addEventListener('change', scheduleRail);

  wizardRailRefresh = () => refreshRail();
  applyRailWidth();
  refreshRail();

  /* ── Conferência do resumo ────────────────────────────────────────────────
     Uma só função monta o passo 4: painel de pendências + prévia. Quem chama não
     precisa lembrar de sincronizar o botão de publicar, porque ela faz isso. */

  const summaryEl = document.getElementById('wizard-summary');
  const publishBtn = document.getElementById('wizard-publish');
  const draftStateEl = document.getElementById('wizard-draft-state');

  function renderSummary(raw) {
    if (!summaryEl) return;
    // Registros seedados não guardaram `creatorName`, mas o dono é quem está logado agora.
    const data = { ...raw, creatorName: raw.creatorName || raw.creator || session?.name || '' };
    summaryEl.innerHTML = ScorePanel(data) + SummaryMarkup(data);

    const blockers = getPublishBlockers(data);
    if (publishBtn) {
      publishBtn.disabled = blockers.length > 0;
      publishBtn.title = blockers.length ? 'Resolva as pendências listadas acima do resumo.' : '';
    }
  }

  /** O salvamento automático deixou de ser botão e virou estado: dizer "salvo às 14:32" informa
   *  o mesmo e não finge ser uma escolha que o criador precisa fazer. */
  function markDraftSaved() {
    if (!draftStateEl) return;
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    draftStateEl.innerHTML = `${CHECK_SVG('w-3.5 h-3.5 text-emerald-500')} Rascunho salvo às ${hora}`;
    draftStateEl.classList.remove('hidden');
    draftStateEl.classList.add('flex');
  }

  /** Cada pendência é um atalho: leva à etapa, pinta os erros e foca o primeiro campo aberto.
   *  Reaproveita validatePanel, que já sabe fazer as três coisas. */
  summaryEl?.addEventListener('click', (e) => {
    const jump = e.target.closest('.readiness-jump');
    if (!jump) return;
    const step = Number(jump.dataset.step);
    const panel = step === 1 ? panel1 : step === 2 ? panel2 : panelRewards;

    paintWizardSteps(step);
    goToWizardPanel(String(step));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!panel) return;
    if (validatePanel(panel)) return;
    // Linha recolhida esconde o próprio erro, então ela precisa ser aberta antes do foco.
    const invalidRow = panel.querySelector('.border-red-400')?.closest('[data-expanded]');
    if (invalidRow && invalidRow.dataset.expanded !== 'true') {
      const ctl = invalidRow.matches('.checkpoint-row') ? checkpointsCtl : invalidRow.matches('.reward-row') ? rewardsCtl : faqCtl;
      ctl.expand(invalidRow);
      invalidRow.querySelector('.border-red-400')?.focus();
    }
  });

  /* Um passo só avança quando não deixa bloqueio para trás, e quem define "bloqueio" é a mesma
     lista que o resumo mostra. As duas checagens precisam viver juntas: validatePanel enxerga o
     que é campo na tela, e getPublishBlockers enxerga o que só existe no conjunto — nenhuma foto
     enviada, por exemplo, não é campo obrigatório de input nenhum. Separadas, elas divergiam: o
     passo 1 liberava a passagem sem foto e o resumo acusava "Falta a foto de capa" três telas
     depois, o que faz o wizard parecer quebrado e joga a correção longe de onde ela nasceu. */
  function paintStepAlert(itens) {
    const box = document.querySelector('#wizard-footer .wizard-step-alert');
    if (!box) return;
    box.classList.toggle('hidden', !itens.length);
    box.classList.toggle('flex', itens.length > 0);
    if (!itens.length) return;
    box.innerHTML = `
      <span class="shrink-0 mt-0.5 text-red-500">${ALERT_SVG('w-4 h-4')}</span>
      <span>${itens.map((i) => escapeHtml(i.label)).join('<br>')}</span>`;
  }

  function stepIsClear(step, panel) {
    const camposOk = validatePanel(panel);
    const pendentes = getPublishBlockers(collectFormData(campaignStartDate)).filter((b) => b.step === step);
    // Erro de campo já se mostra sozinho no campo; a caixa fica para o que não tem campo.
    paintStepAlert(camposOk ? pendentes : []);
    return camposOk && !pendentes.length;
  }

  document.querySelector('.wizard-next-1')?.addEventListener('click', () => {
    if (!stepIsClear(1, panel1)) return;
    paintWizardSteps(2);
    goToWizardPanel('2');
  });

  document.querySelector('.wizard-back-2')?.addEventListener('click', () => {
    paintWizardSteps(1);
    goToWizardPanel('1');
  });
  document.querySelector('.wizard-next-2')?.addEventListener('click', () => {
    checkpointsCtl.pruneEmpty();
    if (!stepIsClear(2, panel2)) {
      // validatePanel() validates every checkpoint field regardless of collapsed state (their
      // bodies are hidden via inline style, not the .hidden class it skips) — but a collapsed
      // row's error is invisible until we open it back up.
      const invalidRow = panel2.querySelector('.checkpoint-row .border-red-400')?.closest('.checkpoint-row');
      if (invalidRow && invalidRow.dataset.expanded !== 'true') {
        checkpointsCtl.expand(invalidRow);
        invalidRow.querySelector('.border-red-400')?.focus();
      }
      return;
    }
    paintWizardSteps(3);
    goToWizardPanel('3');
  });

  document.querySelector('.wizard-back-3')?.addEventListener('click', () => {
    paintWizardSteps(2);
    goToWizardPanel('2');
  });
  document.querySelector('.wizard-next-3')?.addEventListener('click', () => {
    rewardsCtl.pruneEmpty();
    faqCtl.pruneEmpty();
    if (!stepIsClear(3, panelRewards)) {
      const invalidRow = panelRewards.querySelector('.border-red-400')?.closest('[data-expanded]');
      if (invalidRow && invalidRow.dataset.expanded !== 'true') {
        (invalidRow.matches('.reward-row') ? rewardsCtl : faqCtl).expand(invalidRow);
        invalidRow.querySelector('.border-red-400')?.focus();
      }
      return;
    }
    const data = collectFormData(campaignStartDate);
    renderSummary(data);
    paintWizardSteps(4);
    goToWizardPanel('4');

    // Reaching the resumo auto-saves a draft — the creator's work survives from here on, it
    // shows up in the dashboard right away, and they can jump straight back to this step later
    // instead of re-walking the whole wizard (?creator=new&id=...&step=4).
    if (session) {
      const record = editingId
        ? updateCreatorCampaign(session.email, editingId, data)
        : createCreatorCampaign(session.email, { ...data, status: 'draft' });
      if (record) {
        editingId = record.id;
        wizardCard.dataset.editingId = record.id;
        window.history.replaceState({}, '', `?creator=new&id=${record.id}&step=4`);
        wizardIsSaved = true;
        markDraftSaved();
      }
    }
  });

  document.querySelector('.wizard-back-4')?.addEventListener('click', () => {
    paintWizardSteps(3);
    goToWizardPanel('3');
  });

  function finishWizard(status) {
    const session = getCreatorSession();
    if (!session) return;

    const data = collectFormData(campaignStartDate);
    const record = editingId
      ? updateCreatorCampaign(session.email, editingId, status ? { ...data, status } : data)
      : createCreatorCampaign(session.email, { ...data, status });
    if (!record) return;

    // On the success screen the progress bar and the step heading no longer describe anything.
    document.getElementById('wizard-steps-section')?.classList.add('hidden');
    document.getElementById('wizard-step-heading')?.classList.add('hidden');
    const titleEl = document.getElementById('wizard-success-title');
    const messageEl = document.getElementById('wizard-success-message');

    if (isEditingPublished) {
      if (titleEl) titleEl.textContent = 'Alterações salvas!';
      if (messageEl) messageEl.textContent = 'Os apoiadores dessa campanha já foram avisados por e-mail sobre o que mudou.';
    } else if (editingId) {
      if (titleEl) titleEl.textContent = status === 'active' ? 'Campanha publicada!' : 'Rascunho atualizado!';
      if (messageEl) messageEl.textContent = status === 'active' ? 'Sua campanha foi publicada e já está pronta para receber apoios.' : 'Suas alterações foram salvas no rascunho.';
    } else if (messageEl) {
      messageEl.textContent = status === 'draft'
        ? 'Sua campanha foi salva como rascunho. Você pode publicá-la quando quiser.'
        : 'Sua campanha foi publicada e já está pronta para receber apoios.';
    }

    wizardIsSaved = true;
    goToWizardPanel('success');
  }

  document.getElementById('wizard-publish')?.addEventListener('click', () => finishWizard('active'));
  document.getElementById('wizard-save-changes')?.addEventListener('click', () => finishWizard(null));

  // Leave-without-saving guard: intercepts every way out of the wizard (the "voltar" link, the
  // topbar's logo/site links, and "Sair") while nothing has been saved yet, per Checkout.js's
  // existing #checkout-leave-modal precedent for the exact same scenario.
  const leaveModal = document.getElementById('wizard-leave-modal');
  const leaveModalStay = document.getElementById('wizard-leave-modal-stay');
  const leaveModalLeave = document.getElementById('wizard-leave-modal-leave');
  let pendingLeaveHref = null;
  let pendingIsLogout = false;

  function closeLeaveModal() {
    leaveModal?.classList.add('hidden');
    pendingLeaveHref = null;
    pendingIsLogout = false;
  }

  function guardExit(href, isLogout, e) {
    if (wizardIsSaved) return;
    e.preventDefault();
    e.stopPropagation();
    pendingLeaveHref = href;
    pendingIsLogout = isLogout;
    leaveModal?.classList.remove('hidden');
  }

  ['wizard-leave-link', 'creator-topbar-logo-link', 'creator-topbar-home-link'].forEach((id) => {
    document.getElementById(id)?.addEventListener('click', (e) => guardExit(e.currentTarget.getAttribute('href'), false, e));
  });
  document.getElementById('creator-logout-btn')?.addEventListener('click', (e) => guardExit(null, true, e));

  leaveModalStay?.addEventListener('click', closeLeaveModal);
  leaveModal?.querySelector('[data-modal-dismiss]')?.addEventListener('click', closeLeaveModal);
  leaveModalLeave?.addEventListener('click', () => {
    if (pendingIsLogout) {
      clearCreatorSession();
      window.location.href = '/';
      return;
    }
    if (pendingLeaveHref) navigate(pendingLeaveHref);
    closeLeaveModal();
  });

  // "?...&step=4" (set by the Editar entry points once a draft has an id) jumps straight to the
  // resumo instead of forcing a walk back through steps 1-3 — the saved record already has
  // everything those steps would collect.
  const requestedStep = new URLSearchParams(window.location.search).get('step');
  const jumpCampaign = requestedStep === '4' && editingId && session ? getCreatorCampaignById(session.email, editingId) : null;
  if (jumpCampaign) {
    renderSummary(jumpCampaign);
    paintWizardSteps(4);
    goToWizardPanel('4');
    wizardIsSaved = true;
    if (jumpCampaign.status === 'draft') markDraftSaved();
  } else {
    paintWizardSteps(1);
  }
}

/** Updates are only meaningful once a campaign is actually live (drafts don't have backers to
 * update yet) — this section is gated on that in CreatorCampaignSummary. */
function UpdatesSection(campaign) {
  const updates = campaign.updates || [];
  return `
    <div class="mt-6 bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
      <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-4">Atualizações (${updates.length})</h3>
      <form id="update-form" class="flex flex-col gap-3 mb-6">
        <input type="text" name="updateTitle" data-validate="required" placeholder="Título da atualização" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter">
        <textarea name="updateDescription" rows="3" data-validate="required" placeholder="O que você quer contar aos apoiadores?" class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter resize-none"></textarea>
        <button type="submit" class="self-end bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-[13px] font-inter">Publicar atualização</button>
      </form>
      ${updates.length ? `
        <div class="flex flex-col gap-4 pt-5 border-t border-slate-100">
          ${updates.map((u) => `
            <div>
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="font-manrope font-bold text-slate-900 text-[14px]">${escapeHtml(u.title)}</span>
                <span class="text-slate-400 text-[12px] font-inter">${formatDate(u.createdAt)}</span>
              </div>
              <p class="text-slate-600 font-inter text-[13px] leading-relaxed">${escapeHtml(u.description)}</p>
            </div>
          `).join('')}
        </div>
      ` : `<p class="text-[13px] text-slate-400 font-inter pt-5 border-t border-slate-100">Nenhuma atualização publicada ainda.</p>`}
    </div>`;
}

/** Withdrawal becomes available once the campaign hits its funding goal — the creator chooses how
 * much of the still-available balance to withdraw each time (not all-or-nothing). */
function WithdrawPanel(campaign) {
  const session = getCreatorSession();
  if (campaign.status === 'cancelled') {
    return `
      <div class="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Saque da arrecadação</h3>
        <p class="text-[13px] text-slate-500 font-inter">Essa campanha foi cancelada e todo o valor foi devolvido aos apoiadores, não há mais nada para sacar.</p>
      </div>`;
  }

  // Checkpoint-based campaigns organize saques the same way the campaign itself is built — one
  // resolved checkpoint bucket at a time — instead of a single pooled "how much do you want" amount.
  if (campaign.checkpoints?.length) {
    return CheckpointWithdrawPanel(campaign);
  }

  const progress = Math.round(((Number(campaign.raised) || 0) / (Number(campaign.goal) || 1)) * 100);

  if (progress < 100) {
    return `
      <div class="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Saque da arrecadação</h3>
        <p class="text-[13px] text-slate-500 font-inter">Disponível quando a campanha atingir 100% da meta. Faltam ${formatBRL(Math.max(0, Number(campaign.goal) - Number(campaign.raised)))}.</p>
      </div>`;
  }

  const available = getAvailableToWithdraw(campaign);
  const withdrawn = getWithdrawnTotal(campaign);
  const withdrawals = campaign.withdrawals || [];

  return `
    <div class="mt-6 bg-white border border-slate-200 rounded-2xl p-5 md:p-6" id="withdraw-panel">
      <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Saque da arrecadação</h3>
      <p class="text-[13px] text-slate-500 font-inter mb-4">Arrecadado: ${formatBRL(campaign.raised)} · Já sacado: ${formatBRL(withdrawn)}</p>

      ${available > 0 ? `
        <div class="flex flex-col sm:flex-row gap-3 sm:items-end mb-2">
          <label class="block flex-1">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Quanto você quer sacar?</span>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-400 pointer-events-none">R$</span>
              <input type="text" inputmode="numeric" data-money id="withdraw-amount" data-max="${available}" value="${formatMoney(available)}" class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter">
            </div>
            <p id="withdraw-amount-error" class="hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
          </label>
          <button type="button" id="withdraw-btn" class="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter shrink-0">
            Sacar
          </button>
        </div>
        <p class="text-[12px] text-slate-400 font-inter mb-4">Disponível para saque: ${formatBRL(available)}.</p>
        <div id="withdraw-confirm" class="hidden pt-4 border-t border-slate-100">
          <p class="text-[13px] text-slate-500 font-inter mb-4" id="withdraw-confirm-text"></p>
          ${PayoutDestination(session?.email, session)}
          <div class="flex gap-3">
            <button type="button" id="withdraw-cancel" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-[13px] font-inter hover:border-slate-300 transition-all">Cancelar</button>
            <button type="button" id="withdraw-confirm-btn" class="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-[13px] font-inter transition-all">Confirmar saque</button>
          </div>
        </div>
      ` : `<p class="text-[13px] text-emerald-600 font-inter font-semibold">Tudo o que foi arrecadado já foi sacado.</p>`}

      ${withdrawals.length ? `
        <div class="flex flex-col gap-2 mt-5 pt-4 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter mb-1">Histórico de saques</p>
          ${withdrawals.slice().reverse().map((w) => `
            <div class="flex items-start justify-between gap-3 text-[13px] font-inter">
              <span class="text-slate-500 min-w-0">
                ${formatDate(w.withdrawnAt)}
                ${w.payoutAccountId ? `<span class="block text-[12px] text-slate-400 truncate">${escapeHtml(describePayoutAccount(getPayoutAccount(session?.email, w.payoutAccountId)))}</span>` : ''}
              </span>
              <span class="font-bold text-slate-900 shrink-0">${formatBRL(w.amount)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>`;
}

/* ── Conta de destino do saque ───────────────────────────────────────────────
   Dinheiro saindo da plataforma precisa ter endereço explícito. O bloco abaixo
   entra na etapa de confirmação (não antes): pedir dados bancários para quem só
   está olhando o painel seria fricção sem motivo. Na confirmação, a pergunta
   "para onde vai?" é a pergunta certa, e ela também serve de segunda leitura
   antes de uma ação que não dá para desfazer. */

function PayoutAccountOption(account, checked) {
  return `
    <label class="payout-account flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${checked ? 'border-violet-500 bg-violet-50/60' : 'border-slate-200 hover:border-slate-300'}">
      <input type="radio" name="payout-account" value="${escapeHtml(account.id)}" class="sr-only" ${checked ? 'checked' : ''}>
      <span class="payout-radio w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${checked ? 'border-violet-600' : 'border-slate-300'}">
        <span class="w-2 h-2 rounded-full bg-violet-600 ${checked ? '' : 'hidden'}"></span>
      </span>
      <span class="min-w-0">
        <span class="block font-bold text-slate-900 text-[13px] font-manrope truncate">${escapeHtml(account.bank)}</span>
        <span class="block text-[12px] text-slate-500 font-inter truncate">${escapeHtml(payoutAccountTypeLabel(account.type))} · Ag. ${escapeHtml(account.agency)} · Conta ${escapeHtml(account.account)}</span>
      </span>
    </label>`;
}


function PayoutDestination(email, session) {
  const accounts = getPayoutAccounts(email);
  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter';

  return `
    <div id="payout-destination" class="mb-4">
      <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter mb-2">Conta de destino</p>

      <div id="payout-account-list" class="flex flex-col gap-2 ${accounts.length ? '' : 'hidden'}">
        ${accounts.map((a, i) => PayoutAccountOption(a, i === 0)).join('')}
        <button type="button" id="payout-add-toggle" class="self-start inline-flex items-center gap-1.5 text-[13px] font-bold text-violet-600 hover:text-violet-700 font-inter mt-0.5">
          ${icon('plus', 'w-3.5 h-3.5')} Usar outra conta
        </button>
      </div>

      <div id="payout-form" class="${accounts.length ? 'hidden' : ''} border border-slate-200 rounded-xl p-4 bg-slate-50/70 mt-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="block sm:col-span-2">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Banco</span>
            <select name="payoutBank" data-searchable="true" data-search-placeholder="Buscar banco..." class="select-field ${inputClass}">
              <option value="">Selecione ou busque</option>
              ${PAYOUT_BANKS.map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('')}
            </select>
          </label>
          <label class="block sm:col-span-2">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Tipo de conta</span>
            <select name="payoutType" class="select-field ${inputClass}">
              ${PAYOUT_ACCOUNT_TYPES.map((t) => `<option value="${escapeHtml(t.value)}">${escapeHtml(t.label)}</option>`).join('')}
            </select>
          </label>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Agência</span>
            <input type="text" name="payoutAgency" inputmode="numeric" maxlength="6" placeholder="0001" class="${inputClass}">
          </label>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Conta com dígito</span>
            <input type="text" name="payoutAccount" maxlength="14" placeholder="12345-6" class="${inputClass}">
          </label>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Titular</span>
            <input type="text" name="payoutHolder" value="${escapeHtml(session?.name || '')}" placeholder="Nome como está no banco" class="${inputClass}">
          </label>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">CPF ou CNPJ do titular</span>
            <input type="text" name="payoutDocument" data-mask="cpfcnpj" inputmode="numeric" placeholder="000.000.000-00" class="${inputClass}">
          </label>
        </div>
        <p class="text-[12px] text-slate-400 font-inter mt-3">A conta precisa estar no nome do titular da campanha. O repasse cai em até 2 dias úteis.</p>
        <p id="payout-form-error" class="hidden text-red-500 text-[12px] font-inter mt-2"></p>
        <div class="flex gap-2 mt-3">
          <button type="button" id="payout-form-cancel" class="${accounts.length ? '' : 'hidden'} border-2 border-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-[13px] font-inter hover:border-slate-300 transition-all">Cancelar</button>
          <button type="button" id="payout-form-save" class="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-[13px] font-inter transition-all">Salvar conta</button>
        </div>
      </div>
    </div>`;
}

/** Liga o bloco acima e devolve o id da conta escolhida — `null` enquanto não houver
 *  nenhuma, que é o que trava o botão de confirmar. */
function wirePayoutDestination(email, onChange) {
  const root = document.getElementById('payout-destination');
  if (!root) return { getSelectedId: () => null };

  const listEl = root.querySelector('#payout-account-list');
  const formEl = root.querySelector('#payout-form');

  const paintRadios = () => {
    root.querySelectorAll('.payout-account').forEach((label) => {
      const checked = label.querySelector('input').checked;
      label.className = `payout-account flex items-center gap-3 border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${checked ? 'border-violet-500 bg-violet-50/60' : 'border-slate-200 hover:border-slate-300'}`;
      const dot = label.querySelector('.payout-radio');
      dot.className = `payout-radio w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${checked ? 'border-violet-600' : 'border-slate-300'}`;
      dot.firstElementChild.classList.toggle('hidden', !checked);
    });
    onChange?.();
  };

  root.addEventListener('change', (e) => {
    if (e.target.name === 'payout-account') paintRadios();
  });

  root.querySelector('#payout-add-toggle')?.addEventListener('click', () => {
    formEl.classList.remove('hidden');
    root.querySelector('#payout-form-cancel')?.classList.remove('hidden');
    formEl.querySelector('[name="payoutAgency"]')?.focus();
  });

  root.querySelector('#payout-form-cancel')?.addEventListener('click', () => {
    formEl.classList.add('hidden');
  });

  root.querySelector('#payout-form-save')?.addEventListener('click', () => {
    const errorEl = root.querySelector('#payout-form-error');
    const get = (name) => formEl.querySelector(`[name="${name}"]`).value.trim();
    const bank = get('payoutBank');
    const agency = get('payoutAgency');
    const account = get('payoutAccount');
    const holder = get('payoutHolder');
    const doc = get('payoutDocument');

    const digits = doc.replace(/\D/g, '');
    let problem = null;
    if (!bank) problem = 'Escolha o banco.';
    else if (!agency) problem = 'Informe a agência.';
    else if (!account) problem = 'Informe a conta com o dígito.';
    else if (!holder) problem = 'Informe o nome do titular.';
    else if (digits.length !== 11 && digits.length !== 14) problem = 'CPF ou CNPJ incompleto.';

    if (problem) {
      errorEl.textContent = problem;
      errorEl.classList.remove('hidden');
      return;
    }
    errorEl.classList.add('hidden');

    const saved = addPayoutAccount(email, { bank, type: get('payoutType'), agency, account, holder, document: doc });
    listEl.classList.remove('hidden');
    listEl.insertAdjacentHTML('afterbegin', PayoutAccountOption(saved, true));
    listEl.querySelectorAll('input[name="payout-account"]').forEach((r, i) => { r.checked = i === 0; });
    formEl.classList.add('hidden');
    ['payoutAgency', 'payoutAccount', 'payoutDocument'].forEach((n) => { formEl.querySelector(`[name="${n}"]`).value = ''; });
    paintRadios();
  });

  return {
    getSelectedId: () => root.querySelector('input[name="payout-account"]:checked')?.value || null,
  };
}

/** The checkpoint-based saque flow: each checkpoint is its own bucket, worth its slice of what was
 * actually raised (minus anything refunded to backers who left right there) — nothing to type in,
 * just a "Sacar" button per resolved checkpoint that still has money in it. */
function CheckpointWithdrawPanel(campaign) {
  const session = getCreatorSession();
  const checkpoints = [...(campaign.checkpoints || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const withdrawn = getWithdrawnTotal(campaign);
  const withdrawals = campaign.withdrawals || [];

  return `
    <div class="mt-6 bg-white border border-slate-200 rounded-2xl p-5 md:p-6" id="withdraw-panel">
      <h3 class="font-manrope font-bold text-slate-900 text-[15px] mb-1">Saque da arrecadação</h3>
      <p class="text-[13px] text-slate-500 font-inter mb-4">Arrecadado: ${formatBRL(campaign.raised)} · Já sacado: ${formatBRL(withdrawn)}</p>

      <div class="flex flex-col gap-3">
        ${checkpoints.map((cp) => {
          const status = getCheckpointStatus(cp);
          const net = getCheckpointNetAmount(campaign, cp);
          const available = getCheckpointAvailableToWithdraw(campaign, cp);

          let rightSide;
          if (status !== 'resolved') {
            rightSide = `<span class="text-[12px] font-bold text-slate-400 shrink-0">${status === 'upcoming' ? 'Bloqueado' : 'Em decisão'}</span>`;
          } else if (net === 0) {
            rightSide = `<span class="text-[12px] font-bold text-slate-400 shrink-0">Reembolsado</span>`;
          } else if (available > 0) {
            rightSide = `
              <button type="button" class="checkpoint-withdraw-btn bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg text-[13px] font-inter shrink-0 transition-all" data-checkpoint-id="${escapeHtml(cp.id)}" data-amount="${available}" data-title="${escapeHtml(cp.title)}">
                Sacar ${formatBRL(available)}
              </button>`;
          } else {
            rightSide = `<span class="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-600 shrink-0">${icon('check', 'w-3.5 h-3.5')} Sacado</span>`;
          }

          return `
            <div class="flex items-center justify-between gap-3 border border-slate-200 rounded-xl px-4 py-3">
              <div class="min-w-0">
                <p class="font-bold text-slate-900 text-[13px] font-manrope truncate">${escapeHtml(cp.title)}</p>
                <p class="text-[12px] text-slate-500 font-inter">${formatDate(cp.date)} · ${formatBRL(cp.amount)}</p>
              </div>
              ${rightSide}
            </div>`;
        }).join('')}
      </div>

      <div id="checkpoint-withdraw-confirm" class="hidden mt-4 pt-4 border-t border-slate-100">
        <p class="text-[13px] text-slate-500 font-inter mb-4" id="checkpoint-withdraw-confirm-text"></p>
        ${PayoutDestination(session?.email, session)}
        <div class="flex gap-3">
          <button type="button" id="checkpoint-withdraw-cancel" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-[13px] font-inter hover:border-slate-300 transition-all">Cancelar</button>
          <button type="button" id="checkpoint-withdraw-confirm-btn" class="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-[13px] font-inter transition-all">Confirmar saque</button>
        </div>
      </div>

      ${withdrawals.length ? `
        <div class="flex flex-col gap-2 mt-5 pt-4 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter mb-1">Histórico de saques</p>
          ${withdrawals.slice().reverse().map((w) => {
            const cp = checkpoints.find((c) => c.id === w.checkpointId);
            return `
            <div class="flex items-start justify-between gap-3 text-[13px] font-inter">
              <span class="text-slate-500 min-w-0">
                ${formatDate(w.withdrawnAt)}${cp ? ` · ${escapeHtml(cp.title)}` : ''}
                ${w.payoutAccountId ? `<span class="block text-[12px] text-slate-400 truncate">${escapeHtml(describePayoutAccount(getPayoutAccount(session?.email, w.payoutAccountId)))}</span>` : ''}
              </span>
              <span class="font-bold text-slate-900 shrink-0">${formatBRL(w.amount)}</span>
            </div>`;
          }).join('')}
        </div>
      ` : ''}
    </div>`;
}

/** Nudges the creator inside their own decision window — CHECKPOINT_NOTICE_DAYS before a
 * checkpoint's date, since that's the last stretch where an update can still change the outcome. */
function CheckpointNoticeBanner(campaign) {
  if (campaign.status === 'cancelled') return '';
  const upcoming = (campaign.checkpoints || []).find((cp) => isCheckpointNoticeWindow(cp));
  if (!upcoming) return '';
  const days = Math.max(0, Math.ceil((new Date(upcoming.date) - new Date()) / (1000 * 60 * 60 * 24)));
  return `
    <div class="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
      ${icon('alert-triangle', 'w-5 h-5 text-amber-500 shrink-0 mt-0.5')}
      <div>
        <p class="text-[14px] text-amber-800 font-inter"><strong class="font-bold">Checkpoint "${escapeHtml(upcoming.title)}" em ${days} dia${days === 1 ? '' : 's'}.</strong> A partir dessa data seus apoiadores podem decidir continuar ou retirar o apoio ainda não utilizado. Publicar uma atualização agora é a melhor forma de reforçar a confiança antes da decisão.</p>
        <a href="#update-form" class="inline-flex items-center gap-1.5 text-[13px] font-bold text-amber-700 hover:text-amber-900 mt-2">Postar uma atualização ${icon('arrow-right', 'w-3.5 h-3.5')}</a>
      </div>
    </div>`;
}

/** The creator's view into every checkpoint's outcome, backed by the campaign's simulated crowd
 * (see creatorCampaigns.js — creator campaigns aren't wired to real backer accounts yet, so this
 * is a stand-in for what a real per-backer decision feed would show). */
/** The campaign's checkpoint journey — reuses the exact Cronograma stepper (dot + connecting line,
 * "current" step highlighted, "Ver tudo" collapse for long lists) from the public campaign page,
 * in violet instead of blue to match the creator flow. Resolved checkpoints map to "done", the one
 * currently inside its decision window maps to "current", everything else is "upcoming" — the same
 * done/current/upcoming vocabulary the public Cronograma already uses for production milestones. */
function CheckpointsPanel(campaign) {
  const checkpoints = [...(campaign.checkpoints || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!checkpoints.length) return '';

  const withdrawnBackers = getWithdrawnBackers(campaign);
  const canCancelAll = campaign.status !== 'cancelled' && hasAnyCheckpointWithdrawal(campaign);

  const items = checkpoints.map((cp) => {
    const summary = getCheckpointSummary(campaign, cp);
    const status = summary.status === 'resolved' ? 'done' : summary.status === 'deciding' ? 'current' : 'upcoming';
    const lines = [`${formatDate(cp.date)} · ${formatBRL(cp.amount)}`];
    if (cp.description) lines.push(escapeHtml(cp.description));
    if (summary.status !== 'upcoming') {
      lines.push(`${summary.continued} continuaram · ${summary.withdrawn} saíram${summary.withdrawn ? ` · ${formatBRL(summary.refunded)} reembolsados` : ''}`);
    }
    return { title: cp.title, description: lines.join('<br>'), status };
  });

  return `
    <div class="mt-6 bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
      <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 class="font-manrope font-bold text-slate-900 text-[15px]">Checkpoints</h3>
        ${canCancelAll ? `
          <button type="button" id="cancel-campaign-btn" class="inline-flex items-center gap-1.5 text-[12px] font-bold text-red-500 hover:text-red-600">
            ${icon('undo-2', 'w-3.5 h-3.5')} Devolver o dinheiro de todo mundo
          </button>
        ` : ''}
      </div>
      ${Stepper({ items, listId: 'checkpoint-stepper-list', title: '', currentLabel: 'Em decisão', color: 'violet' })}
      ${withdrawnBackers.length ? `
        <div class="mt-4 pt-4 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter mb-2">Apoiadores que saíram</p>
          <div class="flex flex-col gap-1.5">
            ${withdrawnBackers.map((b) => `<div class="flex items-center justify-between text-[13px] font-inter"><span class="text-slate-600">${escapeHtml(b.name)}</span><span class="text-slate-400">${formatBRL(b.amount)}</span></div>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>`;
}

function CancelCampaignModal() {
  return `
    <div id="cancel-campaign-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">Devolver o dinheiro de todo mundo?</h3>
        <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-6">Isso reembolsa 100% do valor de <strong class="font-bold">todos</strong> os apoiadores ainda ativos, mesmo quem decidiu continuar, e cancela a campanha para sempre. Não dá pra desfazer.</p>
        <div class="flex gap-3">
          <button type="button" id="cancel-campaign-modal-cancel" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-[14px] font-inter hover:border-slate-300 transition-all">Voltar</button>
          <button type="button" id="cancel-campaign-modal-confirm" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">Sim, devolver e cancelar</button>
        </div>
      </div>
    </div>`;
}

function CreatorNotFoundCampaign() {
  return `
    <main class="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-5 text-center">
      <h1 class="text-[20px] font-outfit font-bold text-slate-900 mb-3">Campanha não encontrada</h1>
      <a href="?creator=dashboard" class="text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-2">
        ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para minhas campanhas
      </a>
    </main>
    ${Footer()}`;
}

/** "Ver resumo" page for an already-created campaign, reached from the dashboard table. Drafts get
 * a plain "Editar" link straight into the wizard; published campaigns route "Editar" through the
 * backer-notification warning first. */
export function CreatorCampaignSummary(search) {
  const session = getCreatorSession();
  if (!session) return CreatorNotLoggedIn();

  const id = new URLSearchParams(search).get('id');
  let campaign = getCreatorCampaignById(session.email, id);
  if (!campaign) return CreatorNotFoundCampaign();

  const isDraft = campaign.status === 'draft';
  // Simulated backers are generated lazily (once) the first time a non-draft campaign with
  // checkpoints needs them — see creatorCampaigns.js for why they're simulated at all.
  if (!isDraft && campaign.checkpoints?.length) {
    campaign = ensureSimulatedBackers(session.email, id) || campaign;
  }

  return `
    ${CreatorTopBar(session)}
    <main class="min-h-screen bg-slate-50 pb-20 pt-28 md:pt-32">
      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px]">
          <a href="?creator=dashboard" class="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-violet-600 transition-colors mb-6 font-inter font-medium">
            ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para minhas campanhas
          </a>
          <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div class="flex items-center gap-3">
              <h1 class="font-manrope font-bold text-slate-900 text-[20px] md:text-[22px]">Resumo da campanha</h1>
              ${StatusBadge(campaign.status)}
            </div>
            <div class="flex items-center gap-2">
              ${isDraft
                ? `<a href="?creator=new&id=${escapeHtml(campaign.id)}&step=4" class="inline-flex items-center gap-2 border-2 border-violet-200 text-violet-600 font-bold py-2.5 px-5 rounded-xl hover:bg-violet-50 transition-all text-[13px] font-inter">Editar</a>`
                : campaign.status !== 'cancelled'
                  ? `<button type="button" id="summary-edit-btn" class="inline-flex items-center gap-2 border-2 border-violet-200 text-violet-600 font-bold py-2.5 px-5 rounded-xl hover:bg-violet-50 transition-all text-[13px] font-inter">Editar</button>`
                  : ''}
              ${isDraft ? `
                <button type="button" id="summary-publish-btn" data-publish-id="${escapeHtml(campaign.id)}" class="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-[13px] font-inter shadow-lg shadow-violet-600/20">
                  Publicar campanha ${icon('arrow-right', 'w-4 h-4')}
                </button>
              ` : ''}
            </div>
          </div>
          ${!isDraft ? CheckpointNoticeBanner(campaign) : ''}
          ${SummaryMarkup(campaign, { showCheckpointsList: isDraft, showSupportBox: false })}
          ${!isDraft ? CheckpointsPanel(campaign) : ''}
          ${campaign.status !== 'draft' ? WithdrawPanel(campaign) : ''}
          ${campaign.status !== 'draft' ? UpdatesSection(campaign) : ''}
      </div>
    </main>
    ${Footer()}
    ${EditPublishedWarningModal()}
    ${CancelCampaignModal()}
  `;
}

export function initCreatorCampaignSummary() {
  initMoneyInputs();
  wireCreatorUserMenu();
  const session = getCreatorSession();
  const campaignId = new URLSearchParams(window.location.search).get('id');
  const campaign = session && campaignId ? getCreatorCampaignById(session.email, campaignId) : null;

  const openEditWarning = initEditWarningModal((id) => navigate(`?creator=new&id=${id}&step=4`));
  initSteppers();

  // initCreatorTopBar() is safe to use here (unlike in the wizard) — there's nothing unsaved to
  // lose on this read-only-except-for-these-forms page.
  document.getElementById('creator-logout-btn')?.addEventListener('click', () => {
    clearCreatorSession();
    window.location.href = '/';
  });

  document.getElementById('summary-edit-btn')?.addEventListener('click', () => {
    if (campaign) openEditWarning(campaign);
  });

  document.getElementById('summary-publish-btn')?.addEventListener('click', (e) => {
    if (!session) return;
    updateCreatorCampaignStatus(session.email, e.currentTarget.dataset.publishId, 'active');
    navigate(window.location.pathname + window.location.search);
  });

  initDocumentInputs();

  // O destino é o mesmo bloco para os dois fluxos de saque (avulso e por checkpoint):
  // só um dos painéis existe por vez, então há no máximo um #payout-destination na tela.
  const payoutConfirmBtns = ['withdraw-confirm-btn', 'checkpoint-withdraw-confirm-btn']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const payout = wirePayoutDestination(session?.email, () => syncPayoutGate());

  function syncPayoutGate() {
    const ready = !!payout.getSelectedId();
    payoutConfirmBtns.forEach((btn) => {
      btn.disabled = !ready;
      btn.classList.toggle('opacity-40', !ready);
      btn.classList.toggle('cursor-not-allowed', !ready);
      btn.title = ready ? '' : 'Cadastre a conta que vai receber o valor.';
    });
  }
  syncPayoutGate();

  const withdrawBtn = document.getElementById('withdraw-btn');
  const withdrawAmountInput = document.getElementById('withdraw-amount');
  const withdrawAmountError = document.getElementById('withdraw-amount-error');
  const withdrawConfirm = document.getElementById('withdraw-confirm');
  const withdrawConfirmText = document.getElementById('withdraw-confirm-text');

  withdrawBtn?.addEventListener('click', () => {
    const amount = Math.round(parseMoney(withdrawAmountInput.value));
    const max = Number(withdrawAmountInput.dataset.max);
    if (amount <= 0 || amount > max) {
      withdrawAmountError.textContent = amount > max ? `O máximo disponível é ${formatBRL(max)}.` : 'Digite um valor maior que zero.';
      withdrawAmountError.classList.remove('hidden');
      withdrawAmountInput.classList.add('border-red-400');
      return;
    }
    withdrawAmountError.classList.add('hidden');
    withdrawAmountInput.classList.remove('border-red-400');
    withdrawConfirmText.textContent = `Confirma o saque de ${formatBRL(amount)}? Essa ação não pode ser desfeita.`;
    withdrawConfirm.classList.remove('hidden');
  });
  document.getElementById('withdraw-cancel')?.addEventListener('click', () => {
    withdrawConfirm?.classList.add('hidden');
  });
  document.getElementById('withdraw-confirm-btn')?.addEventListener('click', () => {
    if (!session || !campaignId) return;
    const amount = Math.round(parseMoney(withdrawAmountInput.value));
    const payoutAccountId = payout.getSelectedId();
    if (!payoutAccountId) return;
    withdrawCampaignFunds(session.email, campaignId, amount, payoutAccountId);
    navigate(window.location.pathname + window.location.search);
  });

  // Per-checkpoint saque (checkpoint-based campaigns) — one "Sacar" button per resolved
  // checkpoint bucket, confirmed through the same shared inline panel below the list.
  const checkpointWithdrawConfirm = document.getElementById('checkpoint-withdraw-confirm');
  const checkpointWithdrawConfirmText = document.getElementById('checkpoint-withdraw-confirm-text');
  let pendingCheckpointWithdraw = null;

  document.querySelectorAll('.checkpoint-withdraw-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      pendingCheckpointWithdraw = { checkpointId: btn.dataset.checkpointId, amount: Number(btn.dataset.amount) };
      if (checkpointWithdrawConfirmText) {
        checkpointWithdrawConfirmText.textContent = `Confirma o saque de ${formatBRL(pendingCheckpointWithdraw.amount)} do checkpoint "${btn.dataset.title}"? Essa ação não pode ser desfeita.`;
      }
      checkpointWithdrawConfirm?.classList.remove('hidden');
    });
  });
  document.getElementById('checkpoint-withdraw-cancel')?.addEventListener('click', () => {
    checkpointWithdrawConfirm?.classList.add('hidden');
    pendingCheckpointWithdraw = null;
  });
  document.getElementById('checkpoint-withdraw-confirm-btn')?.addEventListener('click', () => {
    if (!session || !campaignId || !pendingCheckpointWithdraw) return;
    const payoutAccountId = payout.getSelectedId();
    if (!payoutAccountId) return;
    withdrawCheckpointFunds(session.email, campaignId, pendingCheckpointWithdraw.checkpointId, pendingCheckpointWithdraw.amount, payoutAccountId);
    navigate(window.location.pathname + window.location.search);
  });

  document.getElementById('update-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!session || !campaignId) return;
    const form = e.currentTarget;
    const title = form.updateTitle.value.trim();
    const description = form.updateDescription.value.trim();
    if (!title || !description) return;
    addCreatorCampaignUpdate(session.email, campaignId, { title, description });
    navigate(window.location.pathname + window.location.search);
  });

  // "Devolver o dinheiro de todo mundo" — the creator's escape hatch once someone has already
  // left at a checkpoint: refund every remaining backer in full and shut the campaign down.
  const cancelModal = document.getElementById('cancel-campaign-modal');
  document.getElementById('cancel-campaign-btn')?.addEventListener('click', () => {
    cancelModal?.classList.remove('hidden');
  });
  document.getElementById('cancel-campaign-modal-cancel')?.addEventListener('click', () => {
    cancelModal?.classList.add('hidden');
  });
  cancelModal?.querySelector('[data-modal-dismiss]')?.addEventListener('click', () => {
    cancelModal.classList.add('hidden');
  });
  document.getElementById('cancel-campaign-modal-confirm')?.addEventListener('click', () => {
    if (!session || !campaignId) return;
    cancelCampaignAndRefundAll(session.email, campaignId);
    navigate(window.location.pathname + window.location.search);
  });
}
