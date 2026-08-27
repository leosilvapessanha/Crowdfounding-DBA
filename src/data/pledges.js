const PLEDGES_KEY = 'trama_pledges';

function readPledges() {
  try {
    const raw = localStorage.getItem(PLEDGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePledges(pledges) {
  localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges));
}

/** Older records were plain campaign-id strings — normalize those to the richer shape on read.
 * `decisions` maps a checkpoint id to what the backer chose there ('continued' | 'withdrawn'). */
function normalizeEntry(entry) {
  const base = typeof entry === 'string'
    ? { campaignId: entry, rewardTitle: null, amount: null, pledgedAt: null }
    : entry;
  return { decisions: {}, withdrawnAt: null, refundedAmount: 0, ...base };
}

/** Full pledge records for a user: which campaign, which reward tier, how much, and when. */
export function getPledges(email) {
  if (!email) return [];
  return (readPledges()[email.trim().toLowerCase()] || []).map(normalizeEntry);
}

export function getPledge(email, campaignId) {
  return getPledges(email).find((p) => p.campaignId === campaignId) || null;
}

/** A backer who withdrew at a checkpoint is no longer supporting the campaign — the pledge stays
 * on record (with what came back) instead of disappearing, so the history stays honest. */
export function isPledgeWithdrawn(pledge) {
  return !!pledge?.withdrawnAt;
}

/** Records the backer's choice at one checkpoint. Withdrawing ends the pledge and books the
 * proportional refund; continuing just marks that checkpoint as decided so it stops asking. */
export function setCheckpointDecision(email, campaignId, checkpointId, decision, refundAmount = 0) {
  if (!email || !campaignId || !checkpointId) return null;
  const pledges = readPledges();
  const key = email.trim().toLowerCase();
  const list = (pledges[key] || []).map(normalizeEntry);
  const pledge = list.find((p) => p.campaignId === campaignId);
  if (!pledge) return null;

  pledge.decisions = { ...pledge.decisions, [checkpointId]: decision };
  if (decision === 'withdrawn') {
    pledge.withdrawnAt = new Date().toISOString();
    pledge.refundedAmount = Math.round(Number(refundAmount) || 0);
  }
  pledges[key] = list;
  writePledges(pledges);
  return pledge;
}

export function getSupportedCampaignIds(email) {
  return getPledges(email).map((p) => p.campaignId);
}

export function hasSupportedCampaign(email, campaignId) {
  return getSupportedCampaignIds(email).includes(campaignId);
}

/** Records a completed checkout — including what was bought and for how much — so "Minhas campanhas
 * apoiadas" can show the actual reward/amount instead of just "you backed this". */
export function addSupportedCampaign(email, campaignId, { rewardTitle = null, amount = null } = {}) {
  if (!email || !campaignId) return;
  const pledges = readPledges();
  const key = email.trim().toLowerCase();
  const list = (pledges[key] || []).map(normalizeEntry);
  if (list.some((p) => p.campaignId === campaignId)) return;
  list.push({ campaignId, rewardTitle, amount, pledgedAt: new Date().toISOString() });
  pledges[key] = list;
  writePledges(pledges);
}
