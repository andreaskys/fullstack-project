# 🚀 Setup Rápido - Party Platform

## Pré-requisitos

- Docker & Docker Compose
- Java 21
- Node.js 18+
- Git

## 1️⃣ Infraestrutura

```bash
# Iniciar todos os serviços (PostgreSQL, Redis, RabbitMQ, Elasticsearch, MinIO)
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f postgres
```

**Aguarde completamente a inicialização do PostgreSQL antes de prosseguir.**

---

## 2️⃣ Backend

```bash
cd backend

# Build
mvn clean install

# Executar (localhost:8080)
mvn spring-boot:run
```

**Logs esperados:**
```
[main] c.p.b.BackendApplication : Started BackendApplication
```

---

## 3️⃣ Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar (localhost:3000)
npm run dev
```

---

## ✅ Validar Serviços

| Serviço | URL | Usuário | Senha |
|---------|-----|---------|-------|
| Frontend | http://localhost:3000 | - | - |
| Backend | http://localhost:8080 | - | - |
| RabbitMQ | http://localhost:15672 | guest | guest |
| MinIO | http://localhost:9001 | minio_access_key | minio_secret_key |
| Elasticsearch | http://localhost:9200 | - | - |
| PostgreSQL | localhost:5432 | admin | admin_password |
| Redis | localhost:6379 | - | - |

---

## 🛑 Parar Tudo

```bash
# Parar containers (sem remover dados)
docker-compose down

# Parar e limpar dados (cuidado!)
docker-compose down -v
```

---

## 🐛 Problemas Comuns

### PostgreSQL não conecta
```bash
# Espere iniciação completa
docker-compose logs postgres

# Ou remova e recrie
docker-compose down -v
docker-compose up -d
```

### MinIO bucket não existe
```bash
docker-compose restart mc-setup
```

### WebSocket não conecta
Verifique se RabbitMQ está rodando:
```bash
docker-compose logs rabbitmq
```

### Porta em uso
```bash
# Encontre processo na porta
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Linux/Mac
```

---

## 📁 Estrutura Importante

```
backend/
├── pom.xml                          # Dependências Maven
├── src/main/resources/
│   └── application.properties        # Configurações
└── src/main/java/com/party/backend/ # Código-fonte

frontend/
├── package.json                     # Dependências NPM
├── next.config.ts                  # Configuração Next.js
├── tsconfig.json                   # Configuração TypeScript
└── src/
    ├── app/                        # Pages
    ├── components/                 # Componentes React
    └── lib/                        # Utilitários

rabbitmq/
└── enabled_plugins                 # Plugins habilitados

docker-compose.yml                  # Orquestração
```

---

## 🔑 Variáveis de Ambiente

### Backend (`backend/src/main/resources/application.properties`)
Já configurado para Docker local. Não precisa alterar.

### Frontend (`frontend/.env.local`)
Criar se necessário:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

---

## 📖 Documentação Completa

Para mais detalhes sobre arquitetura, fluxos, DB schema, etc:
👉 Leia **DOCUMENTACAO.md**

---

## 💡 Dicas

- **Hot Reload**: Frontend recarrega automaticamente ao salvar
- **Logs**: Use `docker-compose logs -f [service]` para acompanhar
- **Database**: Acesse PostgreSQL com uma ferramenta como DBeaver
- **API**: Teste endpoints com Postman ou Insomnia

---

**Pronto! O projeto deve estar rodando em http://localhost:3000** 🎉
