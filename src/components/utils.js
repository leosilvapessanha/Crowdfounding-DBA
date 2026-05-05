export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

export function icon(name, className = '') {
  return `<i data-lucide="${escapeHtml(name)}" class="${escapeHtml(className)}" aria-hidden="true"></i>`;
}
