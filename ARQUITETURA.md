# 🏛️ Arquitetura do Sistema - Party Platform

## Visão Geral da Arquitetura

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENTE (WEB)                            │
│                    Next.js / React / TypeScript                 │
│                   Hosted on Port 3000 (localhost)              │
└────────────────────┬─────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
     HTTP/REST    WebSocket    HTTP/REST
    (REST API)    (STOMP)     (Upload Files)
        │            │            │
┌───────▼────────────▼────────────▼──────────────────────────────┐
│                    BACKEND (JAVA/SPRING)                        │
│                  Spring Boot 3.5.7 Port 8080                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              REST Controllers Layer                     │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │  │
│  │  │Auth  │ │List. │ │Book. │ │Chat  │ │Media │         │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │  │
│  └──────────┬──────────────────────────────────────────────┘  │
│             │                                                   │
│  ┌──────────▼──────────────────────────────────────────────┐  │
│  │            Service Layer (Business Logic)               │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ ListingService  AuthenticationService JwtService│   │  │
│  │  │ BookingService  ChatService NotificationService│   │  │
│  │  │ StorageService  AmenityService                 │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └──────────┬──────────────────────────────────────────────┘  │
│             │                                                   │
│  ┌──────────▼──────────────────────────────────────────────┐  │
│  │          Data Access Layer (Repositories)               │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │ UserRepository    ListingRepository            │   │  │
│  │  │ BookingRepository ChatMessageRepository        │   │  │
│  │  │ ListingSearchRepository (Elasticsearch)        │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └──────────┬────────────────────────────────────────────┬─┘  │
│             │                                            │     │
│             │ JPA/Hibernate                    Elasticsearch  │
│             │                                            │     │
└─────────────┼────────────────────────────────────────────┼─────┘
              │                                            │
      ┌───────▼────────────┐                    ┌─────────▼──────┐
      │   PostgreSQL DB    │                    │  Elasticsearch │
      │   - Users          │                    │  - Indexed Data│
      │   - Listings       │                    │  - Search      │
      │   - Bookings       │                    │  - Aggregations│
      │   - Chat Messages  │                    └────────────────┘
      └────────────────────┘

              Storage & Caching

      ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
      │     MinIO      │  │     Redis      │  │   RabbitMQ     │
      │   S3-compat    │  │  Cache/Session │  │  Message Queue │
      │  - Images      │  │  - Hot Data    │  │  - Notifications│
      │  - Videos      │  │  - Sessions    │  │  - Chat Events │
      └────────────────┘  └────────────────┘  └────────────────┘
```

---

## 1. Camada de Apresentação (Frontend)

### Tecnologias
- **Next.js 16**: Framework React com SSR/SSG
- **React 19**: Componentes e gerenciamento de estado
- **TypeScript**: Type safety
- **Tailwind CSS**: Estilização
- **Radix UI**: Componentes acessíveis

### Estrutura

```
frontend/src/
├── app/                      # Next.js App Router (páginas)
│   ├── (auth)/              # Grupo de rotas autenticadas
│   ├── (public)/            # Rotas públicas
│   ├── page.tsx             # Home
│   └── layout.tsx           # Layout raiz
│
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Primitivos Radix UI
│   ├── forms/              # Componentes de formulário
│   ├── listings/           # Componentes de listagens
│   └── chat/               # Componentes de chat
│
├── context/                 # React Context API
│   └── AuthContext.tsx     # Estado de autenticação
│
├── hooks/                   # Custom React Hooks
│   ├── useChat.ts          # Chat WebSocket
│   ├── useNotification.ts  # Notificações
│   └── useAuth.ts          # Autenticação
│
├── lib/                     # Utilidades
│   ├── api.ts              # Cliente HTTP (fetch/axios)
│   ├── types.ts            # Tipos TypeScript compartilhados
│   └── utils.ts            # Funções utilitárias
│
└── styles/                  # Estilos globais
    └── globals.css         # Tailwind global + custom CSS
```

### Fluxo de Estado

```
User Action (Click, Form Submit)
    ↓
React Component Handler
    ↓
Context / State Update (AuthContext, useState)
    ↓
API Call (HTTP POST/GET/PUT/DELETE)
    ↓
Backend Processing
    ↓
Response
    ↓
State Update
    ↓
Component Re-render
```

### Autenticação Frontend

```typescript
// 1. Login
POST /api/auth/login → { token: "JWT..." }
↓
// 2. Armazena token
localStorage.setItem('token', token)
↓
// 3. Adiciona a requisições
Authorization: Bearer <token>
↓
// 4. Contexto mantém estado
<AuthContext.Provider value={{ user, token, logout }}>
```

---

## 2. Camada de API (Backend - Spring Boot)

### Padrão MVC (Model-View-Controller)

```
HTTP Request
    ↓
