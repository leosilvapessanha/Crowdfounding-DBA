export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

export function icon(name, className = '') {
  return `<i data-lucide="${escapeHtml(name)}" class="${escapeHtml(className)}" aria-hidden="true"></i>`;
}

/** Currency formatter shared by the creator area and the public campaign page — whole reais only,
 * since every amount in the app (metas, checkpoints, saques, recompensas) is entered as an integer. */
export function formatBRL(value) {
  return `R$ ${Math.round(Number(value) || 0).toLocaleString('pt-BR')}`;
}

/** Routes through a real <a> click so main.js's existing SPA click interceptor (pushState + re-render)
 * handles the navigation, instead of duplicating that logic here. */
export function navigate(url) {
  const link = document.createElement('a');
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/* ── Dinheiro ────────────────────────────────────────────────────────────────
   Campos de valor eram <input type="number">, que não aceita ponto de milhar
   nem vírgula decimal: o usuário digitava 2500 e via 2500. A máscara abaixo
   trabalha em centavos, o padrão brasileiro — cada dígito entra pela direita,
   então 250000 vira 2.500,00 sem o usuário precisar posicionar o cursor. */

/** "R$ 2.500,00" ou "2500" → 2500. Aceita qualquer entrada mascarada ou crua. */
export function parseMoney(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
}

/** 2500 → "2.500,00" (sem símbolo; o símbolo é decidido por campo). */
export function formatMoney(reais) {
  return (Number(reais) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** CPF (11 dígitos) e CNPJ (14) no mesmo campo: o formato só é decidido quando a pessoa
 *  passa do 11º dígito, então ela não precisa dizer antes qual dos dois vai digitar. */
export function formatDocument(value) {
  const d = String(value ?? '').replace(/\D/g, '').slice(0, 14);
  if (d.length <= 11) {
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function initDocumentInputs() {
  document.querySelectorAll('input[data-mask="cpfcnpj"]').forEach((input) => {
    if (input.dataset.maskReady === 'true') return;
    input.dataset.maskReady = 'true';
    input.addEventListener('input', () => {
      input.value = formatDocument(input.value);
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    });
  });
}

/** Aplica a máscara em todo input[data-money] da tela.
 *  data-money="symbol" inclui "R$ " no próprio valor, para campos que não têm
 *  um prefixo visual ao lado. */
export function initMoneyInputs() {
  document.querySelectorAll('input[data-money]').forEach((input) => {
    if (input.dataset.moneyReady === 'true') return;
    input.dataset.moneyReady = 'true';

    const withSymbol = input.dataset.money === 'symbol';
    const render = (reais) => (reais ? `${withSymbol ? 'R$ ' : ''}${formatMoney(reais)}` : '');

    if (input.value) input.value = render(parseMoney(input.value));

    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '').slice(0, 11); // teto sensato: R$ 999.999.999,99
      input.value = digits ? render(Number(digits) / 100) : '';
      // O cursor sempre no fim: a máscara reescreve a string inteira a cada tecla.
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    });
  });
}
