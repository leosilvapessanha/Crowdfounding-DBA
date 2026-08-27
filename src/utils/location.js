/** Brazilian states — static list for the "Estado" select. */
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

/**
 * Looks up an address by CEP via ViaCEP (free, public, no key required).
 * Returns null on invalid CEP, not-found, or network failure.
 */
export async function lookupCep(rawCep) {
  const cep = (rawCep || '').replace(/\D/g, '');
  if (cep.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      uf: data.uf || '',
    };
  } catch {
    return null;
  }
}

const cityCache = new Map();

/** Fetches the alphabetically-sorted list of municipalities for a UF via IBGE's public API. */
export async function fetchCitiesByUf(uf) {
  if (!uf) return [];
  if (cityCache.has(uf)) return cityCache.get(uf);

  try {
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    if (!res.ok) return [];
    const data = await res.json();
    const cities = data.map((c) => c.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    cityCache.set(uf, cities);
    return cities;
  } catch {
    return [];
  }
}

/** Formats CEP digits as the user types: 00000-000. */
export function formatCepInput(value) {
  return value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

/**
 * Wires CEP → address autocomplete on a form: fills the street field and
 * populates + selects the UF/city selects. Field names default to the ones
 * used across the app but can be overridden per form.
 */
export function wireAddressAutocomplete(form, { cep = 'cep', street = 'address', city = 'city', uf = 'state', initialUf = '', initialCity = '' } = {}) {
  const cepInput = form.querySelector(`[name="${cep}"]`);
  const streetInput = form.querySelector(`[name="${street}"]`);
  const citySelect = form.querySelector(`[name="${city}"]`);
  const ufSelect = form.querySelector(`[name="${uf}"]`);
  if (!cepInput || !citySelect || !ufSelect) return;

  async function populateCities(ufValue, cityToSelect) {
    if (!ufValue) {
      citySelect.innerHTML = '<option value="">Selecione o estado primeiro</option>';
      citySelect.disabled = true;
      return;
    }
    citySelect.innerHTML = '<option value="">Carregando cidades…</option>';
    citySelect.disabled = true;
    const cities = await fetchCitiesByUf(ufValue);
    citySelect.innerHTML = '<option value="">Selecione a cidade</option>' + cities.map((c) => `<option value="${c}">${c}</option>`).join('');
    citySelect.disabled = false;
    if (cityToSelect && cities.includes(cityToSelect)) citySelect.value = cityToSelect;
  }

  cepInput.addEventListener('input', () => {
    cepInput.value = formatCepInput(cepInput.value);
  });

  cepInput.addEventListener('blur', async () => {
    const address = await lookupCep(cepInput.value);
    if (!address) return;
    if (streetInput && address.street) streetInput.value = address.street;
    if (address.uf) {
      ufSelect.value = address.uf;
      await populateCities(address.uf, address.city);
    }
  });

  ufSelect.addEventListener('change', () => populateCities(ufSelect.value));

  if (initialUf) populateCities(initialUf, initialCity);
}
