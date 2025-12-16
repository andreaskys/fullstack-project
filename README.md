# 🎉 Party Platform - Sistema de Reserva de Eventos

Uma plataforma moderna e escalável para reserva de festas, eventos e espaços, construída com as melhores práticas de desenvolvimento fullstack.

---

## 📚 Documentação Completa

Esta documentação é dividida em vários guias para facilitar a onboarding de novos desenvolvedores:

### 🚀 **[SETUP_RAPIDO.md](SETUP_RAPIDO.md)** - Comece Aqui!
Guia rápido para subir o projeto em 5 minutos. Contém:
- Pré-requisitos mínimos
- Comandos para iniciar cada serviço
- Validação de funcionamento
- Troubleshooting rápido

**Tempo**: ~5 minutos

---

### 🏛️ **[ARQUITETURA.md](ARQUITETURA.md)** - Entenda o Sistema
Visão detalhada de como o projeto é estruturado. Contém:
- Diagrama de componentes
- Padrão MVC (Controller → Service → Repository)
- Descrição de cada tecnologia (PostgreSQL, Redis, RabbitMQ, Elasticsearch, MinIO)
- Fluxos transversais (autenticação, criar listagem, busca, reserva, chat)
- Estratégias de performance e segurança

**Tempo**: ~30 minutos

---

### 📖 **[DOCUMENTACAO.md](DOCUMENTACAO.md)** - Referência Completa
Documentação profunda de todos os componentes. Contém:
- Descrição de cada pasta (backend, frontend, rabbitmq)
- Estrutura de diretórios
- Explicação de serviços e repositórios
- Tipos de dados principais
- Schema de banco de dados
- Variáveis de ambiente

**Tempo**: ~1 hora para referência

---

### 📚 **[API_REST.md](API_REST.md)** - Guia de Endpoints
Documentação interativa de todos os endpoints REST. Contém:
- Métodos HTTP (POST, GET, PUT, DELETE)
- Autenticação (JWT)
- Listagens (CRUD + busca avançada)
- Reservas (criar, consultar, atualizar status)
- Chat em tempo real (HTTP + WebSocket)
- Upload de mídia (imagens e vídeos)
- Amenidades
- Códigos de erro
- Exemplos de requests/responses

**Tempo**: ~20 minutos para consulta

---

## 🏗️ Tech Stack

### Frontend
```
Next.js 16 / React 19 / TypeScript
├─ Tailwind CSS (estilização)
├─ Radix UI (componentes acessíveis)
├─ React Hook Form (formulários)
├─ Zod (validação)
├─ STOMP.js (WebSocket)
└─ SockJS (fallback)
```

### Backend
```
Spring Boot 3.5.7 / Java 21
├─ Spring Security + JWT (autenticação)
├─ Spring Data JPA (ORM)
├─ Spring Data Elasticsearch (busca)
├─ Spring Data Redis (cache)
├─ Spring AMQP (message broker)
├─ Spring WebSocket (real-time)
└─ Flyway (migrações)
```

### Infraestrutura
```
Docker Compose
├─ PostgreSQL 15 (banco relacional)
├─ Redis 7 (cache + sessões)
├─ RabbitMQ 3 (message broker)
├─ Elasticsearch 8.11 (busca + índices)
└─ MinIO (S3-compatible storage)
```

---

## 📊 Estrutura do Projeto

```
fullstack-project/
├── backend/                 # Spring Boot API
│   ├── src/main/java/       # Código-fonte
│   │   └── com/party/backend/
│   │       ├── config/      # Configurações Spring
│   │       ├── controller/  # REST Controllers
│   │       ├── service/     # Lógica de negócio
│   │       ├── repository/  # Data access
│   │       ├── entity/      # JPA Entities
│   │       ├── dto/         # DTOs
│   │       └── exception/   # Exception handlers
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/    # Flyway migrations
│   ├── pom.xml              # Dependências Maven
│   └── mvnw                 # Maven wrapper
│
├── frontend/                # Next.js Web App
│   ├── src/
│   │   ├── app/            # Next.js Pages
│   │   ├── components/     # React Components
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Custom Hooks
│   │   ├── lib/            # Utilities
│   │   └── styles/         # Global CSS
│   ├── package.json        # NPM dependencies
│   ├── tsconfig.json       # TypeScript config
│   └── next.config.ts      # Next.js config
│
├── rabbitmq/               # RabbitMQ Config
│   └── enabled_plugins     # Plugins habilitados
│
├── docker-compose.yml      # Orquestração de containers
├── README.md              # Este arquivo
├── SETUP_RAPIDO.md        # Quick start (5 min)
├── ARQUITETURA.md         # Architecture deep dive
├── DOCUMENTACAO.md        # Complete reference
├── API_REST.md            # API documentation
└── GUIA_DESENVOLVIMENTO.md # Development guide
```

---

## 🚀 Quick Start

