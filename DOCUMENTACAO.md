# Documentação do Projeto Fullstack - Party Platform

## 📋 Visão Geral

Este é um projeto fullstack completo para uma plataforma de reserva de festas/eventos (Party Platform). A arquitetura utiliza:
- **Backend**: Spring Boot 3.5.7 com Java 21
- **Frontend**: Next.js 16 com React 19 e TypeScript
- **Infraestrutura**: Docker Compose com PostgreSQL, Redis, RabbitMQ, Elasticsearch e MinIO

---

## 🏗️ Estrutura do Projeto

```
fullstack-project/
├── backend/               # Aplicação Spring Boot
├── frontend/              # Aplicação Next.js
├── rabbitmq/              # Configuração RabbitMQ
├── docker-compose.yml     # Orquestração de containers
└── DOCUMENTACAO.md        # Este arquivo
```

---

## 🐳 Docker Compose - Infraestrutura

### Arquivo: `docker-compose.yml`

Define todos os serviços necessários para rodar o projeto em containers Docker:

#### **PostgreSQL** (banco de dados principal)
```yaml
porta: 5432
usuario: admin
senha: admin_password
banco: partydb
volume: postgres_data
```
- Banco de dados relacional para armazenar usuários, listagens, reservas e mensagens de chat
- Usa migrações Flyway para versionamento do schema

#### **Redis** (cache e sessões)
```yaml
porta: 6379
volume: redis_data
```
- Cache em memória para melhorar performance
- Armazenamento de sessões de usuários

#### **RabbitMQ** (fila de mensagens)
```yaml
porta AMQP: 5672
porta Stomp: 61613
portal Management: 15672
usuario: guest
senha: guest
```
- Sistema de fila para processamento assíncrono
- Suporta protocolo STOMP para WebSocket
- Painel de gerenciamento em `http://localhost:15672`

#### **Elasticsearch** (busca e indexação)
```yaml
porta: 9200, 9300
heap: 512m (Xms) / 512m (Xmx)
single-node: true
```
- Motor de busca para listagens com suporte a filtros avançados
- Indexação de dados de anúncios

#### **MinIO** (armazenamento de objetos - S3)
```yaml
porta API: 9000
porta Console: 9001
usuario: minio_access_key
senha: minio_secret_key
bucket: party-listings
```
- Compatível com AWS S3
- Armazena imagens e vídeos de listagens
- Acesso públicohabilitado para o bucket `party-listings`

#### **MinIO Client (mc-setup)** (inicialização)
- Container que configura automaticamente o bucket e permissões na inicialização

---

### Como Iniciar

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar os serviços
docker-compose down

