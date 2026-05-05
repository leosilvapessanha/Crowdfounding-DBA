### Abrir detalhes de um projeto

**Como:** apoiador  
**Quero:** clicar em apoiar, dentro do card do projeto 
**Para:** acessar os detalhes da campanha

**_LOCALIZAÇÃO:_**  
Home > Cards de campanha

---

#### Contexto

Após identificar uma campanha de interesse, o usuário precisa acessar a página de detalhes para entender proposta, recompensas, metas, prazos e informações do criador.

A interação deve funcionar por mouse, teclado e toque.

Responsividade não é negociável.

---

#### Regras de negócio

1. Apenas projetos publicados e visíveis devem poder ser abertos pelo apoiador.
2. O clique no título ou imagem deve direcionar para a página correta do projeto.
3. O identificador do projeto deve ser preservado na navegação.
4. A interação deve funcionar por mouse, teclado e toque.
5. O card deve apresentar feedback visual ao ser interagido.

---

#### Solução

1. Permitir clique na imagem, título e em apoiar (juntamente ao seu ícone) do projeto.
2. Direcionar para a página de detalhes da campanha.
3. Enviar o identificador correto do projeto para a página de destino.
4. Manter o CTA “Apoiar” como caminho direto para contribuição.
5. Garantir interação acessível por teclado e mobile.
6. Aplicar estados visuais de hover, active e focus quando existirem.

---

#### Critérios de aceite

1. O clique na imagem deve abrir o projeto correto.
2. O clique no título deve abrir o projeto correto.
3. A navegação deve preservar o identificador da campanha.
4. A interação deve ser acessível por teclado.
5. Em mobile, a área clicável deve ser confortável.
6. O usuário deve receber feedback visual ao interagir com o card.
7. A interação não deve gerar comportamento inesperado em carrosséis.