```bash
# 1. Clonar repositório
git clone [repo-url]
cd fullstack-project

# 2. Iniciar infraestrutura (Docker)
docker-compose up -d

# 3. Backend (Terminal 1)
cd backend
mvn clean install
mvn spring-boot:run

# 4. Frontend (Terminal 2)
cd frontend
npm install
npm run dev

# 5. Acessar
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
# RabbitMQ: http://localhost:15672 (guest:guest)
# MinIO:    http://localhost:9001
```

Para mais detalhes: veja [SETUP_RAPIDO.md](SETUP_RAPIDO.md)

---

## 🔑 Funcionalidades Principais

### 👤 Autenticação
- Registrar novo usuário
- Login com JWT
- Manutenção de sessão
- Renovação de token

### 🏠 Listagens (Anúncios)
- Criar listagem com imagens e vídeos
- Editar listagem (apenas dono)
- Deletar listagem (apenas dono)
- Busca avançada com filtros (Elasticsearch)
- Categorização com amenidades

### 🎫 Reservas
- Criar reserva em uma listagem
- Validação de datas (sem conflitos)
- Cálculo automático de preço
- Visualizar minhas reservas
- Atualizar status (confirmar/cancelar)

### 💬 Chat em Tempo Real
- Mensagens entre host e hóspede
- WebSocket via STOMP
- Histórico de conversas
- Notificações em tempo real

### 📤 Upload de Mídia
- Upload de imagens
- Upload de vídeos
- Armazenamento em MinIO (S3-compatible)
- URLs públicas

---

## 🔒 Segurança

✅ **Implementado:**
- Autenticação JWT com expiração
- Autorização baseada em roles
- Validação de input (frontend + backend)
- CORS configurado
- Senhas encriptadas com BCrypt
- SQL Injection prevention (ORM)

⚠️ **Produção:**
- Usar variáveis de ambiente para secrets
- HTTPS obrigatório
- Rate limiting
- Monitoramento de logs

---

## 📊 Banco de Dados

**Schema Principal:**
```
users ──┐
        ├─→ listings ──┐
        │              ├─→ listing_images
        │              └─→ listing_videos
        │
        └─→ bookings ──→ chat_messages
                        
        └─→ amenities ──→ listing_amenities
```

**Migrações:**
- Versão automática via Flyway
- Scripts em: `backend/src/main/resources/db/migration/`

---

## 🧪 Testes

```bash
# Backend - JUnit + Mockito
cd backend && mvn test

# Frontend - Jest + React Testing Library
cd frontend && npm test
```

---

## 📈 Performance

### Estratégias Implementadas

1. **Cache com Redis**
   - Reduz carga no PostgreSQL
   - TTL automático
   
2. **Indexação Elasticsearch**
   - Buscas rápidas em milhões de registros
   - Agregações analíticas

3. **Paginação**
   - Não carrega todos dados de uma vez
   - Padrão: `?page=0&size=20`

4. **Índices PostgreSQL**
   - Foreign keys indexadas
   - Campos de busca frequente

5. **Fila Assíncrona (RabbitMQ)**
   - Operações pesadas em background
   - Notificações não bloqueiam API

---

## 🚨 Troubleshooting

### Container não inicia?
```bash
docker-compose logs [service-name]
docker-compose down -v
docker-compose up -d
```

### PostgreSQL não conecta?
Aguarde inicialização:
```bash
docker-compose logs postgres | grep "ready to accept"
```

### Porta em uso?
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

Veja [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md) para mais troubleshooting.

---

## 📝 Padrões de Desenvolvimento

### Commits
```bash
feat(feature): descrição
fix(bugfix): descrição
docs(docs): descrição
refactor(refactor): descrição
```

### Code Style
- Backend: Google Java Style Guide
- Frontend: Google TypeScript Style Guide
- Linting: ESLint + Prettier

### PRs
1. Criar branch: `feature/nome`
2. Fazer alterações
3. Rodar testes
4. Abrir PR com descrição
5. Code review
6. Merge e deploy

---

## 📞 Contato e Suporte

Para dúvidas ou sugestões:
- Abrir issue no GitHub
- Contatar desenvolvedor principal
- Consultar documentação completa

---

## 📜 Versão e Status

**Versão Atual**: 1.0.0
**Status**: Em Desenvolvimento
**Última Atualização**: Dezembro 2025

---

## 🎯 Próximos Passos

1. **Leia [SETUP_RAPIDO.md](SETUP_RAPIDO.md)** para subir o projeto
2. **Explore [ARQUITETURA.md](ARQUITETURA.md)** para entender o sistema
3. **Consulte [API_REST.md](API_REST.md)** para integrar com o frontend
4. **Use [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)** ao contribuir

---

## 📚 Recursos Adicionais

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Elasticsearch Documentation](https://www.elastic.co/guide/)
- [Docker Documentation](https://docs.docker.com/)

---

**Bem-vindo ao Party Platform! 🎉**

Aproveite o desenvolvimento e se divirta construindo! 🚀
