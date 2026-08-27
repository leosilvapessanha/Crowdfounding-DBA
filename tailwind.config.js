/** Tokens do design system, lidos de src/styles/tokens.css.
 *
 *  Tudo aqui é aditivo: nenhuma escala padrão do Tailwind foi sobrescrita, porque
 *  o código atual usa as classes nativas (text-sm, rounded-xl, shadow-lg...) em
 *  centenas de lugares. Os nomes abaixo são semânticos de propósito — dizem a
 *  função ("card", "control", "accent"), não o valor — para que a adoção seja
 *  incremental e uma mudança de token não exija caçar classes na mão. */
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './index_testes.html', './src/**/*.js'],
  theme: {
    extend: {
      colors: {
        /* Semântico: muda com data-area="creator" sem trocar classe nenhuma. */
        accent: {
          50: channel('accent-50'),
          100: channel('accent-100'),
          200: channel('accent-200'),
          500: channel('accent-500'),
          600: channel('accent-600'),
          700: channel('accent-700'),
          DEFAULT: channel('accent-600'),
        },
        surface: {
          DEFAULT: channel('surface'),
          subtle: channel('surface-subtle'),
        },
        ink: {
          strong: channel('neutral-900'), // títulos
          DEFAULT: channel('neutral-700'), // corpo
          muted: channel('neutral-500'), // apoio
          subtle: channel('neutral-400'), // placeholder, desabilitado
        },
        line: {
          DEFAULT: channel('neutral-200'), // borda padrão
          strong: channel('neutral-300'), // borda de input
        },
        success: channel('success'),
        warning: channel('warning'),
        danger: channel('danger'),
      },

      fontFamily: {
        body: ['var(--font-body)'],
        display: ['var(--font-display)'],
        heading: ['var(--font-heading)'],
      },

      /* Escala consolidada: 18 tamanhos avulsos (10px–40px) em 6 degraus.
       *
       * O corte veio dos números, não do gosto. A banda de corpo sozinha era 59%
       * do uso, dividida em três tamanhos (13/14/15px) que faziam o mesmo
       * trabalho — viraram um. Cada degrau agora tem um papel que o vizinho não
       * cobre, e a distância entre eles é grande o bastante para a hierarquia
       * ser perceptível sem medir. */
      fontSize: {
        caption: ['12px', { lineHeight: '1.5' }], // metadados, overline, badge (73 usos)
        body: ['14px', { lineHeight: '1.6' }], // corpo e interface (214)
        lead: ['16px', { lineHeight: '1.6' }], // texto longo de leitura (27)
        title: ['20px', { lineHeight: '1.3' }], // título de bloco (30)
        headline: ['24px', { lineHeight: '1.25' }], // título de seção (18)
        display: ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // hero (3)
      },

      borderRadius: {
        control: '0.75rem', // botões e inputs — rounded-xl, o mais usado (159)
        card: '1rem', // cards e modais — rounded-2xl (59)
        panel: '1.75rem', // superfícies grandes
      },

      boxShadow: {
        card: '0 8px 40px rgba(0, 0, 0, 0.04)',
        raised: '0 12px 32px rgba(15, 23, 42, 0.12)',
        bar: '0 -4px 20px rgba(0, 0, 0, 0.08)', // barras fixas no rodapé
        accent: '0 10px 15px -3px rgb(var(--accent-600) / 0.2)',
      },

      spacing: {
        gutter: 'var(--gutter-2xl)',
      },
    },
  },
  plugins: [],
};
