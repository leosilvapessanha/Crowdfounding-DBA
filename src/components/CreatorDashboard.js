import { deleteCreatorCampaign, getCampaignsByCreator, getCheckpointStatus, updateCreatorCampaignStatus } from '../data/creatorCampaigns.js';
import { clearCreatorSession, getCreatorSession } from '../data/creatorStore.js';
import { CreatorNotLoggedIn, CreatorTopBar, EditPublishedWarningModal, initCreatorTopBar, initEditWarningModal } from './CreatorLayout.js';
import { Footer } from './Footer.js';
import { escapeHtml, formatBRL, icon, navigate } from './utils.js';

// formatBRL now lives in utils.js (the public campaign page needs it too) — re-exported here so
// the creator modules that already import it from this file keep working unchanged.
export { formatBRL } from './utils.js';

const STATUS_TABS = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Em andamento' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'ended', label: 'Encerradas' },
  { value: 'cancelled', label: 'Canceladas' },
];

const STATUS_BADGE = {
  active: { label: 'Em andamento', className: 'bg-blue-50 text-blue-600' },
  draft: { label: 'Rascunho', className: 'bg-slate-100 text-slate-500' },
  ended: { label: 'Encerrada', className: 'bg-violet-50 text-violet-600' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-600' },
};

const PAGE_SIZE = 10;

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('pt-BR');
}

export function StatusBadge(status) {
  const badge = STATUS_BADGE[status] || STATUS_BADGE.draft;
  return `<span class="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${badge.className}">${badge.label}</span>`;
}

/** The next checkpoint still ahead of the campaign — the date the creator has to plan around, since
 * it's when backers get to decide again. Highlighted while its decision window is actually open. */
