### Visualizar card de projeto

**Como:** apoiador  
**Quero:** visualizar informações resumidas de uma campanha em um card  
**Para:** decidir rapidamente se quero conhecer ou apoiar aquele projeto

**_LOCALIZAÇÃO:_**  
Home > Seções de projetos > Cards de campanha

---

#### Contexto

Os cards são o principal elemento de descoberta da plataforma. Eles precisam apresentar informações suficientes para o usuário avaliar interesse inicial sem precisar abrir todos os projetos.

Os cards devem ser responsivos e manter boa leitura em listas horizontais, grids e mobile.

Responsividade não é negociável.

---

#### Regras de negócio

1. Todo projeto publicado e visível deve possuir card.
2. O card deve exibir informações mínimas para decisão inicial.
3. A barra de progresso deve refletir o percentual real de financiamento.
4. O CTA “Apoiar” deve estar disponível para campanhas ativas.
5. Campanhas encerradas não devem exibir CTA primário de apoio, salvo regra específica do produto.
6. Cards devem funcionar corretamente em desktop, tablet e mobile.
7. Cards sem imagem devem exibir fallback visual.
8. Caso a campanha não estiver ativa, o card não deve ficar visivel parao usuário.

---

#### Solução

1. Exibir imagem de capa do projeto.
2. Exibir categoria ou tag do projeto.
3. Exibir nome da campanha.
4. Exibir nome do criador ou editora.
5. Exibir percentual financiado.
6. Exibir barra de progresso.
7. Exibir prazo restante, quando aplicável. Caso a campanha esteja próximo do fim (15 dias ou menos), o prazo deverá aparecer em uma cor vermelha com um ícone de relógio antes dela. O texto vira XX dias restantes.
8. Exibir valor mínimo de apoio.
9. Exibir CTA para apoiar em campanhas ativas.
10. Ajustar card para grids e carrosséis responsivos.
11. Garantir fallback para imagem ausente.

---

#### Critérios de aceite

1. Cada card deve exibir imagem, categoria, título, criador, progresso, prazo, valor mínimo e CTA quando aplicável.
2. A barra de progresso deve representar corretamente o percentual financiado.
3. O card deve ser legível em desktop e mobile.
4. O card não deve quebrar layout em carrosséis horizontais.
5. O CTA deve ter área de toque confortável em mobile.
6. Informações importantes não devem depender apenas de cor.
7. Cards sem imagem devem ter fallback visual.
8. O card não deve gerar overflow horizontal.

---

#### Cenários

1. **Visualizar card completo**  
   **Dado que:** existem projetos disponíveis na plataforma  
   **Quando:** a seção de projetos for carregada  
   **Então:** cada card deve exibir imagem, categoria, título, criador, progresso, valor mínimo e CTA de apoio

2. **Projeto próximos do fim**  
   **Dado que:** um projeto está próximo do encerramento (15 dias ou menos)  
   **Quando:** o card for exibido  
   **Então:** o prazo restante deve aparecer com destaque visual adequado

3. **Card em mobile**  
   **Dado que:** o usuário acessa a plataforma pelo celular  
   **Quando:** os cards forem exibidos  
   **Então:** os cards devem manter leitura, espaçamento e área de toque adequados