### Visualizar últimos dias para apoiar

**Como:** apoiador  
**Quero:** visualizar campanhas próximas do encerramento  
**Para:** não perder a oportunidade de apoiar projetos relevantes

**_LOCALIZAÇÃO:_**  
Home > Seção “Últimos dias para apoiar”

---

#### Contexto

Campanhas próximas do fim criam senso de urgência legítimo. Essa seção ajuda o usuário a identificar projetos que ainda podem receber apoio, mas que estão perto de encerrar.

A urgência deve ser clara, mas não agressiva.

Responsividade não é negociável.

---

#### Regras de negócio

1. A seção deve listar apenas campanhas ativas próximas do encerramento.
2. Campanhas encerradas não devem aparecer nessa seção.
3. A ordenação deve priorizar menor prazo restante.
4. O destaque de urgência deve ser claro, mas não alarmista.
5. A seção deve funcionar corretamente em mobile.
6. Caso não existam campanhas próximas do fim, a seção pode ser ocultada ou exibir estado vazio.

---

#### Solução

1. Exibir seção com o título “Últimos dias para apoiar”.
2. Listar projetos com prazo de encerramento próximo.
3. Destacar visualmente a quantidade de dias restantes.
4. Evitar linguagem agressiva ou alarmista.
5. Disponibilizar link “Ver todos” deve direcionar para a listagem de produtos ordenados pela Próximo de terminar.
6. Adaptar cards e navegação para mobile.
7. Garantir que a informação de prazo não dependa apenas de cor.

---

#### Critérios de aceite

1. A seção deve exibir apenas campanhas ativas próximas do fim.
2. Os projetos devem ser ordenados por menor prazo restante.
3. O prazo restante deve estar visível nos cards.
4. Campanhas encerradas não devem aparecer na seção.
5. O link “Ver todos” deve direcionar para listagem correspondente.
6. A seção deve ser responsiva e utilizável em mobile.
7. A seção não deve gerar overflow horizontal.
8. O destaque de urgência deve ser legível e não agressivo.

---

#### Cenários

1. **Visualizar campanhas próximas do fim**  
   **Dado que:** existem campanhas próximas do encerramento  
   **Quando:** a seção for carregada  
   **Então:** os cards devem exibir projetos ordenados por menor prazo restante

2. **Exibir urgência no card**  
   **Dado que:** uma campanha possui poucos dias restantes  
   **Quando:** seu card for exibido  
   **Então:** o prazo restante deve receber destaque visual claro e legível

3. **Campanha encerrada**  
   **Dado que:** uma campanha já foi encerrada  
   **Quando:** a seção for carregada  
   **Então:** essa campanha não deve ser exibida em “Últimos dias para apoiar”