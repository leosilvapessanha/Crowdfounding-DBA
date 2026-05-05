## Épico 11 — SEO orgânico, arquitetura indexável e crescimento sem tráfego pago

### Implementar e auditar SEO técnico após migração para Next.js

**Issue type:** Technical Enabler / Engineering Task + Product SEO  
**Prioridade:** Alta  
**Área responsável:** Engenharia, Produto e Conteúdo  
**Tecnologia:** Next.js com App Router  
**Momento de implementação:** Após a migração do projeto para Next.js já ter sido concluída  
**Objetivo de negócio:** Aumentar a capacidade da plataforma de ser encontrada organicamente no Google sem depender de tráfego pago

**Como:** plataforma de crowdfunding de RPG já migrada para Next.js  
**Quero:** auditar, corrigir e expandir a base de SEO técnico, arquitetura indexável, metadados, sitemap, robots, dados estruturados, performance e páginas públicas  
**Para:** aumentar as chances de ranqueamento em buscas relacionadas a crowdfunding de RPG, projetos independentes, campanhas abertas, categorias de RPG e criadores

**_LOCALIZAÇÃO:_**  
Projeto Next.js já migrado > `app/`, `app/layout.tsx`, rotas públicas, home, páginas de campanha, páginas de categoria, listagens editoriais, blog/guias, sitemap, robots, metadata, JSON-LD, cards, carrosséis, links internos e assets

---

#### Contexto

A migração do projeto para Next.js já foi concluída.

Esta issue não deve recriar a migração nem alterar a arquitetura sem necessidade. O objetivo é revisar o projeto já migrado e garantir que ele esteja preparado para SEO orgânico, indexação, rastreamento, performance, compartilhamento social, links internos e crescimento sem tráfego pago.

SEO não garante primeira posição no Google. Esta issue tem como objetivo remover barreiras técnicas, melhorar a compreensão do conteúdo pelos mecanismos de busca, aumentar a qualidade das páginas públicas e preparar a plataforma para competir organicamente em buscas de nicho.

A plataforma quer competir sem tráfego pago com ferramentas e plataformas de crowdfunding, priorizando termos específicos do universo RPG, como:

- crowdfunding de RPG;
- financiamento coletivo RPG;
- campanhas de RPG abertas;
- apoiar projeto de RPG;
- RPG independente Brasil;
- livros de RPG independentes;
- miniaturas de RPG;
- mapas de RPG;
- suplementos de RPG;
- sistemas de RPG;
- aventuras de RPG;
- criar campanha de RPG;
- como apoiar projetos de RPG;
- como financiar um RPG independente.

A estratégia deve priorizar páginas públicas úteis, rastreáveis e indexáveis, em vez de depender apenas da home.

Responsividade não é negociável.

---

#### Destinado à engenharia

A IA responsável por codar deve considerar que o projeto **já está em Next.js com App Router**.

Não refazer a migração.

O trabalho esperado é:

1. Auditar a estrutura existente.
2. Corrigir lacunas de SEO técnico.
3. Implementar arquivos e metadados ausentes.
4. Melhorar arquitetura de rotas indexáveis.
5. Garantir links internos rastreáveis.
6. Implementar ou ajustar JSON-LD.
7. Melhorar performance e responsividade.
8. Preparar a plataforma para crescimento orgânico.

---

#### Regras de negócio

