import { searchCampaigns } from '../data/campaigns.js';
import { Footer } from './Footer.js';
import { Header } from './Header.js';
import { ProjectCard } from './ProjectCard.js';
import { escapeHtml, icon } from './utils.js';

/** The "/search" results page — reached from the header search bar (term, category and/or sort as
 * query params). Refining happens from that same header search bar, not from a second toolbar here. */
export function SearchResults(queryString) {
  const params = new URLSearchParams(queryString);
  const term = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'populares';

  const results = searchCampaigns({ term, category, sort });

  return `
    ${Header()}
    <main class="min-h-screen pb-20 pt-28 md:pt-36">
      <div class="px-5 md:px-8 xl:px-[10%] 2xl:px-[256px]">
        <h1 class="font-manrope font-bold text-slate-900 text-[24px] md:text-[28px] mb-1">${term ? `Resultados para "${escapeHtml(term)}"` : 'Explorar projetos'}</h1>
        <p class="text-[14px] text-slate-500 font-inter mb-8">${results.length} campanha${results.length === 1 ? '' : 's'} encontrada${results.length === 1 ? '' : 's'}.</p>

        ${results.length ? `
          <div class="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>a]:!w-full">
            ${results.map(ProjectCard).join('')}
          </div>
        ` : `
          <div class="bg-white border border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">${icon('search', 'w-6 h-6')}</div>
            <h3 class="text-[16px] font-manrope font-bold text-slate-900 mb-1.5">Nenhum projeto encontrado</h3>
            <p class="text-[14px] text-slate-500 font-inter mb-5">Tente outro termo ou remova os filtros aplicados.</p>
            <a href="/" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-[14px] font-inter">
              Voltar para a home ${icon('arrow-right', 'w-4 h-4')}
            </a>
          </div>
        `}
      </div>
    </main>
    ${Footer()}
  `;
}
