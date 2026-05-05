### Acessar login

**Como:** usuário cadastrado  
**Quero:** clicar em “Entrar”  
**Para:** acessar minha conta

**_LOCALIZAÇÃO:_**  
Header > CTA “Entrar”

---

#### Contexto

Usuários cadastrados precisam acessar sua conta para apoiar campanhas, acompanhar contribuições ou criar projetos. O login deve estar visível e acessível no header.

Responsividade não é negociável.

---

#### Regras de negócio

1. O CTA “Entrar” deve ser exibido apenas para usuários não autenticados.
2. Usuários autenticados devem visualizar acesso à conta, perfil ou menu do usuário.
3. Credenciais inválidas devem gerar mensagem de erro clara.
4. O login deve funcionar em desktop e mobile.
5. O CTA deve ser acessível por teclado.

---

#### Solução

1. Exibir o botão “Entrar” no header para usuários não autenticados.
2. Ao clicar, direcionar para o fluxo de login.
3. Validar credenciais informadas.
4. Em caso de sucesso, autenticar o usuário.
5. Em caso de erro, exibir mensagem clara.
6. Em mobile, manter o login acessível no menu ou na área de ações.
7. Garantir foco visível e área de toque adequada.

---

#### Critérios de aceite

1. Usuários não autenticados devem visualizar “Entrar”.
2. Usuários autenticados não devem visualizar “Entrar” como ação principal.
3. Credenciais válidas devem autenticar o usuário.
4. Credenciais inválidas devem exibir mensagem clara.
5. O CTA deve ser acessível por teclado.
6. Em mobile, o CTA deve estar acessível e fácil de tocar.
7. O CTA não deve quebrar o layout do header.

---

#### Cenários

1. **Login com credenciais válidas**  
   **Dado que:** o usuário possui uma conta cadastrada  
   **Quando:** informar credenciais válidas  
   **Então:** deve acessar sua conta

2. **Login com credenciais inválidas**  
   **Dado que:** o usuário informou dados incorretos  
   **Quando:** tentar entrar  
   **Então:** deve visualizar uma mensagem de erro clara

3. **Login em dispositivo móvel**  
   **Dado que:** o usuário acessa a plataforma pelo celular  
   **Quando:** abrir o menu ou ações do header  
   **Então:** deve encontrar a opção “Entrar”