1. A home deve ser indexável.
2. Páginas públicas de campanhas devem ser indexáveis quando a campanha estiver publicada.
3. Páginas públicas de categorias devem ser indexáveis quando tiverem conteúdo relevante.
4. Listagens editoriais devem ter URLs próprias e indexáveis quando fizer sentido.
5. Páginas privadas não devem ser indexadas.
6. Login, cadastro, checkout, painel do usuário, dashboard do criador e rotas administrativas devem ser bloqueadas ou marcadas como `noindex`.
7. Cada página indexável deve possuir título único.
8. Cada página indexável deve possuir descrição única.
9. Cada página indexável deve possuir canonical.
10. Cada página indexável deve possuir apenas um `h1`.
11. A hierarquia de headings deve ser semântica e coerente.
12. Conteúdo crítico não deve depender exclusivamente de renderização client-side.
13. Links importantes devem usar `next/link` com `href` real.
14. Cards de campanhas devem ter links reais para páginas públicas de campanha.
15. Cards finais “Ver todos” dos carrosséis devem ter links reais para suas respectivas listagens.
16. Imagens de campanhas devem usar `next/image`, salvo justificativa técnica documentada.
17. Imagens devem possuir `alt` descritivo.
18. Imagens devem possuir dimensões definidas para evitar layout shift.
19. Vídeos de background devem possuir `poster` ou fallback visual.
20. O vídeo da hero não pode prejudicar leitura, performance ou responsividade.
21. A experiência mobile deve ser tratada como parte obrigatória da estratégia de SEO.
22. A plataforma deve possuir `robots.ts` ou equivalente funcional no Next.js.
23. A plataforma deve possuir `sitemap.ts` ou equivalente funcional no Next.js.
24. O sitemap deve incluir rotas públicas relevantes.
25. O sitemap deve incluir campanhas públicas dinamicamente quando houver fonte de dados.
26. A plataforma deve possuir dados estruturados em JSON-LD quando aplicável.
27. O conteúdo visível para mecanismos de busca deve corresponder ao conteúdo entregue ao usuário.
28. A implementação não deve usar keyword stuffing.
29. A implementação não deve usar conteúdo oculto enganoso.
30. A implementação não deve criar páginas programáticas vazias ou sem valor real.
31. O Design System deve ser preservado.
32. A implementação não deve adicionar dependências desnecessárias.
33. Todas as páginas públicas devem funcionar corretamente em desktop, tablet e mobile.
34. Ajustes devem respeitar a estrutura Next.js já migrada, evitando refatorações amplas desnecessárias.

---

#### Solução

1. Auditar a estrutura atual do projeto Next.js.

2. Verificar se existem e estão corretos:
   - `app/layout.tsx`;
   - `app/page.tsx`;
   - `app/robots.ts`;
   - `app/sitemap.ts`;
   - rotas públicas;
   - rotas privadas;
   - componentes de cards;
   - componentes de carrossel;
   - componentes de metadata;
   - componentes de JSON-LD;
   - uso de `next/link`;
   - uso de `next/image`.

3. Caso não existam, criar ou corrigir os arquivos:
   - `app/robots.ts`;
   - `app/sitemap.ts`;
   - componentes de JSON-LD;
   - helpers de metadata;
   - helpers de canonical;
   - fallback de imagem;
   - fallback de vídeo.

4. Garantir que o `app/layout.tsx` possua:
   - `metadataBase`;
   - title default;
   - title template;
   - description default;
   - Open Graph;
   - Twitter Cards;
   - lang `pt-BR`;
   - configuração correta de fontes, se aplicável.

5. Garantir que páginas dinâmicas usem `generateMetadata`, especialmente:
   - campanhas;
   - categorias;
   - criadores;
   - artigos de blog;
   - guias.

6. Criar ou validar `app/robots.ts` com:
   - permissão para rotas públicas;
   - bloqueio para rotas privadas;
   - referência ao sitemap.

7. Criar ou validar `app/sitemap.ts` com:
   - home;
   - `/projetos`;
   - `/projetos/mais-apoiados`;
   - `/projetos/novidades`;
   - `/projetos/ultimos-dias`;
   - categorias públicas;
   - campanhas públicas;
   - criadores públicos;
   - guias;
   - blog;
   - páginas institucionais relevantes.

8. Garantir que o sitemap não inclua:
   - login;
   - cadastro;
   - checkout;
   - painel;
   - dashboard do criador;
   - admin;
   - campanhas privadas;
   - páginas de erro;
   - páginas sem conteúdo público relevante.

9. Auditar e corrigir URLs públicas para que sejam amigáveis e descritivas.

