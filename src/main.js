import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Facebook,
  Flag,
  Globe,
  Heart,
  Hexagon,
  Image,
  Instagram,
  LayoutGrid,
  List,
  Lock,
  LogOut,
  Mail,
  MailCheck,
  MapPin,
  Menu,
  MoreVertical,
  Pencil,
  Plus,
  Rocket,
  Search,
  Settings,
  Sparkles,
  Twitter,
  Undo2,
  User,
  X,
  createIcons,
} from 'lucide';
import { App } from './App.js';
import { Account, initAccount } from './components/Account.js';
import { initHeaderAuth } from './components/Header.js';
import { initMobileMenu, initNavScrollEffect } from './components/MobileMenu.js';
import { initMyPledges, MyPledges } from './components/MyPledges.js';
import { initSearch } from './components/SearchBar.js';
import { SearchResults } from './components/SearchResults.js';
import { initCustomSelects } from './components/SelectField.js';
import './styles/tailwind.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/utilities.css';

import { Auth, initAuth } from './components/Auth.js';
import { initBottomSheet } from './components/BottomSheet.js';
import { CampaignDetails, initCarousel, initCheckpointDecision, initComments, initDonation, initCountdown, initSteppers, initFaqAccordion } from './components/CampaignDetails.js';
import { initCampaignTabs, initHeaderSwap } from './components/CampaignHeader.js';
import { Checkout, initCheckout } from './components/Checkout.js';
import { CreatorAuth, initCreatorAuth } from './components/CreatorAuth.js';
import { CreateCampaign, CreatorCampaignSummary, initCreateCampaign, initCreatorCampaignSummary } from './components/CreateCampaign.js';
import { CreatorDashboard, initCreatorDashboard } from './components/CreatorDashboard.js';
import { DesignSystem } from './components/DesignSystem.js';
import { getCreatorSession } from './data/creatorStore.js';

const appRoot = document.getElementById('app');

function render() {
  if (!appRoot) return;

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('project');
  const isCheckout = projectId && params.has('checkout');
  const authView = params.get('auth');
  const isAuth = !!authView;
  // "?account=pledges/1" is a mocked preview of the populated state — the "/1" isn't a real path,
  // just a suffix on the query value so the demo URL stays a single param like the rest of the app.
  const [accountView, accountMock] = (params.get('account') || '').split('/');
  const isAccount = params.has('account');
  const isMyPledges = isAccount && accountView === 'pledges';
  const creatorView = params.get('creator');
  const isCreatorAuth = creatorView === 'login' || creatorView === 'signup' || creatorView === 'forgot';
  const isCreatorDashboard = creatorView === 'dashboard';
  const isCreatorNew = creatorView === 'new';
  const isCreatorSummary = creatorView === 'summary';
  const isDesignSystem = params.has('ds');
  const isSearch = !projectId && !isAccount && !creatorView && (params.has('search') || params.has('category') || params.has('sort'));

  if (isDesignSystem) {
    appRoot.innerHTML = DesignSystem();
  } else if (isAuth) {
    appRoot.innerHTML = Auth(authView, window.location.search);
  } else if (isCreatorAuth) {
    appRoot.innerHTML = CreatorAuth(creatorView, window.location.search);
  } else if (isCreatorDashboard) {
    appRoot.innerHTML = CreatorDashboard(window.location.search);
  } else if (isCreatorNew) {
    appRoot.innerHTML = CreateCampaign(window.location.search);
  } else if (isCreatorSummary) {
    appRoot.innerHTML = CreatorCampaignSummary(window.location.search);
  } else if (isMyPledges) {
    appRoot.innerHTML = MyPledges({ mock: accountMock === '1' });
  } else if (isAccount) {
    appRoot.innerHTML = Account();
  } else if (isCheckout) {
    appRoot.innerHTML = Checkout(projectId, window.location.search);
  } else if (projectId) {
    appRoot.innerHTML = CampaignDetails(projectId);
  } else if (isSearch) {
    appRoot.innerHTML = SearchResults(window.location.search);
  } else {
    appRoot.innerHTML = App();
  }

  /* Tema da área do criador. tokens.css já definia [data-area="creator"] trocando os canais de
     accent de azul para violeta, mas nada no app chegava a marcar o atributo, então `accent`
     resolvia azul dentro do wizard enquanto todo botão ao lado era violeta. Marcar aqui, no
     único ponto por onde toda rota passa, faz o token valer para tudo que estiver na tela,
     inclusive os modais que vivem fora do <main>. */
  const isCreatorArea = isCreatorAuth || isCreatorDashboard || isCreatorNew || isCreatorSummary;
  if (isCreatorArea) appRoot.dataset.area = 'creator';
  else delete appRoot.dataset.area;

  // Re-initialize dynamic elements after innerHTML changes
  createIcons({
    icons: {
      AlertTriangle,
      ArrowRight,
      Calendar,
      Camera,
      Check,
      ChevronDown,
      ChevronLeft,
      ChevronRight,
      Clock,
      CreditCard,
      Facebook,
      Flag,
      Globe,
      Heart,
      Hexagon,
      Image,
      Instagram,
      LayoutGrid,
      List,
      Lock,
      LogOut,
      Mail,
      MailCheck,
      MapPin,
      Menu,
      MoreVertical,
      Pencil,
      Plus,
      Rocket,
      Search,
      Settings,
      Sparkles,
      Twitter,
      Undo2,
      User,
      X,
    },
  });

  // Auth pages have their own self-contained shell (no global nav), so the
  // mobile menu / search / header-auth inits below are harmless no-ops there.
  initMobileMenu();
  initNavScrollEffect();
  initSearch();
  initHeaderAuth();
  initCustomSelects();

  // Hero's "Criar campanha" is a <button>, not a link, so it needs its own click wiring
  // instead of going through the anchor-click SPA interceptor below. Already has a creator
  // session? Skip the login screen and go straight to the dashboard.
  document.getElementById('hero-create-campaign-btn')?.addEventListener('click', () => {
    const destination = getCreatorSession() ? '?creator=dashboard' : '?creator=login';
    window.history.pushState({}, '', destination);
    render();
    window.scrollTo(0, 0);
  });

  if (isAuth) {
    initAuth(authView);
  } else if (isCreatorAuth) {
    initCreatorAuth(creatorView);
  } else if (isCreatorDashboard) {
    initCreatorDashboard();
  } else if (isCreatorNew) {
    initCreateCampaign();
  } else if (isCreatorSummary) {
    initCreatorCampaignSummary();
  } else if (isMyPledges) {
    initMyPledges();
  } else if (isAccount) {
    initAccount();
  } else if (isCheckout) {
    initCheckout();
  } else if (projectId) {
    initCarousel();
    initDonation();
    initCountdown();
    initCheckpointDecision();
    initSteppers();
    initFaqAccordion();
    initComments();
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
