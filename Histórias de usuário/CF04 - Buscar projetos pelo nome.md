### Buscar projetos pelo nome

**Como:** apoiador  
**Quero:** buscar projetos, campanhas ou criadores pelo nome  
**Para:** encontrar rapidamente campanhas específicas que desejo conhecer ou apoiar

**_LOCALIZAÇÃO:_**  
Header > Campo de busca

---

#### Contexto

O usuário pode chegar à plataforma já sabendo o nome de um projeto, sistema, campanha ou criador. Por isso, a busca deve estar disponível em local de destaque, permitindo acesso rápido aos resultados.

A busca precisa funcionar bem em desktop e mobile, sem comprometer a navegação do header.

Responsividade não é negociável.

---

#### Regras de negócio

1. A busca deve aceitar termos relacionados a projetos, campanhas, sistemas e criadores.
2. Busca vazia não deve executar consulta.
3. O sistema deve orientar o usuário quando a busca estiver vazia.
4. A busca deve preservar o termo pesquisado ao redirecionar para a listagem.
5. A busca deve ser acessível em dispositivos móveis.
6. O campo deve possuir label acessível ou `aria-label`.

---

#### Solução

1. Exibir campo de busca no header.
2. Permitir digitação de termos como nome do projeto, criador ou campanha.
3. Disponibilizar botão ou ícone para executar a busca.
4. Validar busca vazia antes de apresentar resultados.
5. Sugerir campanhas existentes na plataforma com base no que está sendo digitado pelo usuário (pelo nome do projedo ex. quando o usuário digitar "pr" o usuário visualiza sugestões como "Projeto", "Prince of Pércia, "Prédio" e até mais oito itens existentes ordenados alfabéticamente. Se não existirem campanha, um feedback claro é dado para o usuário) 
5. Quando a busca ocorrer (usuário clicou no botão de busca), ocorre o redirecionar o usuário para uma listagem filtrada com base no termo buscado, categoria selecionada e ordenação desejada.
6. Adaptar o campo de busca para mobile, garantindo boa área de toque e leitura.
7. Garantir feedback visual para foco, erro e execução da busca.

---

#### Critérios de aceite

1. O campo de busca deve estar sempre visível no header.
2. O usuário deve conseguir digitar termos no campo.
3. O botão ou ícone de busca deve executar a ação.
4. Busca vazia deve exibir orientação clara.
5. Busca preenchida deve direcionar para resultados relacionados.
6. O termo pesquisado deve ser preservado na tela de resultados.
7. Em mobile, o campo deve ser legível, utilizável e não quebrar o header.
8. O campo deve possuir label acessível ou `aria-label`.
9. O campo não deve gerar overflow horizontal.

---

#### Cenários

1. **Buscar com termo preenchido**  
   **Dado que:** o usuário está na home  
   **Quando:** ele digitar um termo no campo de busca e clicar no botão de busca  
   **Então:** o sistema deve exibir projetos relacionados ao termo pesquisado

2. **Buscar com campo vazio**  
   **Dado que:** o campo de busca está vazio  
   **Quando:** o usuário clicar no botão de busca  
   **Então:** o sistema deve orientar o usuário a digitar o nome de um projeto, campanha ou criador

3. **Buscar em dispositivo móvel**  
   **Dado que:** o usuário está acessando a plataforma pelo celular  
   **Quando:** ele interagir com o campo de busca  
   **Então:** o campo deve permanecer legível, acessível e confortável para digitação