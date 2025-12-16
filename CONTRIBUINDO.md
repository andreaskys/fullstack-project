# 🤝 Guia de Contribuição - Party Platform

Obrigado por considerar contribuir para o Party Platform! Este documento fornece as diretrizes e procedimentos para contribuir com o projeto.

---

## 📋 Antes de Começar

1. Certifique-se de ter lido [README.md](README.md)
2. Configure seu ambiente usando [SETUP_RAPIDO.md](SETUP_RAPIDO.md)
3. Familiarize-se com a arquitetura em [ARQUITETURA.md](ARQUITETURA.md)
4. Consulte [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md) para padrões

---

## 🔄 Fluxo de Trabalho

### 1. Forke e Clone

```bash
# Forke no GitHub (botão "Fork")
# Clone seu fork
git clone https://github.com/SEU_USUARIO/fullstack-project.git
cd fullstack-project

# Adicione upstream para sincronizar
git remote add upstream https://github.com/USUARIO_ORIGINAL/fullstack-project.git
```

### 2. Crie uma Branch

```bash
# Sempre partir da main atualizada
git checkout main
git pull upstream main

# Crie branch com prefixo apropriado
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b bugfix/corrigir-erro
git checkout -b docs/melhorar-documentacao
```

### 3. Desenvolva Sua Feature

Siga os padrões em [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md):
- Estruture o código
- Escreva testes
- Atualize documentação
- Valide com linter

```bash
# Backend
cd backend
mvn clean install
mvn test

# Frontend
cd frontend
npm install
npm test
npm run lint
```

### 4. Faça Commits Significativos

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(listings): adicionar filtro por amenidades

- Implementar filtro multi-select
- Atualizar Elasticsearch query
- Adicionar UI component
- Escrever testes unitários"
```

**Prefixos Válidos:**
- `feat`: Nova funcionalidade
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação de código
- `refactor`: Refatoração
- `perf`: Melhoria de performance
- `test`: Testes
- `chore`: Tarefas (dependências, build)

### 5. Push e Abra um Pull Request

```bash
# Push para seu fork
git push origin feature/nova-funcionalidade

# Abra PR no GitHub
# - Compare seu branch com o main original
# - Descreva mudanças, motivação, como testar
# - Referencie issues relacionadas (#123)
```

---

## 📝 Checklist para Pull Request

Antes de submeter, certifique-se:

### Código
- [ ] Segue padrões do projeto
- [ ] Sem código morto ou comentários desnecessários
- [ ] Nomes de variáveis/funções são descritivos
- [ ] Sem console.log, System.out.println em produção

### Testes
- [ ] Novos testes foram adicionados
- [ ] Testes passam: `mvn test` (backend), `npm test` (frontend)
- [ ] Cobertura de teste é adequada

### Documentação
- [ ] README atualizado (se necessário)
- [ ] Comentários de código para lógica complexa
- [ ] Docstrings em métodos públicos

### Backend
- [ ] Validação de input nos DTOs
- [ ] Tratamento de exceções apropriado
- [ ] Migrations Flyway (se mudou schema)
- [ ] Sem SQL injection (use ORM/parameterized queries)

### Frontend
- [ ] Componentes bem tipados (TypeScript)
- [ ] Props validadas com interfaces
- [ ] Sem memory leaks (cleanup em useEffect)
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Acessibilidade básica

### Segurança
- [ ] Sem credenciais hardcoded
- [ ] Validação de entrada (frontend + backend)
- [ ] Autorização verificada (apenas dono pode editar)
- [ ] Senhas nunca em logs

---

## 🎯 Tipos de Contribuição Esperadas

### 1. Novas Funcionalidades

**Exemplo:** Sistema de avaliações de listagens

```
Backend:
├─ Entity/DTO
├─ Repository
├─ Service (lógica de negócio)
├─ Controller (REST endpoint)
└─ Testes

