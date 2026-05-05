### Visualizar novidades da semana

**Como:** apoiador  
**Quero:** visualizar campanhas novas ou destacadas na semana  
**Para:** descobrir projetos recentes no universo de RPG

**_LOCALIZAÇÃO:_**  
Home > Seção “Novidades da semana”

---

#### Contexto

A seção de novidades estimula recorrência e descoberta. Ela mostra ao usuário que a plataforma possui campanhas novas e conteúdo constantemente atualizado.

A seção precisa funcionar bem em desktop, tablet e mobile.

Responsividade não é negociável.

---

#### Regras de negócio

1. A seção deve listar projetos recentes.
2. Apenas projetos ativos devem ser exibidos.
3. A definição de “semana” deve seguir para produtos que foram lançados em 7 dias ou menos.
4. Em mobile, a seção deve permitir navegação confortável pelos cards.
5. Caso não existam novidades, a seção pode ser ocultada ou exibir estado vazio, conforme regra do produto.

---

#### Solução

1. Exibir seção com o título “Novidades da semana”.
2. Listar campanhas recentes ou destacadas editorialmente.
3. Exibir cards com informações essenciais.
4. Disponibilizar link “Ver todos”.
5. Manter navegação fluida em desktop e mobile.
6. Adaptar a seção para scroll horizontal ou grid responsivo em telas menores.

---

#### Critérios de aceite

1. A seção deve exibir 8 campanhas recentes ou menos destacadas e no final do carrossel, um ícone para ver todas ordenada pela data de lançamento.
2. O link “Ver todos” deve direcionar para a listagem de produtos ordenados pela data de lançamento.
3. Os cards devem manter o mesmo padrão visual da plataforma.
4. A seção deve ser responsiva.
5. Em mobile, os cards devem ser acessíveis sem quebra visual.
6. A seção não deve gerar overflow horizontal.
7. Os cards devem manter área de toque adequada.

---

#### Cenários

1. **Visualizar novidades**  
   **Dado que:** existem campanhas recentes disponíveis  
   **Quando:** a seção for carregada  
   **Então:** os cards das novidades da semana devem ser exibidos

2. **Acessar todas as novidades**  
   **Dado que:** o usuário está na seção “Novidades da semana”  
   **Quando:** clicar em “Ver todos”  
   **Então:** deve acessar uma listagem com todas as campanhas recentes