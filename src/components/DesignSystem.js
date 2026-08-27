import { Footer } from './Footer.js';
import { escapeHtml, icon } from './utils.js';

/* Guia vivo do design system.
 *
 * Renderiza usando os próprios tokens (bg-accent-600, font-body, rounded-card...),
 * então ele não consegue divergir do produto: se um token mudar, esta página muda
 * junto. É documentação executável, não um print que envelhece. */

function Section(id, title, description, body) {
  return `
    <section id="${id}" class="mb-14 scroll-mt-24">
      <h2 class="font-heading font-bold text-ink-strong text-title mb-1">${title}</h2>
      <p class="font-body text-body text-ink-muted mb-6 max-w-[62ch]">${description}</p>
      ${body}
    </section>`;
}

function Swatch(label, cls, value, dark = false) {
  return `
    <div class="rounded-control overflow-hidden border border-line">
      <div class="${cls} h-16 flex items-end p-2">
        <span class="text-caption font-body font-bold ${dark ? 'text-white' : 'text-ink-strong'}">${label}</span>
      </div>
      <div class="px-2 py-1.5 bg-surface">
        <code class="text-caption text-ink-muted font-mono">${value}</code>
      </div>
    </div>`;
}

function TypeRow(cls, name, usage, sample) {
  return `
    <div class="flex items-baseline justify-between gap-6 py-3 border-b border-line last:border-0">
      <p class="${cls} text-ink-strong min-w-0 truncate">${sample}</p>
      <div class="text-right shrink-0">
        <code class="text-caption text-ink-muted font-mono block">${name}</code>
        <span class="text-caption text-ink-subtle">${usage}</span>
      </div>
    </div>`;
}

/** Cada token de componente aparece com o uso ao lado, porque a pergunta que trava
 *  uma decisão não é "como é" e sim "quando uso este e não o outro". */
function Spec(preview, name, when) {
  return `
    <div class="flex items-center gap-4 py-3.5 border-b border-line last:border-0 flex-wrap">
      <div class="w-[200px] shrink-0">${preview}</div>
      <div class="min-w-0">
        <code class="text-caption text-ink-muted font-mono">${name}</code>
        <p class="text-body text-ink-muted">${when}</p>
      </div>
    </div>`;
}

const BTN = {
  primary: 'bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 px-6 rounded-control transition-all shadow-accent text-body font-body',
  secondary: 'border-2 border-line text-ink-muted font-bold py-3 px-6 rounded-control hover:border-line-strong transition-all text-body font-body',
  quiet: 'text-accent-600 hover:text-accent-700 font-bold text-body font-body underline underline-offset-2 decoration-accent-200',
  danger: 'bg-danger hover:opacity-90 text-white font-bold py-3 px-6 rounded-control transition-all text-body font-body',
};

const INPUT = 'w-full px-4 py-3 rounded-control border border-line-strong bg-surface focus:border-accent-600 focus:ring-4 focus:ring-accent-50 outline-none transition-all text-body font-body';

function Badge(label, cls) {
  return `<span class="inline-block text-caption font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${cls}">${label}</span>`;
}

function Alert(tone, title, text) {
  const map = {
    info: 'bg-accent-50 border-accent-100 text-accent-700',
    warning: 'bg-warning/10 border-warning/30 text-[#92400e]',
    danger: 'bg-danger/10 border-danger/30 text-[#991b1b]',
    neutral: 'bg-neutral-100 border-line text-ink',
  };
  return `
    <div class="flex items-start gap-3 border rounded-card px-4 py-3 ${map[tone]}">
      ${icon('flag', 'w-4 h-4 shrink-0 mt-0.5')}
      <div>
        <p class="text-body font-bold font-heading">${title}</p>
        <p class="text-caption font-body leading-relaxed mt-0.5 opacity-90">${text}</p>
      </div>
    </div>`;
}