Frontend:
├─ Hook (useReviews)
├─ Components (ReviewForm, ReviewCard)
├─ Page/Integration
└─ Testes
```

### 2. Bug Fixes

**Exemplo:** Corrigir erro de reconexão WebSocket

```bash
1. Reproduzir o bug
2. Escrever teste que falha
3. Implementar fix
4. Validar teste passa
5. Documentar causa em PR
```

### 3. Melhorias de Performance

**Exemplo:** Adicionar cache Redis para listagens

```bash
1. Identificar gargalo (APM, logs)
2. Propor solução
3. Implementar e testar
4. Medir melhoria (before/after)
5. Documentar impacto
```

### 4. Documentação

- Esclarecer instruções confusas
- Adicionar exemplos de código
- Corrigir typos
- Melhorar diagramas

---

## 🔍 Code Review

### O Que Esperamos em um PR

1. **Descrição Clara**
   - O que foi feito?
   - Por quê foi feito?
   - Como testar?

2. **Escopo Focado**
   - Uma feature por PR
   - Não misture refactoring com feature nova
   - Tamanho razoável (< 400 linhas)

3. **Testes Inclusos**
   - Testes unitários/integração
   - Pelo menos 80% de cobertura
   - Casos de erro testados

4. **Documentação Atualizada**
   - README se necessário
   - Comentários em código complexo
   - Update API docs

### Respondendo a Comentários

- ✅ Aceite feedback construtivo
- 💬 Explique decisões quando necessário
- 🔄 Faça iterações rápidas
- 🙏 Agradeça revisores

---

## 🏗️ Estrutura de Pastas para Novas Features

### Feature: Sistema de Avaliações

**Backend:**
```java
src/main/java/com/party/backend/
├── entity/Review.java
├── dto/ReviewDTO.java
├── dto/CreateReviewDTO.java
├── repository/ReviewRepository.java
├── service/ReviewService.java
└── controller/ReviewController.java

src/test/java/com/party/backend/
├── service/ReviewServiceTest.java
└── controller/ReviewControllerTest.java

src/main/resources/db/migration/
└── V5__add_reviews_table.sql
```

**Frontend:**
```typescript
src/
├── types/review.ts
├── hooks/useReviews.ts
├── components/
│   ├── ReviewForm.tsx
│   ├── ReviewCard.tsx
│   └── ReviewsList.tsx
└── app/
    └── listings/[id]/
        └── reviews/
            └── page.tsx
```

---

## 🚀 Deploy e Release

### Versioning

Usamos [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` (ex: 1.2.3)
- `MAJOR`: Breaking changes
- `MINOR`: Nova feature compatível
- `PATCH`: Bug fix

### Release Process

```bash
# 1. Atualizar versão
# backend/pom.xml: <version>1.1.0</version>
# frontend/package.json: "version": "1.1.0"

# 2. Atualizar CHANGELOG
echo "## [1.1.0] - 2024-12-20
- feat: novo sistema de avaliações
- fix: bug de reconnexão WebSocket
- perf: cache de listagens com Redis" >> CHANGELOG.md

# 3. Commit e tag
git commit -m "chore: release v1.1.0"
git tag v1.1.0
git push origin main --tags

# 4. Build e deploy
docker-compose up --build -d
```

---

## 🐛 Reportando Bugs

### Antes de Reportar
- [ ] Verificou a documentação?
- [ ] Procurou issues já existentes?
- [ ] Consegue reproduzir o bug?

### Como Reportar

Abra uma issue com:

```markdown
**Descrição**
Breve descrição do problema.

**Como Reproduzir**
1. Vá para página X
2. Clique em Y
3. Veja erro Z

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que realmente aconteceu.

**Logs/Screenshots**
Anexe logs, screenshots ou vídeo.

**Ambiente**
- OS: Windows 10
- Browser: Chrome 120
- Node: 18.0.0
- Java: 21
```

---

## 💡 Sugestões de Funcionalidades

Abra uma issue com:

```markdown
**Descrição**
Resumo do que gostaria de ver.

**Caso de Uso**
Como isso ajuda o usuário?

**Benefícios**
- Benefício 1
- Benefício 2

**Contexto Adicional**
Links, referências, exemplos.
```

---

## 📚 Recursos Úteis

- [Git Workflow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)

---

## ❓ FAQ

### Q: Meu PR foi rejeitado. E agora?

A: Não é pessoal! Feedback é para melhorar o projeto. Faça os ajustes e resubmeta.

### Q: Quanto tempo leva o review?

A: Geralmente 2-5 dias. Revisor vai deixar comentários ou aprovar.

### Q: Posso trabalhar em múltiplas features?

A: Sim, use branches diferentes. Mas PR por feature é melhor.

### Q: E se discordar do feedback?

A: Abra discussão no PR. Explique sua visão. Podemos chegar a consenso.

### Q: Como faço para ser mantainer?

A: Contribua regularmente, mostre expertise, e converse com o time.

---

## 📞 Dúvidas?

- Abra uma [discussion](https://github.com/...) no GitHub
- Contate o desenvolvedor principal
- Consulte a documentação

---

## 🙏 Obrigado!

Sua contribuição torna o Party Platform melhor para todos! 🚀

**Feliz coding!** ✨