┌─────────────────────────────────────────┐
│ Controller Layer (@RestController)      │
│ - Recebe requisição HTTP                │
│ - Valida entrada (@Valid)               │
│ - Delega para Service                   │
│ - Retorna ResponseEntity                │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Service Layer (@Service)                │
│ - Lógica de negócio                    │
│ - Transações (@Transactional)          │
│ - Orquestração entre repositórios     │
│ - Integração com serviços externos    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Repository Layer (@Repository)          │
│ - Abstrai acesso a dados                │
│ - JPA/Hibernate para SQL               │
│ - Elasticsearch para busca             │
│ - Redis para cache                     │
└──────────────┬──────────────────────────┘
               ↓
Banco de Dados / Índices / Cache
```

### Controllers Principais

#### 1. **AuthController**
```java
POST /api/auth/register    // Registrar novo usuário
POST /api/auth/login       // Login com credenciais
GET  /api/auth/me          // Dados do usuário autenticado
POST /api/auth/refresh     // Renovar token JWT
```

#### 2. **ListingController**
```java
GET    /api/listings              // Listar com paginação
GET    /api/listings/{id}         // Detalhes de uma listing
POST   /api/listings              // Criar nova listing
PUT    /api/listings/{id}         // Atualizar listing
DELETE /api/listings/{id}         // Deletar listing
GET    /api/listings/search       // Busca avançada (Elasticsearch)
```

#### 3. **BookingController**
```java
POST   /api/bookings              // Criar reserva
GET    /api/bookings              // Minhas reservas
GET    /api/bookings/{id}         // Detalhes da reserva
PUT    /api/bookings/{id}/status  // Atualizar status
DELETE /api/bookings/{id}         // Cancelar reserva
```

#### 4. **ChatController**
```java
GET    /api/chat/bookings         // Chats do usuário
GET    /api/chat/{bookingId}      // Histórico de mensagens
POST   /api/chat/{bookingId}      // Enviar mensagem (HTTP fallback)
```

#### 5. **MediaController**
```java
POST   /api/media/upload/image    // Upload de imagem
POST   /api/media/upload/video    // Upload de vídeo
DELETE /api/media/{id}            // Deletar mídia
```

### Serviços Principais

#### **AuthenticationService**
```java
public class AuthenticationService {
    // Registra novo usuário com senha hash
    public User register(RegisterRequest request);
    
    // Autentica com email/senha, retorna token
    public AuthResponse authenticate(LoginRequest request);
    
    // Obtém usuário do token
    public User getCurrentUser();
}
```

#### **JwtService**
```java
public class JwtService {
    // Gera JWT com expiração
    public String generateToken(User user);
    
    // Valida e extrai claims do token
    public Claims extractClaims(String token);
    
    // Verifica se token está expirado
    public boolean isTokenExpired(String token);
}
```

#### **ListingService**
```java
public class ListingService {
    // CRUD operações
    public Listing create(CreateListingDTO dto);
    public Listing getById(UUID id);
    public List<Listing> getAll(Pageable pageable);
    public Listing update(UUID id, UpdateListingDTO dto);
    public void delete(UUID id);
    
    // Busca avançada
    public Page<Listing> search(SearchCriteria criteria);
    
    // Validações
    public void validateOwnership(UUID listingId);
}
```

#### **BookingService**
```java
public class BookingService {
    // CRUD
    public Booking create(CreateBookingDTO dto);
    public Booking getById(UUID id);
    public List<Booking> getUserBookings(UUID userId);
    public Booking updateStatus(UUID id, BookingStatus status);
    
    // Validações
    public void validateDatesAvailability(UUID listingId, LocalDate checkIn, LocalDate checkOut);
    public void validateUserOwnership(UUID bookingId);
}
```

#### **ChatService**
```java
public class ChatService {
    // Mensagens
    public ChatMessage saveMessage(UUID bookingId, String content, User sender);
    public List<ChatMessage> getMessagesForBooking(UUID bookingId);
    
    // WebSocket
    public void broadcastMessage(UUID bookingId, ChatMessage message);
}
```

#### **StorageService**
```java
public class StorageService {
    // Upload para MinIO
    public String uploadImage(MultipartFile file, String bucketName);
    public String uploadVideo(MultipartFile file, String bucketName);
    
