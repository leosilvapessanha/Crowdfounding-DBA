const normalizeId = (title, index) =>
  `${title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${index + 1}`;

const createCampaign = ([badge, image, title, creator, progress, time, price, urgent = false], index) => ({
  id: normalizeId(title, index),
  href: `?project=${normalizeId(title, index)}`,
  badge,
  image,
  title,
  creator,
  progress,
  time,
  price,
  urgent,
  alt: title,
});

export const campaignGroups = {
  featured: [
    ['Investigação', '/assets/Img/card_ordem.png', 'Ordem Paranormal: Enigma do Medo', 'Jambô Editora', 85, '12 dias', 'R$ 50'],
    ['Fantasia', '/assets/Img/card_tormenta.png', 'O Um Anel: Terra-Média', 'Devir Brasil', 68, '14 dias', 'R$ 50'],
    ['Board Game', '/assets/Img/card_gloomhaven.png', 'Gloomhaven: Início do Fim', 'Editora Grok', 32, '22 dias', 'R$ 50'],
    ['Pledges Abertos', '/assets/Img/card_vampiro.png', 'Vampiro: A Máscara Luxo', 'Mundo das Trevas', 50, '18 dias', 'R$ 50'],
    ['Fantasia Oriental', '/assets/Img/card_l5r.png', 'A Lenda dos Cinco Anéis', 'New Order Editora', 12, '28 dias', 'R$ 50'],
    ['Ficção Científica', '/assets/Img/card_cyberpunk.png', 'Cyberpunk RED', 'R. Talsorian', 90, '3 dias restantes', 'R$ 50', true],
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
