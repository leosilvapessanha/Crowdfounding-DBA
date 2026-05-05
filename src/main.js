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

const appRoot = document.getElementById('app');

if (appRoot) {
  appRoot.innerHTML = App();
}

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