10. Validar rotas indexáveis esperadas:
   - `/projetos`;
   - `/projetos/mais-apoiados`;
   - `/projetos/novidades`;
   - `/projetos/ultimos-dias`;
   - `/categoria/livros-rpg`;
   - `/categoria/aventuras-rpg`;
   - `/categoria/miniaturas-rpg`;
   - `/categoria/mapas-rpg`;
   - `/categoria/sistemas-rpg`;
   - `/categoria/suplementos-rpg`;
   - `/campanha/[slug]`;
   - `/criador/[slug]`;
   - `/guia/como-apoiar-projetos-de-rpg`;
   - `/guia/como-criar-campanha-de-rpg`;
   - `/blog`;
   - `/blog/[slug]`.

11. Caso alguma rota pública ainda não exista, preparar estrutura mínima ou registrar TODO técnico claro no código, sem quebrar a aplicação.

12. Auditar a home.

13. Garantir que a home tenha:
   - `h1` único;
   - title e description adequados;
   - canonical;
   - Open Graph;
   - Twitter Card;
   - seções com headings corretos;
   - links reais para campanhas, categorias e listagens;
   - JSON-LD de `WebSite`;
   - JSON-LD de `Organization`, se houver dados suficientes;
   - `SearchAction`, se a busca interna existir como rota real.

14. Auditar páginas de campanha pública.

15. Cada página de campanha pública deve possuir:
   - slug legível;
   - title único;
   - meta description única;
   - canonical;
   - Open Graph próprio;
   - imagem social própria;
   - `h1`;
   - resumo da campanha;
   - descrição completa;
   - categoria;
   - tags;
   - criador;
   - progresso de financiamento;
   - prazo;
   - recompensas;
   - FAQ, quando disponível;
   - atualizações, quando disponíveis;
   - links para campanhas relacionadas;
   - dados estruturados quando aplicável.

16. Auditar páginas de categoria.

17. Cada página de categoria deve possuir:
   - title único;
   - meta description única;
   - canonical;
   - `h1`;
   - texto introdutório original;
   - lista de campanhas relacionadas;
   - links para categorias relacionadas;
   - FAQ quando fizer sentido;
   - conteúdo suficiente para não ser uma página vazia.

18. Auditar listagens editoriais.

19. As listagens editoriais devem incluir:
   - “Projetos com mais apoiadores”;
   - “Novidades da semana”;
   - “Últimos dias para apoiar”.

20. Cada listagem editorial deve possuir:
   - URL própria;
   - title único;
   - description única;
   - heading correto;
   - texto introdutório curto;
   - cards com links reais;
   - paginação ou carregamento progressivo quando necessário.

21. Auditar hub editorial, guias e blog.

22. Garantir que existam ou estejam previstas rotas para:
   - `/guia/como-apoiar-projetos-de-rpg`;
   - `/guia/como-criar-campanha-de-rpg`;
   - `/blog`.

23. Preparar estrutura para conteúdos futuros relacionados a:
   - melhores campanhas de RPG do mês;
   - RPG independente brasileiro;
   - como financiar um livro de RPG;
   - como apoiar projetos independentes;
   - guias de categorias;
   - entrevistas com criadores;
   - lançamentos de RPG independente.

24. Garantir que conteúdos editoriais tenham:
   - title único;
   - description única;
   - `h1`;
   - headings hierárquicos;
   - links internos;
   - links para campanhas relacionadas;
   - conteúdo útil e não genérico.

25. Auditar páginas públicas de criadores.

26. Cada página pública de criador deve possuir:
   - slug próprio;
   - nome do criador;
   - bio;
   - campanhas ativas;
   - campanhas anteriores;
   - estatísticas públicas, se disponíveis;
   - links oficiais;
   - title;
   - description;
   - canonical;
   - Open Graph;
   - dados estruturados quando aplicável.

27. Auditar arquitetura de links internos.

28. Links internos obrigatórios:
   - home para listagens editoriais;
   - home para categorias;
   - cards para campanhas;
   - campanhas para categorias;
   - campanhas para criadores;
   - campanhas para campanhas relacionadas;
   - categorias para campanhas;
   - categorias para categorias relacionadas;
   - blog/guias para campanhas e categorias;
   - card final dos carrosséis para listagens completas;
   - link “Ver todos” do topo para a mesma rota do card final.

