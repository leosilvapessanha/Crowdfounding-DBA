const ACCOUNTS_KEY = 'trama_accounts';
const SESSION_KEY = 'trama_session';

const SEED_ACCOUNTS = [
  {
    email: 'apoiador@dba.com.br',
    password: 'teste01!',
    cpf: '52998224725',
    name: 'Apoiador Teste',
    birthDate: '',
    address: '',
  },
];

function readAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(SEED_ACCOUNTS));
      return [...SEED_ACCOUNTS];
    }
    return JSON.parse(raw);
  } catch {
    return [...SEED_ACCOUNTS];
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

const onlyDigits = (v) => (v || '').replace(/\D/g, '');

export function findAccountByEmail(email) {
  const target = email.trim().toLowerCase();
  return readAccounts().find((a) => a.email.toLowerCase() === target) || null;
}

export function findAccountByCpf(cpf) {
  const target = onlyDigits(cpf);
  return readAccounts().find((a) => onlyDigits(a.cpf) === target) || null;
}

/** Creates an account. Caller is responsible for the uniqueness checks (email + CPF). */
export function createAccount({ email, password, cpf, name, birthDate, cep, address, complement, city, state }) {
  const accounts = readAccounts();
  const account = {
    email: email.trim(),
    password,
    cpf: onlyDigits(cpf),
    name: name.trim(),
    birthDate: birthDate || '',
    cep: onlyDigits(cep || ''),
    address: address || '',
    complement: complement || '',
    city: city || '',
    state: state || '',
  };
  accounts.push(account);
  writeAccounts(accounts);
  return account;
}

export function updateAccount(email, updates) {
  const accounts = readAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account) return null;
  Object.assign(account, updates);
  writeAccounts(accounts);
  return account;
}

export function updateAccountPassword(email, newPassword) {
  const accounts = readAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!account) return false;
  account.password = newPassword;
  writeAccounts(accounts);
  return true;
}

export function verifyLogin(email, password) {
  const account = findAccountByEmail(email);
  if (!account || account.password !== password) return null;
  return account;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(account) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: account.email, name: account.name }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
