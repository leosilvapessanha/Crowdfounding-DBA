# Contexto do Projeto — Plataforma de Crowdfunding de RPG

## 1. Visão geral

O projeto é uma plataforma de **crowdfunding focada no universo de RPG**, voltada para conectar apoiadores/compradores a criadores de campanhas e produtos relacionados a RPG.

A plataforma deve funcionar como um marketplace de descoberta e apoio a projetos criativos, incluindo:

- livros de RPG;
- aventuras;
- suplementos;
- sistemas independentes;
- mapas;
- miniaturas;
- acessórios;
- livros;
- conteúdos narrativos;
- campanhas de criadores independentes.

O foco principal da experiência inicial é o **comprador/apoiador**, não o vendedor/criador.

O criador deve existir como caminho secundário, por exemplo com links como:

- “Para criadores”;
- “Criar campanha”;
- “Publique seu projeto”.

---

## 2. Objetivo da plataforma

A plataforma deve permitir que o usuário:

1. Descubra projetos criativos de RPG.
2. Busque campanhas pelo nome.
3. Filtre projetos por categoria.
4. Explore campanhas em destaque.
5. Apoie criadores e projetos independentes.
6. Sinta que está participando de uma comunidade ligada a RPG, fantasia, narrativa e criatividade.

A experiência deve comunicar:

- descoberta;
- apoio;
- comunidade;
- curadoria;
- confiança;
- imaginação;
- construção de mundos;
- financiamento coletivo;
- projetos independentes;
- RPG de mesa como cultura.

---

## 3. Público-alvo

### Público principal: apoiadores/compradores

São pessoas que:

- gostam de RPG de mesa;
- querem descobrir campanhas e projetos;
- valorizam livros, mapas, miniaturas, suplementos e aventuras;
- gostam de apoiar criadores independentes;
- procuram curadoria, confiança e sensação de pertencimento;
- querem uma experiência moderna, fácil e visualmente agradável.

Esse público deve orientar as decisões principais de UI, branding e copy.

### Público secundário: criadores

São pessoas ou grupos que criam produtos de RPG, como:

- autores;
- ilustradores;
- mestres;
- editoras independentes;
- designers de sistemas;
- makers de miniaturas;
- criadores de mapas;
- produtores de acessórios;
- desenvolvedores de aventuras e campanhas.

Eles devem ter um caminho claro para publicar campanhas.

---

## 4. Direção de marca

A direção estratégica definida para a identidade visual é:

## “O Códice Contemporâneo”

Essa direção combina:

- RPG de mesa;
- livros físicos premium;
- mapas;
- dados;
- miniaturas;
- campanhas narrativas;
- interface digital moderna;
- visual clean;
- fundo claro/leitoso;
- estética editorial;
- confiança de produto digital;
- atmosfera criativa e comunitária.

A ideia central é que:

> Os vídeos e elementos visuais carregam a fantasia; a interface deve trazer clareza, confiança e sofisticação.

A marca não deve parecer:

- fórum antigo de RPG;
- loja genérica de games;
- produto infantil;
- fantasia medieval caricata;
- dark fantasy pesado;
- interface poluída;
- plataforma excessivamente “nerd genérica”.

---

## 5. Arquivos importantes do projeto

### `index-trama.html`

Arquivo principal onde está a plataforma.

### `design_system-trama.html`

Arquivo com as diretrizes do Design System.

Ele contém:

- tipografia;
- cores;
- espaçamentos;
- tokens;
- componentes;
- regras visuais;
- estilos de botões;
- padrões de UI.

Qualquer alteração visual deve respeitar esse arquivo.

### `Branding.html`

Documento gerado com a estratégia de marca.

Ele contém:

- essência da marca;
- público-alvo;
- tom de voz;
- direção estética;
- tokens cromáticos;
- tipografia;
- princípios visuais;
- motion;
- recomendações de logo;
- posicionamento geral.

### Vídeos de background

Foram criados vídeos curtos e sutis para uso como background da hero section.

Eles mostram cenas de RPG de mesa com:

- livros;
- mapas;
- dados;
- miniaturas;
- luz quente;
- atmosfera lúdica;
- movimento sutil;
- estética cinematográfica.

Esses vídeos devem ficar no fundo da hero, com textos e componentes por cima.

---

## 6. Hero section

A hero section é o foco atual do projeto.

Ela deve ser inspirada conceitualmente no redesign do Kickstarter, especialmente em:

- impacto visual;
- headline grande;
- layout editorial;
- navegação minimalista;
- foco em descoberta;
- interface limpa;
- forte hierarquia tipográfica;
- uso criativo de espaço em branco;
- CTAs claros.

Mas a plataforma não deve copiar o Kickstarter.

A hero deve ser uma versão própria, adaptada para crowdfunding de RPG.

---

## 7. Estrutura da hero section

A hero section deve conter:

### Header

Com:

