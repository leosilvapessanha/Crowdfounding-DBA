import { findAccountByEmail, getSession, setSession, updateAccount, verifyLogin } from '../data/authStore.js';
import { getCampaignById, isCampaignEnded } from '../data/campaigns.js';
import { addSupportedCampaign } from '../data/pledges.js';
import { BRAZILIAN_STATES, formatCepInput, wireAddressAutocomplete } from '../utils/location.js';
import { defaultRewards } from './CampaignDetails.js';
import { Footer } from './Footer.js';
import { Header } from './Header.js';
import { escapeHtml, icon, navigate } from './utils.js';

/** Resolves what's being purchased: a fixed reward tier or a free-amount donation. */
function resolveSelection(campaign, params) {
  if (params.get('checkout') === 'reward') {
    const reward = defaultRewards(campaign).find((r) => r.id === params.get('reward'));
    if (reward) return reward;
  }

  const amount = Math.max(0, Math.round(Number(params.get('amount')) || 0));
  return {
    id: 'livre',
    title: 'Apoio livre',
    price: `R$ ${amount.toLocaleString('pt-BR')}`,
    description: 'Contribuição livre, sem recompensa vinculada. Você recebe apenas a nossa gratidão (e a satisfação de ver o projeto sair do papel).',
    includes: [],
  };
}

/** Every other reward tier — so the last-chance upsell shows all real options, not just the next one up. */
function resolveAlternatives(campaign, selection) {
  return defaultRewards(campaign).filter((r) => r.id !== selection.id);
}

