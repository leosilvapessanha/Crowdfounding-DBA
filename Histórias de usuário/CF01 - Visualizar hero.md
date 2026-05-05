### Visualizar a Hero Section da plataforma

**Como:** apoiador interessado em RPG  
**Quero:** acessar uma página inicial clara, atrativa e contextualizada  
**Para:** entender rapidamente que posso descobrir e apoiar projetos independentes de RPG

**_LOCALIZAÇÃO:_**  
Home > Hero Section

---

#### Contexto

A hero section é o primeiro contato do usuário com a plataforma. Ela precisa comunicar de forma clara que a plataforma é um crowdfunding para projetos de RPG, com foco em descoberta, apoio e comunidade.

A seção deve usar o vídeo de background como elemento visual principal, mantendo boa leitura dos textos, botões e chamadas para ação.

Responsividade não é negociável. A hero deve funcionar corretamente em desktop, tablet e mobile.

---

#### Regras de negócio

1. A comunicação principal da hero deve ser voltada ao apoiador/comprador.
2. A chamada para criadores deve existir apenas como ação secundária.
3. O vídeo de background não pode prejudicar a leitura dos textos.
4. A hero deve manter contraste adequado entre texto, botões e fundo.
5. A hero deve funcionar corretamente em dispositivos móveis, sem overflow horizontal ou perda de legibilidade.
6. Caso o vídeo não carregue, deve existir fallback visual.

---

#### Solução

1. Exibir uma hero section com vídeo de background relacionado ao universo de RPG.
2. Apresentar headline clara, forte e memorável.
3. Exibir subtítulo explicando a proposta da plataforma.
4. Disponibilizar CTA principal para explorar projetos.
5. Disponibilizar CTA secundário para criação de campanha.
6. Aplicar overlay adequado sobre o vídeo para garantir leitura.
7. Adaptar espaçamentos, tamanhos de fonte, botões e composição para mobile.
8. Garantir fallback visual caso o vídeo não carregue.

---

#### Critérios de aceite

1. A hero deve exibir vídeo de background corretamente.
2. A headline deve estar visível e legível sobre o vídeo.
3. O subtítulo deve explicar a proposta da plataforma de forma clara.
4. O CTA principal deve ter maior destaque visual que o CTA secundário.
5. A ação para criadores deve aparecer com menor peso visual.
6. A hero não deve gerar rolagem horizontal em nenhuma resolução.
7. Em mobile, textos, botões e vídeo devem se adaptar sem quebra de layout.
8. Em caso de falha no vídeo, deve existir fallback visual adequado.

---

#### Cenários

1. **Usuário acessa a home**  
   **Dado que:** o usuário acessou a página inicial da plataforma  
   **Quando:** a home for carregada  
   **Então:** a hero section deve ser exibida com vídeo de background, headline, subtítulo e CTAs principais

2. **Usuário visualiza a hero em dispositivo móvel**  
   **Dado que:** o usuário acessou a home por um dispositivo móvel  
   **Quando:** a hero section for exibida  
   **Então:** os textos, botões e vídeo devem se adaptar ao tamanho da tela sem quebra visual ou perda de legibilidade

3. **Vídeo de background não carrega**  
   **Dado que:** existe uma falha no carregamento do vídeo  
   **Quando:** a hero section for exibida  
   **Então:** deve ser apresentado um fallback visual que preserve a estética e a legibilidade da seção