# Ver logs
docker-compose logs -f [service-name]
```

---

## 🔙 Backend - Spring Boot

### Localização: `/backend`

**Tecnologias Principais:**
- Spring Boot 3.5.7
- Spring Data JPA (ORM)
- Spring Security + JWT
- Spring AMQP (RabbitMQ)
- Spring Data Elasticsearch
- Spring Data Redis
- Spring WebSocket
- PostgreSQL Driver
- Lombok (annotations)
- Flyway (migrações de DB)
- AWS SDK S3

### Estrutura do Código

```
src/main/java/com/party/backend/
├── config/                 # Configurações
│   ├── ApplicationConfig   # Beans e configurações gerais
│   ├── SecurityConfig      # Spring Security e JWT
│   ├── WebConfig          # Configuração web (CORS, etc)
│   ├── WebSocketConfig    # WebSocket para chat
│   ├── StorageConfig      # Configuração MinIO/S3
│   └── CorsConfig         # CORS
├── controller/             # REST Controllers
│   ├── AuthController     # Autenticação/Registro
│   ├── ListingController  # CRUD de listagens
│   ├── BookingController  # Reservas
│   ├── ChatController     # Mensagens
│   ├── AmenityController  # Comodidades
│   ├── MediaController    # Upload de mídia
│   └── demo/              # Controladores de demo
├── service/                # Lógica de negócio
│   ├── AuthenticationService   # Autenticação
│   ├── JwtService              # Geração/validação JWT
│   ├── ListingService          # Operações de listagens
│   ├── BookingService          # Operações de reservas
│   ├── ChatService             # Operações de chat
│   ├── NotificationService     # Notificações via RabbitMQ
│   ├── StorageService          # Upload de arquivos (MinIO)
│   └── AmenityService          # Gerenciamento de comodidades
├── repository/             # Acesso a dados
│   ├── UserRepository
│   ├── ListingRepository
│   ├── ListingSearchRepository (Elasticsearch)
│   ├── BookingRepository
│   ├── ChatMessageRepository
│   ├── AmenityRepository
│   ├── ListingImageRepository
│   └── ListingVideoRepository
├── entity/                 # Entidades JPA
│   ├── User               # Usuários
│   ├── Listing            # Anúncios de festas
│   ├── Booking            # Reservas
│   ├── ChatMessage        # Mensagens de chat
│   ├── Amenity            # Comodidades
│   ├── ListingImage       # Imagens associadas
│   └── ListingVideo       # Vídeos associados
├── dto/                    # Data Transfer Objects
│   ├── AuthRequest
│   ├── AuthResponse
│   ├── ListingDTO
│   ├── BookingDTO
│   └── Outros DTOs
├── exception/              # Tratamento de exceções
│   └── GlobalExceptionHandler
└── BackendApplication      # Classe principal
```

### Fluxos Principais

#### 1. **Autenticação (JWT)**
```
POST /api/auth/register
POST /api/auth/login
├─ AuthController
├─ AuthenticationService
├─ JwtService
└─ UserRepository
```

#### 2. **Criar Listagem**
```
POST /api/listings
├─ ListingController
├─ ListingService
├─ StorageService (upload de imagens/vídeos)
├─ ListingRepository
├─ ListingSearchRepository (indexação Elasticsearch)
└─ MediaController (URLs de mídia)
```

#### 3. **Buscar Listagens**
```
GET /api/listings/search
├─ ListingController
├─ ListingService
├─ ListingSearchRepository (Elasticsearch)
└─ Cache Redis (opcional)
```

#### 4. **Fazer Reserva**
```
POST /api/bookings
├─ BookingController
├─ BookingService
├─ BookingRepository
└─ NotificationService (envia msg RabbitMQ)
```

#### 5. **Chat em Tempo Real**
```
WebSocket: /ws/chat
├─ WebSocketConfig
├─ ChatService
├─ ChatMessageRepository
└─ RabbitMQ STOMP (broadcast)
```

### Configurações Importantes

**application.properties:**
- `spring.datasource.*` - Conexão PostgreSQL
- `spring.data.redis.*` - Conexão Redis
- `spring.rabbitmq.*` - Conexão RabbitMQ
- `spring.elasticsearch.*` - Conexão Elasticsearch
- `aws.s3.*` - Configuração MinIO
- `secretKey` - Chave secreta JWT

### Como Executar

```bash
# Build
mvn clean install

# Executar
mvn spring-boot:run

# Ou via Java
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Migrações Flyway
Localizadas em: `/backend/src/main/resources/db/migration/`
- Versionam o schema do banco automaticamente
- Executadas na inicialização da aplicação

---

## 🎨 Frontend - Next.js

### Localização: `/frontend`

**Tecnologias Principais:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI (componentes)
- React Hook Form (formulários)
- Zod (validação)
- STOMP.js (WebSocket)
- Recharts (gráficos)
- SockJS (fallback WebSocket)

### Estrutura do Código

