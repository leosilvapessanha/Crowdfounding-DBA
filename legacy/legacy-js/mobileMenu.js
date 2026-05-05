(() => {
function setExpanded(button, isOpen) {
  button?.setAttribute('aria-expanded', String(isOpen));
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!mobileMenu) return;

  const setMenuOpen = (isOpen) => {
    mobileMenu.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    setExpanded(mobileMenuBtn, isOpen);
  };

  mobileMenuBtn?.addEventListener('click', () => setMenuOpen(true));
  closeMobileMenuBtn?.addEventListener('click', () => setMenuOpen(false));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      setMenuOpen(false);
    }
  });
}

function initNavScrollEffect() {
  const navContainer = document.querySelector('nav > div');
  if (!navContainer) return;

  const updateNavState = () => {
    if (window.scrollY > 10) {
      navContainer.classList.add('bg-white/90', 'backdrop-blur-3xl');
      navContainer.classList.remove('bg-white/60', 'md:bg-white/45');
      return;
    }

    navContainer.classList.remove('bg-white/90', 'backdrop-blur-3xl');
    navContainer.classList.add('bg-white/60', 'md:bg-white/45');
  };

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });
}

window.TramaMobileMenu = {
  initMobileMenu,
  initNavScrollEffect,
};
})();
