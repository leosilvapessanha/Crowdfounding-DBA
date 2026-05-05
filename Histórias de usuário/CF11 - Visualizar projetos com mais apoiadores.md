### Visualizar projetos com mais apoiadores

**Como:** apoiador  
**Quero:** visualizar uma seção com projetos populares  
**Para:** descobrir campanhas validadas pela comunidade

**_LOCALIZAÇÃO:_**  
Home > Seção “Projetos com mais apoiadores”

---

#### Contexto

Projetos com mais apoiadores funcionam como prova social. Essa seção ajuda o usuário a descobrir campanhas com maior tração e reduz incerteza na decisão de explorar ou apoiar.

A seção precisa funcionar bem em desktop e mobile.

Responsividade não é negociável.

---

#### Regras de negócio

1. A seção deve listar projetos ordenados por número de apoiadores ou métrica equivalente de popularidade (mais usuários apoiaram).
2. A seção deve possuir link para listagem completa.
3. Em mobile, os cards devem ser navegáveis sem quebra de layout.
4. Caso não existam projetos populares, a seção pode ser ocultada ou exibir estado vazio, conforme regra do produto.

---

#### Solução

1. Exibir seção com o título “Projetos com mais apoiadores”.
2. Listar os 8 cards de campanhas com maior número de apoiadores ou popularidade (do maior para o menor).
3. Exibir link “Ver todos”.
4. Permitir navegação horizontal quando houver mais projetos do que espaço disponível.
5. Manter padrão visual consistente com os demais cards.
6. Adaptar a seção para mobile com scroll horizontal ou grid responsivo.
7. Disponibilizar um último card para ver todos. Ao clicar, ele vai para uma página com todos os itens ordenados pela popularidade

---

#### Critérios de aceite

1. A seção deve ser exibida quando houver projetos populares.
2. Os cards devem ser ordenados por popularidade.
3. O link “Ver todos” deve direcionar para a listagem correspondente.
4. A seção deve ser responsiva.
5. Em mobile, o usuário deve conseguir acessar todos os cards.
6. A seção não deve gerar overflow horizontal na página.
7. Os cards devem manter leitura e área de toque adequadas.

---

#### Cenários

1. **Visualizar seção com projetos**  
   **Dado que:** existem projetos populares disponíveis  
   **Quando:** a home for carregada  
   **Então:** a seção deve exibir os cards dos projetos com mais apoiadores

2. **Acessar todos os projetos populares**  
   **Dado que:** o usuário visualiza a seção  
   **Quando:** clicar em “Ver todos”  
   **Então:** deve ser levado para uma listagem completa de projetos populares