    // Delete de arquivos
    public void deleteFile(String bucketName, String objectName);
    
    // URLs públicas
    public String getPublicUrl(String bucketName, String objectName);
}
```

#### **NotificationService**
```java
public class NotificationService {
    // Publica eventos para fila RabbitMQ
    public void notifyBookingCreated(BookingEvent event);
    public void notifyBookingConfirmed(BookingEvent event);
    public void notifyNewMessage(ChatMessageEvent event);
}
```

### Configurações Importantes

#### **SecurityConfig**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // JWT filter
    // CORS settings
    // Password encoder (BCrypt)
    // Authentication manager
}
```

#### **WebSocketConfig**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig {
    // Stomp endpoint: /ws
    // Message mapping: /app/chat
    // Broadcast: /topic/chat
}
```

#### **StorageConfig**
```java
@Configuration
public class StorageConfig {
    // MinIO client
    // S3 credentials
    // Bucket configuration
}
```

---

## 3. Camada de Dados (Databases & Storage)

### PostgreSQL - Banco Relacional

**Schema Principal:**

```sql
-- Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listagens (anúncios)
CREATE TABLE listings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    max_guests INTEGER,
    price_per_night DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Imagens de listagens
CREATE TABLE listing_images (
    id UUID PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vídeos de listagens
CREATE TABLE listing_videos (
    id UUID PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    video_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservas
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mensagens de chat
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comodidades
CREATE TABLE amenities (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100)
);

-- Associação muitos-para-muitos
CREATE TABLE listing_amenities (
    listing_id UUID NOT NULL REFERENCES listings(id),
    amenity_id UUID NOT NULL REFERENCES amenities(id),
    PRIMARY KEY (listing_id, amenity_id)
);

-- Índices para performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_chat_messages_booking_id ON chat_messages(booking_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

**Migrações Flyway:**
```
src/main/resources/db/migration/
├── V1__initial_schema.sql
├── V2__add_amenities_table.sql
├── V3__add_chat_table.sql
└── ...
```

### Elasticsearch - Busca e Indexação

**Índice de Listings:**
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text" },
      "address": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
      "maxGuests": { "type": "integer" },
      "pricePerNight": { "type": "double" },
      "amenities": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

**Casos de Uso:**
- Busca full-text: "casa com piscina"
- Filtros por amenidades
- Range queries: preço entre X e Y
- Agregações: preço médio, listagens por cidade

### Redis - Cache e Sessões

**Dados em Cache:**
```
listings:{id}           → Dados da listing (60 min TTL)
user:{userId}:bookings  → Reservas do usuário (30 min TTL)
search:results:{hash}   → Resultados de busca (10 min TTL)
sessions:{sessionId}    → Sessão do usuário (24h TTL)
```

### MinIO (S3-Compatible) - Armazenamento de Objetos

**Buckets:**
```
party-listings/
├── images/
│   ├── {listingId}/{imageId}.jpg
│   ├── {listingId}/{imageId}.png
│   └── ...
├── videos/
│   ├── {listingId}/{videoId}.mp4
│   ├── {listingId}/{videoId}.webm
│   └── ...
└── profiles/
    ├── {userId}/avatar.jpg
    └── ...
```

**URLs Públicas:**
```
http://localhost:9000/party-listings/images/{listingId}/{imageId}.jpg
```

---

## 4. Serviços de Infraestrutura

### RabbitMQ - Message Broker

**Arquitetura:**
```
Producer (Backend Service)
    ↓ publishes
Exchange: amq.topic
    ↓ routes to
Queue: notifications
Queue: chat.messages
    ↓ consumed by
Consumer (WebSocket, Email Service)
```

**Filas Principais:**

1. **notifications**
   - Evento: BookingCreated
   - Evento: BookingConfirmed
   - Payload: `{ bookingId, userId, message }`

2. **chat.messages**
   - Evento: NewMessage
   - Payload: `{ bookingId, senderId, content, timestamp }`

3. **emails** (se implementado)
   - Evento: SendEmail
   - Payload: `{ to, subject, body }`

**WebSocket STOMP:**
```
Frontend → WebSocket (/ws)
        → STOMP Client
        → Subscribe /topic/chat/{bookingId}
        → Receive messages from broker
        → RabbitMQ STOMP adapter (:61613)
```

---

## 5. Fluxos Transversais

### A. Fluxo de Autenticação

```
1. Usuário entra credenciais na página /login
   ↓
2. Frontend: POST /api/auth/login { email, password }
   ↓
3. Backend AuthController recebe
   ↓
4. AuthenticationService.authenticate()
   - Busca usuário no banco
   - Valida senha com BCrypt
   - Se válido, gera JWT
   ↓
5. JwtService.generateToken() retorna token
   ↓
6. Frontend recebe token
   ↓
7. Frontend armazena em localStorage
   ↓
8. AuthContext.login() atualiza estado global
   ↓
9. Requisições subsequentes incluem:
   Authorization: Bearer {token}
   ↓
10. SecurityConfig.JwtFilter() valida token
    - Extrai claims
    - Seta UserDetails no SecurityContext
    ↓
11. Controller acessa @AuthenticationPrincipal User
```

### B. Fluxo de Criar Listagem

```
1. Usuário clica "Criar Anúncio"
   ↓
2. Frontend: /create-listing page
   ↓
3. Usuário preenche formulário + faz upload de imagens/vídeos
   ↓
4. Frontend: 
   a) POST /api/media/upload/image → MinIO → retorna URL
   b) POST /api/media/upload/video → MinIO → retorna URL
   c) POST /api/listings { title, description, images[], videos[] }
   ↓
5. Backend ListingController.create()
   ↓
6. ListingService.create()
   - Cria entidade Listing no PostgreSQL
   - Cria registros ListingImage/ListingVideo
   - Índica no Elasticsearch para buscas
   ↓
7. Listing criada com sucesso
   ↓
8. Frontend redireciona para /listings/{id}
```

### C. Fluxo de Busca com Filtros

```
1. Usuário preenche filtros na home
   - Localização
   - Datas check-in/out
   - Preço mín/máx
   - Amenidades
   ↓
2. Frontend: GET /api/listings/search?location=...&minPrice=...
   ↓
3. Backend ListingController.search()
   ↓
4. ListingService.search()
   - Consulta Elasticsearch
   - Aplica filtros (must clauses)
   - Aplica ranges (price between X and Y)
   - Aplica termo text (location)
   ↓
5. Elasticsearch retorna matches
   ↓
6. ListingService.buildResponseDTOs() enriquece com dados DB
   ↓
7. Frontend recebe e exibe resultados
   ↓
8. Cache em Redis para futuras buscas idênticas
```

### D. Fluxo de Reserva

```
1. Usuário clica "Reservar" em uma listing
   ↓
2. Frontend: Abre modal BookingWidget
   - Seleciona check-in/check-out
   - Confirma preço total
   ↓
3. Usuário clica "Confirmar Reserva"
   ↓
4. Frontend: POST /api/bookings { listingId, checkInDate, checkOutDate }
   ↓
5. Backend BookingController.create()
   ↓
6. BookingService.create()
   - Valida datas (não sobrepostas)
   - Valida listing existe
   - Calcula preço total
   - Cria Booking no PostgreSQL
   ↓
7. NotificationService.notifyBookingCreated()
   - Publica evento em RabbitMQ
   - Fila: notifications
   ↓
8. Consumer RabbitMQ (EmailService, NotificationHandler)
   - Envia notificação ao proprietário
   - Envia confirma ao hóspede
   ↓
9. Frontend retorna resposta de sucesso
   ↓
10. Redireciona para /chat/{bookingId}
```

### E. Fluxo de Chat em Tempo Real

```
1. Usuário abre /chat/{bookingId}
   ↓
2. Frontend:
   a) GET /api/chat/{bookingId} → histórico de mensagens
   b) useChat hook inicia WebSocket
   ↓
3. STOMP Client conecta em ws://localhost:8080/ws
   ↓
4. Subscribe /topic/chat/{bookingId}
   ↓
5. Usuário digita e envia mensagem
   ↓
6. Frontend: Send para /app/chat/{bookingId}
   ↓
7. Backend ChatController recebe (WebSocketHandler)
   ↓
8. ChatService.saveMessage()
   - Persiste em PostgreSQL
   - Publica em RabbitMQ
   ↓
9. RabbitMQ STOMP adapter
   ↓
10. Broadcast para /topic/chat/{bookingId}
   ↓
11. Todos os subscribers recebem a mensagem em tempo real
   ↓
12. Frontend re-renderiza ChatBox com mensagem nova
```

---

## 6. Padrões de Integração

### Transações

```java
@Transactional
public Booking createBooking(CreateBookingDTO dto) {
    // Se alguma operação falhar, toda a transação é revertida
    Booking booking = new Booking();
    // ... populate
    
    bookingRepository.save(booking);
    
    // Mesma transação
    notificationService.notify(booking);
    
    // Se falhar aqui, booking não é salvo
    return booking;
}
```

### Validação de Permissões

```java
public void validateOwnership(UUID listingId, UUID userId) {
    Listing listing = listingRepository.findById(listingId)
        .orElseThrow(() -> new NotFoundException("Listing not found"));
    
    if (!listing.getUserId().equals(userId)) {
        throw new ForbiddenException("Not the owner");
    }
}
```

### Cache com Redis

```java
@Cacheable(value = "listings", key = "#id")
public Listing getById(UUID id) {
    return repository.findById(id)
        .orElseThrow(() -> new NotFoundException());
}

@CacheEvict(value = "listings", key = "#id")
public void updateListing(UUID id, UpdateListingDTO dto) {
    // Update logic
}
```

---

## 7. Performance e Escalabilidade

### Estratégias Implementadas

1. **Indexação em Elasticsearch**
   - Buscas rápidas em milhões de listings
   - Agregações analíticas

2. **Cache com Redis**
   - Dados mais acessados em memória
   - Reduz carga PostgreSQL
   - TTL automático

3. **Paginação**
   - Não carrega todos os registros
   - `?page=0&size=20`

4. **Índices no PostgreSQL**
   - Foreign keys indexadas
   - Campos de busca frequente

5. **Compressão de Mídia**
   - Imagens redimensionadas
   - Vídeos em múltiplas resoluções (se implementado)

6. **Fila Assíncrona (RabbitMQ)**
   - Operações pesadas em background
   - Notificações não bloqueiam API

### Métricas para Monitorar

- Tempo de resposta da API
- Taxa de erro (5xx)
- Latência de banco de dados
- Tamanho do cache Redis
- Fila RabbitMQ (backlog)
- Índices Elasticsearch (tamanho, latência)

---

## 8. Segurança

### Camadas de Segurança

1. **Autenticação**
   - JWT bearer token
   - Expiração 24h
   - Refresh token (se implementado)

2. **Autorização**
   - Role-based (ROLE_ADMIN, ROLE_USER)
   - Ownership validation (só dono pode editar)

3. **Validação de Entrada**
   - `@Valid` em DTOs
   - Zod no frontend
   - Limites de tamanho de arquivo

4. **CORS**
   - Apenas origem frontend permitida
   - Métodos HTTP restritos

5. **Encriptação**
   - Senhas com BCrypt (não reversível)
   - HTTPS em produção (não http)

6. **Rate Limiting**
   - (Pode ser implementado com Redis)
   - Proteção contra brute-force

---

## 9. Diagrama de Sequência - Reserva Completa

```
User             Frontend         Backend        Database    RabbitMQ
 │                  │                │               │           │
 ├─ Click Booking ──┤                │               │           │
 │                  │                │               │           │
 │                  ├─ POST /bookings────────┐       │           │
 │                  │                │       │       │           │
 │                  │                ├──────────────→│ Save      │
 │                  │                │       │       │           │
 │                  │                ├──────────────────────────→│
 │                  │                │  Publish Event            │
 │                  │                │       │       │           │
 │                  │←── 200 OK ──────┤       │       │           │
 │                  │                │       │       │           │
 │                  ├─ Redirect ────→│       │       │           │
 │ Display Success  │                │       │       │           │
 ├────────┬─────────┤                │       │       │           │
 │        │         │                │       │       │           │
 │ Receive Event    │                │       │       │ Process ──┤
 │ Notification     │                │       │       │  Event    │
 │ (Email, Toast)   │                │       │       │           │
 │                  │                │       │       │           │
```

---

## 10. Deployment

### Containerização

Cada serviço roda em seu próprio container:
```dockerfile
# Backend
FROM openjdk:21-jdk
COPY target/backend.jar /app.jar
CMD java -jar /app.jar

# Frontend (Next.js)
FROM node:18-alpine
RUN npm run build
CMD npm start
```

### Orquestração (docker-compose.yml)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
  redis:
    image: redis:7
  rabbitmq:
    image: rabbitmq:3-management
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  minio:
    image: minio/minio
  backend:
    build: ./backend
    depends_on:
      - postgres
      - redis
      - rabbitmq
  frontend:
    build: ./frontend
    depends_on:
      - backend
```

---

## Conclusão

Esta arquitetura oferece:
- ✅ Escalabilidade (horizontal e vertical)
- ✅ Performance (cache, índices, async)
- ✅ Segurança (JWT, CORS, validação)
- ✅ Manutenibilidade (padrões claros, separação de concerns)
- ✅ Resiliência (filas, transações, tratamento de erro)

Para perguntas sobre implementação específica, consulte os arquivos de código.
