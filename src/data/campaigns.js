const normalizeId = (title, index) =>
  `${title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${index + 1}`;

/** These seed campaigns carry a progress percentage but no funding figures of their own. A goal
 * derived from the id (stable across renders, never re-rolled) gives the campaign page something
 * concrete to divide into checkpoints and to show as "arrecadado de X". */
const seededGoal = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return 10000 + (hash % 41) * 1000; // R$ 10.000 – R$ 50.000, em passos de mil
};

const createCampaign = ([badge, image, title, creator, progress, time, price, urgent = false], index) => {
  const id = normalizeId(title, index);
  const goal = seededGoal(id);
  return {
    id,
    href: `?project=${id}`,
    badge,
    image,
    title,
    creator,
    progress,
    time,
    price,
    urgent,
    goal,
    raised: Math.round((goal * (Number(progress) || 0)) / 100),
    alt: title,
  };
};

export const campaignGroups = {
  featured: [
    ['Investigação', '/assets/Img/card_ordem.png', 'Ordem Paranormal: Enigma do Medo', 'Jambô Editora', 85, '12 dias', 'R$ 50'],
    ['Fantasia', '/assets/Img/card_tormenta.png', 'O Um Anel: Terra-Média', 'Devir Brasil', 68, '14 dias', 'R$ 50'],
    ['Board Game', '/assets/Img/card_gloomhaven.png', 'Gloomhaven: Início do Fim', 'Editora Grok', 32, '22 dias', 'R$ 50'],
    ['Pledges Abertos', '/assets/Img/card_vampiro.png', 'Vampiro: A Máscara Luxo', 'Mundo das Trevas', 50, '18 dias', 'R$ 50'],
    ['Fantasia Oriental', '/assets/Img/card_l5r.png', 'A Lenda dos Cinco Anéis', 'New Order Editora', 12, '28 dias', 'R$ 50'],
    ['Ficção Científica', '/assets/Img/card_cyberpunk.png', 'Cyberpunk RED', 'R. Talsorian', 90, 'Encerrado', 'R$ 50', false],
    ['Fantasia Animada', '/assets/Img/card_avatar.png', 'Avatar RPG: Legends', 'Magpie Games', 45, '35 dias', 'R$ 50'],
    ['Horror Cósmico', '/assets/Img/card_lovecraft.png', 'O Chamado de Cthulhu', 'Chaosium Inc.', 20, '40 dias', 'R$ 50'],
  ].map(createCampaign),
  weekly: [
    ['Acessórios', '/assets/Img/prod_dice_sets.png', 'Kit Dados Gemstone — 3 Sets', 'Arcane Forge Studio', 72, '15 dias', 'R$ 89'],
    ['Acessórios', '/assets/Img/prod_dice_tower.png', 'Torre de Dados Celtic Walnut', 'Woodcraft RPG', 40, '25 dias', 'R$ 120'],
    ['Miniaturas', '/assets/Img/prod_miniatures.png', 'Trio de Heróis — Pintados', 'Mini Realm Brasil', 55, '20 dias', 'R$ 65'],
    ['Mapas', '/assets/Img/prod_battle_maps.png', 'Battle Map Canvas — Dungeon', 'Cartógrafo RPG', 91, '5 dias restantes', 'R$ 45', true],
    ['Horror', '/assets/Img/card_lovecraft.png', 'Noites no Abismo — Expansão', 'Abismo Games', 18, '29 dias', 'R$ 55'],
    ['Fantasia', '/assets/Img/card_tormenta.png', 'Fortaleza dos Dragões — HC', 'Dragão Brasil', 35, '21 dias', 'R$ 80'],
    ['Solo RPG', '/assets/Img/prod_spell_cards.png', 'Deck de Aventuras Solo', 'Solo Quest BR', 48, '18 dias', 'R$ 35'],
    ['Mapas', '/assets/Img/prod_battle_maps.png', 'Hex Map Deluxe — 6 Biomas', 'HexCraft Studio', 25, '26 dias', 'R$ 60'],
  ].map(createCampaign),
  ending: [
    ['Suplemento', '/assets/Img/prod_sourcebook.png', 'Chronicles of Eldroria — Luxo', 'Eldroria Press', 95, '2 dias restantes', 'R$ 150', true],
    ['Diário', '/assets/Img/prod_journal.png', 'Diário de Personagem — Aetherium', 'Aetherium Studio', 78, '4 dias restantes', 'R$ 70', true],
    ['Escudo', '/assets/Img/prod_gm_screen.png', 'Escudo do Mestre — Dark Fantasy', 'DarkForge Crafts', 88, '6 dias restantes', 'R$ 95', true],
    ['Cards', '/assets/Img/prod_spell_cards.png', 'Spell Cards — Arcanum Collection', 'Arcanum Games', 62, '8 dias restantes', 'R$ 40', true],
    ['Bestiário', '/assets/Img/card_avatar.png', 'Bestiário Ilustrado — Vol. 2', 'Fauna Press', 82, '3 dias restantes', 'R$ 85', true],
    ['Classes', '/assets/Img/card_cyberpunk.png', 'Compêndio de Classes 5e', 'Kobold Press BR', 71, '7 dias restantes', 'R$ 55', true],
    ['Acessórios', '/assets/Img/prod_dice_sets.png', 'Dados de Obsidiana — Edição Limitada', 'Obsidian Dice Co.', 93, '1 dia restante', 'R$ 110', true],
    ['Cenário', '/assets/Img/card_gloomhaven.png', 'Terras de Ferro — Cenário RPG', 'Iron Realm Studio', 58, '9 dias restantes', 'R$ 75', true],
  ].map(createCampaign),
};