/** Reformats a stored card number (digits only) back into "0000 0000 0000 0000" for display. */
function formatCardNumber(digits) {
  return String(digits || '').replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Static, deterministic fake QR code (not a real scannable Pix payload —
 * this is a mock checkout with no backend). Draws the three classic corner
 * "finder" squares plus a pseudo-random module fill so it reads as a QR
 * code at a glance.
 */
function fakeQrSvg() {
  const modules = 21;
  const cell = 8;
  const size = modules * cell;
  const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c > modules - 8) || (r > modules - 8 && c < 7);
  const filled = (r, c) => ((r * 928371 + c * 12345 + 7) % 5) < 2;

  let modulesSvg = '';
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (inFinder(r, c) || !filled(r, c)) continue;
      modulesSvg += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="#0f172a"/>`;
    }
  }

  const finder = (x, y) => `
    <rect x="${x}" y="${y}" width="${cell * 7}" height="${cell * 7}" fill="#0f172a"/>
    <rect x="${x + cell}" y="${y + cell}" width="${cell * 5}" height="${cell * 5}" fill="#fff"/>
    <rect x="${x + cell * 2}" y="${y + cell * 2}" width="${cell * 3}" height="${cell * 3}" fill="#0f172a"/>
  `;

  return `<svg width="168" height="168" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QR Code Pix">
    <rect width="${size}" height="${size}" fill="#fff"/>
    ${modulesSvg}
    ${finder(0, 0)}
    ${finder((modules - 7) * cell, 0)}
    ${finder(0, (modules - 7) * cell)}
  </svg>`;
}

/** A single selectable package card — radio dot + price + description, expanding to show its "includes" list when selected. */
function packageOption(pkg, selected) {
  return `
    <div
      class="package-option flex flex-col gap-3 rounded-2xl border-2 p-5 lg:p-6 cursor-pointer transition-all ${selected ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 hover:border-slate-300'}"
      data-package-id="${escapeHtml(pkg.id)}"
      data-title="${escapeHtml(pkg.title)}"
      data-price="${escapeHtml(pkg.price)}"
      data-selected="${selected}"
    >
      <div class="flex items-start gap-3">
        <span class="package-radio mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? 'border-blue-600' : 'border-slate-300'}">
          <span class="package-radio-dot w-2.5 h-2.5 rounded-full bg-blue-600 ${selected ? '' : 'hidden'}"></span>
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-3">
            <h3 class="font-manrope font-bold text-slate-900 text-[15px] lg:text-[16px] leading-tight">${escapeHtml(pkg.title)}</h3>
            <span class="text-blue-600 font-outfit font-bold text-[16px] lg:text-[18px] shrink-0">${escapeHtml(pkg.price)}</span>
          </div>
          <p class="text-[13px] lg:text-[14px] text-slate-500 font-inter leading-relaxed mt-1">${escapeHtml(pkg.description)}</p>
        </div>
      </div>
      ${pkg.includes.length ? `
        <ul class="package-includes flex flex-col gap-2 pl-8 ${selected ? '' : 'hidden'}">
          ${pkg.includes.map((item) => `
            <li class="flex items-start gap-2 text-[13px] lg:text-[14px] text-slate-600 font-inter">
              <span class="mt-0.5 text-blue-600 shrink-0">${icon('check', 'w-3.5 h-3.5')}</span>
              ${escapeHtml(item)}
            </li>
          `).join('')}
        </ul>
      ` : ''}
    </div>`;
}

function NotFoundCheckout() {
  return `
    ${Header()}
    <main class="min-h-[60vh] flex flex-col items-center justify-center pt-24">
      <h1 class="text-3xl font-bold font-outfit text-slate-900 mb-4">Campanha não encontrada</h1>
      <a href="/" class="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2">
        ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para a home
      </a>
    </main>
    ${Footer()}
  `;
}

/** Last line of defense: every "Apoiar" entry point on the campaign page is already disabled once
 * a campaign ends, but someone could still land here directly via a stale/typed URL — the actual
 * purchase flow has to refuse too, not just the buttons that normally lead to it. */
function EndedCheckout(campaign) {
  return `
    ${Header()}
    <main class="min-h-[60vh] flex flex-col items-center justify-center pt-24 px-5 text-center">
      <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-5">${icon('clock', 'w-6 h-6')}</div>
      <h1 class="text-[22px] font-outfit font-bold text-slate-900 mb-2">Essa campanha já encerrou</h1>
      <p class="text-[14px] text-slate-500 font-inter mb-6 max-w-sm">O prazo para apoiar <em>${escapeHtml(campaign.title)}</em> terminou — não é mais possível contribuir com este projeto.</p>
      <a href="?project=${escapeHtml(campaign.id)}" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
        Ver a campanha ${icon('arrow-right', 'w-4 h-4')}
      </a>
    </main>
    ${Footer()}
  `;
}

export function Checkout(projectId, search) {
  const campaign = getCampaignById(projectId);
  if (!campaign) return NotFoundCheckout();
  if (isCampaignEnded(campaign)) return EndedCheckout(campaign);

  const params = new URLSearchParams(search);
  const selection = resolveSelection(campaign, params);
  const alternatives = resolveAlternatives(campaign, selection);

  const session = getSession();
  const account = session ? findAccountByEmail(session.email) : null;
  const savedCard = account?.card || null;
  const next = encodeURIComponent(`/${search}`);

  return `
    ${Header()}
    <main class="min-h-screen pb-20 pt-28 md:pt-36">
      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px]">
        <a href="?project=${escapeHtml(campaign.id)}" id="checkout-leave-link" class="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-blue-600 transition-colors mb-8 font-inter font-medium">
          ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para a campanha
        </a>

        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">

          <!-- LEFT: campaign + selected package -->
          <div class="lg:w-[58%] shrink-0">
            <h1 class="text-[24px] lg:text-[32px] font-outfit font-bold text-slate-900 leading-tight mb-3">${escapeHtml(campaign.title)}</h1>
            <p class="text-[14px] lg:text-[15px] text-slate-500 font-inter leading-relaxed mb-8">
              Ao confirmar seu apoio, você garante sua participação nesta campanha e ajuda <strong class="text-slate-700">${escapeHtml(campaign.creator)}</strong> a colocar mais essa aventura de pé. O valor é debitado agora, mas repassado ao criador por etapa. A cada checkpoint, você decide se segue ou pede o restante de volta.
            </p>

            ${alternatives.length ? `<p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter mb-3">Ainda dá tempo de trocar de recompensa</p>` : ''}
            <div class="flex flex-col gap-3" id="checkout-packages">
              ${packageOption(selection, true)}
              ${alternatives.map((r) => packageOption(r, false)).join('')}
            </div>
          </div>

          <!-- RIGHT: checkout form -->
          <div class="lg:flex-1 w-full lg:w-auto">
          <div class="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide rounded-[1.75rem]">
          <div class="bg-white border border-slate-200 rounded-[1.75rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] p-6 lg:p-8" id="checkout-panel" data-campaign-id="${escapeHtml(campaign.id)}">

            <h2 class="font-manrope font-bold text-slate-900 text-[18px] lg:text-[20px] mb-6">Finalizar apoio</h2>

            <!-- Step indicator -->
            <div class="mb-8 max-w-[220px] mx-auto flex items-start" id="checkout-steps">
              <div class="flex flex-col items-center gap-2">
                <span class="checkout-step-dot w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-outfit shrink-0" data-step="1">1</span>
                <span class="checkout-step-label text-[11px] font-bold font-inter" data-step="1">Entrega</span>
              </div>
              <div class="checkout-step-line flex-1 h-0.5 mx-2 mt-[13px]"></div>
              <div class="flex flex-col items-center gap-2">
                <span class="checkout-step-dot w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-outfit shrink-0" data-step="2">2</span>
                <span class="checkout-step-label text-[11px] font-bold font-inter" data-step="2">Pagamento</span>
              </div>
            </div>

            <!-- Step 1: delivery details -->
            <div class="checkout-step-panel" data-step-panel="1">
              <div class="flex flex-col gap-4 mb-6">
                <label class="block">
                  <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Nome completo</span>
                  <input type="text" name="name" data-validate="required,fullName" placeholder="Seu nome completo" value="${escapeHtml(account?.name || '')}" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                  <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                </label>
                <label class="block">
                  <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">E-mail</span>
                  <input type="email" name="email" data-validate="required,email" placeholder="voce@email.com" value="${escapeHtml(account?.email || '')}" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                  <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                </label>
                <label class="block max-w-[160px]">
                  <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">CEP</span>
                  <input type="text" name="cep" data-validate="required,cep" inputmode="numeric" maxlength="9" placeholder="00000-000" value="${escapeHtml(account?.cep ? formatCepInput(account.cep) : '')}" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                  <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                </label>
                <label class="block">
                  <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Endereço</span>
                  <input type="text" name="address" data-validate="required" placeholder="Rua e número" value="${escapeHtml(account?.address || '')}" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                  <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                </label>
                <label class="block">
                  <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Complemento <span class="text-slate-400 font-normal normal-case">(opcional)</span></span>
                  <input type="text" name="complement" placeholder="Apto, bloco, referência..." value="${escapeHtml(account?.complement || '')}" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Estado</span>
                    <select name="state" data-validate="required" class="select-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                      <option value="">Selecione</option>
                      ${BRAZILIAN_STATES.map((s) => `<option value="${s.value}" ${account?.state === s.value ? 'selected' : ''}>${escapeHtml(s.label)}</option>`).join('')}
                    </select>
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                  <label class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Cidade</span>
                    <select name="city" data-validate="required" disabled class="select-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter disabled:opacity-60 disabled:cursor-not-allowed">
                      <option value="">Selecione o estado primeiro</option>
                    </select>
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                </div>
                ${session ? `
                  <label class="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" name="saveAddress" checked class="w-4 h-4 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200 shrink-0">
                    <span class="text-[13px] text-slate-600 font-inter">Salvar esses dados para a próxima compra</span>
                  </label>
                ` : ''}
              </div>
              <button type="button" class="checkout-next w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl flex items-center justify-center gap-2 text-[15px]">
                Continuar para pagamento ${icon('arrow-right', 'w-4 h-4')}
              </button>
            </div>

            <!-- Step 2: payment -->
            <div class="checkout-step-panel hidden" data-step-panel="2">
              <div>
                <div class="flex gap-2 mb-5" id="checkout-payment-method">
                  <button type="button" class="checkout-method flex-1 py-3 rounded-xl border-2 border-blue-500 bg-blue-50 text-blue-600 font-bold text-[14px] font-inter transition-all" data-method="pix">Pix</button>
                  <button type="button" class="checkout-method flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-[14px] font-inter transition-all" data-method="card">Cartão</button>
                </div>

                <div id="checkout-pix-panel" class="mb-6 flex flex-col items-center text-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div class="bg-white p-3 rounded-lg border border-slate-200">
                    ${fakeQrSvg()}
                  </div>
                  <p class="text-[13px] font-bold text-slate-900 font-inter">Escaneie o código com o app do seu banco</p>
                  <p class="text-[12px] text-slate-500 font-inter leading-relaxed">
                    O valor só é debitado se a campanha atingir a meta.
                  </p>
                </div>

                <div id="checkout-card-panel" class="hidden flex-col gap-4 mb-6">
                  <label class="block">
                    <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Número do cartão</span>
                    <input type="text" name="cardNumber" data-validate="required,cardNumber" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" value="${savedCard ? escapeHtml(formatCardNumber(savedCard.number)) : ''}" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                    <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="block">
                      <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Validade</span>
                      <input type="text" name="cardExpiry" data-validate="required,cardExpiry" inputmode="numeric" maxlength="5" placeholder="MM/AA" value="${savedCard ? escapeHtml(savedCard.expiry) : ''}" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                      <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                    </label>
                    <label class="block">
                      <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">CVV</span>
                      <input type="text" name="cvv" data-validate="required,cvv" inputmode="numeric" maxlength="4" placeholder="123" class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                      <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5"></p>
                    </label>
                  </div>
                  ${session ? `
                    <label class="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" name="saveCard" checked class="w-4 h-4 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200 shrink-0">
                      <span class="text-[13px] text-slate-600 font-inter">Salvar este cartão para as próximas compras</span>
                    </label>
                  ` : ''}
                </div>

                <div class="flex items-center justify-between text-[14px] font-inter pt-4 border-t border-slate-100">
                  <span class="text-slate-500">Total do apoio</span>
                  <span class="font-bold text-slate-900 font-outfit text-[18px]" id="checkout-total-price">${escapeHtml(selection.price)}</span>
                </div>
              </div>

              <div class="flex gap-3">
                <button type="button" class="checkout-back shrink-0 px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[14px] font-inter hover:border-slate-300 transition-all">
                  Voltar
                </button>
                <button type="button" class="checkout-confirm flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-[15px]">
                  Confirmar apoio ${icon('arrow-right', 'w-4 h-4')}
                </button>
              </div>
            </div>

            <!-- Success state -->
            <div class="checkout-step-panel hidden text-center py-6" data-step-panel="success">
              <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                ${icon('check', 'w-6 h-6')}
              </div>
              <h3 class="font-manrope font-bold text-slate-900 text-[19px] mb-2">Apoio confirmado!</h3>
              <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-7">
                Obrigado por apoiar <em>${escapeHtml(campaign.title)}</em>. Você receberá um e-mail de confirmação com todos os detalhes em instantes.
              </p>
              <a href="?project=${escapeHtml(campaign.id)}" class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
                Voltar para a campanha
              </a>
            </div>

          </div>
          </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Package swap confirmation -->
    <div id="checkout-package-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">Trocar de recompensa?</h3>
        <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-6" id="checkout-package-modal-body"></p>
        <div class="flex gap-3">
          <button type="button" id="checkout-package-modal-cancel" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-[14px] font-inter hover:border-slate-300 transition-all">
            Cancelar
          </button>
          <button type="button" id="checkout-package-modal-confirm" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">
            Confirmar troca
          </button>
        </div>
      </div>
    </div>

    <!-- Leave checkout confirmation -->
    <div id="checkout-leave-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">Você ainda não terminou</h3>
        <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-6">
          Se sair agora, os dados que você preencheu não serão salvos e você vai precisar refazer o apoio depois.
        </p>
        <div class="flex gap-3">
          <button type="button" id="checkout-leave-modal-stay" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-[14px] font-inter hover:border-slate-300 transition-all">
            Continuar apoio
          </button>
          <button type="button" id="checkout-leave-modal-leave" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">
            Sair sem salvar
          </button>
        </div>
      </div>
    </div>

    <!-- Back to step 1 confirmation -->
    <div id="checkout-back-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">Tem certeza que quer voltar?</h3>
        <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-6">
          Você está quase terminando o apoio. Ao voltar, será preciso revisar os dados de entrega antes de retornar para o pagamento.
        </p>
        <div class="flex gap-3">
          <button type="button" id="checkout-back-modal-stay" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-[14px] font-inter hover:border-slate-300 transition-all">
            Continuar pagamento
          </button>
          <button type="button" id="checkout-back-modal-confirm" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">
            Voltar mesmo assim
          </button>
        </div>
      </div>
    </div>

    <!-- Login gate: shown over the checkout when the visitor isn't signed in -->
    <div id="checkout-login-modal" class="${session ? 'hidden' : ''} fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-[28px] shadow-2xl max-w-[420px] w-full p-8 max-h-[90vh] overflow-y-auto">
        <div class="mb-6">
          <h3 class="text-[22px] font-outfit font-bold text-slate-900 mb-1.5">Entre para continuar</h3>
          <p class="text-[14px] text-slate-500 font-inter">Fazendo login a gente já preenche seus dados de entrega e você acompanha esse apoio na sua conta.</p>
        </div>

        <div id="checkout-login-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>

        <form id="checkout-login-form" class="flex flex-col gap-4" novalidate>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">E-mail</span>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">${icon('mail', 'w-[18px] h-[18px]')}</div>
              <input type="email" name="email" data-validate="required,email" placeholder="voce@email.com" class="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
            </div>
            <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5" data-error-for="email"></p>
          </label>
          <label class="block">
            <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Senha</span>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">${icon('lock', 'w-[18px] h-[18px]')}</div>
              <input type="password" name="password" data-validate="required" placeholder="Sua senha" class="w-full pl-11 pr-16 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
              <button type="button" class="checkout-login-toggle-password absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400 hover:text-blue-600">Mostrar</button>
            </div>
            <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5" data-error-for="password"></p>
          </label>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
            Entrar ${icon('arrow-right', 'w-4 h-4')}
          </button>
        </form>

        <button type="button" id="checkout-login-guest" class="w-full text-center text-slate-500 hover:text-blue-600 font-semibold text-[13px] font-inter mt-5 transition-colors">
          Continuar sem entrar
        </button>
        <p class="text-center text-[12px] text-slate-400 font-inter mt-4">
          Não tem conta? <a href="?auth=signup&next=${next}" class="text-blue-600 font-semibold hover:text-blue-700">Criar conta</a>
        </p>
      </div>
    </div>

    ${Footer()}
  `;
}

/**
 * Field validators, keyed by the token used in an input's `data-validate`
 * list (comma-separated, checked in order — first failure wins). Each
 * returns null when valid, or the message to show under the field.
 */
const validators = {
  required: (v) => (v.trim().length > 0 ? null : 'Campo obrigatório.'),
  fullName: (v) => (v.trim().length < 2 || /\s/.test(v.trim()) ? null : 'Digite nome e sobrenome.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'E-mail inválido.'),
  cep: (v) => (/^\d{5}-?\d{3}$/.test(v.trim()) ? null : 'CEP inválido. Use o formato 00000-000.'),
  cardNumber: (v) => (/^\d{13,19}$/.test(v.replace(/\s/g, '')) ? null : 'Número de cartão inválido.'),
  cardExpiry: (v) => {
    const m = v.trim().match(/^(\d{2})\/(\d{2})$/);
    if (!m) return 'Use o formato MM/AA.';
    const month = Number(m[1]);
    if (month < 1 || month > 12) return 'Mês inválido.';
    const expiryEnd = new Date(2000 + Number(m[2]), month, 0);
    const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return expiryEnd >= startOfThisMonth ? null : 'Cartão vencido.';
  },
  cvv: (v) => (/^\d{3,4}$/.test(v.trim()) ? null : 'CVV inválido.'),
};

/** Runs an input's data-validate rules, toggling its error message + border. Returns whether it's valid. */
function validateField(input) {
  const rules = (input.dataset.validate || '').split(',').filter(Boolean);
  const errorEl = input.parentElement.querySelector('.field-error');
  const message = rules.map((rule) => validators[rule]?.(input.value)).find(Boolean) || null;

  input.classList.toggle('border-red-400', !!message);
  input.classList.toggle('border-slate-200', !message);
  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.classList.toggle('hidden', !message);
  }
  return !message;
}

/** Validates every visible data-validate field inside a panel; focuses the first invalid one. */
function validatePanel(panelEl) {
  const inputs = Array.from(panelEl.querySelectorAll('input[data-validate]')).filter((el) => !el.closest('.hidden'));
  let firstInvalid = null;

  inputs.forEach((input) => {
    if (!validateField(input) && !firstInvalid) firstInvalid = input;
  });

  firstInvalid?.focus();
  return !firstInvalid;
}

/** Re-validates a field on blur, and clears its error as soon as the user fixes it. */
function wireLiveValidation(root) {
  root.querySelectorAll('input[data-validate]').forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('border-red-400')) validateField(input);
    });
  });
}

/**
 * Two-step checkout wizard: delivery details → payment. Client-side only
 * (no backend) — "Confirmar apoio" just reveals a success state.
 */
export function initCheckout() {
  const panel = document.getElementById('checkout-panel');
  if (!panel) return;

  const stepDots = Array.from(panel.querySelectorAll('.checkout-step-dot'));
  const stepLabels = Array.from(panel.querySelectorAll('.checkout-step-label'));
  const stepLine = panel.querySelector('.checkout-step-line');
  const stepPanels = Array.from(panel.querySelectorAll('.checkout-step-panel'));

  function paintSteps(activeStep) {
    stepDots.forEach((dot) => {
      const step = Number(dot.dataset.step);
      const state = step < activeStep ? 'done' : step === activeStep ? 'current' : 'upcoming';

      dot.className = 'checkout-step-dot w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold font-outfit shrink-0 ' +
        (state === 'upcoming' ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white');
      // Inline SVG instead of icon() + <i data-lucide>: this markup is
      // injected after main.js's one-time createIcons() pass, so a lucide
      // placeholder tag here would never get swapped for the real icon.
      dot.innerHTML = state === 'done'
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : String(step);
    });

    stepLabels.forEach((label) => {
      const step = Number(label.dataset.step);
      const state = step <= activeStep ? 'active' : 'upcoming';
      label.className = 'checkout-step-label text-[11px] font-bold font-inter ' +
        (state === 'upcoming' ? 'text-slate-400' : 'text-slate-900');
    });

    if (stepLine) stepLine.className = 'checkout-step-line flex-1 h-0.5 mx-2 mt-[13px] ' + (activeStep >= 2 ? 'bg-blue-600' : 'bg-slate-200');
  }

  function goToPanel(name) {
    stepPanels.forEach((p) => p.classList.toggle('hidden', p.dataset.stepPanel !== name));
  }

  wireLiveValidation(panel);

  const step1Panel = panel.querySelector('.checkout-step-panel[data-step-panel="1"]');
  const step2Panel = panel.querySelector('.checkout-step-panel[data-step-panel="2"]');

  const loggedInAccount = (() => {
    const session = getSession();
    return session ? findAccountByEmail(session.email) : null;
  })();
  wireAddressAutocomplete(step1Panel, { initialUf: loggedInAccount?.state, initialCity: loggedInAccount?.city });

  panel.querySelector('.checkout-next')?.addEventListener('click', () => {
    if (!validatePanel(step1Panel)) return;

    if (step1Panel.querySelector('[name="saveAddress"]')?.checked) {
      const session = getSession();
      if (session) {
        updateAccount(session.email, {
          cep: step1Panel.querySelector('[name="cep"]').value.replace(/\D/g, ''),
          address: step1Panel.querySelector('[name="address"]').value,
          complement: step1Panel.querySelector('[name="complement"]').value,
          city: step1Panel.querySelector('[name="city"]').value,
          state: step1Panel.querySelector('[name="state"]').value,
        });
      }
    }

    paintSteps(2);
    goToPanel('2');
  });

  // Going back to step 1 from payment gets its own confirmation — friction
  // on purpose, since the user is one step away from finishing.
  const backModal = document.getElementById('checkout-back-modal');
  const backModalStay = document.getElementById('checkout-back-modal-stay');
  const backModalConfirm = document.getElementById('checkout-back-modal-confirm');

  function closeBackModal() {
    backModal?.classList.add('hidden');
  }

  panel.querySelector('.checkout-back')?.addEventListener('click', () => {
    backModal?.classList.remove('hidden');
  });

  backModalStay?.addEventListener('click', closeBackModal);
  backModal?.querySelector('[data-modal-dismiss]')?.addEventListener('click', closeBackModal);
  backModalConfirm?.addEventListener('click', () => {
    closeBackModal();
    paintSteps(1);
    goToPanel('1');
  });

  panel.querySelector('.checkout-confirm')?.addEventListener('click', () => {
    if (!validatePanel(step2Panel)) return;
    document.getElementById('checkout-steps')?.classList.add('hidden');
    goToPanel('success');

    const session = getSession();
    if (session) {
      const selected = document.querySelector('.package-option[data-selected="true"]');
      addSupportedCampaign(session.email, panel.dataset.campaignId, {
        rewardTitle: selected?.dataset.title || null,
        amount: selected?.dataset.price || null,
      });

      // CVV is never persisted — same rule real card vaults follow, it's re-entered every time.
      const cardPanel = document.getElementById('checkout-card-panel');
      const isCardMethod = cardPanel && !cardPanel.classList.contains('hidden');
      if (isCardMethod && step2Panel.querySelector('[name="saveCard"]')?.checked) {
        updateAccount(session.email, {
          card: {
            number: step2Panel.querySelector('[name="cardNumber"]').value.replace(/\D/g, ''),
            expiry: step2Panel.querySelector('[name="cardExpiry"]').value.trim(),
          },
        });
      }
    }
  });

  const totalPriceEl = document.getElementById('checkout-total-price');

  // Package swap: choosing a different tier changes what's being bought and
  // its price, so it's confirmed through a modal instead of applying silently.
  const packageOptions = Array.from(document.querySelectorAll('#checkout-packages .package-option'));
  const packageModal = document.getElementById('checkout-package-modal');
  const packageModalBody = document.getElementById('checkout-package-modal-body');
  const packageModalCancel = document.getElementById('checkout-package-modal-cancel');
  const packageModalConfirm = document.getElementById('checkout-package-modal-confirm');
  let pendingPackage = null;

  function applyPackage(option) {
    packageOptions.forEach((opt) => {
      const isSelected = opt === option;
      opt.dataset.selected = String(isSelected);
      opt.classList.toggle('border-blue-600', isSelected);
      opt.classList.toggle('bg-blue-50/40', isSelected);
      opt.classList.toggle('border-slate-200', !isSelected);

      const radio = opt.querySelector('.package-radio');
      radio.classList.toggle('border-blue-600', isSelected);
      radio.classList.toggle('border-slate-300', !isSelected);
      radio.querySelector('.package-radio-dot').classList.toggle('hidden', !isSelected);

      opt.querySelector('.package-includes')?.classList.toggle('hidden', !isSelected);
    });

    if (totalPriceEl) totalPriceEl.textContent = option.dataset.price;
  }

  function closePackageModal() {
    packageModal?.classList.add('hidden');
    pendingPackage = null;
  }

  packageOptions.forEach((option) => {
    option.addEventListener('click', () => {
      if (option.dataset.selected === 'true' || !packageModal || !packageModalBody) {
        applyPackage(option);
        return;
      }

      pendingPackage = option;
      const current = packageOptions.find((opt) => opt.dataset.selected === 'true');
      packageModalBody.textContent =
        `Você está trocando "${current?.dataset.title}" por "${option.dataset.title}". `
        + `O valor do seu apoio passa de ${current?.dataset.price} para ${option.dataset.price}.`;
      packageModal.classList.remove('hidden');
    });
  });

  packageModalCancel?.addEventListener('click', closePackageModal);
  packageModal?.querySelector('[data-modal-dismiss]')?.addEventListener('click', closePackageModal);
  packageModalConfirm?.addEventListener('click', () => {
    if (pendingPackage) applyPackage(pendingPackage);
    closePackageModal();
  });

  // Payment method toggle — just switches which panel is shown, no price change.
  const methodBtns = Array.from(panel.querySelectorAll('.checkout-method'));
  const pixPanel = document.getElementById('checkout-pix-panel');
  const cardPanel = document.getElementById('checkout-card-panel');

  methodBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      methodBtns.forEach((b) => {
        b.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-600');
        b.classList.add('border-slate-200', 'text-slate-500');
      });
      btn.classList.remove('border-slate-200', 'text-slate-500');
      btn.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-600');

      const isPix = btn.dataset.method === 'pix';
      pixPanel?.classList.toggle('hidden', !isPix);
      cardPanel?.classList.toggle('hidden', isPix);
      cardPanel?.classList.toggle('flex', !isPix);
    });
  });

  // Leaving checkout ("Voltar para a campanha") drops whatever was typed in,
  // so it's confirmed through a modal instead of navigating immediately.
  const leaveLink = document.getElementById('checkout-leave-link');
  const leaveModal = document.getElementById('checkout-leave-modal');
  const leaveModalStay = document.getElementById('checkout-leave-modal-stay');
  const leaveModalLeave = document.getElementById('checkout-leave-modal-leave');

  function closeLeaveModal() {
    leaveModal?.classList.add('hidden');
  }

  leaveLink?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    leaveModal?.classList.remove('hidden');
  });

  leaveModalStay?.addEventListener('click', closeLeaveModal);
  leaveModal?.querySelector('[data-modal-dismiss]')?.addEventListener('click', closeLeaveModal);
  leaveModalLeave?.addEventListener('click', () => {
    window.history.pushState({}, '', leaveLink.getAttribute('href'));
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  });

  // Login gate: logging in here re-renders the whole checkout page (same URL) so the
  // delivery fields prefill from the account and the header reflects the session.
  // Uses its own validation (data-error-for, like Auth.js) since its fields are wrapped
  // in an icon <div>, unlike the rest of Checkout's fields that validatePanel() expects.
  const loginModal = document.getElementById('checkout-login-modal');
  const loginForm = document.getElementById('checkout-login-form');

  function validateLoginField(input) {
    const rules = (input.dataset.validate || '').split(',').filter(Boolean);
    const errorEl = loginForm.querySelector(`[data-error-for="${input.name}"]`);
    const message = rules.map((rule) => validators[rule]?.(input.value)).find(Boolean) || null;
    input.classList.toggle('border-red-400', !!message);
    input.classList.toggle('border-slate-200', !message);
    if (errorEl) {
      errorEl.textContent = message || '';
      errorEl.classList.toggle('hidden', !message);
    }
    return !message;
  }

  function validateLoginForm() {
    const inputs = Array.from(loginForm?.querySelectorAll('[data-validate]') || []);
    let firstInvalid = null;
    inputs.forEach((input) => {
      if (!validateLoginField(input) && !firstInvalid) firstInvalid = input;
    });
    firstInvalid?.focus();
    return !firstInvalid;
  }

  loginForm?.querySelectorAll('.checkout-login-toggle-password').forEach((btn) => {
    const input = btn.previousElementSibling;
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Ocultar' : 'Mostrar';
    });
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    const account = verifyLogin(loginForm.email.value, loginForm.password.value);
    const errorBanner = document.getElementById('checkout-login-error');
    if (!account) {
      if (errorBanner) {
        errorBanner.textContent = 'E-mail ou senha incorretos.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    setSession(account);
    navigate(window.location.pathname + window.location.search);
  });

  document.getElementById('checkout-login-guest')?.addEventListener('click', () => {
    loginModal?.classList.add('hidden');
  });

  paintSteps(1);
  goToPanel('1');
}