function NextCheckpointCell(campaign) {
  const checkpoints = [...(campaign.checkpoints || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!checkpoints.length) return '<span class="text-slate-300">—</span>';

  const pending = checkpoints.find((cp) => getCheckpointStatus(cp) !== 'resolved');
  if (!pending) return '<span class="text-slate-400">Todos concluídos</span>';

  const deciding = getCheckpointStatus(pending) === 'deciding';
  return `
    <span class="${deciding ? 'font-bold text-amber-600' : 'text-slate-500'}">${formatDate(pending.date)}</span>
    <span class="block text-[12px] text-slate-400 truncate max-w-[160px]">${deciding ? 'Em decisão' : escapeHtml(pending.title)}</span>`;
}

function CampaignRow(campaign) {
  const progress = Math.min(100, Math.round(((Number(campaign.raised) || 0) / (Number(campaign.goal) || 1)) * 100));

  return `
    <tr class="hover:bg-slate-50/60 transition-colors">
      <td class="px-5 py-4 text-[13px] text-slate-500 font-inter whitespace-nowrap">${formatDate(campaign.createdAt)}</td>
      <td class="px-5 py-4">
        <div class="flex items-center gap-3 min-w-0">
          <img src="${escapeHtml(campaign.image)}" alt="" class="w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-100">
          <div class="min-w-0">
            <p class="font-manrope font-bold text-slate-900 text-[14px] truncate">${escapeHtml(campaign.title)}</p>
            <p class="text-[12px] text-slate-500 font-inter truncate">${escapeHtml(campaign.category)}</p>
          </div>
        </div>
      </td>
      <td class="px-5 py-4 text-[13px] font-bold text-slate-900 font-outfit whitespace-nowrap">${formatBRL(campaign.raised)} <span class="text-slate-400 font-normal">/ ${formatBRL(campaign.goal)} · ${progress}%</span></td>
      <td class="px-5 py-4 text-[13px] font-inter whitespace-nowrap">${NextCheckpointCell(campaign)}</td>
      <td class="px-5 py-4 whitespace-nowrap">${StatusBadge(campaign.status)}</td>
      <td class="px-5 py-4 text-right">
        <button type="button" class="row-menu-trigger p-2 -m-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" data-campaign-id="${escapeHtml(campaign.id)}" data-status="${escapeHtml(campaign.status)}" data-title="${escapeHtml(campaign.title)}" data-backers="${Number(campaign.backers) || 0}" aria-label="Ações da campanha" aria-haspopup="true" aria-expanded="false">
          ${icon('more-vertical', 'w-4 h-4')}
        </button>
      </td>
    </tr>`;
}

/** One shared floating menu (positioned via JS, fixed to the viewport) instead of a dropdown
 * per row — a per-row dropdown would sit inside the table's overflow-x-auto wrapper, which (per
 * the CSS overflow-pairing rule) computes overflow-y to non-visible too and clips it.
 * "Editar" and "Excluir" both change meaning per row (edit skips the warning for drafts; delete
 * only ever shows for drafts/ended, never for a live campaign with backers watching it), so their
 * visibility and behavior are set fresh each time the menu opens — see initCreatorDashboard(). */
function RowMenu() {
  return `
    <div id="row-menu" class="hidden fixed z-50 w-44 bg-white rounded-xl border border-slate-200 shadow-[0_12px_32px_rgba(15,23,42,0.12)] overflow-hidden py-1.5" role="menu">
      <a href="?creator=dashboard" id="row-menu-summary" role="menuitem" class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors outline-none focus:bg-slate-50">
        ${icon('arrow-right', 'w-3.5 h-3.5')} Ver resumo
      </a>
      <button type="button" id="row-menu-edit" role="menuitem" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors text-left outline-none focus:bg-slate-50">
        ${icon('pencil', 'w-3.5 h-3.5')} Editar
      </button>
      <button type="button" id="row-menu-publish" class="hidden w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors text-left outline-none focus:bg-emerald-50" role="menuitem">
        ${icon('check', 'w-3.5 h-3.5')} Publicar
      </button>
      <button type="button" id="row-menu-delete" class="hidden w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors text-left outline-none focus:bg-red-50" role="menuitem">
        ${icon('x', 'w-3.5 h-3.5')} Excluir
      </button>
    </div>`;
}

function DeleteCampaignModal() {
  return `
    <div id="delete-campaign-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">Excluir campanha?</h3>
        <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-6" id="delete-campaign-modal-body"></p>
        <div class="flex gap-3">
          <button type="button" id="delete-campaign-modal-cancel" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-[14px] font-inter hover:border-slate-300 transition-all">Cancelar</button>
          <button type="button" id="delete-campaign-modal-confirm" class="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">Excluir definitivamente</button>
        </div>
      </div>
    </div>`;
}

function CampaignTable(campaigns) {
  return `
    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[780px]">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/60">
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Criada em</th>
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Campanha</th>
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Arrecadado</th>
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Próximo checkpoint</th>
            <th class="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest font-inter">Status</th>
            <th class="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${campaigns.map(CampaignRow).join('')}
        </tbody>
      </table>
    </div>`;
}

function Pagination({ statusFilter, currentPage, totalPages, total }) {
  if (totalPages <= 1) return '';
  const pageHref = (p) => `?creator=dashboard&status=${statusFilter}&page=${p}`;
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return `
    <div class="flex items-center justify-between gap-4 mt-4">
      <p class="text-[13px] text-slate-500 font-inter">Página ${currentPage} de ${totalPages} · ${total} campanha${total === 1 ? '' : 's'}</p>
      <div class="flex items-center gap-2">
        <a href="${pageHref(Math.max(1, currentPage - 1))}" class="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors ${prevDisabled ? 'pointer-events-none opacity-40' : ''}" aria-label="Página anterior" aria-disabled="${prevDisabled}">
          ${icon('chevron-left', 'w-4 h-4')}
        </a>
        <a href="${pageHref(Math.min(totalPages, currentPage + 1))}" class="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors ${nextDisabled ? 'pointer-events-none opacity-40' : ''}" aria-label="Próxima página" aria-disabled="${nextDisabled}">
          ${icon('chevron-right', 'w-4 h-4')}
        </a>
      </div>
    </div>`;
}

function EmptyState(statusFilter) {
  const isAll = statusFilter === 'all';
  return `
    <div class="bg-white border border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
      <div class="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">${icon('layout-grid', 'w-6 h-6')}</div>
      <h3 class="text-[16px] font-manrope font-bold text-slate-900 mb-1.5">${isAll ? 'Nenhuma campanha ainda' : 'Nada por aqui'}</h3>
      <p class="text-[14px] text-slate-500 font-inter mb-5">${isAll ? 'Crie sua primeira campanha e comece a arrecadar.' : 'Nenhuma campanha nessa categoria no momento.'}</p>
      ${isAll ? `
        <a href="?creator=new" class="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
          Criar campanha ${icon('plus', 'w-4 h-4')}
        </a>
      ` : ''}
    </div>`;
}

export function CreatorDashboard(search) {
  const session = getCreatorSession();
  if (!session) return CreatorNotLoggedIn();

  const params = new URLSearchParams(search);
  const statusFilter = STATUS_TABS.some((t) => t.value === params.get('status')) ? params.get('status') : 'all';

  const campaigns = getCampaignsByCreator(session.email);
  const counts = {
    all: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
    ended: campaigns.filter((c) => c.status === 'ended').length,
    cancelled: campaigns.filter((c) => c.status === 'cancelled').length,
  };
  const filtered = statusFilter === 'all' ? campaigns : campaigns.filter((c) => c.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, Number(params.get('page')) || 1), totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return `
    ${CreatorTopBar(session)}
    <main class="min-h-screen bg-slate-50 pb-20 pt-28 md:pt-32">
      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px]">
        <div class="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 class="font-manrope font-bold text-slate-900 text-[24px] md:text-[28px] mb-1">Minhas campanhas</h1>
            <p class="text-[14px] text-slate-500 font-inter">Gerencie suas campanhas e acompanhe o financiamento.</p>
          </div>
          <a href="?creator=new" class="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-5 rounded-xl transition-all text-[14px] font-inter shadow-lg shadow-violet-600/20">
            Criar campanha ${icon('plus', 'w-4 h-4')}
          </a>
        </div>

        <div class="flex items-center gap-2 mb-6 max-w-full">
          <button type="button" id="status-tabs-prev" class="hidden shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors" aria-label="Categorias anteriores">
            ${icon('chevron-left', 'w-4 h-4')}
          </button>
          <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 min-w-0 overflow-x-auto hide-scrollbar scroll-smooth" id="status-tabs">
            ${STATUS_TABS.map((t) => `
              <a href="?creator=dashboard&status=${t.value}" class="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors shrink-0 ${t.value === statusFilter ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-700'}">
                ${t.label} <span class="text-[11px] ${t.value === statusFilter ? 'text-white/70' : 'text-slate-400'}">${counts[t.value]}</span>
              </a>
            `).join('')}
          </div>
          <button type="button" id="status-tabs-next" class="hidden shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors" aria-label="Mais categorias">
            ${icon('chevron-right', 'w-4 h-4')}
          </button>
        </div>

        ${filtered.length ? CampaignTable(pageItems) : EmptyState(statusFilter)}
        ${filtered.length ? Pagination({ statusFilter, currentPage, totalPages, total: filtered.length }) : ''}
      </div>
    </main>
    ${Footer()}
    ${RowMenu()}
    ${DeleteCampaignModal()}
    ${EditPublishedWarningModal()}
  `;
}

export function initCreatorDashboard() {
  initCreatorTopBar(clearCreatorSession);

  // Status tabs: prev/next buttons scroll the pill bar itself instead of the page scrolling
  // right to reveal it (that was the actual bug — see the w-full/min-w-0 fix on its container).
  const tabsScroll = document.getElementById('status-tabs');
  const tabsPrev = document.getElementById('status-tabs-prev');
  const tabsNext = document.getElementById('status-tabs-next');

  if (tabsScroll && tabsPrev && tabsNext) {
    const updateTabArrows = () => {
      const canScroll = tabsScroll.scrollWidth > tabsScroll.clientWidth + 1;
      tabsPrev.classList.toggle('hidden', !canScroll || tabsScroll.scrollLeft <= 0);
      tabsPrev.classList.toggle('flex', canScroll && tabsScroll.scrollLeft > 0);
      const atEnd = tabsScroll.scrollLeft + tabsScroll.clientWidth >= tabsScroll.scrollWidth - 1;
      tabsNext.classList.toggle('hidden', !canScroll || atEnd);
      tabsNext.classList.toggle('flex', canScroll && !atEnd);
    };

    tabsPrev.addEventListener('click', () => tabsScroll.scrollBy({ left: -140, behavior: 'smooth' }));
    tabsNext.addEventListener('click', () => tabsScroll.scrollBy({ left: 140, behavior: 'smooth' }));
    tabsScroll.addEventListener('scroll', updateTabArrows, { passive: true });
    window.addEventListener('resize', updateTabArrows);
    updateTabArrows();
  }

  const rowMenu = document.getElementById('row-menu');
  const menuSummaryLink = document.getElementById('row-menu-summary');
  const menuEditBtn = document.getElementById('row-menu-edit');
  const menuPublishBtn = document.getElementById('row-menu-publish');
  const menuDeleteBtn = document.getElementById('row-menu-delete');
  if (!rowMenu) return;

  const openEditWarning = initEditWarningModal((id) => navigate(`?creator=new&id=${id}&step=4`));

  let activeTrigger = null;
  let activeCampaign = null;

  function menuItems() {
    return Array.from(rowMenu.querySelectorAll('[role="menuitem"]')).filter((el) => !el.classList.contains('hidden'));
  }

  function closeRowMenu() {
    rowMenu.classList.add('hidden');
    activeTrigger?.setAttribute('aria-expanded', 'false');
    activeTrigger = null;
    activeCampaign = null;
  }

  document.querySelectorAll('.row-menu-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const reopening = activeTrigger !== trigger;
      const previousTrigger = trigger;
      closeRowMenu();
      if (!reopening) return;

      const { campaignId, status, title, backers } = trigger.dataset;
      activeCampaign = { id: campaignId, status, title, backers: Number(backers) || 0 };

      menuSummaryLink.href = `?creator=summary&id=${campaignId}`;
      menuPublishBtn.classList.toggle('hidden', status !== 'draft');
      menuPublishBtn.dataset.publishId = campaignId;
      // A cancelled campaign already refunded everyone and has nothing left to edit or notify.
      menuEditBtn.classList.toggle('hidden', status === 'cancelled');
      // Deleting a live campaign would pull the rug out from under real backers — only
      // drafts (never published) and ended/cancelled campaigns (already wrapped up) can be removed.
      menuDeleteBtn.classList.toggle('hidden', status === 'active');

      const rect = previousTrigger.getBoundingClientRect();
      rowMenu.style.top = `${rect.bottom + 4}px`;
      rowMenu.style.left = `${rect.right - 176}px`;
      rowMenu.classList.remove('hidden');
      previousTrigger.setAttribute('aria-expanded', 'true');
      activeTrigger = previousTrigger;
      requestAnimationFrame(() => menuItems()[0]?.focus());
    });
  });

  rowMenu.addEventListener('click', (e) => e.stopPropagation());
  rowMenu.addEventListener('keydown', (e) => {
    const items = menuItems();
    const index = items.indexOf(document.activeElement);
    if (e.key === 'Escape') {
      e.stopPropagation();
      const trigger = activeTrigger;
      closeRowMenu();
      trigger?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
  });
  document.addEventListener('click', closeRowMenu);
  window.addEventListener('scroll', closeRowMenu, true);

  menuEditBtn?.addEventListener('click', () => {
    if (!activeCampaign) return;
    const campaign = activeCampaign;
    closeRowMenu();
    if (campaign.status === 'draft') {
      navigate(`?creator=new&id=${campaign.id}&step=4`);
    } else {
      openEditWarning(campaign);
    }
  });

  menuPublishBtn?.addEventListener('click', () => {
    const session = getCreatorSession();
    if (!session || !menuPublishBtn.dataset.publishId) return;
    updateCreatorCampaignStatus(session.email, menuPublishBtn.dataset.publishId, 'active');
    navigate(window.location.pathname + window.location.search);
  });

  // Delete confirmation
  const deleteModal = document.getElementById('delete-campaign-modal');
  const deleteModalBody = document.getElementById('delete-campaign-modal-body');
  const deleteModalCancel = document.getElementById('delete-campaign-modal-cancel');
  const deleteModalConfirm = document.getElementById('delete-campaign-modal-confirm');
  let pendingDelete = null;

  function closeDeleteModal() {
    deleteModal?.classList.add('hidden');
    pendingDelete = null;
  }

  menuDeleteBtn?.addEventListener('click', () => {
    if (!activeCampaign) return;
    pendingDelete = activeCampaign;
    deleteModalBody.textContent = pendingDelete.backers > 0
      ? `"${pendingDelete.title}" tem ${pendingDelete.backers} ${pendingDelete.backers === 1 ? 'apoiador' : 'apoiadores'} no histórico. Excluir remove a campanha e esse histórico para sempre, não dá pra desfazer.`
      : `"${pendingDelete.title}" será apagada para sempre, não dá pra desfazer.`;
    closeRowMenu();
    deleteModal?.classList.remove('hidden');
  });

  deleteModalCancel?.addEventListener('click', closeDeleteModal);
  deleteModal?.querySelector('[data-modal-dismiss]')?.addEventListener('click', closeDeleteModal);
  deleteModalConfirm?.addEventListener('click', () => {
    const session = getCreatorSession();
    if (!session || !pendingDelete) return;
    deleteCreatorCampaign(session.email, pendingDelete.id);
    closeDeleteModal();
    navigate(window.location.pathname + window.location.search);
  });
}
