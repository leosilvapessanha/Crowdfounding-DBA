const CREATOR_CAMPAIGNS_KEY = 'trama_creator_campaigns';

/** Seed campaigns for the demo creator account, one per status, so the dashboard's tab bar and
 * table have something to show on first login instead of an empty state. */
const SEED_CAMPAIGNS = {
  'criador@dba.com': [
    {
      id: 'demo-active-1',
      title: 'Guardiões de Aethermoor',
      category: 'Fantasia',
      shortDescription: 'Um RPG de exploração em um arquipélago de ilhas flutuantes, à deriva sobre um oceano de nuvens.',
      description: 'Guardiões de Aethermoor é um cenário completo de RPG de mesa ambientado em um arquipélago de ilhas flutuantes. O livro traz regras de exploração aérea, um bestiário próprio e seis classes inéditas.',
      image: '/assets/Img/card_l5r.png',
      goal: 15000,
      durationDays: 30,
      rewards: [
        { id: 'r1', title: 'Apoiador Digital', price: 'R$ 60', description: 'PDF completo do livro base.' },
        { id: 'r2', title: 'Edição Física', price: 'R$ 180', description: 'Livro impresso capa dura + PDF.' },
      ],
      status: 'active',
      raised: 9840,
      backers: 214,
      createdAt: '2026-07-20T14:00:00.000Z',
      checkpoints: [
        { id: 'cp1', title: 'Roteiro e worldbuilding fechados', date: '2026-07-30', amount: 5000, description: 'Pagamento da equipe de design de sistema e revisão de texto do roteiro completo do cenário.' },
        { id: 'cp2', title: 'Arte da capa finalizada', date: '2026-08-10', amount: 6000, description: 'Contratação do ilustrador para a arte de capa e das seis classes inéditas.' },
        { id: 'cp3', title: 'Diagramação e revisão final', date: '2026-08-29', amount: 4000, description: 'Diagramação do livro final, revisão editorial e preparação dos arquivos para impressão.' },
      ],
      withdrawals: [],
      updates: [
        { id: 'u1', title: 'Fechamos a arte da capa!', description: 'Depois de algumas rodadas com a equipe de ilustração, a arte final da capa está pronta. Em breve mostramos o mockup impresso.', createdAt: '2026-08-05T10:00:00.000Z' },
      ],
    },
    {
      id: 'demo-draft-1',
      title: 'Crônicas do Vale Sombrio',
      category: 'Horror',
      shortDescription: 'Suplemento de horror gótico para sistemas d20, com uma campanha completa de 10 sessões.',
      description: 'Crônicas do Vale Sombrio leva o grupo a um vale amaldiçoado onde a névoa nunca dissipa. Inclui campanha completa, novos monstros e regras de sanidade.',
      image: '/assets/Img/card_gloomhaven.png',
      goal: 8000,
      durationDays: 21,
      rewards: [
        { id: 'r1', title: 'Apoiador Digital', price: 'R$ 45', description: 'PDF completo.' },
      ],
      status: 'draft',
      raised: 0,
      backers: 0,
      createdAt: '2026-08-10T09:30:00.000Z',
      withdrawals: [],
      updates: [],
    },
    {
      id: 'demo-ended-1',
      title: 'Bestiário Selvagem: Vol. 1',
      category: 'Bestiário',
      shortDescription: 'Um compêndio com 80 criaturas originais, ilustradas e prontas para qualquer mesa de fantasia.',
      description: 'Bestiário Selvagem reúne 80 criaturas inéditas, cada uma com arte exclusiva, ficha completa e ganchos de aventura prontos para usar.',
      image: '/assets/Img/card_avatar.png',
      goal: 6000,
      durationDays: 25,
      rewards: [
        { id: 'r1', title: 'Apoiador Digital', price: 'R$ 35', description: 'PDF completo.' },
        { id: 'r2', title: 'Edição Física', price: 'R$ 95', description: 'Livro impresso + PDF.' },
      ],
      status: 'ended',
      raised: 22150,
      backers: 480,
      createdAt: '2026-05-02T11:15:00.000Z',
      checkpoints: [
        { id: 'cp1', title: 'Pesquisa e concept art', date: '2026-05-20', amount: 1500, description: 'Pesquisa de referências e concept art inicial das 80 criaturas do bestiário.' },
        { id: 'cp2', title: '80 criaturas ilustradas', date: '2026-06-25', amount: 2500, description: 'Pagamento da equipe de ilustração pela arte final de todas as 80 criaturas.' },
        { id: 'cp3', title: 'Revisão final e diagramação', date: '2026-07-10', amount: 2000, description: 'Revisão de texto, diagramação final e preparação dos arquivos para publicação.' },
      ],
      withdrawals: [],
      updates: [],
    },
  ],
};

