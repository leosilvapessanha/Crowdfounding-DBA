import { Footer } from './components/Footer.js';
import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { ProjectCarousel } from './components/ProjectCarousel.js';
import { SearchModal } from './components/SearchBar.js';
import { SectionHeader } from './components/SectionHeader.js';
import { campaignGroups, carouselCtas } from './data/campaigns.js';

const projectSections = [
  {
    id: 'destaques',
    title: 'Projetos com mais apoiadores',
    group: 'featured',
    href: '#todos-projetos',
    className: 'w-full py-12 md:py-20 relative z-10',
  },
  {
    id: 'novidades',
    title: 'Novidades da semana',
    group: 'weekly',
    href: '#',
    className: 'w-full bg-white py-12 md:py-20 relative z-10',
  },
  {
    id: 'ultimos-dias',
    title: 'Últimos dias para apoiar',
    group: 'ending',
    href: '#',
    className: 'w-full py-12 md:py-20 relative z-10',
  },
];

function ProjectSection(section) {
  return `<section class="${section.className}" id="${section.id}">
    <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px]">
      <div class="w-full">
        ${SectionHeader({ title: section.title, href: section.href })}
        ${ProjectCarousel({
          campaigns: campaignGroups[section.group],
          cta: carouselCtas[section.group],
        })}
      </div>
    </div>
  </section>`;
}

export function App() {
  return `${Header()}
  ${Hero()}
  ${projectSections.map(ProjectSection).join('\n')}
  ${Footer()}
  ${SearchModal()}`;
}
