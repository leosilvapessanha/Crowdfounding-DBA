import {
  createAccount,
  findAccountByCpf,
  findAccountByEmail,
  setSession,
  updateAccountPassword,
  verifyLogin,
} from '../data/authStore.js';
import { escapeHtml, icon } from './utils.js';

/** Standard Brazilian CPF checksum (mod 11) — rejects malformed numbers and the classic all-same-digit fakes. */
function isValidCPF(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (base) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += Number(base[i]) * (base.length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return checkDigit(digits.slice(0, 9)) === Number(digits[9]) && checkDigit(digits.slice(0, 10)) === Number(digits[10]);
}

/** Formats CPF digits as the user types: 000.000.000-00. */
function formatCpfInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

const validators = {
  required: (input) => {
    if (input.type === 'checkbox') return input.checked ? null : 'É preciso aceitar os termos para continuar.';
    return input.value.trim() ? null : 'Campo obrigatório.';
  },
  fullName: (input) => (/\s\S/.test(input.value.trim()) ? null : 'Digite nome e sobrenome.'),
  email: (input) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()) ? null : 'E-mail inválido.'),
  cpf: (input) => (isValidCPF(input.value) ? null : 'CPF inválido.'),
  password: (input) => (/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(input.value) ? null : 'Mínimo 8 caracteres, com letra e número.'),
  birthDate: (input) => {
    if (!input.value) return null; // optional field
    const date = new Date(input.value);
    if (Number.isNaN(date.getTime())) return 'Data inválida.';
    if (date > new Date()) return 'Não pode ser uma data no futuro.';
    if (new Date().getFullYear() - date.getFullYear() > 120) return 'Verifique a data informada.';
    return null;
  },
  cep: (input) => {
    if (!input.value.trim()) return null; // optional field
    return /^\d{5}-?\d{3}$/.test(input.value.trim()) ? null : 'CEP inválido. Use o formato 00000-000.';
  },
};

/** Runs an input's data-validate rules, toggling its [data-error-for] message + border. Returns whether it's valid. */
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

/** Validates every data-validate field in a form; focuses the first invalid one. */
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
  const banner = form.parentElement.querySelector('#auth-error');
  if (!banner) return;
  banner.textContent = message;
  banner.classList.toggle('hidden', !message);
}

