import { getSession } from '../data/authStore.js';
import { Footer } from './Footer.js';
import { escapeHtml, icon } from './utils.js';

/** Deliberately its own chrome (not the marketplace Header) — the creator portal is a distinct
 * area with its own session, so mixing in the backer header's search bar / login state would
 * be misleading about which account is actually signed in. When the person is also logged in as
 * a backer, the site link becomes an explicit "Ver como apoiador" — the counterpart to "Ver como
 * criador" on the backer side — so either header can hand off to the other view. */
/* Mesma casca do header do apoiador: pílula flutuante, mesmo logo, mesmo menu de usuário.
 * A área do criador não tem busca (não se procura campanha aqui, gerencia-se a própria),
 * então o espaço central some em vez de virar outro componente. O que muda é o sotaque:
 * selo "Criadores" e accent violeta. */
export function CreatorTopBar(session) {
  const backerSession = getSession();
  const siteLinkLabel = backerSession ? 'Ver como apoiador' : 'Ver o site';
  const initial = escapeHtml((session.name || '?').charAt(0).toUpperCase());
  const firstName = escapeHtml((session.name || '').split(' ')[0]);

  return `<nav class="fixed top-0 z-50 w-full mt-3 md:mt-6 px-4 md:px-8 xl:px-[10%] 2xl:px-[256px] flex justify-center">
    <div class="w-full flex items-center justify-between bg-white/60 md:bg-white/45 backdrop-blur-2xl backdrop-saturate-200 px-3 sm:px-4 md:px-8 py-3 rounded-3xl lg:rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_12px_40px_rgba(15,23,42,0.15)] border border-white/70 lg:border-white/60 gap-3">

      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <a href="/" id="creator-topbar-logo-link" aria-label="Página inicial Trama" class="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-400 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
            ${icon('rocket', 'w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm')}
          </div>
          <span class="text-xl font-bold tracking-tight text-slate-900 font-outfit uppercase drop-shadow-sm">TRAMA<span class="text-violet-600">.</span></span>
        </a>
        <span class="hidden sm:inline text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">Criadores</span>
      </div>

      <div class="relative shrink-0" id="creator-user-menu">
        <button type="button" id="creator-user-trigger" class="flex items-center gap-2 text-[13px] font-bold text-slate-700 font-inter pr-2 py-1 pl-1 rounded-full hover:bg-slate-100/70 transition-colors" aria-haspopup="true" aria-expanded="false">
          <span class="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-400 text-white flex items-center justify-center text-[12px] font-bold font-outfit shrink-0">${initial}</span>
          <span class="hidden sm:inline">Olá, ${firstName}</span>
          ${icon('chevron-down', 'w-3.5 h-3.5 text-slate-400 transition-transform')}
        </button>
        <div id="creator-user-dropdown" class="hidden absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-[0_12px_32px_rgba(15,23,42,0.12)] overflow-hidden py-1.5">
          <a href="?creator=dashboard" class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors">
            ${icon('layout-grid', 'w-4 h-4')} Minhas campanhas
          </a>
          <a href="?creator=new" class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors">
            ${icon('plus', 'w-4 h-4')} Criar campanha
          </a>
          <a href="/" id="creator-topbar-home-link" class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors">
            ${icon('heart', 'w-4 h-4')} ${siteLinkLabel}
          </a>
          <div class="h-px bg-slate-100 my-1"></div>
          <button type="button" id="creator-logout-btn" class="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors text-left">
            ${icon('log-out', 'w-4 h-4')} Sair
          </button>
        </div>
      </div>
    </div>
  </nav>`;
}


export function wireCreatorUserMenu() {
  const trigger = document.getElementById('creator-user-trigger');
  const dropdown = document.getElementById('creator-user-dropdown');
  if (!trigger || !dropdown) return;
  const chevron = trigger.querySelector('[data-lucide="chevron-down"], svg:last-of-type');

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle('hidden');
    trigger.setAttribute('aria-expanded', String(!open));
    chevron?.classList.toggle('rotate-180', !open);
  });
  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    chevron?.classList.remove('rotate-180');
  });
}

export function initCreatorTopBar(onLogout) {
  wireCreatorUserMenu();
  document.getElementById('creator-logout-btn')?.addEventListener('click', () => {
    onLogout();
    window.location.href = '/';
  });
}

/** Shown for any creator-portal route when there's no creator session. */
export function CreatorNotLoggedIn() {
  return `
    <main class="min-h-screen flex flex-col items-center justify-center px-5 text-center bg-slate-50">
      <div class="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5">${icon('rocket', 'w-6 h-6')}</div>
      <h1 class="text-[22px] font-outfit font-bold text-slate-900 mb-2">Área do criador</h1>
      <p class="text-[14px] text-slate-500 font-inter mb-6 max-w-sm">Entre com sua conta de criador para gerenciar suas campanhas.</p>
      <a href="?creator=login" class="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
        Entrar como criador ${icon('arrow-right', 'w-4 h-4')}
      </a>
    </main>
    ${Footer()}`;
}

/** Confirmation shown before editing an already-published campaign — drafts skip it (no backers to
 * notify yet). Shared by the dashboard's row menu and the campaign summary page's "Editar" button,
 * so the warning (and its wiring) exists in exactly one place. */
export function EditPublishedWarningModal() {
  return `
    <div id="edit-warning-modal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" data-modal-dismiss></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="font-manrope font-bold text-slate-900 text-[17px] mb-2">Isso vai avisar todo mundo</h3>
        <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-6" id="edit-warning-modal-body"></p>
        <div class="flex gap-3">
          <button type="button" id="edit-warning-modal-cancel" class="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-[14px] font-inter hover:border-slate-300 transition-all">
            Cancelar
          </button>
          <button type="button" id="edit-warning-modal-confirm" class="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl text-[14px] font-inter transition-all">
            Sim, quero editar e notificar
          </button>
        </div>
      </div>
    </div>`;
}

/** Wires EditPublishedWarningModal(). Returns openEditWarning(campaign) — call it instead of
 * navigating directly whenever "Editar" is clicked on a non-draft campaign; onConfirm(campaignId)
 * only runs if the creator accepts. Draft campaigns should bypass this and navigate straight there. */
export function initEditWarningModal(onConfirm) {
  const modal = document.getElementById('edit-warning-modal');
  const body = document.getElementById('edit-warning-modal-body');
  const cancelBtn = document.getElementById('edit-warning-modal-cancel');
  const confirmBtn = document.getElementById('edit-warning-modal-confirm');
  if (!modal) return () => {};

  let pendingId = null;

  function close() {
    modal.classList.add('hidden');
    pendingId = null;
  }

  cancelBtn?.addEventListener('click', close);
  modal.querySelector('[data-modal-dismiss]')?.addEventListener('click', close);
  confirmBtn?.addEventListener('click', () => {
    if (pendingId) onConfirm(pendingId);
    close();
  });

  return function openEditWarning(campaign) {
    pendingId = campaign.id;
    const count = Number(campaign.backers) || 0;
    const who = count === 1 ? '1 apoiador acompanhando' : `${count} apoiadores acompanhando`;
    body.textContent = `"${campaign.title}" já tem ${who}. Qualquer alteração salva aqui dispara um e-mail pra todos eles contando o que mudou — não dá pra desfazer depois de enviado. Vale a pena?`;
    modal.classList.remove('hidden');
  };
}
