import {
  ArrowRight,
  ChevronDown,
  Clock,
  Facebook,
  Globe,
  Hexagon,
  Instagram,
  LayoutGrid,
  Menu,
  Search,
  Sparkles,
  Twitter,
  X,
  createIcons,
} from 'lucide';
import { App } from './App.js';
import { initMobileMenu, initNavScrollEffect } from './components/MobileMenu.js';
import { initSearch } from './components/SearchBar.js';
import './styles/tailwind.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/utilities.css';

import { initBottomSheet } from './components/BottomSheet.js';
import { CampaignDetails, initCarousel, initDonation, initCountdown } from './components/CampaignDetails.js';
import { initCampaignTabs, initHeaderSwap } from './components/CampaignHeader.js';

const appRoot = document.getElementById('app');

function render() {
  if (!appRoot) return;

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project');

  if (projectId) {
    appRoot.innerHTML = CampaignDetails(projectId);
  } else {
    appRoot.innerHTML = App();
  }

  // Re-initialize dynamic elements after innerHTML changes
  createIcons({
    icons: {
      ArrowRight,
      ChevronDown,
      Clock,
      Facebook,
      Globe,
      Hexagon,
      Instagram,
      LayoutGrid,
      Menu,
      Search,
      Sparkles,
      Twitter,
      X,
    },
  });

  initMobileMenu();
  initNavScrollEffect();
  initSearch();

  // Initialize carousel, donation, tabs, header swap, and bottom sheet on campaign details page
  if (projectId) {
    initCarousel();
    initDonation();
    initCountdown();
    initCampaignTabs();
    initHeaderSwap();
    initBottomSheet();
  }

  // Smooth scroll for hash links on the same page
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Handle browser navigation (Back/Forward)
window.addEventListener('popstate', render);

// Intercept link clicks to maintain SPA routing
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.href) {
    const url = new URL(link.href);
    // If the link is internal to this origin
    if (url.origin === window.location.origin) {
      // If it's a project link or the home link
      if (url.searchParams.has('project') || url.pathname === '/') {
        // Allow normal link behavior for hash links within the same page
        if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
        
        e.preventDefault();
        window.history.pushState({}, '', link.href);
        render();
        window.scrollTo(0, 0);
      }
    }
  }
});

// Initial render
render();
