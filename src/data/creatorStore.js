const CREATOR_ACCOUNTS_KEY = 'trama_creator_accounts';
const CREATOR_SESSION_KEY = 'trama_creator_session';
const PAYOUT_ACCOUNTS_KEY = 'trama_creator_payout_accounts';

/** Temporary demo account so the creator flow can be reviewed without building real onboarding —
 * surfaced on the creator login screen too. Remove once real creator signup review/approval exists. */
const SEED_CREATORS = [
  { email: 'criador@dba.com', password: '123456', name: 'Estúdio Criador' },
];

function readCreators() {
  try {
    const raw = localStorage.getItem(CREATOR_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(CREATOR_ACCOUNTS_KEY, JSON.stringify(SEED_CREATORS));
      return [...SEED_CREATORS];
    }
    return JSON.parse(raw);
  } catch {
    return [...SEED_CREATORS];
  }
}

function writeCreators(creators) {
  localStorage.setItem(CREATOR_ACCOUNTS_KEY, JSON.stringify(creators));
}

export function findCreatorByEmail(email) {
  const target = email.trim().toLowerCase();
  return readCreators().find((c) => c.email.toLowerCase() === target) || null;
}

/** Creates a creator account. Caller is responsible for the email-uniqueness check. */
export function createCreator({ email, password, name }) {
  const creators = readCreators();
  const creator = { email: email.trim(), password, name: name.trim() };
  creators.push(creator);
  writeCreators(creators);
  return creator;
}

export function updateCreatorPassword(email, newPassword) {
  const creators = readCreators();
  const creator = creators.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
  if (!creator) return false;
  creator.password = newPassword;
  writeCreators(creators);
  return true;
}

export function verifyCreatorLogin(email, password) {
  const creator = findCreatorByEmail(email);
  if (!creator || creator.password !== password) return null;
  return creator;
}

export function getCreatorSession() {
  try {
    const raw = localStorage.getItem(CREATOR_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCreatorSession(creator) {
  localStorage.setItem(CREATOR_SESSION_KEY, JSON.stringify({ email: creator.email, name: creator.name }));
}

export function clearCreatorSession() {
  localStorage.removeItem(CREATOR_SESSION_KEY);
}

/* ── Contas de destino do saque ──────────────────────────────────────────────
   A conta bancária é do criador, não da campanha: é a mesma pessoa recebendo
   por todos os projetos dela. Por isso fica aqui, indexada por e-mail, e não
   dentro de cada registro de campanha. O saque guarda só o id da conta usada,
   então o histórico continua dizendo para onde cada valor foi mesmo depois de
   o criador cadastrar outras contas. */

export const PAYOUT_BANKS = [
  'Banco do Brasil', 'Bradesco', 'Itaú Unibanco', 'Santander', 'Caixa Econômica Federal',
  'Nubank', 'Banco Inter', 'C6 Bank', 'BTG Pactual', 'Banco Original',
  'Banrisul', 'Banco Safra', 'Sicoob', 'Sicredi', 'Banco Pan',
  'Neon', 'PagBank', 'Mercado Pago', 'Will Bank', 'XP Investimentos',
];

export const PAYOUT_ACCOUNT_TYPES = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Conta poupança' },
  { value: 'payment', label: 'Conta de pagamento' },
];

export function payoutAccountTypeLabel(value) {
  return PAYOUT_ACCOUNT_TYPES.find((t) => t.value === value)?.label || 'Conta corrente';
}

function readPayouts() {
  try {
    return JSON.parse(localStorage.getItem(PAYOUT_ACCOUNTS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function getPayoutAccounts(email) {
  if (!email) return [];
  return readPayouts()[email.trim().toLowerCase()] || [];
}

export function getPayoutAccount(email, id) {
  return getPayoutAccounts(email).find((a) => a.id === id) || null;
}

export function addPayoutAccount(email, { bank, type, agency, account, holder, document: doc }) {
  const all = readPayouts();
  const key = email.trim().toLowerCase();
  const entry = {
    id: `payout-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bank,
    type,
    agency,
    account,
    holder,
    document: doc,
    createdAt: new Date().toISOString(),
  };
  all[key] = [...(all[key] || []), entry];
  localStorage.setItem(PAYOUT_ACCOUNTS_KEY, JSON.stringify(all));
  return entry;
}

/** "Bradesco · Conta corrente · Ag. 1234 · Conta 56789-0" — uma linha, do jeito que aparece
 *  na confirmação do saque e no histórico. */
export function describePayoutAccount(account) {
  if (!account) return 'Conta removida';
  return `${account.bank} · ${payoutAccountTypeLabel(account.type)} · Ag. ${account.agency} · Conta ${account.account}`;
}
