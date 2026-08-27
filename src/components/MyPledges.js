import { findAccountByEmail, getSession } from '../data/authStore.js';
import { campaignGroups, getCampaignById } from '../data/campaigns.js';
import { addSupportedCampaign, getPledges } from '../data/pledges.js';
import { NotLoggedIn } from './Account.js';
import { Footer } from './Footer.js';
import { Header } from './Header.js';
import { escapeHtml, icon } from './utils.js';

/** Preview-only stand-in for a supporter with pledges — reachable at "?account=pledges/1" — so the
 * populated state can be reviewed without having to complete a real checkout first. */
const MOCK_PLEDGE_RECORDS = [
  { campaign: campaignGroups.ending[0], rewardTitle: 'Pacote Colecionador', amount: 'R$ 250' },
  { campaign: campaignGroups.featured[0], rewardTitle: 'Apoiador Inicial', amount: 'R$ 50' },
  { campaign: campaignGroups.weekly[2], rewardTitle: null, amount: 'R$ 65' },
].filter((record) => record.campaign);

/** A pledge is a receipt, not a pitch: what was bought, what it cost, and where to check on it —
 * not the campaign's funding progress bar or an "Apoiar" button, since that's already done. */
function pledgeStatusLine(campaign) {
  const progress = Math.min(100, Math.max(0, Number(campaign.progress) || 0));
  if (progress >= 100) return 'Meta atingida — em produção';
  return `${progress}% financiado · ${campaign.time}`;
}

function ViewToggle() {
  return `
    <div class="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1 shrink-0" role="group" aria-label="Alternar visualização">
      <button type="button" class="pledges-view-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors" data-view-btn="cards" aria-pressed="true">
        ${icon('layout-grid', 'w-3.5 h-3.5')} Cards
      </button>
      <button type="button" class="pledges-view-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors" data-view-btn="table" aria-pressed="false">
        ${icon('list', 'w-3.5 h-3.5')} Tabela
      </button>
    </div>`;
}

function PledgeCard({ campaign, rewardTitle, amount }) {
  const projectHref = `?project=${escapeHtml(campaign.id)}`;

  return `
    <div class="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-5">
      <a href="${projectHref}" class="shrink-0 block w-full sm:w-32 h-36 sm:h-24 rounded-xl overflow-hidden bg-slate-100">
        <img src="${escapeHtml(campaign.image)}" alt="${escapeHtml(campaign.alt || campaign.title)}" class="w-full h-full object-cover" loading="lazy" decoding="async">
      </a>

      <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="flex-1 min-w-0">
          <a href="${projectHref}" class="font-manrope font-bold text-slate-900 text-[16px] leading-tight hover:text-blue-600 transition-colors">${escapeHtml(campaign.title)}</a>
          <p class="text-[13px] text-slate-500 font-inter mt-0.5">${escapeHtml(campaign.creator)}</p>
          <div class="flex items-center flex-wrap gap-2 mt-3">
            <span class="text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">${escapeHtml(rewardTitle || 'Apoio livre')}</span>
            <span class="text-[13px] font-bold text-slate-900 font-outfit">${escapeHtml(amount || campaign.price)}</span>
          </div>
        </div>

        <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 sm:text-right sm:border-l sm:border-slate-100 sm:pl-5">
          <span class="text-[12px] text-slate-500 font-inter">${escapeHtml(pledgeStatusLine(campaign))}</span>
          <a href="${projectHref}#campaign-schedule" class="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap">
            Ver cronograma e atualizações ${icon('arrow-right', 'w-3.5 h-3.5')}
          </a>
        </div>
      </div>
    </div>`;
}

function PledgeTableRow({ campaign, rewardTitle, amount }) {
  const projectHref = `?project=${escapeHtml(campaign.id)}`;

  return `
    <tr class="hover:bg-slate-50/60 transition-colors">
      <td class="px-5 py-4">
        <a href="${projectHref}" class="flex items-center gap-3 min-w-0 group">
          <img src="${escapeHtml(campaign.image)}" alt="${escapeHtml(campaign.alt || campaign.title)}" class="w-11 h-11 rounded-lg object-cover shrink-0" loading="lazy" decoding="async">
          <div class="min-w-0">
            <p class="font-manrope font-bold text-slate-900 text-[14px] truncate group-hover:text-blue-600 transition-colors">${escapeHtml(campaign.title)}</p>
            <p class="text-[12px] text-slate-500 font-inter truncate">${escapeHtml(campaign.creator)}</p>
          </div>
        </a>
      </td>
      <td class="px-5 py-4 whitespace-nowrap">
        <span class="text-[11px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">${escapeHtml(rewardTitle || 'Apoio livre')}</span>
      </td>
      <td class="px-5 py-4 text-[13px] font-bold text-slate-900 font-outfit whitespace-nowrap">${escapeHtml(amount || campaign.price)}</td>
      <td class="px-5 py-4 text-[13px] text-slate-500 font-inter whitespace-nowrap">${escapeHtml(pledgeStatusLine(campaign))}</td>
      <td class="px-5 py-4 text-right">
        <a href="${projectHref}#campaign-schedule" class="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap">
          Checkpoints ${icon('arrow-right', 'w-3.5 h-3.5')}
        </a>
      </td>
    </tr>`;
}