```
src/
├── app/                    # Pages (Next.js App Router)
│   ├── page.tsx           # Home - listagens principais
│   ├── login/page.tsx     # Página de login
│   ├── register/page.tsx  # Página de registro
│   ├── create-listing/page.tsx    # Criar novo anúncio
│   ├── edit-listing/[id]/page.tsx # Editar anúncio
│   ├── listings/[id]/page.tsx     # Detalhes do anúncio
│   ├── my-listings/page.tsx       # Meus anúncios
│   ├── my-bookings/page.tsx       # Minhas reservas
│   ├── chat/page.tsx              # Lista de chats
│   ├── chat/[bookingId]/page.tsx  # Chat específico
│   └── layout.tsx                 # Layout raiz
├── components/             # Componentes reutilizáveis
│   ├── ui/                # Componentes Radix UI (genéricos)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── ... (mais 20+ componentes)
│   ├── navbar.tsx         # Navegação principal
│   ├── ListingsSection.tsx # Seção de listagens
│   ├── listing-form.tsx   # Formulário criar/editar
│   ├── ImageUpload.tsx    # Upload de imagens
│   ├── VideoUpload.tsx    # Upload de vídeos
│   ├── ListingActions.tsx # Ações da listagem
│   ├── DeleteListingButton.tsx
│   ├── BookingWidget.tsx  # Widget de reserva
│   ├── booking-card.tsx   # Card de reserva
│   ├── ChatBox.tsx        # Interface de chat
│   ├── search-filters.tsx # Filtros de busca
│   └── theme-provider.tsx # Tema (dark/light)
├── context/                # React Context
│   └── AuthContext.tsx    # Contexto de autenticação
├── hooks/                  # Custom React Hooks
│   ├── useChat.ts         # Hook para chat WebSocket
│   └── useNotification.ts # Hook para notificações
├── lib/                    # Utilitários
│   ├── types.ts           # Tipos TypeScript compartilhados
│   └── utils.ts           # Funções utilitárias
└── styles/                 # Estilos globais
    └── globals.css        # Tailwind + CSS customizado
```

### Tipos Principais (`lib/types.ts`)

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  maxGuests: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  videos: string[];
  userId: string;
  createdAt: Date;
}

interface Booking {
  id: string;
  listingId: string;
  userId: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}
```

### Fluxos Principais

#### 1. **Autenticação**
```
/login ou /register
├─ Login/Register page
├─ AuthContext (estado global)
├─ LocalStorage (token JWT)
└─ Interceptadores HTTP (validação token)
```

#### 2. **Listar Listagens com Filtros**
```
/ (home) ou search
├─ ListingsSection
├─ search-filters (filtros)
├─ API: GET /api/listings/search?...
├─ Elasticsearch (backend)
└─ Cache Redis (opcional)
```

#### 3. **Criar/Editar Anúncio**
```
/create-listing ou /edit-listing/[id]
├─ listing-form
├─ ImageUpload (múltiplas imagens)
├─ VideoUpload (vídeos)
├─ POST/PUT /api/listings
└─ MinIO (armazenamento)
```

#### 4. **Detalhes da Listagem**
```
/listings/[id]
├─ Exibe info completa
├─ BookingWidget (reservar)
├─ ChatBox (iniciar chat)
└─ ListingActions (editar/deletar se dono)
```

#### 5. **Chat em Tempo Real**
```
/chat/[bookingId]
├─ useChat hook (STOMP WebSocket)
├─ ChatBox component
├─ Mensagens em tempo real
└─ RabbitMQ (broadcast)
```

### Variáveis de Ambiente (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### Como Executar

```bash
# Instalar dependências
npm install

# Desenvolvimento (hot reload)
npm run dev
# Acessa: http://localhost:3000

# Build
npm build

# Produção
npm start