export const carouselCtas = {
  featured: {
    href: '#todos-projetos',
    icon: 'layout-grid',
    title: 'Explorar Catálogo',
    description: 'Veja todos os projetos abertos e descubra novas ideias geniais.',
    label: 'Ver todos',
  },
  weekly: {
    href: '#',
    icon: 'sparkles',
    title: 'Mais Novidades',
    description: 'Descubra campanhas recém-lançadas por criadores.',
    label: 'Ver todos',
  },
  ending: {
    href: '#',
    icon: 'clock',
    title: 'Não perca tempo',
    description: 'Veja todas as campanhas que estão nos últimos dias.',
    label: 'Ver todos',
  },
};

export const getAllCampaigns = () => [
  ...campaignGroups.featured,
  ...campaignGroups.weekly,
  ...campaignGroups.ending,
];

export const getCampaignById = (id) => getAllCampaigns().find((c) => c.id === id);

/** A campaign whose deadline has passed — the "time" field carries "Encerrado" instead of a day
 * count once it's over. Every support entry point (donation form, reward cards, checkout itself)
 * gates on this so a closed campaign can't keep collecting pledges past its own deadline. */
export const isCampaignEnded = (campaign) => /^encerrad/i.test(String(campaign?.time || '').trim());

/** Categories are driven by each campaign's own badge — there's no separate taxonomy to maintain. */
export const getCategories = () =>
  [...new Set(getAllCampaigns().map((c) => c.badge))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const SORT_OPTIONS = [
  { value: 'populares', label: 'Populares' },
  { value: 'prazo', label: 'Terminando em breve' },
  { value: 'preco-menor', label: 'Menor preço' },
  { value: 'preco-maior', label: 'Maior preço' },
];

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseDaysRemaining(time) {
  const match = String(time).match(/\d+/);
  return match ? Number(match[0]) : Infinity;
}

function parsePrice(price) {
  const match = String(price).replace(/\./g, '').match(/\d+(,\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : 0;
}

const sorters = {
  prazo: (a, b) => parseDaysRemaining(a.time) - parseDaysRemaining(b.time),
  'preco-menor': (a, b) => parsePrice(a.price) - parsePrice(b.price),
  'preco-maior': (a, b) => parsePrice(b.price) - parsePrice(a.price),
  populares: (a, b) => (Number(b.progress) || 0) - (Number(a.progress) || 0),
};

/** Powers the header search bar and "/search" results page: free-text term (matched against title,
 * creator and category), an optional exact category filter, and a sort order. */
export function searchCampaigns({ term = '', category = '', sort = 'populares' } = {}) {
  const normalizedTerm = normalizeText(term.trim());

  const results = getAllCampaigns().filter((c) => {
    const matchesTerm = !normalizedTerm
      || normalizeText(c.title).includes(normalizedTerm)
      || normalizeText(c.creator).includes(normalizedTerm)
      || normalizeText(c.badge).includes(normalizedTerm);
    const matchesCategory = !category || c.badge === category;
    return matchesTerm && matchesCategory;
  });

  return results.sort(sorters[sort] || sorters.populares);
}