function readAll() {
  try {
    const raw = localStorage.getItem(CREATOR_CAMPAIGNS_KEY);
    if (!raw) {
      localStorage.setItem(CREATOR_CAMPAIGNS_KEY, JSON.stringify(SEED_CAMPAIGNS));
      return { ...SEED_CAMPAIGNS };
    }
    return JSON.parse(raw);
  } catch {
    return { ...SEED_CAMPAIGNS };
  }
}

function writeAll(data) {
  localStorage.setItem(CREATOR_CAMPAIGNS_KEY, JSON.stringify(data));
}

function generateId() {
  return `camp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Checkpoints: a backer's decision window opens the moment the checkpoint date arrives and stays
 * open for this many days; a creator is nudged this many days before the date, since that's the
 * window where a well-timed update can keep someone from leaving. */
export const CHECKPOINT_DECISION_DAYS = 5;
export const CHECKPOINT_NOTICE_DAYS = 5;

/** Small, stable pool of mock backer names — since creator campaigns aren't wired to real backer
 * accounts (a known gap: they don't appear in the public catalog/checkout at all), each campaign
 * gets a deterministic simulated crowd instead, so the checkpoint panel has someone to decide. */
const MOCK_BACKER_NAMES = [
  'Ana Beatriz', 'Bruno Castro', 'Carla Dias', 'Diego Fernandes', 'Elisa Gomes',
  'Felipe Rocha', 'Gabriela Lima', 'Henrique Alves', 'Isabela Souza', 'João Pedro',
  'Larissa Melo', 'Marcos Vinícius', 'Natália Prado', 'Otávio Ramos', 'Paula Nogueira',
];

/** Deterministic 0-99 pseudo-random number from a string seed — same inputs always produce the
 * same output, so a checkpoint's simulated outcome doesn't reshuffle on every page load. */
function seededRoll(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

/** Splits a campaign's backer count/raised total into a named, individually-trackable mock crowd
 * (capped at 15 for a readable list). Deterministic per campaign id, generated once and cached on
 * the record the first time checkpoints need it. */
function buildSimulatedBackers(campaign) {
  const count = Math.max(1, Math.min(15, Number(campaign.backers) || 1));
  const raised = Number(campaign.raised) || 0;
  // Random weights normalized to sum to 1 first, then applied to `raised` — sizing each backer
  // straight off the raw average (without normalizing) can overshoot and leave the last backer
  // with nothing once everyone else's rounded share is added up.
  const weights = Array.from({ length: count }, (_, i) => 0.6 + (seededRoll(`${campaign.id}-amt-${i}`) / 100) * 0.8);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const backers = [];
  let allocated = 0;
  weights.forEach((w, i) => {
    const isLast = i === count - 1;
    const amount = isLast ? Math.max(1, raised - allocated) : Math.max(1, Math.round((w / totalWeight) * raised));
    allocated += amount;
    backers.push({
      id: `sim-${campaign.id}-${i}`,
      name: MOCK_BACKER_NAMES[seededRoll(`${campaign.id}-name-${i}`) % MOCK_BACKER_NAMES.length],
      amount,
      active: true,
      decisions: {},
    });
  });
  return backers;
}

/** Lazily creates and persists the simulated backer crowd the first time it's needed, so it stays
 * stable across renders instead of being rebuilt (and re-randomized) every time. */
export function ensureSimulatedBackers(email, id) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = list.find((c) => c.id === id);
  if (!record) return null;
  if (!record.simulatedBackers) {
    record.simulatedBackers = buildSimulatedBackers(record);
    all[key] = list;
    writeAll(all);
  }
  return record;
}

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d;
}

/** A checkpoint's lifecycle: 'upcoming' (date hasn't arrived), 'deciding' (date arrived, backers
 * have up to CHECKPOINT_DECISION_DAYS to choose), 'resolved' (window closed, outcome is final). */
export function getCheckpointStatus(checkpoint, now = new Date()) {
  const date = new Date(checkpoint.date);
  if (now < date) return 'upcoming';
  const windowEnd = addDays(checkpoint.date, CHECKPOINT_DECISION_DAYS);
  return now < windowEnd ? 'deciding' : 'resolved';
}

/** True during the CHECKPOINT_NOTICE_DAYS window before a checkpoint's date — the creator should
 * see a nudge to post an update, since this is the last chance to influence the outcome. */
export function isCheckpointNoticeWindow(checkpoint, now = new Date()) {
  const date = new Date(checkpoint.date);
  const noticeStart = addDays(checkpoint.date, -CHECKPOINT_NOTICE_DAYS);
  return now >= noticeStart && now < date;
}

/** Resolves every checkpoint up to and including `now` against the simulated crowd, in order —
 * once a backer withdraws at a checkpoint, they're inactive for every later one. A backer's
 * decision at a checkpoint is a stable roll (not re-rolled on reload): ~85% stay, ~15% leave. */
function resolveSimulatedDecisions(campaign, now) {
  const backers = (campaign.simulatedBackers || []).map((b) => ({ ...b, active: true, decisions: { ...b.decisions } }));
  const checkpoints = [...(campaign.checkpoints || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  checkpoints.forEach((cp) => {
    const status = getCheckpointStatus(cp, now);
    if (status === 'upcoming') return;
    backers.forEach((backer) => {
      if (!backer.active) return;
      if (backer.decisions[cp.id]) return;
      if (status === 'deciding') return; // still inside the window — no verdict yet
      const roll = seededRoll(`${campaign.id}-${cp.id}-${backer.id}`);
      const decision = roll < 15 ? 'withdrawn' : 'continued';
      backer.decisions[cp.id] = decision;
      if (decision === 'withdrawn') backer.active = false;
    });
  });

  return backers;
}

/** Per-checkpoint tally for the creator's dashboard: how many of the (still-active-at-that-point)
 * backers stayed vs. left, and how much was refunded at that step. Each checkpoint carries its own
 * R$ `amount` (the checkpoints are how the goal gets built — `goal` is their sum), so "what's left
 * to fund" from a given checkpoint onward is just that checkpoint's slice of the goal. */
export function getCheckpointSummary(campaign, checkpoint, now = new Date()) {
  const resolved = resolveSimulatedDecisions(campaign, now);
  const checkpoints = [...(campaign.checkpoints || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const index = checkpoints.findIndex((c) => c.id === checkpoint.id);
  const goal = Number(campaign.goal) || 0;
  const remainingAmount = checkpoints.slice(index).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const remainingFraction = goal ? remainingAmount / goal : 0;

  let continued = 0;
  let withdrawn = 0;
  let refunded = 0;
  resolved.forEach((backer) => {
    const decision = backer.decisions[checkpoint.id];
    if (decision === 'continued') continued += 1;
    if (decision === 'withdrawn') {
      withdrawn += 1;
      refunded += Math.round(backer.amount * remainingFraction);
    }
  });

  return { status: getCheckpointStatus(checkpoint, now), continued, withdrawn, refunded };
}

/** Sum of refunds already paid out across every resolved checkpoint — this is money the creator
 * never gets to keep, so it comes off `raised` before anything else. */
export function getCheckpointRefundedTotal(campaign, now = new Date()) {
  const checkpoints = campaign.checkpoints || [];
  return checkpoints.reduce((sum, cp) => sum + getCheckpointSummary(campaign, cp, now).refunded, 0);
}

/** Money tied to checkpoints that haven't resolved yet (still 'upcoming' or 'deciding') — held
 * back from the creator's withdrawable balance in case those backers choose to leave and need a
 * proportional refund out of it. */
export function getCheckpointLockedAmount(campaign, now = new Date()) {
  const checkpoints = campaign.checkpoints || [];
  const goal = Number(campaign.goal) || 0;
  if (!goal) return 0;
  const unresolvedAmount = checkpoints
    .filter((cp) => getCheckpointStatus(cp, now) !== 'resolved')
    .reduce((sum, cp) => sum + (Number(cp.amount) || 0), 0);
  return Math.round((Number(campaign.raised) || 0) * (unresolvedAmount / goal));
}

/** Sum of everything already withdrawn against one specific checkpoint's own bucket. */
export function getCheckpointWithdrawnTotal(campaign, checkpointId) {
  return (campaign?.withdrawals || [])
    .filter((w) => w.checkpointId === checkpointId)
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
}

/** What a resolved checkpoint is actually worth: its slice of what was really raised (not its
 * nominal planned amount — a campaign can end up over- or under-raising against the goal), minus
 * whatever was refunded to backers who left right at this checkpoint. Unresolved checkpoints are
 * worth 0 here — nothing is withdrawable until the decision window closes. */
export function getCheckpointNetAmount(campaign, checkpoint, now = new Date()) {
  if (getCheckpointStatus(checkpoint, now) !== 'resolved') return 0;
  const goal = Number(campaign.goal) || 0;
  if (!goal) return 0;
  const share = Math.round((Number(campaign.raised) || 0) * ((Number(checkpoint.amount) || 0) / goal));
  const refunded = getCheckpointSummary(campaign, checkpoint, now).refunded;
  return Math.max(0, share - refunded);
}

/** What's left to withdraw from one specific checkpoint's bucket right now — saques are organized
 * per checkpoint (not one pooled "how much do you want" amount), since each checkpoint is its own
 * building block of the campaign. */
export function getCheckpointAvailableToWithdraw(campaign, checkpoint, now = new Date()) {
  if (campaign.status === 'cancelled') return 0;
  const net = getCheckpointNetAmount(campaign, checkpoint, now);
  return Math.max(0, net - getCheckpointWithdrawnTotal(campaign, checkpoint.id));
}

/** True once at least one simulated backer has withdrawn at some checkpoint — this is what unlocks
 * the creator's "devolver o dinheiro de todo mundo" option. */
export function hasAnyCheckpointWithdrawal(campaign, now = new Date()) {
  return resolveSimulatedDecisions(campaign, now).some((b) => !b.active);
}

/** List of backers who withdrew, most-recent-decision-first, for the "quem saiu" breakdown. */
export function getWithdrawnBackers(campaign, now = new Date()) {
  return resolveSimulatedDecisions(campaign, now).filter((b) => !b.active);
}

/** The creator's "reforço": once anyone has left, refund every remaining backer in full and shut
 * the campaign down. Unlike the automatic proportional refund, this pays back 100% of every
 * still-active pledge — it's an opt-in escape hatch, not something that happens on its own. */
export function cancelCampaignAndRefundAll(email, id) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = list.find((c) => c.id === id);
  if (!record) return null;
  record.status = 'cancelled';
  record.cancelledAt = new Date().toISOString();
  all[key] = list;
  writeAll(all);
  return record;
}

export function getCampaignsByCreator(email) {
  if (!email) return [];
  return readAll()[email.trim().toLowerCase()] || [];
}

export function getCreatorCampaignById(email, id) {
  return getCampaignsByCreator(email).find((c) => c.id === id) || null;
}

/** Sum of every withdrawal made so far — legacy records from before per-amount withdrawals may
 * carry no `withdrawals` array at all, hence the `|| []`. */
export function getWithdrawnTotal(campaign) {
  return (campaign?.withdrawals || []).reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
}

/** Available balance excludes what's already been withdrawn, what's already been refunded to
 * departing backers, and what's still locked behind an unresolved checkpoint. */
export function getAvailableToWithdraw(campaign) {
  if (!campaign || campaign.status === 'cancelled') return 0;
  const hasCheckpoints = (campaign.checkpoints || []).length > 0;
  const locked = hasCheckpoints ? getCheckpointLockedAmount(campaign) : 0;
  const refunded = hasCheckpoints ? getCheckpointRefundedTotal(campaign) : 0;
  return Math.max(0, (Number(campaign.raised) || 0) - getWithdrawnTotal(campaign) - locked - refunded);
}

/** Creates a campaign for a creator. `status` is 'draft' or 'active' — set by the wizard depending
 * on whether the creator saved a draft or published. */
export function createCreatorCampaign(email, data) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    raised: 0,
    backers: 0,
    withdrawals: [],
    updates: [],
    checkpoints: [],
    ...data,
  };
  list.push(record);
  all[key] = list;
  writeAll(all);
  return record;
}

/** Overwrites an existing campaign's editable fields (title, image, category, goal, rewards, ...)
 * without touching id/createdAt/status/raised/backers — used when a creator edits a draft or an
 * already-published campaign through the wizard. Pass `status` explicitly only when it should change
 * (e.g. publishing a draft being edited); omitting it leaves the current status untouched. */
export function updateCreatorCampaign(email, id, data) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = list.find((c) => c.id === id);
  if (!record) return null;
  Object.assign(record, data);
  all[key] = list;
  writeAll(all);
  return record;
}

/** Publishes a draft (or otherwise changes status) — used by the "Publicar" action on the
 * dashboard row and on the campaign summary page. */
export function updateCreatorCampaignStatus(email, id, status) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = list.find((c) => c.id === id);
  if (!record) return null;
  record.status = status;
  all[key] = list;
  writeAll(all);
  return record;
}

/** Removes a campaign entirely — offered only for drafts and ended campaigns (never for a live
 * "active" one, which real backers may be watching). Caller (UI) enforces that restriction. */
export function deleteCreatorCampaign(email, id) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  all[key] = next;
  writeAll(all);
  return true;
}

/** Withdraws part or all of the funds still available (raised minus what's already been withdrawn).
 * Rejects amounts that are zero, negative, or exceed what's currently available. */
export function withdrawCampaignFunds(email, id, amount, payoutAccountId = null) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = list.find((c) => c.id === id);
  if (!record) return null;

  const requested = Math.round(Number(amount) || 0);
  const available = getAvailableToWithdraw(record);
  if (requested <= 0 || requested > available) return null;

  if (!record.withdrawals) record.withdrawals = [];
  record.withdrawals.push({ id: generateId(), amount: requested, withdrawnAt: new Date().toISOString(), payoutAccountId });
  all[key] = list;
  writeAll(all);
  return record;
}

/** Withdraws from one checkpoint's own bucket — a campaign built from checkpoints has its saques
 * organized the same way, one resolved checkpoint at a time, instead of a single pooled amount.
 * Rejects if the checkpoint hasn't resolved yet or the amount exceeds what's left in its bucket. */
export function withdrawCheckpointFunds(email, id, checkpointId, amount, payoutAccountId = null) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = list.find((c) => c.id === id);
  if (!record) return null;

  const checkpoint = (record.checkpoints || []).find((cp) => cp.id === checkpointId);
  if (!checkpoint) return null;

  const requested = Math.round(Number(amount) || 0);
  const available = getCheckpointAvailableToWithdraw(record, checkpoint);
  if (requested <= 0 || requested > available) return null;

  if (!record.withdrawals) record.withdrawals = [];
  record.withdrawals.push({ id: generateId(), amount: requested, withdrawnAt: new Date().toISOString(), checkpointId, payoutAccountId });
  all[key] = list;
  writeAll(all);
  return record;
}

/** Posts a campaign update — shown to backers on the public campaign page and listed here for
 * the creator's own reference. */
export function addCreatorCampaignUpdate(email, id, { title, description }) {
  const all = readAll();
  const key = email.trim().toLowerCase();
  const list = all[key] || [];
  const record = list.find((c) => c.id === id);
  if (!record) return null;
  if (!record.updates) record.updates = [];
  record.updates.unshift({ id: generateId(), title, description, createdAt: new Date().toISOString() });
  all[key] = list;
  writeAll(all);
  return record;
}