# Lint
npm run lint
```

---

## 🔧 RabbitMQ - Configuração

### Localização: `/rabbitmq`

**Arquivo: `enabled_plugins`**

Define quais plugins RabbitMQ devem estar ativos:
```
rabbitmq_stomp           # Protocolo STOMP para WebSocket
rabbitmq_management      # UI de gerenciamento
rabbitmq_management_agent
```

### Acessar Management UI

- **URL**: http://localhost:15672
- **Usuário**: guest
- **Senha**: guest

### Filas Principais

1. **notifications** - Notificações de reservas e mensagens
2. **chat.messages** - Mensagens de chat
3. **bookings** - Eventos de reserva

### Protocolo STOMP

O frontend se conecta via STOMP para receber mensagens em tempo real:
```javascript
// Frontend
const client = new StompClient({
  brokerURL: 'ws://localhost:8080/ws',
  ...
});

client.subscribe('/topic/chat', (message) => {
  // Processa mensagem
});
```

---

## 📦 Banco de Dados - Schema

### Tabelas Principais (PostgreSQL)

#### `users`
```sql
id (UUID)
email (UNIQUE)
password_hash
first_name
last_name
profile_picture_url
created_at
```

#### `listings`
```sql
id (UUID)
user_id (FK)
title
description
address
max_guests (INT)
price_per_night (DECIMAL)
created_at
updated_at
```

#### `listing_images`
```sql
id (UUID)
listing_id (FK)
image_url
created_at
```

#### `listing_videos`
```sql
id (UUID)
listing_id (FK)
video_url
created_at
```

#### `bookings`
```sql
id (UUID)
listing_id (FK)
user_id (FK)
check_in_date
check_out_date
total_price
status (ENUM: PENDING, CONFIRMED, CANCELLED)
created_at
```

#### `chat_messages`
```sql
id (UUID)
booking_id (FK)
sender_id (FK)
content
created_at
```

#### `amenities`
```sql
id (UUID)
name
icon
```

#### `listing_amenities`
```sql
listing_id (FK)
amenity_id (FK)
```

---

## 🔒 Segurança

### Autenticação JWT

1. **Fluxo**:
   ```
   POST /api/auth/login
   ├─ Valida credenciais
   ├─ Gera JWT (expiração 24h)
   └─ Retorna token
   
   Requisições subsequentes:
   Header: Authorization: Bearer <token>
   ```

2. **Validação**:
   - Token armazenado em LocalStorage (frontend)
   - Validado em cada requisição (backend)
   - SecurityConfig implementa filtro JWT

### CORS

- Configurado para aceitar requisições do frontend
- Apenas origens permitidas podem acessar API

### Credenciais Padrão

⚠️ **NÃO USE EM PRODUÇÃO**:
```
Admin do banco: admin / admin_password
Redis: sem senha
RabbitMQ: guest / guest
MinIO: minio_access_key / minio_secret_key
```

---

## 🚀 Fluxo de Desenvolvimento

### Setup Inicial

```bash
# 1. Clone o repositório
git clone [repo-url]
cd fullstack-project

# 2. Inicie a infraestrutura
docker-compose up -d

# 3. Verifique status dos containers
docker-compose ps

# 4. Backend
cd backend
mvn clean install
mvn spring-boot:run

# 5. Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

### Verificação

- **Backend**: http://localhost:8080/swagger-ui.html (se Swagger estiver configurado)
- **Frontend**: http://localhost:3000
- **RabbitMQ**: http://localhost:15672
- **MinIO**: http://localhost:9001
- **Elasticsearch**: http://localhost:9200

---

## 🐛 Troubleshooting

### Container não inicia
```bash
# Ver logs
docker-compose logs [service-name]

# Remover e recriar
docker-compose down -v
docker-compose up -d
```

### Erro de conexão PostgreSQL
```bash
# Aguardar inicialização
docker-compose logs postgres
# Aguarde mensagem: "database system is ready to accept connections"
```

### MinIO bucket não criado
```bash
# Reiniciar
docker-compose restart mc-setup
```

### WebSocket não conecta
```bash
# Verificar RabbitMQ STOMP
docker-compose logs rabbitmq
# Porta 61613 deve estar aberta
```

