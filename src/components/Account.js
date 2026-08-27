import { findAccountByEmail, getSession, setSession, updateAccount } from '../data/authStore.js';
import { campaignGroups, carouselCtas } from '../data/campaigns.js';
import { getSupportedCampaignIds } from '../data/pledges.js';
import { BRAZILIAN_STATES, wireAddressAutocomplete } from '../utils/location.js';
import { Footer } from './Footer.js';
import { Header } from './Header.js';
import { ProjectCarousel } from './ProjectCarousel.js';
import { escapeHtml, icon } from './utils.js';

/** Section header using the same box-title pattern as "Finalizar apoio" on the checkout panel
 * (font-manrope, bold, slate-900, 18/20px) so every panel title in the app reads the same way. */
function exploreSectionHeader(title, href) {
  return `
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-manrope font-bold text-slate-900 text-[18px] lg:text-[20px]">${title}</h2>
      <a href="${href}" class="group shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-blue-600 transition-colors">
        <span>Ver todos</span>
        ${icon('arrow-right', 'w-3.5 h-3.5 transition-all group-hover:translate-x-1')}
      </a>
    </div>`;
}

/** Picks which "keep exploring" carousel to show below the supporter's data: campaigns close to ending
 * that they haven't backed yet, falling back to newer campaigns, then an empty state if they've backed everything. */
function AccountExploreSection(supportedIds) {
  const ending = campaignGroups.ending.filter((c) => !supportedIds.includes(c.id));
  if (ending.length > 0) {
    return `
      ${exploreSectionHeader('Últimos dias para apoiar', '/#ultimos-dias')}
      ${ProjectCarousel({ campaigns: ending, cta: carouselCtas.ending })}
    `;
  }

  const weekly = campaignGroups.weekly.filter((c) => !supportedIds.includes(c.id));
  if (weekly.length > 0) {
    return `
      ${exploreSectionHeader('Novidades da semana', '/#novidades')}
      ${ProjectCarousel({ campaigns: weekly, cta: carouselCtas.weekly })}
    `;
  }

  return `
    <div class="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
      <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">${icon('check', 'w-6 h-6')}</div>
      <h3 class="text-[16px] font-outfit font-bold text-slate-900 mb-1.5">Você apoiou todas as campanhas em destaque!</h3>
      <p class="text-[14px] text-slate-500 font-inter mb-5">Volte de vez em quando — novas campanhas de RPG chegam toda semana.</p>
      <a href="/" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
        Explorar o catálogo ${icon('arrow-right', 'w-4 h-4')}
      </a>
    </div>
  `;
}

