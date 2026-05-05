/**
 * Reusable progress bar used by both ProjectCard and CampaignDetails.
 * @param {{ progress: number, height?: string }} opts
 */
export function ProgressBar({ progress, height = 'h-[4px]' }) {
  const clamped = Math.min(100, Math.max(0, Number(progress) || 0));
  return `<div class="w-full bg-slate-100 rounded-full ${height}"><div class="bg-blue-600 ${height} rounded-full" style="width: ${clamped}%"></div></div>`;
}