29. Garantir que textos âncora sejam descritivos.

30. Evitar âncoras genéricas como:
   - “clique aqui”;
   - “saiba mais” sem contexto;
   - “ver” isolado.

31. Preferir âncoras como:
   - “Ver campanhas de RPG de fantasia”;
   - “Explorar miniaturas de RPG”;
   - “Apoiar projetos independentes de RPG”;
   - “Conhecer campanhas nos últimos dias”.

32. Implementar ou corrigir JSON-LD.

33. JSON-LD esperado na home:
   - `WebSite`;
   - `Organization`;
   - `SearchAction`, se houver busca real.

34. JSON-LD esperado em listagens:
   - `ItemList`.

35. JSON-LD esperado em breadcrumbs:
   - `BreadcrumbList`.

36. JSON-LD esperado em campanhas:
   - `CreativeWork`, `Product` ou estrutura equivalente, conforme modelagem final.

37. Garantir que JSON-LD não declare informações falsas ou invisíveis para o usuário.

38. Auditar imagens.

39. Cada imagem de campanha deve possuir:
   - `src`;
   - `alt`;
   - `width`;
   - `height`;
   - fallback quando necessário.

40. Usar `next/image` sempre que aplicável.

41. Auditar vídeo da hero.

42. O vídeo da hero deve possuir:
   - arquivo comprimido;
   - `poster`;
   - `muted`;
   - `playsInline`;
   - `loop`, quando necessário;
   - fallback visual;
   - overlay adequado;
   - respeito a `prefers-reduced-motion`.

43. Evitar que vídeo da hero prejudique LCP.

44. Auditar performance.

45. A implementação deve:
   - evitar JavaScript desnecessário;
   - usar Server Components quando possível;
   - usar Client Components apenas onde houver interação real;
   - carregar scripts não críticos com `defer` quando aplicável;
   - evitar bibliotecas pesadas sem necessidade;
   - evitar layout shift;
   - otimizar fontes;
   - otimizar imagens;
   - preservar Core Web Vitals.

46. Auditar responsividade.

47. Em mobile:
   - não pode haver overflow horizontal;
   - botões devem ter área de toque confortável;
   - busca deve ser utilizável;
   - carrosséis devem funcionar por toque;
   - card final “Ver todos” deve ser acessível;
   - textos devem ser legíveis;
   - vídeo deve manter contraste adequado;
   - header deve ser utilizável.

48. Auditar acessibilidade como parte da base de SEO.

49. Garantir:
   - HTML semântico;
   - labels em formulários;
   - `aria-label` quando necessário;
   - foco visível;
   - navegação por teclado;
   - contraste adequado;
   - textos alternativos;
   - elementos interativos reais.

50. Preparar documentação técnica com:
   - rotas indexáveis;
   - rotas bloqueadas;
   - regras de canonical;
   - padrão de metadata;
   - padrão de slug;
   - padrão de `alt`;
   - padrão de JSON-LD;
   - padrão de páginas de campanha;
   - padrão de páginas de categoria;
   - padrão de conteúdo editorial.

---

#### Destinado à engenharia

##### Estrutura global esperada

Validar se o projeto já possui equivalente a:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.exemplo.com.br"),
  title: {
    default: "Trama RPG — Descubra e apoie projetos independentes de RPG",
    template: "%s | Trama RPG",
  },
  description:
    "Explore campanhas independentes de RPG, apoie criadores e descubra livros, aventuras, mapas, miniaturas, sistemas e suplementos para sua mesa.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Trama RPG — Descubra e apoie projetos independentes de RPG",
    description:
      "Explore campanhas independentes de RPG, apoie criadores e descubra novas aventuras para sua mesa.",
    url: "https://www.exemplo.com.br",
    siteName: "Trama RPG",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trama RPG — plataforma de crowdfunding para projetos de RPG",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trama RPG — Descubra e apoie projetos independentes de RPG",
    description:
      "Explore campanhas independentes de RPG, apoie criadores e descubra novas aventuras para sua mesa.",
    images: ["/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};