function fieldMarkup({ label, name, type = 'text', placeholder = '', validate = '', optional = false, extraInputAttrs = '', icon: iconName = '' }) {
  return `
    <label class="block">
      <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">${escapeHtml(label)}${optional ? ' <span class="text-slate-400 font-normal normal-case">(opcional)</span>' : ''}</span>
      <div class="relative">
        ${iconName ? `<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">${icon(iconName, 'w-[18px] h-[18px]')}</div>` : ''}
        <input type="${type}" name="${name}" ${validate ? `data-validate="${validate}"` : ''} placeholder="${escapeHtml(placeholder)}" ${extraInputAttrs} class="w-full ${iconName ? 'pl-11' : 'px-4'} ${iconName ? 'pr-4' : ''} py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
      </div>
      <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5" data-error-for="${name}"></p>
    </label>`;
}

/** Centered card over a full-bleed brand backdrop, shared by login, signup, and password recovery. */
function AuthShell({ title, subtitle, formHtml, wide = false }) {
  return `
    <div class="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-12 px-5">
      <img src="/assets/Img/pexels-cris-ramos-1837545236-30835420.jpg" class="absolute inset-0 w-full h-full object-cover" style="filter: grayscale(1) contrast(1.05);" alt="" aria-hidden="true">
      <div class="absolute inset-0 bg-blue-600" style="mix-blend-mode: color;"></div>
      <div class="absolute inset-0" style="background: linear-gradient(160deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.35) 45%, rgba(15,23,42,0.65) 100%);"></div>

      <div class="relative z-10 w-full ${wide ? 'max-w-[560px]' : 'max-w-[480px]'}">
        <div class="bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-2xl border border-white/60 p-8 md:p-12">
          <a href="/" class="flex items-center gap-2 mb-8 group w-fit">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105 shrink-0">${icon('hexagon', 'w-4 h-4')}</div>
            <span class="text-lg font-bold font-outfit uppercase tracking-tight text-slate-900">TRAMA<span class="text-blue-600">.</span></span>
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

function Login(search) {
  const next = new URLSearchParams(search).get('next') || '/';
  return AuthShell({
    title: 'Bem-vindo de volta',
    subtitle: 'Entre para acompanhar suas campanhas e apoios.',
    formHtml: `
      <div id="auth-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>

      <form id="login-form" class="flex flex-col gap-4" novalidate>
        ${fieldMarkup({ label: 'E-mail', name: 'email', type: 'email', placeholder: 'voce@email.com', validate: 'required,email', icon: 'mail' })}
        <label class="block">
          <span class="text-[13px] font-semibold text-slate-700 font-inter mb-1.5 block">Senha</span>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">${icon('lock', 'w-[18px] h-[18px]')}</div>
            <input type="password" name="password" data-validate="required" placeholder="Sua senha" class="w-full pl-11 pr-16 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all text-[14px] font-inter">
            <button type="button" class="auth-toggle-password absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-bold text-slate-400 hover:text-blue-600">Mostrar</button>
          </div>
          <p class="field-error hidden text-red-500 text-[12px] font-inter mt-1.5" data-error-for="password"></p>
          <a href="?auth=forgot" class="mt-1.5 inline-block text-[12px] font-semibold text-blue-600 hover:text-blue-700">Esqueci minha senha</a>
        </label>
        <input type="hidden" name="next" value="${escapeHtml(next)}">
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
          Entrar ${icon('arrow-right', 'w-4 h-4')}
        </button>
        <a href="?auth=signup&next=${encodeURIComponent(next)}" class="w-full text-center border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-[15px] font-inter">
          Criar conta
        </a>
      </form>

      <p class="text-[12px] text-slate-400 font-inter text-center mt-6">Conta de teste: <strong class="text-slate-500">apoiador@dba.com.br</strong> / <strong class="text-slate-500">teste01!</strong></p>
    `,
  });
}

function Signup(search) {
  const next = new URLSearchParams(search).get('next') || '/';
  return AuthShell({
    title: 'Criar conta',
    subtitle: 'Leva menos de um minuto para começar.',
    wide: true,
    formHtml: `
      <div id="auth-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>

      <form id="signup-form" class="flex flex-col gap-4" novalidate>
        ${fieldMarkup({ label: 'Nome completo', name: 'name', placeholder: 'Seu nome completo', validate: 'required,fullName', icon: 'user' })}
        ${fieldMarkup({ label: 'E-mail', name: 'email', type: 'email', placeholder: 'voce@email.com', validate: 'required,email', icon: 'mail' })}
        ${fieldMarkup({ label: 'CPF', name: 'cpf', placeholder: '000.000.000-00', validate: 'required,cpf', extraInputAttrs: 'inputmode="numeric" maxlength="14"', icon: 'credit-card' })}
        <div class="grid grid-cols-2 gap-3">
          ${fieldMarkup({ label: 'Senha', name: 'password', type: 'password', placeholder: 'Mín. 8 caracteres', validate: 'required,password', icon: 'lock' })}
          ${fieldMarkup({ label: 'Confirmar senha', name: 'passwordConfirm', type: 'password', placeholder: 'Repita a senha', validate: 'required', icon: 'lock' })}
        </div>
        ${fieldMarkup({ label: 'Data de nascimento', name: 'birthDate', type: 'date', validate: 'birthDate', optional: true, icon: 'calendar' })}

        <label class="flex items-start gap-2.5 mt-1 cursor-pointer">
          <input type="checkbox" name="terms" data-validate="required" class="mt-0.5 w-4 h-4 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200 shrink-0">
          <span class="text-[13px] text-slate-600 font-inter leading-relaxed">Li e aceito os <a href="#" class="text-blue-600 font-semibold hover:text-blue-700">Termos de Uso</a> e a <a href="#" class="text-blue-600 font-semibold hover:text-blue-700">Política de Privacidade</a>.</span>
        </label>
        <p class="field-error hidden text-red-500 text-[12px] font-inter -mt-2.5" data-error-for="terms"></p>

        <input type="hidden" name="next" value="${escapeHtml(next)}">
        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
          Criar conta ${icon('arrow-right', 'w-4 h-4')}
        </button>
        <a href="?auth=login&next=${encodeURIComponent(next)}" class="w-full text-center border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all text-[15px] font-inter">
          Já tenho conta
        </a>
      </form>
    `,
  });
}

function ForgotPassword() {
  return AuthShell({
    title: 'Recuperar acesso',
    subtitle: null,
    formHtml: `
      <div id="forgot-panels">
        <div class="forgot-step" data-forgot-step="request">
          <p class="text-[14px] text-slate-500 font-inter text-center -mt-4 mb-6">Digite seu e-mail e enviaremos um link para você criar uma nova senha.</p>
          <div id="auth-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>
          <form id="forgot-request-form" class="flex flex-col gap-4" novalidate>
            ${fieldMarkup({ label: 'E-mail', name: 'email', type: 'email', placeholder: 'voce@email.com', validate: 'required,email', icon: 'mail' })}
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
              Enviar link de recuperação
            </button>
          </form>
          <a href="?auth=login" class="mt-6 flex items-center justify-center gap-2 text-[13px] text-slate-500 hover:text-blue-600 transition-colors font-inter font-medium">
            ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para o login
          </a>
        </div>

        <div class="forgot-step hidden text-center" data-forgot-step="sent">
          <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-5 mx-auto">${icon('mail-check', 'w-6 h-6')}</div>
          <h2 class="text-[20px] font-outfit font-bold text-slate-900 mb-2">Verifique seu e-mail</h2>
          <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-8">Se <strong id="forgot-sent-email" class="text-slate-700"></strong> estiver cadastrado, você vai receber um link de recuperação em instantes.</p>
          <button type="button" id="forgot-simulate-link" class="w-full border-2 border-blue-200 text-blue-600 font-bold py-3.5 rounded-xl hover:bg-blue-50 transition-all text-[14px] mb-3">
            Simular clique no link do e-mail (demo)
          </button>
          <a href="?auth=login" class="mt-3 flex items-center justify-center gap-2 text-[13px] text-slate-500 hover:text-blue-600 transition-colors font-inter font-medium">
            ${icon('arrow-right', 'w-4 h-4 rotate-180')} Voltar para o login
          </a>
        </div>

        <div class="forgot-step hidden" data-forgot-step="reset">
          <p class="text-[14px] text-slate-500 font-inter text-center -mt-4 mb-6">Escolha uma nova senha para sua conta.</p>
          <div id="forgot-reset-error" class="hidden bg-red-50 border border-red-200 text-red-600 text-[13px] font-inter rounded-xl px-4 py-3 mb-5"></div>
          <form id="forgot-reset-form" class="flex flex-col gap-4" novalidate>
            ${fieldMarkup({ label: 'Nova senha', name: 'password', type: 'password', placeholder: 'Mín. 8 caracteres', validate: 'required,password', icon: 'lock' })}
            ${fieldMarkup({ label: 'Confirmar nova senha', name: 'passwordConfirm', type: 'password', placeholder: 'Repita a senha', validate: 'required', icon: 'lock' })}
            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl mt-2 flex items-center justify-center gap-2 text-[15px]">
              Redefinir senha
            </button>
          </form>
        </div>

        <div class="forgot-step hidden text-center" data-forgot-step="done">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">${icon('check', 'w-6 h-6')}</div>
          <h2 class="text-[20px] font-outfit font-bold text-slate-900 mb-2">Senha redefinida!</h2>
          <p class="text-[14px] text-slate-500 font-inter leading-relaxed mb-7">Sua senha foi alterada com sucesso. Já pode entrar com a nova senha.</p>
          <a href="?auth=login" class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
            Ir para o login
          </a>
        </div>
      </div>
    `,
  });
}

export function Auth(view, search) {
  if (view === 'signup') return Signup(search);
  if (view === 'forgot') return ForgotPassword(search);
  return Login(search);
}

function wirePasswordToggles(root) {
  root.querySelectorAll('.auth-toggle-password').forEach((btn) => {
    const input = btn.previousElementSibling;
    btn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Ocultar' : 'Mostrar';
    });
  });
}