- logo ou nome da plataforma;
- links principais:
  - Projetos;
  - Categorias;
  - Como funciona;
  - Destaques;
- ação secundária para criadores:
  - Para criadores;
  - Criar campanha;
- botão ou link de entrada:
  - Entrar.

O header precisa ser:

- limpo;
- moderno;
- responsivo;
- legível sobre o vídeo;
- bem espaçado.

### Vídeo de background

O vídeo deve:

- ocupar toda a hero section;
- ficar atrás de todos os elementos;
- usar `object-fit: cover`;
- ter autoplay;
- estar em loop;
- estar muted;
- usar `playsinline`;
- ter fallback/poster;
- não competir com os textos.

### Overlay claro

Como os textos da hero são pretos ou muito escuros, o vídeo precisa receber um overlay claro.

A camada de overlay deve:

- melhorar contraste;
- preservar a estética do vídeo;
- deixar a leitura confortável;
- evitar escurecimento excessivo;
- criar uma sensação premium e levemente leitoso/glass.

Possíveis recursos:

- branco translúcido;
- gradiente claro;
- blur sutil;
- light haze;
- radial claro atrás do texto.

### Headline

A headline deve ser grande, forte e memorável.

Direções possíveis:

- “Descubra campanhas que merecem ganhar vida.”
- “Apoie mundos em construção.”
- “Encontre a próxima aventura da sua mesa.”
- “Descubra projetos de RPG antes de todo mundo.”

A headline deve comunicar:

- descoberta;
- apoio;
- criatividade;
- campanha;
- RPG;
- imaginação.

### Subheadline

Texto curto e claro explicando a proposta.

Exemplos:

- “Explore livros, aventuras, miniaturas e suplementos criados por comunidades independentes.”
- “Encontre campanhas de RPG, apoie criadores e ajude novas histórias a chegarem à mesa.”
- “Uma plataforma para descobrir, apoiar e acompanhar projetos do universo RPG.”

### Busca

A hero precisa ter uma barra de busca em destaque.

Ela deve permitir buscar por:

- nome da campanha;
- sistema;
- criador;
- projeto.

Placeholder sugerido:

- “Busque por uma campanha, sistema ou criador”

A busca deve ter:

- ícone;
- input;
- botão;
- feedback visual;
- boa usabilidade em mobile;
- aparência premium;
- legibilidade sobre o vídeo.

### Filtros

Os filtros devem aparecer em formato de chips/pills.

Sugestões:

- Populares;
- Livros;
- Aventuras;
- Miniaturas;
- Mapas;
- Sistemas;
- Suplementos;
- Acessórios;
- Zines.

Eles devem ser clicáveis e ter estado ativo.

### CTAs

CTAs principais:

- “Explorar projetos”
- “Ver destaques”

CTA secundário para criadores:

- “Para criadores”
- “Quero criar uma campanha”

A hierarquia deve deixar claro que o foco é o apoiador.

---

## 8. Direção visual

A interface deve ser:

- moderna;
- clean;
- premium;
- editorial;
- clara;
- confiável;
- responsiva;
- sofisticada;
- levemente lúdica.

A estética deve equilibrar:

- fantasia e clareza;
- RPG e produto digital;
- criatividade e confiança;
- comunidade e curadoria;
- visual inspirador e usabilidade.

Evitar:

- excesso de ornamento;
- madeira, pergaminho e textura medieval pesada;
- dragões, espadas e escudos clichês;
- d20 genérico sem refinamento;
- dark mode pesado;
- poluição visual;
- visual infantil.

---

## 9. Responsividade

A hero deve ser refinada com abordagem mobile-first.

Ela precisa funcionar bem em:

- desktop grande;
- notebook;
- tablet;
- mobile;
- telas pequenas.

Boas práticas:

- evitar overflow horizontal;
- área mínima de toque de 44px;
- busca confortável no mobile;
- filtros com scroll horizontal ou quebra controlada;
- header compacto;
- overlay mais forte no mobile se necessário;
- CTAs empilháveis;
- headline entre 2 e 4 linhas no mobile.

---

## 10. Acessibilidade

A plataforma deve considerar:

- HTML semântico;
- botões reais;
- input com label acessível;
- `aria-label` quando necessário;
- foco visível;
- contraste adequado;
- navegação por teclado;
- fallback para vídeo;
- respeito a redução de movimento;
- alt text correto para logo.

---

## 11. Critérios de qualidade

O resultado final deve parecer:

- produto real;
- moderno;
- confiável;
- premium;
- escalável;
- bem acabado;
- adequado para apresentação a stakeholders.

Não basta trocar nome, logo e vídeo.

A marca precisa aparecer como sistema visual aplicado, mantendo:

- clareza;
- foco no apoiador;
- estética de RPG sofisticada;
- UI limpa;
- busca funcional;
- filtros utilizáveis;
- CTAs claros;
- responsividade;
- acessibilidade;
- coerência com o Design System.
