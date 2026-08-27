/* Select customizado.
 *
 * O <select> nativo desenha a lista aberta pelo sistema operacional, então ela ignora
 * raio, borda, tipografia e cor do produto: aberto, parece outro componente dentro do
 * campo. Aqui a lista é DOM, e herda os mesmos tokens do estado fechado.
 *
 * É melhoria progressiva, não substituição: o <select> original continua no DOM como
 * fonte da verdade. Todo código que já lê `select[name=x].value` (collectFormData,
 * checkout, conta) segue funcionando sem saber que isso existe. */

const CHEVRON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="select-chevron w-4 h-4 text-slate-400 transition-transform shrink-0"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

const CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 shrink-0"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

/** Herda a caixa do campo fechado para o gatilho ficar idêntico ao input ao lado. */
const TRIGGER_BASE = 'select-trigger w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border bg-white text-left text-[14px] font-inter transition-all outline-none';

export function initCustomSelects() {
  document.querySelectorAll('select.select-field').forEach((native) => {
    if (native.dataset.enhanced === 'true') return;
    native.dataset.enhanced = 'true';

    const wrap = document.createElement('div');
    wrap.className = 'select-wrap relative';
    native.parentNode.insertBefore(wrap, native);
    wrap.appendChild(native);
    native.classList.add('sr-only'); // fora da vista, mas ainda é quem guarda o valor
    native.tabIndex = -1;

    // Lido ao vivo, nunca capturado: o select de cidade só ganha opções depois que o
    // estado é escolhido, e uma cópia feita no init ficaria eternamente vazia.
    const opts = () => Array.from(native.options);
    const placeholder = () => opts().find((o) => o.value === '');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (native.disabled) trigger.disabled = true;

    const list = document.createElement('div');
    list.className = 'select-list hidden absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-[0_12px_32px_rgba(15,23,42,0.12)] overflow-hidden';
    list.setAttribute('role', 'listbox');

    /* Modo busca (data-searchable). Listas longas — categoria, banco — não se resolvem
     * rolando: a pessoa já sabe o que quer e digitar é mais rápido que procurar. A caixa
     * de busca vive dentro do painel e só aparece quando ele abre, então o estado fechado
     * continua sendo um campo de seleção comum. */
    const searchable = native.dataset.searchable === 'true';
    let query = '';
    let activeIndex = 0;

    const searchBox = document.createElement('div');
    const search = document.createElement('input');
    if (searchable) {
      searchBox.className = 'p-2 border-b border-slate-100';
      search.type = 'text';
      search.className = 'w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[14px] font-inter text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-400 focus:bg-white transition-all';
      search.placeholder = native.dataset.searchPlaceholder || 'Buscar...';
      searchBox.appendChild(search);
      list.appendChild(searchBox);
    }

    const optionsBox = document.createElement('div');
    optionsBox.className = 'max-h-56 overflow-y-auto py-1.5';
    list.appendChild(optionsBox);

    /** Busca sem acento: quem digita "cosmico" está procurando "Horror Cósmico", e ninguém
     *  troca de teclado no meio de um filtro. */
    const fold = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    /** Opções que passam pelo filtro atual. Sem busca, é a lista inteira. */
    const visibleOpts = () => {
      const q = fold(query.trim());
      return opts().filter((o) => o.value !== '' && (!q || fold(o.textContent).includes(q)));
    };

    /* O gatilho é redesenhado a cada mudança para refletir valor, foco e erro. O estado
     * de erro é espelhado do <select> nativo: quem valida continua marcando o nativo e
     * não precisa conhecer este componente. */
    function paintTrigger(open = false) {
      const selected = opts().find((o) => o.value === native.value);
      const isPlaceholder = !native.value;
      const hasError = native.classList.contains('border-red-400');
      const border = hasError ? 'border-red-400' : open ? 'border-violet-500 ring-4 ring-violet-50' : 'border-slate-300';
      trigger.className = `${TRIGGER_BASE} ${border} ${native.disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`;
      trigger.innerHTML = `
        <span class="truncate ${isPlaceholder ? 'text-slate-400' : 'text-slate-900'}">${selected ? selected.textContent : placeholder()?.textContent || 'Selecione'}</span>
        ${CHEVRON}`;
      trigger.querySelector('.select-chevron')?.classList.toggle('rotate-180', open);
      trigger.setAttribute('aria-expanded', String(open));
    }

    function paintList() {
      const items = visibleOpts();
      if (!items.length) {
        optionsBox.innerHTML = `<p class="px-4 py-3 text-[13px] font-inter text-slate-400">Nada encontrado para "${query.replace(/</g, '&lt;')}".</p>`;
        return;
      }
      activeIndex = Math.max(0, Math.min(activeIndex, items.length - 1));
      optionsBox.innerHTML = items
        .map((o, i) => {
          const selected = o.value === native.value;
          const highlighted = i === activeIndex;
          return `
            <div role="option" tabindex="-1" data-value="${o.value.replace(/"/g, '&quot;')}" aria-selected="${selected}"
                 class="select-option flex items-center justify-between gap-2 px-4 py-2.5 text-[14px] font-inter cursor-pointer transition-colors ${selected ? 'text-violet-600 font-semibold' : 'text-slate-700'} ${highlighted ? (selected ? 'bg-violet-50' : 'bg-slate-50') : ''}">
              <span class="truncate">${o.textContent}</span>
              ${selected ? CHECK : ''}
            </div>`;
        })
        .join('');
      optionsBox.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }

    let open = false;
    function setOpen(next) {
      open = next;
      list.classList.toggle('hidden', !next);
      if (next) {
        // Abrir sempre recomeça a busca: o filtro anterior é lixo de contexto na próxima vez.
        query = '';
        if (searchable) search.value = '';
        activeIndex = Math.max(0, visibleOpts().findIndex((o) => o.value === native.value));
        paintList();
        if (searchable) search.focus();
      }
      paintTrigger(next);
    }

    if (searchable) {
      search.addEventListener('input', () => {
        query = search.value;
        activeIndex = 0;
        paintList();
      });
      search.addEventListener('keydown', (e) => {
        const items = visibleOpts();
        if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(items.length - 1, activeIndex + 1); paintList(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(0, activeIndex - 1); paintList(); }
        if (e.key === 'Enter') { e.preventDefault(); if (items[activeIndex]) choose(items[activeIndex].value); }
        if (e.key === 'Escape') { e.preventDefault(); setOpen(false); trigger.focus(); }
        if (e.key === 'Tab') setOpen(false);
      });
    }

    function choose(value) {
      native.value = value;
      // Quem escuta o <select> (validação, cidades dependentes do estado) continua sendo avisado.
      native.dispatchEvent(new Event('change', { bubbles: true }));
      setOpen(false);
      trigger.focus();
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!native.disabled) setOpen(!open);
    });

    list.addEventListener('click', (e) => {
      e.stopPropagation(); // clicar na caixa de busca não pode fechar o painel
      const opt = e.target.closest('.select-option');
      if (opt) choose(opt.dataset.value);
    });

    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        if (!open) return setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
      if (!open) return;

      const values = opts().filter((o) => o.value !== '').map((o) => o.value);
      const i = values.indexOf(native.value);
      if (e.key === 'ArrowDown') choose(values[Math.min(values.length - 1, i + 1)] ?? values[0]);
      if (e.key === 'ArrowUp' && i > 0) choose(values[i - 1]);
    });

    document.addEventListener('click', () => { if (open) setOpen(false); });

    // Mudanças externas (validação marcando erro, cidade repopulada) redesenham o gatilho.
    new MutationObserver(() => paintTrigger(open)).observe(native, { attributes: true, attributeFilter: ['class', 'disabled'] });
    native.addEventListener('change', () => paintTrigger(open));

    wrap.appendChild(trigger);
    wrap.appendChild(list);
    paintTrigger(false);
  });
}