---

## 📝 Padrões de Código

### Backend (Java/Spring)

```java
// Serviço com injeção de dependência
@Service
@RequiredArgsConstructor
public class ListingService {
    private final ListingRepository repository;
    private final ListingSearchRepository searchRepository;
    
    public Listing create(CreateListingDTO dto) {
        // Lógica aqui
    }
}

// Controller com validação
@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {
    private final ListingService service;
    
    @PostMapping
    public ResponseEntity<ListingDTO> create(@Valid @RequestBody CreateListingDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }
}
```

### Frontend (TypeScript/React)

```typescript
// Hook customizado
export function useChat(bookingId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    // Setup WebSocket
  }, [bookingId]);
  
  return { messages, sendMessage };
}

// Component
export function ChatBox({ bookingId }: Props) {
  const { messages, sendMessage } = useChat(bookingId);
  
  return (
    <div>
      {/* Render messages */}
    </div>
  );
}
```

---

## 📊 Fluxo de Dados

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                │
│  ┌──────────────┐        ┌──────────────┐           │
│  │  React Pages │ ◄──►   │  AuthContext │           │
│  └──────────────┘        └──────────────┘           │
│         ▲                                           │
│         │ HTTP/WebSocket                            │
│         ▼                                           │
├─────────────────────────────────────────────────────┤
│                 Backend (Spring Boot)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │Controller│─►│ Service  │─►│Repository│           │
│  └──────────┘  └──────────┘  └──────────┘           │
│         ▲            │             │                │
│         │            ▼             ▼                │
│         │      ┌──────────┐   ┌──────────┐          │
│         │      │ External │   │Database  │          │
│         │      │ Services │   │          │          │
│         │      └──────────┘   └──────────┘          │
│         └─────────────────────────────────────────  │
├─────────────────────────────────────────────────────┤
│              External Services (Docker)             │
│  ┌────────┐  ┌────────┐  ┌──────────┐  ┌──────┐     │
│  │PostgreSQL│ │ Redis  │  │RabbitMQ  │  │MinIO│     │
│  └────────┘  └────────┘  └──────────┘  └──────┘     │
│  ┌──────────────────┐  ┌──────────────────┐         │
│  │  Elasticsearch   │  │ PostgreSQL (ES)  │         │
│  └──────────────────┘  └──────────────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD e Deploy

### Pré-requisitos

- Docker e Docker Compose instalados
- Java 21 (para build local do backend)
- Node.js 18+ (para build local do frontend)

### Build

```bash
# Backend
cd backend && mvn clean package

# Frontend
cd frontend && npm run build
```

### Deployment

Recomendações para produção:
1. Usar secrets gerenciados (não hardcode)
2. Separar configurações por ambiente
3. Implementar CI/CD (GitHub Actions, GitLab CI, etc)
4. Usar variáveis de ambiente para credenciais

---

## 📚 Recursos Úteis

### Documentação Oficial
- [Spring Boot](https://spring.io/projects/spring-boot)
- [Next.js](https://nextjs.org/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [RabbitMQ](https://www.rabbitmq.com/documentation.html)
- [Elasticsearch](https://www.elastic.co/guide/index.html)
- [MinIO](https://min.io/docs/)

### Ferramentas
- **Postman** - Testar APIs REST
- **pgAdmin** - Gerenciar PostgreSQL
- **DBeaver** - IDE para banco de dados
- **VS Code** - Editor de código

---

## 🤝 Contribuindo

### Passos para Contribuições

1. Criar branch da feature: `git checkout -b feature/minha-feature`
2. Commitar mudanças: `git commit -m 'Adiciona minha feature'`
3. Fazer push: `git push origin feature/minha-feature`
4. Abrir Pull Request

### Code Review
- Revisar código antes de merge
- Testar localmente
- Validar com o time

---

**Última atualização**: Dezembro 2025
**Versão**: 1.0.0
