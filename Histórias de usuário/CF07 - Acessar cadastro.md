### Acessar cadastro

**Como:** novo usuário  
**Quero:** clicar em “Cadastre-se”  
**Para:** criar uma conta na plataforma

**_LOCALIZAÇÃO:_**  
Header > CTA “Cadastre-se”

---

#### Contexto

Usuários que desejam apoiar campanhas ou criar projetos precisam ter uma conta na plataforma. O cadastro deve ser acessível a partir do header, com uma chamada clara e fácil de encontrar.

Responsividade não é negociável.

---

#### Regras de negócio

1. O cadastro deve estar disponível para usuários não autenticados.
2. Usuários autenticados não devem visualizar CTA de cadastro no header.
3. Após cadastro com sucesso, o usuário deve ser autenticado ou direcionado para confirmação, conforme regra do produto.
4. Em mobile, o acesso ao cadastro deve estar disponível no menu ou área de ações.
5. O CTA deve ser acessível por teclado.

---

#### Solução

1. Exibir o CTA “Cadastre-se” no header para usuários não autenticados.
2. Ao clicar, direcionar o usuário para o fluxo de cadastro.
3. Permitir que o usuário informe dados básicos.
4. Após cadastro com sucesso, retornar o usuário logado para a plataforma ou para etapa de confirmação.
5. Em mobile, manter o acesso ao cadastro dentro do menu ou área de ações principais.
6. Garantir feedback de erro e sucesso no fluxo.

---

#### Critérios de aceite

1. Usuários não autenticados devem visualizar o CTA “Cadastre-se”.
2. Usuários autenticados não devem visualizar o CTA de cadastro.
3. O clique deve direcionar para o fluxo correto.
4. O CTA deve ser acessível por teclado.
5. Em mobile, o CTA deve continuar acessível e fácil de tocar.
6. O fluxo deve exibir feedback em caso de erro ou sucesso.
7. O CTA não deve gerar quebra visual no header.

---

#### Cenários

1. **Usuário acessa cadastro**  
   **Dado que:** o usuário está na home e não está autenticado  
   **Quando:** clicar em “Cadastre-se”  
   **Então:** deve acessar o fluxo de cadastro

2. **Cadastro realizado com sucesso**  
   **Dado que:** o usuário preencheu os dados obrigatórios corretamente  
   **Quando:** finalizar o cadastro  
   **Então:** deve acessar a plataforma autenticado ou seguir para etapa de confirmação

3. **Usuário autenticado acessa a home**  
   **Dado que:** o usuário está autenticado  
   **Quando:** visualizar o header  
   **Então:** o CTA “Cadastre-se” não deve ser exibido