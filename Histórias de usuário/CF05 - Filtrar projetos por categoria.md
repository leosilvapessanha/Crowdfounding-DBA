### Filtrar projetos por categoria

**Como:** apoiador  
**Quero:** selecionar uma categoria de projeto  
**Para:** encontrar campanhas mais próximas dos meus interesses no universo de RPG

**_LOCALIZAÇÃO:_**  
Header > Filtro de categoria

---

#### Contexto

A plataforma reúne diferentes tipos de projetos de RPG, como livros, miniaturas, mapas, suplementos, sistemas e acessórios. O filtro por categoria ajuda o usuário a reduzir o esforço de descoberta e encontrar campanhas relevantes.

O filtro deve ser simples, visível e funcional em diferentes tamanhos de tela.

Responsividade não é negociável.

---

#### Regras de negócio

1. A opção “Todas” deve remover o filtro de categoria default.
2. Apenas uma categoria principal deve ser aplicada por vez nesta versão.
3. A categoria selecionada deve ficar visualmente indicada.
4. A lista de categorias deve funcionar em desktop e mobile.
5. Categorias sem projetos devem exibir estado vazio adequado.
6. O filtro deve funcionar em conjunto com busca e ordenação.

---

#### Definições

**CATEGORIA** - Tipo de projeto que está sendo lançado pelo criador. Ele é definido no momento da criação e pode ser:
1. Cards
2. RPG
3. Video games
4. Tabuleiro
5. Livros
6. Outros
7. Todos

---

#### Solução

1. Exibir opção de categoria no header.
2. Permitir que o usuário visualize uma lista de categorias disponíveis o primeiro item da listagem é "Todos" (default) e depois os itens são ordenados alfabéticamente. Obrigatóriamente, o último item é "Outros"
3. Aplicar a categoria selecionada na listagem de projetos.
4. Permitir retornar para a visualização de todas as categorias.
5. Quando a busca ocorrer (usuário clicou no botão de busca), ocorre o redirecionar o usuário para uma listagem filtrada com base no termo buscado, categoria selecionada e ordenação desejada.
6. Manter indicação visual da categoria selecionada.
7. Adaptar o seletor para mobile, evitando corte de texto ou overflow.

---

#### Critérios de aceite

1. O filtro de categoria deve estar disponível no header.
2. A lista de categorias deve ser exibida ao interagir com o filtro.
3. Ao selecionar uma categoria, a listagem deve ser filtrada.
4. Ao selecionar “Todas”, os filtros devem ser removidos.
5. A categoria selecionada deve ter estado visual claro.
6. Em mobile, o filtro deve ser utilizável por toque.
7. O filtro deve ser acessível por teclado.
8. Caso não existam resultados, deve ser exibida mensagem de estado vazio.
9. O filtro não deve gerar overflow horizontal.

---

#### Cenários

1. **Selecionar uma categoria**  
   **Dado que:** o usuário está na home  
   **Quando:** ele selecionar uma categoria no filtro  
   **E:** efetuar uma busca  
   **Então:** a listagem deve exibir projetos relacionados à categoria escolhida

2. **Selecionar todas as categorias**  
   **Dado que:** uma categoria específica está aplicada  
   **Quando:** o usuário selecionar a opção “Todas”  
   **Então:** a listagem deve voltar a exibir projetos de todas as categorias

3. **Categoria sem resultados**  
   **Dado que:** o usuário selecionou uma categoria  
   **Quando:** não existirem projetos relacionados  
   **Então:** o sistema deve exibir uma mensagem informando que não há projetos disponíveis naquela categoria