function PledgeTable(records) {
  return `
    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/60">
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Campanha</th>
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Recompensa</th>
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Valor</th>
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Status</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${records.map(PledgeTableRow).join('')}
        </tbody>
      </table>
    </div>`;
}

/** Lists what the logged-in user has actually bought — reward tier and amount paid per campaign,
 * with a path to that campaign's schedule/updates instead of a "back this" pitch. Defaults to the
 * card view; "initMyPledges" wires the cards/table toggle client-side. */
export function MyPledges({ mock = false } = {}) {
  const session = getSession();
  if (!session) return NotLoggedIn();

  const account = findAccountByEmail(session.email);
  if (!account) return NotLoggedIn();

  // Materialize the mock records into real storage (idempotent — addSupportedCampaign
  // skips campaigns already pledged) so every other data-driven feature — the pledge
  // alert on the campaign page, the schedule link, etc. — sees the same "as if real" state.
  if (mock) {
    MOCK_PLEDGE_RECORDS.forEach(({ campaign, rewardTitle, amount }) => {
      addSupportedCampaign(account.email, campaign.id, { rewardTitle, amount });
    });
  }

  const records = getPledges(account.email)
    .map((p) => ({ campaign: getCampaignById(p.campaignId), rewardTitle: p.rewardTitle, amount: p.amount }))
    .filter((record) => record.campaign);

  return `
    ${Header()}
    <main class="min-h-screen pb-20 pt-28 md:pt-36 flex flex-col">
      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] flex-1 flex flex-col">
        <a href="?account=edit" class="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-blue-600 transition-colors mb-6 font-inter font-medium">
          ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para meus dados
        </a>

        <div class="flex items-start justify-between gap-4 flex-wrap mb-1">
          <h1 class="font-manrope font-bold text-slate-900 text-[24px] md:text-[28px]">Minhas campanhas apoiadas</h1>
          ${records.length ? ViewToggle() : ''}
        </div>
        ${records.length ? `<p class="text-[14px] text-slate-500 font-inter mb-6">Você apoiou ${records.length} campanha${records.length === 1 ? '' : 's'}.</p>` : ''}

        ${records.length ? `
          <div data-pledges-view="cards" class="flex flex-col gap-4">
            ${records.map(PledgeCard).join('')}
          </div>
          <div data-pledges-view="table" class="hidden">
            ${PledgeTable(records)}
          </div>
        ` : `
          <div class="mt-6 flex-1 bg-white border border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">${icon('heart', 'w-6 h-6')}</div>
            <h3 class="text-[16px] font-manrope font-bold text-slate-900 mb-1.5">Nenhuma campanha apoiada ainda</h3>
            <p class="text-[14px] text-slate-500 font-inter mb-5">Explore o catálogo e encontre um projeto de RPG pra chamar de seu.</p>
            <a href="/" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
              Explorar o catálogo ${icon('arrow-right', 'w-4 h-4')}
            </a>
          </div>
        `}
      </div>
    </main>
    ${Footer()}
  `;
}

/** Wires the cards/table toggle. Nothing to do if the page rendered the empty state (no toggle exists). */
export function initMyPledges() {
  const buttons = Array.from(document.querySelectorAll('.pledges-view-btn'));
  const panels = Array.from(document.querySelectorAll('[data-pledges-view]'));
  if (!buttons.length || !panels.length) return;

  function setView(view) {
    panels.forEach((panel) => panel.classList.toggle('hidden', panel.dataset.pledgesView !== view));
    buttons.forEach((btn) => {
      const active = btn.dataset.viewBtn === view;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('bg-white', active);
      btn.classList.toggle('shadow-sm', active);
      btn.classList.toggle('text-blue-600', active);
      btn.classList.toggle('text-slate-500', !active);
    });
  }

  buttons.forEach((btn) => btn.addEventListener('click', () => setView(btn.dataset.viewBtn)));
  setView('cards');
}