function initLoginForm(root) {
  const form = document.getElementById('login-form');
  if (!form) return;
  wireLiveValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const email = form.email.value;
    const password = form.password.value;
    const account = verifyLogin(email, password);
    if (!account) {
      showBanner(form, 'E-mail ou senha incorretos.');
      return;
    }

    showBanner(form, null);
    setSession(account);
    window.location.href = form.next.value || '/';
  });
}

function initSignupForm(root) {
  const form = document.getElementById('signup-form');
  if (!form) return;
  wireLiveValidation(form);

  // Live CPF formatting as the user types.
  const cpfInput = form.querySelector('[name="cpf"]');
  cpfInput?.addEventListener('input', () => {
    const cursorFromEnd = cpfInput.value.length - cpfInput.selectionStart;
    cpfInput.value = formatCpfInput(cpfInput.value);
    const pos = Math.max(0, cpfInput.value.length - cursorFromEnd);
    cpfInput.setSelectionRange(pos, pos);
  });

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

    // Email and CPF must both be unique across accounts.
    const emailInput = form.querySelector('[name="email"]');
    const cpfInputEl = form.querySelector('[name="cpf"]');
    let hasDuplicate = false;

    if (findAccountByEmail(form.email.value)) {
      const errorEl = form.querySelector('[data-error-for="email"]');
      emailInput.classList.add('border-red-400');
      emailInput.classList.remove('border-slate-200');
      if (errorEl) { errorEl.textContent = 'Esse e-mail já está cadastrado.'; errorEl.classList.remove('hidden'); }
      hasDuplicate = true;
    }
    if (findAccountByCpf(form.cpf.value)) {
      const errorEl = form.querySelector('[data-error-for="cpf"]');
      cpfInputEl.classList.add('border-red-400');
      cpfInputEl.classList.remove('border-slate-200');
      if (errorEl) { errorEl.textContent = 'Esse CPF já está cadastrado.'; errorEl.classList.remove('hidden'); }
      hasDuplicate = true;
    }
    if (hasDuplicate) {
      (emailInput.classList.contains('border-red-400') ? emailInput : cpfInputEl).focus();
      return;
    }

    const account = createAccount({
      email: form.email.value,
      password: form.password.value,
      cpf: form.cpf.value,
      name: form.name.value,
      birthDate: form.birthDate.value,
    });

    setSession(account);
    window.location.href = form.next.value || '/';
  });
}

