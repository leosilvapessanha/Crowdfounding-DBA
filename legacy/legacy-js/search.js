(() => {
function setExpanded(button, isOpen) {
  button?.setAttribute('aria-expanded', String(isOpen));
}

function initMobileSearch() {
  const mobileSearchTrigger = document.getElementById('mobile-search-trigger');
  const mobileSearchModal = document.getElementById('mobile-search-modal');
  const closeSearchModalBtn = document.getElementById('close-search-modal');

  if (!mobileSearchModal) return;

  const setSearchOpen = (isOpen) => {
    mobileSearchModal.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    setExpanded(mobileSearchTrigger, isOpen);
  };

  mobileSearchTrigger?.addEventListener('click', () => setSearchOpen(true));
  closeSearchModalBtn?.addEventListener('click', () => setSearchOpen(false));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileSearchModal.classList.contains('hidden')) {
      setSearchOpen(false);
    }
  });
}

function initDesktopSearch() {
  const searchInput = document.getElementById('desktop-search-input');
  const searchBtn = document.getElementById('desktop-search-btn');

  const performSearch = () => {
    const term = searchInput ? searchInput.value.trim() : '';
    if (term) {
      console.log(`Searching for: "${term}"`);
    }
  };

  searchBtn?.addEventListener('click', performSearch);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') performSearch();
  });
}

window.TramaSearch = {
  initDesktopSearch,
  initMobileSearch,
};
})();