export function DesignSystem() {
  const nav = [
    ['cor', 'Cor'],
    ['tipografia', 'Tipografia'],
    ['forma', 'Forma e elevação'],
    ['componentes', 'Componentes'],
    ['temas', 'Temas'],
    ['adocao', 'Adoção'],
  ];

  return `
    <main class="min-h-screen bg-surface-subtle pb-20 pt-10">
      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px]">

        <header class="mb-12 max-w-[70ch]">
          <span class="${'inline-block text-caption font-bold uppercase tracking-widest text-accent-600 bg-accent-50 border border-accent-100 px-3 py-1 rounded-full mb-4'}">Design System</span>
          <h1 class="font-display font-bold text-ink-strong text-display leading-tight mb-3">Trama DS</h1>
          <p class="font-body text-lead text-ink-muted leading-relaxed">
            Extraído da área do apoiador, que é a parte mais madura do produto. Nenhum valor aqui foi
            inventado: cada token saiu de uma auditoria do que já estava em uso, e o número entre
            parênteses é quantas vezes aquele valor aparecia no código.
          </p>
          <nav class="flex flex-wrap gap-2 mt-6">
            ${nav.map(([id, label]) => `
              <a href="#${id}" class="text-body font-body font-semibold text-ink-muted hover:text-accent-600 border border-line hover:border-accent-200 bg-surface px-3 py-1.5 rounded-full transition-colors">${label}</a>
            `).join('')}
          </nav>
        </header>

        ${Section('cor', 'Cor', `
          O accent é <strong>semântico, não literal</strong>: os componentes falam <code class="text-caption bg-neutral-100 px-1 rounded">accent</code>,
          nunca "azul". É o que permite a área do criador virar violeta sem duplicar um componente sequer.
          Os neutros carregam a interface inteira, e as cores de status só entram quando existe um estado real a comunicar.
        `, `
          <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-3">Accent</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            ${Swatch('50', 'bg-accent-50', 'accent-50')}
            ${Swatch('100', 'bg-accent-100', 'accent-100')}
            ${Swatch('200', 'bg-accent-200', 'accent-200')}
            ${Swatch('500', 'bg-accent-500', 'accent-500', true)}
            ${Swatch('600', 'bg-accent-600', 'accent-600 · ação', true)}
            ${Swatch('700', 'bg-accent-700', 'accent-700 · hover', true)}
          </div>

          <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-3">Neutros e texto</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            ${Swatch('surface', 'bg-surface border-b border-line', 'surface')}
            ${Swatch('subtle', 'bg-surface-subtle', 'surface-subtle')}
            ${Swatch('line', 'bg-line', 'line · borda (91)')}
            ${Swatch('muted', 'bg-ink-muted', 'ink-muted · apoio (71)', true)}
            ${Swatch('strong', 'bg-ink-strong', 'ink-strong · título (76)', true)}
          </div>

          <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-3">Status</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ${Swatch('success', 'bg-success', 'concluído, valor liberado', true)}
            ${Swatch('warning', 'bg-warning', 'decisão aberta, prazo', true)}
            ${Swatch('danger', 'bg-danger', 'excluir, retirar, cancelar', true)}
          </div>
        `)}

        ${Section('tipografia', 'Tipografia', `
          Três famílias com papéis fixos: <strong>Inter</strong> para corpo e interface,
          <strong>Outfit</strong> para números e destaques, <strong>Manrope</strong> para títulos de seção.
          A auditoria encontrou 18 tamanhos avulsos entre 10px e 40px, consolidados em
          <strong>6 degraus</strong>. Cada linha abaixo mostra o degrau e quais tamanhos brutos ele absorveu.
        `, `
          <div class="bg-surface border border-line rounded-card p-6">
            ${TypeRow('font-display font-bold text-display', 'text-display · 40px', 'hero · absorve 32/38/40', 'Financie destinos')}
            ${TypeRow('font-heading font-bold text-headline', 'text-headline · 24px', 'seção · absorve 24/26/28', 'Sobre o projeto')}
            ${TypeRow('font-heading font-bold text-title', 'text-title · 20px', 'bloco · absorve 18/19/20/22', 'Recompensas')}
            ${TypeRow('font-body text-lead', 'text-lead · 16px', 'texto longo · absorve 16/17', 'O texto que o apoiador lê antes de decidir.')}
            ${TypeRow('font-body text-body', 'text-body · 14px', 'corpo · absorve 13/14/15', 'Corpo e interface. 59% de todo o uso.')}
            ${TypeRow('font-body font-bold uppercase tracking-widest text-caption', 'text-caption · 12px', 'metadado · absorve 10/11/12', 'Categoria')}
          </div>
          <div class="grid sm:grid-cols-2 gap-3 mt-4">
            <div class="bg-surface border border-line rounded-card p-5">
              <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-2">Por que 6 e não 9</p>
              <p class="text-body font-body text-ink-muted leading-relaxed">
                A banda de corpo era 59% do uso repartida em 13/14/15px, três tamanhos fazendo o mesmo
                trabalho. Se a diferença não é perceptível sem régua, ela não é hierarquia: é ruído que
                cada tela resolve de um jeito.
              </p>
            </div>
            <div class="bg-surface border border-line rounded-card p-5">
              <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-2">Pesos</p>
              <p class="text-body font-body text-ink-muted leading-relaxed">
                <strong class="text-ink-strong">bold</strong> (166 usos) e
                <strong class="text-ink-strong">semibold</strong> (52) cobrem quase tudo. Com a escala
                menor, o peso passa a carregar mais hierarquia que o tamanho.
              </p>
            </div>
          </div>
        `)}

        ${Section('forma', 'Forma e elevação', `
          Raios comunicam hierarquia: quanto maior a superfície, maior o raio. Sombras existem para
          separar planos, não para decorar — por isso são poucas e cada uma tem um trabalho.
        `, `
          <div class="bg-surface border border-line rounded-card p-6 mb-4">
            ${Spec('<div class="h-10 bg-neutral-100 rounded-control"></div>', 'rounded-control · 12px', 'Botões e inputs. É o raio mais usado do produto (159).')}
            ${Spec('<div class="h-10 bg-neutral-100 rounded-card"></div>', 'rounded-card · 16px', 'Cards, modais e alertas (59).')}
            ${Spec('<div class="h-10 bg-neutral-100 rounded-panel"></div>', 'rounded-panel · 28px', 'Superfícies grandes, como o card do assistente.')}
            ${Spec('<div class="h-8 w-24 bg-neutral-100 rounded-full"></div>', 'rounded-full', 'Badges, pills e avatares (62).')}
          </div>
          <div class="bg-surface border border-line rounded-card p-6">
            ${Spec('<div class="h-12 bg-surface rounded-card shadow-card border border-line"></div>', 'shadow-card', 'Repouso: cards sobre o fundo da página.')}
            ${Spec('<div class="h-12 bg-surface rounded-card shadow-raised"></div>', 'shadow-raised', 'Flutuante: menus e popovers.')}
            ${Spec('<div class="h-12 bg-surface rounded-card shadow-bar"></div>', 'shadow-bar', 'Barras fixas no rodapé.')}
            ${Spec(`<button class="${BTN.primary} w-full">Ação</button>`, 'shadow-accent', 'Só no botão primário, para dar peso à ação principal.')}
          </div>
        `)}

        ${Section('componentes', 'Componentes', `
          Um papel por variante. A regra que evita a maioria dos erros: <strong>um primário por tela</strong>,
          e destrutivo nunca é o botão mais chamativo da tela — ele aparece depois de uma confirmação.
        `, `
          <div class="bg-surface border border-line rounded-card p-6 mb-4">
            <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-4">Botões</p>
            ${Spec(`<button class="${BTN.primary}">Publicar campanha</button>`, 'primary', 'A ação que move a tarefa adiante. Uma por tela.')}
            ${Spec(`<button class="${BTN.secondary}">Voltar</button>`, 'secondary', 'Alternativa neutra: voltar, cancelar, adiar.')}
            ${Spec(`<button class="${BTN.quiet}">Retirar apoio</button>`, 'quiet', 'Ação de baixa ênfase que não deve competir com a principal.')}
            ${Spec(`<button class="${BTN.danger}">Excluir</button>`, 'danger', 'Irreversível. Só dentro de um modal de confirmação.')}
          </div>

          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div class="bg-surface border border-line rounded-card p-6">
              <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-4">Campo</p>
              <label class="block mb-4">
                <span class="text-body font-semibold text-ink-strong font-body mb-1.5 block">Título da campanha</span>
                <input type="text" placeholder="Ex: Guardiões de Aethermoor" class="${INPUT}">
              </label>
              <label class="block">
                <span class="text-body font-semibold text-ink-strong font-body mb-1.5 block">Com erro</span>
                <input type="text" value="" class="${INPUT} border-danger">
                <p class="text-caption text-danger font-body mt-1.5">Campo obrigatório.</p>
              </label>
              <p class="text-caption text-ink-subtle font-body mt-4">
                Fundo branco e borda de 1px. Fundo cinza em campo editável lê como desabilitado.
              </p>
            </div>

            <div class="bg-surface border border-line rounded-card p-6">
              <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-4">Status</p>
              <div class="flex flex-wrap gap-2 mb-5">
                ${Badge('Em andamento', 'bg-accent-50 text-accent-600')}
                ${Badge('Rascunho', 'bg-neutral-100 text-ink-muted')}
                ${Badge('Encerrada', 'bg-neutral-100 text-ink')}
                ${Badge('Cancelada', 'bg-danger/10 text-danger')}
                ${Badge('Concluído', 'bg-success/10 text-success')}
              </div>
              <p class="text-caption text-ink-subtle font-body">
                Sempre em pill, caixa alta e com o mesmo tracking. A cor carrega o significado, o formato mantém a família reconhecível.
              </p>
            </div>
          </div>

          <div class="bg-surface border border-line rounded-card p-6">
            <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-4">Alertas</p>
            <div class="flex flex-col gap-3">
              ${Alert('info', 'Informativo', 'Contexto que ajuda a decidir, sem urgência.')}
              ${Alert('warning', 'Requer atenção', 'Algo com prazo, como uma janela de decisão aberta.')}
              ${Alert('danger', 'Consequência séria', 'Ação irreversível ou erro que bloqueia o fluxo.')}
              ${Alert('neutral', 'Estado encerrado', 'Situação estável que apenas informa.')}
            </div>
          </div>
        `)}

        ${Section('temas', 'Temas por área', `
          A diferença entre apoiador e criador é <strong>só o accent</strong>. Trocando os canais RGB do token
          em <code class="text-caption bg-neutral-100 px-1 rounded">[data-area="creator"]</code>, botões, foco,
          badges e steppers acompanham juntos. Os dois blocos abaixo são o mesmo componente, com o mesmo HTML.
        `, `
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-surface border border-line rounded-card p-6">
              <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-3">Apoiador (padrão)</p>
              <button class="${BTN.primary} w-full mb-3">Apoiar este projeto</button>
              <input type="text" placeholder="Foco no campo" class="${INPUT}">
            </div>
            <div data-area="creator" class="bg-surface border border-line rounded-card p-6">
              <p class="text-caption font-bold uppercase tracking-widest text-ink-subtle mb-3">Criador · data-area="creator"</p>
              <button class="${BTN.primary} w-full mb-3">Publicar campanha</button>
              <input type="text" placeholder="Foco no campo" class="${INPUT}">
            </div>
          </div>
        `)}

        ${Section('adocao', 'Adoção', `
          Estado real, sem maquiagem: os tokens existem e estão prontos, mas o produto ainda usa
          valores avulsos do Tailwind na maioria das telas.
        `, `
          <div class="bg-surface border border-line rounded-card p-6">
            <div class="flex items-start gap-3 mb-4">
              ${icon('check', 'w-4 h-4 text-success shrink-0 mt-1')}
              <p class="text-body font-body text-ink"><strong class="text-ink-strong">Feito:</strong> tokens definidos em <code class="text-caption bg-neutral-100 px-1 rounded">tokens.css</code>, expostos no <code class="text-caption bg-neutral-100 px-1 rounded">tailwind.config.js</code> e aplicados no <code class="text-caption bg-neutral-100 px-1 rounded">base.css</code>. Tema por área funcionando.</p>
            </div>
            <div class="flex items-start gap-3 mb-4">
              ${icon('clock', 'w-4 h-4 text-warning shrink-0 mt-1')}
              <p class="text-body font-body text-ink"><strong class="text-ink-strong">Pendente:</strong> migrar os componentes existentes. Hoje eles usam <code class="text-caption bg-neutral-100 px-1 rounded">text-[13px]</code>, <code class="text-caption bg-neutral-100 px-1 rounded">blue-600</code> e <code class="text-caption bg-neutral-100 px-1 rounded">violet-600</code> escritos na mão.</p>
            </div>
            <div class="flex items-start gap-3">
              ${icon('alert-triangle', 'w-4 h-4 text-ink-subtle shrink-0 mt-1')}
              <p class="text-body font-body text-ink"><strong class="text-ink-strong">Decisão consciente:</strong> nada do que já existia foi sobrescrito. As escalas nativas do Tailwind seguem em uso em 22 lugares, então os nomes do DS são novos e a migração pode ser feita tela a tela, sem big bang.</p>
            </div>
          </div>
        `)}

      </div>
    </main>
    ${Footer()}
  `;
}
