### Ordenar projetos

**Como:** apoiador  
**Quero:** ordenar os projetos exibidos  
**Para:** visualizar primeiro as campanhas mais relevantes para o meu interesse

**_LOCALIZAÇÃO:_**  
Header > Ordenar

---

#### Contexto

Usuários podem ter diferentes intenções ao explorar campanhas. Alguns querem ver projetos populares, outros preferem novidades, campanhas perto do encerramento ou projetos com maior percentual financiado.

A ordenação deve ajudar na descoberta sem tornar a interface complexa.

Responsividade não é negociável.

---

#### Regras de negócio

1. A ordenação padrão deve ser “Populares”, salvo se outra regra for definida pelo produto.
2. A ordenação selecionada deve ficar visível para o usuário.
3. A troca de ordenação deve reorganizar a listagem.
4. A ordenação deve funcionar em conjunto com busca e categoria.
5. A ordenação deve ser utilizável em mobile.
6. O seletor deve ser acessível por teclado.

---

#### Definições

**Ordenar** - A forma que os itens devem ser ordenados em uma busca:
1. Popularidade
2. Ordem alfabética
3. Próximo de terminar
4. Data de lançamento
5. Próximo da meta
6. Meta batita

**Próximo de terminar** - Itens que estão a 15 dias ou menos para término da campanha
**Próximo da meta** - Itens com 90% ou mais da meta alcançada
**Meta batida** - Itens que já arrecadaram 100% da meta e ainda não chegaram na data de término da campanha

---

#### Solução

1. Exibir opção de ordenação no header.
2. Permitir ordenar por popularidade (default). Ao clicar no item Ordenar uma lista de categorias disponíveis o primeiro item da listagem é "Popularidade" (default) e depois os itens são ordenados na ordem da lista que está em **Definições**.
3. Preparar a estrutura para futuras ordenações, como mais recentes, últimos dias e maior percentual financiado.
4. Atualizar a listagem conforme a ordenação selecionada.
5. Quando a busca ocorrer (usuário clicou no botão de busca), ocorre o redirecionar o usuário para uma listagem ordenada de acordo com a necessidade do usuário.
6. Manter a opção selecionada visível para o usuário.
7. Adaptar o seletor de ordenação para toque em mobile.
8. Garantir estados de hover, active e focus.

---

#### Critérios de aceite

1. A opção de ordenação deve estar disponível no header.
2. A ordenação padrão deve ser exibida.
3. Ao trocar a ordenação, a listagem deve ser atualizada.
4. A ordenação aplicada deve permanecer visível.
5. A ordenação deve funcionar junto com filtros existentes.
6. Em mobile, o seletor deve ser legível e fácil de acionar.
7. O seletor deve ser acessível por teclado.
8. O seletor não deve gerar overflow horizontal.

---

#### Cenários

1. **Ordenar por populares**  
   **Dado que:** o usuário está visualizando projetos na home  
   **Quando:** ele selecionar a ordenação “Populares”  
   **Então:** os projetos devem ser exibidos priorizando campanhas com maior popularidade

2. **Alterar ordenação**  
   **Dado que:** uma ordenação já está aplicada  
   **Quando:** o usuário selecionar uma nova opção de ordenação  
   **Então:** a listagem deve ser reorganizada conforme o novo critério