function initForgotPasswordFlow(root) {
  const panelsRoot = document.getElementById('forgot-panels');
  if (!panelsRoot) return;

  const steps = Array.from(panelsRoot.querySelectorAll('.forgot-step'));
  function goToStep(name) {
    steps.forEach((s) => s.classList.toggle('hidden', s.dataset.forgotStep !== name));
  }

  let pendingEmail = '';

  const requestForm = document.getElementById('forgot-request-form');
  wireLiveValidation(requestForm);
  requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(requestForm)) return;
    pendingEmail = requestForm.email.value.trim();
    document.getElementById('forgot-sent-email').textContent = pendingEmail;
    goToStep('sent');
  });

  document.getElementById('forgot-simulate-link')?.addEventListener('click', () => {
    goToStep('reset');
  });

  const resetForm = document.getElementById('forgot-reset-form');
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

    // Whether or not the email exists, we don't reveal that here — the "sent" step
    // already showed the neutral message. Updating is a no-op for unknown emails.
    updateAccountPassword(pendingEmail, resetForm.password.value);
    goToStep('done');
  });
}

export function initAuth(view) {
  const root = document.getElementById('app');
  if (!root) return;
  wirePasswordToggles(root);

  if (view === 'signup') initSignupForm(root);
  else if (view === 'forgot') initForgotPasswordFlow(root);
  else initLoginForm(root);
}