function field({ label, name, type = 'text', value = '', placeholder = '', validate = '', optional = false, disabled = false, note = '', extraInputAttrs = '', icon: iconName = '' }) {
  return `
    <label class="block">
      <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">${escapeHtml(label)}${optional ? ' <span class="text-slate-400 font-normal normal-case">(opcional)</span>' : ''}</span>
      <div class="relative">
        ${iconName ? `<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">${icon(iconName, 'w-[18px] h-[18px]')}</div>` : ''}
        <input type="${type}" name="${name}" value="${escapeHtml(value)}" ${validate ? `data-validate="${validate}"` : ''} ${disabled ? 'disabled' : ''} placeholder="${escapeHtml(placeholder)}" ${extraInputAttrs} class="w-full ${iconName ? 'pl-11 pr-4' : 'px-4'} py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter disabled:opacity-60 disabled:cursor-not-allowed">
      </div>
      ${note ? `<p class="text-[12px] text-slate-400 font-inter mt-1.5">${escapeHtml(note)}</p>` : ''}
      <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5" data-error-for="${name}"></p>
    </label>`;
}

function sectionHeader(text, sectionKey) {
  return `
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-manrope font-bold text-slate-900 text-[18px] lg:text-[20px]">${text}</h2>
      <button type="button" class="account-edit-toggle w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-colors shrink-0" data-section-toggle="${sectionKey}" aria-label="Editar ${text.toLowerCase()}">
        ${icon('pencil', 'w-4 h-4')}
      </button>
    </div>`;
}

function readRow(label, viewId, value, { empty = 'Não informado' } = {}) {
  const hasValue = value && String(value).trim();
  return `
    <div class="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-b-0">
      <span class="text-[13px] text-slate-500 font-inter shrink-0">${escapeHtml(label)}</span>
      <span id="${viewId}" class="text-[14px] font-semibold ${hasValue ? 'text-slate-900' : 'text-slate-400 font-normal'} font-inter text-right truncate">${escapeHtml(hasValue ? value : empty)}</span>
    </div>`;
}

function formatDateBR(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

export function NotLoggedIn(search) {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  return `
    ${Header()}
    <main class="min-h-[70vh] flex flex-col items-center justify-center pt-24 px-5 text-center">
      <h1 class="text-2xl font-bold font-outfit text-slate-900 mb-3">Você precisa entrar para ver essa página</h1>
      <p class="text-slate-500 font-inter mb-6">Faça login para editar seus dados de apoiador.</p>
      <a href="?auth=login&next=${next}" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
        Ir para o login ${icon('arrow-right', 'w-4 h-4')}
      </a>
    </main>
    ${Footer()}
  `;
}

export function Account() {
  const session = getSession();
  if (!session) return NotLoggedIn();

  const account = findAccountByEmail(session.email);
  if (!account) return NotLoggedIn();

  const cpfFormatted = (account.cpf || '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const cepFormatted = (account.cep || '').replace(/(\d{5})(\d{3})/, '$1-$2');
  const stateLabel = BRAZILIAN_STATES.find((s) => s.value === account.state)?.label || '';

  const initial = (account.name || account.email || '?').charAt(0).toUpperCase();
  const supportedIds = getSupportedCampaignIds(account.email);

  const saveCancelButtons = `
    <div class="flex gap-3 mt-2">
      <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl text-[14px]">
        Salvar
      </button>
      <button type="button" class="account-section-cancel flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:border-slate-300 transition-all text-[14px]" data-section-cancel="1">
        Cancelar
      </button>
    </div>`;

  return `
    ${Header()}
    <main class="min-h-screen pb-20 pt-28 md:pt-36 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 12% 15%, rgba(37,99,235,0.06), transparent 25%), radial-gradient(circle at 88% 8%, rgba(14,165,233,0.07), transparent 25%);"></div>

      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px] relative">
        <a href="/" class="inline-flex items-center gap-2 text-[14px] text-slate-500 hover:text-blue-600 transition-colors mb-6 font-inter font-medium">
          ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar
        </a>

        <div id="account-success" class="hidden bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-inter rounded-xl px-4 py-3 mb-6">
          Dados atualizados com sucesso!
        </div>
        <div id="auth-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-6"></div>

        <form id="account-form" novalidate>
            <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-stretch">

              <div class="relative rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 p-6 md:p-8 text-white overflow-hidden shadow-xl shadow-blue-600/20 flex flex-col min-h-[280px]">
                <div class="absolute inset-0 opacity-[0.08] pointer-events-none" style="background-image: radial-gradient(circle, white 1.5px, transparent 1.5px); background-size: 26px 26px;"></div>
                <div class="relative flex flex-col items-center text-center gap-4 h-full">
                  <div class="relative">
                    <div id="account-profile-avatar" class="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-3xl font-bold font-outfit shrink-0 overflow-hidden">
                      ${account.photo ? `<img src="${escapeHtml(account.photo)}" alt="" class="w-full h-full object-cover">` : escapeHtml(initial)}
                    </div>
                    <label for="account-photo-input" class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md cursor-pointer hover:bg-blue-50 transition-colors" aria-label="Alterar foto do perfil">
                      ${icon('camera', 'w-3.5 h-3.5')}
                    </label>
                    <input type="file" accept="image/*" id="account-photo-input" class="hidden">
                  </div>
                  <div class="min-w-0">
                    <span class="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-100 font-outfit">Ficha do Apoiador</span>
                    <h1 id="account-profile-name" class="text-xl font-outfit font-bold leading-tight mt-1">${escapeHtml(account.name || 'Apoiador Trama')}</h1>
                    <p id="account-profile-email" class="text-white/80 text-[13px] font-inter mt-0.5 break-all">${escapeHtml(account.email)}</p>
                  </div>

                  <div class="mt-auto pt-6 w-full">
                    <div class="h-px bg-white/20 mb-5"></div>
                    <a href="?account=pledges" class="flex items-center justify-center gap-2.5 group -m-2 p-2 rounded-xl hover:bg-white/10 transition-colors">
                      <span class="text-2xl font-outfit font-bold leading-none">${supportedIds.length}</span>
                      <span class="text-[12px] font-inter text-white/70 text-left leading-tight group-hover:text-white transition-colors">campanha${supportedIds.length === 1 ? '' : 's'}<br>apoiada${supportedIds.length === 1 ? '' : 's'}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div class="min-w-0">
                <div class="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 mb-6" data-section="identity">
                  ${sectionHeader('Identidade', 'identity')}

                  <div data-section-view="identity">
                    ${readRow('Nome completo', 'account-view-name', account.name)}
                    ${readRow('E-mail', 'account-view-email', account.email)}
                    ${readRow('CPF', 'account-view-cpf', cpfFormatted)}
                    ${readRow('Data de nascimento', 'account-view-birthDate', formatDateBR(account.birthDate))}
                  </div>

                  <div class="hidden flex-col gap-4" data-section-edit="identity">
                    ${field({ label: 'Nome completo', name: 'name', value: account.name, validate: 'required,fullName', icon: 'user' })}
                    ${field({ label: 'E-mail', name: 'email', type: 'email', value: account.email, validate: 'required,email', icon: 'mail' })}
                    ${field({ label: 'CPF', name: 'cpf', value: cpfFormatted, disabled: true, note: 'O CPF não pode ser alterado.', icon: 'credit-card' })}
                    ${field({ label: 'Data de nascimento', name: 'birthDate', type: 'date', value: account.birthDate, validate: 'birthDate', optional: true, icon: 'calendar' })}
                    ${saveCancelButtons}
                  </div>
                </div>

                <div class="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8" data-section="address">
                  ${sectionHeader('Endereço de entrega', 'address')}

                  <div data-section-view="address">
                    ${readRow('CEP', 'account-view-cep', cepFormatted)}
                    ${readRow('Endereço', 'account-view-address', account.address)}
                    ${readRow('Complemento', 'account-view-complement', account.complement)}
                    ${readRow('Estado', 'account-view-state', stateLabel)}
                    ${readRow('Cidade', 'account-view-city', account.city)}
                  </div>

                  <div class="hidden flex-col gap-4" data-section-edit="address">
                    ${field({ label: 'CEP', name: 'cep', value: cepFormatted, validate: 'cep', optional: true, extraInputAttrs: 'inputmode="numeric" maxlength="9"', icon: 'map-pin' })}
                    ${field({ label: 'Endereço', name: 'address', value: account.address, placeholder: 'Rua e número', optional: true })}
                    ${field({ label: 'Complemento', name: 'complement', value: account.complement, placeholder: 'Apto, bloco, referência...', optional: true })}

                    <div class="grid grid-cols-2 gap-3">
                      <label class="block">
                        <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Estado <span class="text-slate-400 font-normal normal-case">(opcional)</span></span>
                        <select name="state" class="select-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
                          <option value="">Selecione</option>
                          ${BRAZILIAN_STATES.map((s) => `<option value="${s.value}" ${s.value === account.state ? 'selected' : ''}>${escapeHtml(s.label)}</option>`).join('')}
                        </select>
                      </label>
                      <label class="block">
                        <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Cidade <span class="text-slate-400 font-normal normal-case">(opcional)</span></span>
                        <select name="city" ${account.state ? '' : 'disabled'} class="select-field w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter disabled:opacity-60 disabled:cursor-not-allowed">
                          <option value="">${account.state ? 'Carregando cidades…' : 'Selecione o estado primeiro'}</option>
                        </select>
                      </label>
                    </div>
                    ${saveCancelButtons}
                  </div>
                </div>
              </div>

            </div>
        </form>

        <div class="mt-6 [overflow-x:clip]">
          ${AccountExploreSection(supportedIds)}
        </div>
      </div>
    </main>
    ${Footer()}
  `;
}

const validators = {
  required: (input) => (input.value.trim() ? null : 'Campo obrigatório.'),
  fullName: (input) => (/\s\S/.test(input.value.trim()) ? null : 'Digite nome e sobrenome.'),
  email: (input) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) ? null : 'E-mail inválido.'),
  cep: (input) => {
    if (!input.value.trim()) return null;
    return /^\d{5}-?\d{3}$/.test(input.value.trim()) ? null : 'CEP inválido. Use o formato 00000-000.';
  },
  birthDate: (input) => {
    if (!input.value) return null;
    const date = new Date(input.value);
    if (Number.isNaN(date.getTime())) return 'Data inválida.';
    if (date > new Date()) return 'Não pode ser uma data no futuro.';
    return null;
  },
};

function validateField(form, input) {
  const rules = (input.dataset.validate || '').split(',').filter(Boolean);
  const errorEl = form.querySelector(`[data-error-for="${input.name}"]`);
  const message = rules.map((rule) => validators[rule]?.(input)).find(Boolean) || null;
  input.classList.toggle('border-red-400', !!message);
  input.classList.toggle('border-slate-200', !message);
  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.classList.toggle('hidden', !message);
  }
  return !message;
}

function validateForm(form) {
  const inputs = Array.from(form.querySelectorAll('[data-validate]'));
  let firstInvalid = null;
  inputs.forEach((input) => {
    if (!validateField(form, input) && !firstInvalid) firstInvalid = input;
  });
  firstInvalid?.focus();
  return !firstInvalid;
}

function setSectionMode(section, mode) {
  const view = document.querySelector(`[data-section-view="${section}"]`);
  const editEl = document.querySelector(`[data-section-edit="${section}"]`);
  if (!view || !editEl) return;
  view.classList.toggle('hidden', mode === 'edit');
  editEl.classList.toggle('hidden', mode !== 'edit');
  editEl.classList.toggle('flex', mode === 'edit');
}

function syncAccountViewRows(form) {
  const setText = (id, value, empty = 'Não informado') => {
    const el = document.getElementById(id);
    if (!el) return;
    const hasValue = value && String(value).trim();
    el.textContent = hasValue ? value : empty;
    el.classList.toggle('text-slate-400', !hasValue);
    el.classList.toggle('font-normal', !hasValue);
    el.classList.toggle('text-slate-900', !!hasValue);
    el.classList.toggle('font-semibold', !!hasValue);
  };

  setText('account-view-name', form.name.value);
  setText('account-view-email', form.email.value);
  setText('account-view-birthDate', formatDateBR(form.birthDate.value));
  setText('account-view-cep', form.cep.value);
  setText('account-view-address', form.address.value);
  setText('account-view-complement', form.complement.value);
  setText('account-view-state', form.state.options[form.state.selectedIndex]?.text !== 'Selecione' ? form.state.options[form.state.selectedIndex]?.text : '');
  setText('account-view-city', form.city.value);

  const profileName = document.getElementById('account-profile-name');
  const profileEmail = document.getElementById('account-profile-email');
  const profileAvatar = document.getElementById('account-profile-avatar');
  if (profileName) profileName.textContent = form.name.value || 'Apoiador Trama';
  if (profileEmail) profileEmail.textContent = form.email.value;
  if (profileAvatar) profileAvatar.textContent = (form.name.value || form.email.value || '?').charAt(0).toUpperCase();
}

export function initAccount() {
  const form = document.getElementById('account-form');
  if (!form) return;

  const session = getSession();
  const originalEmail = session.email;

  document.querySelectorAll('[data-section-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => setSectionMode(btn.dataset.sectionToggle, 'edit'));
  });

  document.getElementById('account-photo-input')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const avatarEl = document.getElementById('account-profile-avatar');
      if (avatarEl) {
        avatarEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = dataUrl;
        img.alt = '';
        img.className = 'w-full h-full object-cover';
        avatarEl.appendChild(img);
      }
      const updated = updateAccount(originalEmail, { photo: dataUrl });
      if (updated) setSession(updated);
    };
    reader.readAsDataURL(file);
  });
  document.querySelectorAll('[data-section-cancel]').forEach((btn) => {
    const section = btn.closest('[data-section]')?.dataset.section;
    if (section) btn.addEventListener('click', () => setSectionMode(section, 'view'));
  });

  form.querySelectorAll('[data-validate]').forEach((input) => {
    const revalidate = () => {
      if (input.classList.contains('border-red-400')) validateField(form, input);
    };
    input.addEventListener('blur', revalidate);
    input.addEventListener('input', revalidate);
  });

  // If a state is already saved, pre-load its cities so the select isn't stuck on "Carregando…".
  const stateSelect = form.querySelector('[name="state"]');
  const citySelect = form.querySelector('[name="city"]');
  const account = findAccountByEmail(originalEmail);
  wireAddressAutocomplete(form);
  if (stateSelect.value) {
    stateSelect.dispatchEvent(new Event('change'));
    // wireAddressAutocomplete's change handler is async; select the saved city once options land.
    const trySelectCity = () => {
      if (citySelect.querySelector(`option[value="${CSS.escape(account.city || '')}"]`)) {
        citySelect.value = account.city;
      } else if (!citySelect.disabled) {
        setTimeout(trySelectCity, 200);
      }
    };
    setTimeout(trySelectCity, 200);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const successBanner = document.getElementById('account-success');
    const errorBanner = document.getElementById('auth-error');
    successBanner.classList.add('hidden');
    errorBanner.classList.add('hidden');

    const newEmail = form.email.value.trim();
    if (newEmail.toLowerCase() !== originalEmail.toLowerCase() && findAccountByEmail(newEmail)) {
      const errorEl = form.querySelector('[data-error-for="email"]');
      form.email.classList.add('border-red-400');
      form.email.classList.remove('border-slate-200');
      if (errorEl) { errorEl.textContent = 'Esse e-mail já está cadastrado.'; errorEl.classList.remove('hidden'); }
      form.email.focus();
      return;
    }

    const updated = updateAccount(originalEmail, {
      name: form.name.value,
      email: newEmail,
      birthDate: form.birthDate.value,
      cep: form.cep.value,
      address: form.address.value,
      complement: form.complement.value,
      city: form.city.value,
      state: form.state.value,
    });

    if (!updated) {
      errorBanner.textContent = 'Não foi possível salvar. Tente novamente.';
      errorBanner.classList.remove('hidden');
      return;
    }

    setSession(updated);
    syncAccountViewRows(form);
    setSectionMode('identity', 'view');
    setSectionMode('address', 'view');
    successBanner.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
