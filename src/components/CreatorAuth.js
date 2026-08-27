import { getSession } from '../data/authStore.js';
import {
  createCreator,
  findCreatorByEmail,
  setCreatorSession,
  updateCreatorPassword,
  verifyCreatorLogin,
} from '../data/creatorStore.js';
import { escapeHtml, icon } from './utils.js';

const validators = {
  required: (input) => {
    if (input.type === 'checkbox') return input.checked ? null : 'É preciso aceitar os termos para continuar.';
    return input.value.trim() ? null : 'Campo obrigatório.';
  },
  fullName: (input) => (/\s\S/.test(input.value.trim()) ? null : 'Digite nome e sobrenome.'),
  email: (input) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) ? null : 'E-mail inválido.'),
  password: (input) => (/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(input.value) ? null : 'Mínimo 8 caracteres, com letra e número.'),
};

function validateField(form, input) {
  const rules = (input.dataset.validate || '').split(',').filter(Boolean);
  const errorEl = form.querySelector(`[data-error-for="${input.name}"]`);
  const message = rules.map((rule) => validators[rule]?.(input)).find(Boolean) || null;

  if (input.type !== 'checkbox') {
    input.classList.toggle('border-red-400', !!message);
    input.classList.toggle('border-slate-200', !message);
  }
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

function wireLiveValidation(form) {
  form.querySelectorAll('[data-validate]').forEach((input) => {
    const revalidate = () => {
      if (input.type === 'checkbox' || input.classList.contains('border-red-400')) validateField(form, input);
    };
    input.addEventListener('blur', revalidate);
    input.addEventListener('input', revalidate);
    input.addEventListener('change', revalidate);
  });
}

function showBanner(form, message) {
  const banner = form.parentElement.querySelector('#creator-auth-error');
  if (!banner) return;
  banner.textContent = message;
  banner.classList.toggle('hidden', !message);
}

function fieldMarkup({ label, name, type = 'text', placeholder = '', validate = '', icon: iconName = '', value = '' }) {
  return `
    <label class="block">
      <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">${escapeHtml(label)}</span>
      <div class="relative">
        ${iconName ? `<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">${icon(iconName, 'w-[18px] h-[18px]')}</div>` : ''}
        <input type="${type}" name="${name}" ${validate ? `data-validate="${validate}"` : ''} placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" class="w-full ${iconName ? 'pl-11 pr-4' : 'px-4'} py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter">
      </div>
      <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5" data-error-for="${name}"></p>
    </label>`;
}

/** Centered card over a full-bleed backdrop — same shell as the backer Auth pages, tinted violet
 * instead of blue so the creator portal reads as a distinct area of the app. */
function CreatorAuthShell({ title, subtitle, formHtml }) {
  return `
    <div class="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-12 px-5">
      <img src="/assets/Img/pexels-cris-ramos-1837545236-30835420.jpg" class="absolute inset-0 w-full h-full object-cover" style="filter: grayscale(1) contrast(1.05);" alt="" aria-hidden="true">
      <div class="absolute inset-0 bg-violet-700" style="mix-blend-mode: color;"></div>
      <div class="absolute inset-0" style="background: linear-gradient(160deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.35) 45%, rgba(15,23,42,0.65) 100%);"></div>

      <div class="relative z-10 w-full max-w-[480px]">
        <div class="bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-2xl border border-white/60 p-8 md:p-12">
          <a href="/" class="flex items-center gap-2 mb-8 group w-fit">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-400 flex items-center justify-center text-white shadow-lg shadow-violet-600/20 transition-transform group-hover:scale-105 shrink-0">${icon('rocket', 'w-4 h-4')}</div>
            <span class="text-lg font-bold font-outfit uppercase tracking-tight text-slate-900">TRAMA<span class="text-violet-600">.</span></span>
            <span class="text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Criadores</span>
          </a>

          <div class="text-left mb-7">
            <h1 class="text-[24px] font-outfit font-bold text-slate-900 mb-1.5">${title}</h1>
            ${subtitle ? `<p class="text-[14px] text-slate-500 font-inter">${subtitle}</p>` : ''}
          </div>
          ${formHtml}
        </div>
        <p class="text-center text-white/70 text-[12px] font-inter mt-6">© 2026 Trama RPG, Inc.</p>
      </div>
    </div>`;
}

function CreatorLogin(search) {
  const next = new URLSearchParams(search).get('next') || '?creator=dashboard';
  return CreatorAuthShell({
    title: 'Portal do criador',
    subtitle: 'Entre para gerenciar suas campanhas.',
    formHtml: `
      <div id="creator-auth-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>

      <form id="creator-login-form" class="flex flex-col gap-4" novalidate>
        ${fieldMarkup({ label: 'E-mail', name: 'email', type: 'email', placeholder: 'voce@estudio.com', validate: 'required,email', icon: 'mail' })}
        <label class="block">
          <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Senha</span>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">${icon('lock', 'w-[18px] h-[18px]')}</div>
            <input type="password" name="password" data-validate="required" placeholder="Sua senha" class="w-full pl-11 pr-16 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-50 outline-none transition-all text-[14px] font-inter">
            <button type="button" class="creator-auth-toggle-password absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400 hover:text-violet-600">Mostrar</button>
          </div>
          <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5" data-error-for="password"></p>
          <a href="?creator=forgot" class="mt-1.5 inline-block text-[12px] font-semibold text-violet-600 hover:text-violet-700">Esqueci minha senha</a>
        </label>
        <input type="hidden" name="next" value="${escapeHtml(next)}">
        <button type="submit" class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
          Entrar ${icon('arrow-right', 'w-4 h-4')}
        </button>
        <a href="?creator=signup&next=${encodeURIComponent(next)}" class="w-full text-center border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 transition-all text-[15px] font-inter">
          Cadastrar meu estúdio
        </a>
      </form>

      <p class="text-[12px] text-slate-400 font-inter text-center mt-6">Conta de teste (temporária): <strong class="text-slate-500">criador@dba.com</strong> / <strong class="text-slate-500">123456</strong></p>
    `,
  });
}

function CreatorSignup(search) {
  const next = new URLSearchParams(search).get('next') || '?creator=dashboard';
  // Same person, same email: if they're already a backer, start the creator account with that
  // email pre-filled instead of making them think up a second one.
  const backerSession = getSession();
  return CreatorAuthShell({
    title: 'Cadastrar meu estúdio',
    subtitle: 'Leva menos de um minuto para começar.',
    formHtml: `
      <div id="creator-auth-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>

      <form id="creator-signup-form" class="flex flex-col gap-4" novalidate>
        ${fieldMarkup({ label: 'Nome ou estúdio', name: 'name', placeholder: 'Seu nome ou o do estúdio', validate: 'required,fullName', icon: 'user', value: backerSession?.name || '' })}
        ${fieldMarkup({ label: 'E-mail', name: 'email', type: 'email', placeholder: 'voce@estudio.com', validate: 'required,email', icon: 'mail', value: backerSession?.email || '' })}
        <div class="grid grid-cols-2 gap-3">
          ${fieldMarkup({ label: 'Senha', name: 'password', type: 'password', placeholder: 'Mín. 8 caracteres', validate: 'required,password', icon: 'lock' })}
          ${fieldMarkup({ label: 'Confirmar senha', name: 'passwordConfirm', type: 'password', placeholder: 'Repita a senha', validate: 'required', icon: 'lock' })}
        </div>

        <label class="flex items-start gap-2.5 mt-1 cursor-pointer">
          <input type="checkbox" name="terms" data-validate="required" class="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 text-violet-600 focus:ring-2 focus:ring-violet-200 shrink-0">
          <span class="text-[13px] text-slate-600 font-inter leading-relaxed">Li e aceito os <a href="#" class="text-violet-600 font-semibold hover:text-violet-700">Termos de Uso para Criadores</a>.</span>
        </label>
        <p class="field-error hidden text-red-500 text-[12px] font-inter -mt-2.5" data-error-for="terms"></p>

        <input type="hidden" name="next" value="${escapeHtml(next)}">
        <button type="submit" class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
          Criar conta ${icon('arrow-right', 'w-4 h-4')}
        </button>
        <a href="?creator=login&next=${encodeURIComponent(next)}" class="w-full text-center border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 transition-all text-[15px] font-inter">
          Já tenho conta
        </a>
      </form>
    `,
  });
}

function CreatorForgotPassword() {
  return CreatorAuthShell({
    title: 'Recuperar acesso',
    subtitle: null,
    formHtml: `
      <div id="creator-forgot-panels">
        <div class="creator-forgot-step" data-forgot-step="request">
          <p class="text-[14px] text-slate-500 font-inter text-center -mt-4 mb-6">Digite seu e-mail e enviaremos um link para você criar uma nova senha.</p>
          <div id="creator-auth-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>
          <form id="creator-forgot-request-form" class="flex flex-col gap-4" novalidate>
            ${fieldMarkup({ label: 'E-mail', name: 'email', type: 'email', placeholder: 'voce@estudio.com', validate: 'required,email', icon: 'mail' })}
            <button type="submit" class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
              Enviar link de recuperação
            </button>
          </form>
          <a href="?creator=login" class="mt-6 flex items-center justify-center gap-2 text-[13px] text-slate-500 hover:text-violet-600 transition-colors font-inter font-medium">
            ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para o login
          </a>
        </div>

        <div class="creator-forgot-step hidden text-center" data-forgot-step="sent">
          <div class="w-14 h-14 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mb-5 mx-auto">${icon('mail-check', 'w-6 h-6')}</div>
          <h2 class="text-[20px] font-outfit font-bold text-slate-900 mb-2">Verifique seu e-mail</h2>
          <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-8">Se <strong id="creator-forgot-sent-email" class="text-slate-700"></strong> estiver cadastrado, você vai receber um link de recuperação em instantes.</p>
          <button type="button" id="creator-forgot-simulate-link" class="w-full border-2 border-violet-200 text-violet-600 font-bold py-3.5 rounded-xl hover:bg-violet-50 transition-all text-[14px] mb-3">
            Simular clique no link do e-mail (demo)
          </button>
          <a href="?creator=login" class="mt-3 flex items-center justify-center gap-2 text-[13px] text-slate-500 hover:text-violet-600 transition-colors font-inter font-medium">
            ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para o login
          </a>
        </div>

        <div class="creator-forgot-step hidden" data-forgot-step="reset">
          <p class="text-[14px] text-slate-500 font-inter text-center -mt-4 mb-6">Escolha uma nova senha para sua conta.</p>
          <div id="creator-forgot-reset-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>
          <form id="creator-forgot-reset-form" class="flex flex-col gap-4" novalidate>
            ${fieldMarkup({ label: 'Nova senha', name: 'password', type: 'password', placeholder: 'Mín. 8 caracteres', validate: 'required,password', icon: 'lock' })}
            ${fieldMarkup({ label: 'Confirmar nova senha', name: 'passwordConfirm', type: 'password', placeholder: 'Repita a senha', validate: 'required', icon: 'lock' })}
            <button type="submit" class="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
              Redefinir senha
            </button>
          </form>
        </div>

        <div class="creator-forgot-step hidden text-center" data-forgot-step="done">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">${icon('check', 'w-6 h-6')}</div>
          <h2 class="text-[20px] font-outfit font-bold text-slate-900 mb-2">Senha redefinida!</h2>
          <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-7">Sua senha foi alterada com sucesso. Já pode entrar com a nova senha.</p>
          <a href="?creator=login" class="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
            Ir para o login
          </a>
        </div>
      </div>
    `,
  });
}

export function CreatorAuth(view, search) {
  if (view === 'signup') return CreatorSignup(search);
  if (view === 'forgot') return CreatorForgotPassword(search);
  return CreatorLogin(search);
}

function wirePasswordToggles(root) {
  root.querySelectorAll('.creator-auth-toggle-password').forEach((btn) => {
    const input = btn.previousElementSibling;
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Ocultar' : 'Mostrar';
    });
  });
}

function initCreatorLoginForm() {
  const form = document.getElementById('creator-login-form');
  if (!form) return;
  wireLiveValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const creator = verifyCreatorLogin(form.email.value, form.password.value);
    if (!creator) {
      showBanner(form, 'E-mail ou senha incorretos.');
      return;
    }

    showBanner(form, null);
    setCreatorSession(creator);
    window.location.href = form.next.value || '?creator=dashboard';
  });
}

function initCreatorSignupForm() {
  const form = document.getElementById('creator-signup-form');
  if (!form) return;
  wireLiveValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const passwordConfirmError = form.querySelector('[data-error-for="passwordConfirm"]');
    if (form.password.value !== form.passwordConfirm.value) {
      form.passwordConfirm.classList.add('border-red-400');
      form.passwordConfirm.classList.remove('border-slate-200');
      if (passwordConfirmError) {
        passwordConfirmError.textContent = 'As senhas não coincidem.';
        passwordConfirmError.classList.remove('hidden');
      }
      form.passwordConfirm.focus();
      return;
    }

    if (findCreatorByEmail(form.email.value)) {
      const emailInput = form.querySelector('[name="email"]');
      const errorEl = form.querySelector('[data-error-for="email"]');
      emailInput.classList.add('border-red-400');
      emailInput.classList.remove('border-slate-200');
      if (errorEl) { errorEl.textContent = 'Esse e-mail já está cadastrado.'; errorEl.classList.remove('hidden'); }
      emailInput.focus();
      return;
    }

    const creator = createCreator({
      email: form.email.value,
      password: form.password.value,
      name: form.name.value,
    });

    setCreatorSession(creator);
    window.location.href = form.next.value || '?creator=dashboard';
  });
}

function initCreatorForgotPasswordFlow() {
  const panelsRoot = document.getElementById('creator-forgot-panels');
  if (!panelsRoot) return;

  const steps = Array.from(panelsRoot.querySelectorAll('.creator-forgot-step'));
  function goToStep(name) {
    steps.forEach((s) => s.classList.toggle('hidden', s.dataset.forgotStep !== name));
  }

  let pendingEmail = '';

  const requestForm = document.getElementById('creator-forgot-request-form');
  wireLiveValidation(requestForm);
  requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(requestForm)) return;
    pendingEmail = requestForm.email.value.trim();
    document.getElementById('creator-forgot-sent-email').textContent = pendingEmail;
    goToStep('sent');
  });

  document.getElementById('creator-forgot-simulate-link')?.addEventListener('click', () => {
    goToStep('reset');
  });

  const resetForm = document.getElementById('creator-forgot-reset-form');
  wireLiveValidation(resetForm);
  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(resetForm)) return;

    if (resetForm.password.value !== resetForm.passwordConfirm.value) {
      const errorEl = resetForm.querySelector('[data-error-for="passwordConfirm"]');
      resetForm.passwordConfirm.classList.add('border-red-400');
      resetForm.passwordConfirm.classList.remove('border-slate-200');
      if (errorEl) { errorEl.textContent = 'As senhas não coincidem.'; errorEl.classList.remove('hidden'); }
      resetForm.passwordConfirm.focus();
      return;
    }

    updateCreatorPassword(pendingEmail, resetForm.password.value);
    goToStep('done');
  });
}

export function initCreatorAuth(view) {
  const root = document.getElementById('app');
  if (!root) return;
  wirePasswordToggles(root);

  if (view === 'signup') initCreatorSignupForm();
  else if (view === 'forgot') initCreatorForgotPasswordFlow();
  else initCreatorLoginForm();
}
