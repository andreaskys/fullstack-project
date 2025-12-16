# 📚 Guia de API REST - Party Platform

**Base URL**: `http://localhost:8080/api`

**Formato**: JSON

**Autenticação**: JWT Bearer Token no header `Authorization: Bearer {token}`

---

## 🔐 Autenticação

### POST `/auth/register`
Registrar novo usuário.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "João",
  "lastName": "Silva"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "profilePicture": null,
  "createdAt": "2024-12-16T10:30:00Z"
}
```

**Erros:**
- `400` - Email já existe, senha fraca, campo inválido
- `422` - Validação de entrada falhou

---

### POST `/auth/login`
Autenticar e obter token JWT.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "firstName": "João",
    "lastName": "Silva"
  }
}
```

**Erros:**
- `401` - Credenciais inválidas
- `404` - Usuário não encontrado

---

### GET `/auth/me`
Obter dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "profilePicture": "http://localhost:9000/bucket/profiles/uuid-123/avatar.jpg"
}
```

**Erros:**
- `401` - Token inválido ou expirado
- `404` - Usuário não encontrado

---

## 📍 Listagens (Anúncios)

### POST `/listings`
Criar nova listagem.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Casa com Piscina - Festa Perfeita",
  "description": "Casa espaçosa com piscina, churrasqueira e 5 quartos. Ideal para festas e eventos.",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "maxGuests": 30,
  "pricePerNight": 500.00,
  "images": [
    "http://localhost:9000/party-listings/images/uuid-123/image-1.jpg"
  ],
  "videos": [
    "http://localhost:9000/party-listings/videos/uuid-123/video-1.mp4"
  ],
  "amenities": [
    "piscina",
    "churrasqueira",
    "wifi",
    "ar-condicionado",
    "som-ambiente"
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-456",
  "userId": "uuid-123",
  "title": "Casa com Piscina - Festa Perfeita",
  "description": "Casa espaçosa...",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "maxGuests": 30,
  "pricePerNight": 500.00,
  "images": ["http://localhost:9000/..."],
  "videos": ["http://localhost:9000/..."],
  "amenities": ["piscina", "churrasqueira", ...],
  "createdAt": "2024-12-16T10:30:00Z",
  "updatedAt": "2024-12-16T10:30:00Z"
}
```

**Erros:**
- `400` - Dados inválidos
- `401` - Não autenticado
- `422` - Validação falhou

---

### GET `/listings`
Listar todas as listagens com paginação.

**Query Parameters:**
```
?page=0&size=20&sort=createdAt,desc
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "uuid-456",
      "title": "Casa com Piscina",
      "address": "Rua das Flores, 123",
      "maxGuests": 30,
      "pricePerNight": 500.00,
      "images": ["http://localhost:9000/..."],
      "amenities": ["piscina", "churrasqueira"],
      "rating": 4.8,
      "reviewCount": 15
    }
  ],
  "totalElements": 100,
  "totalPages": 5,
  "currentPage": 0,
  "size": 20
}
```

---

### GET `/listings/{id}`
Obter detalhes de uma listagem específica.

**Response:** `200 OK`
```json
{
  "id": "uuid-456",
  "userId": "uuid-123",
  "user": {
    "id": "uuid-123",
    "firstName": "João",
    "lastName": "Silva",
    "profilePicture": "http://localhost:9000/..."
  },
  "title": "Casa com Piscina - Festa Perfeita",
  "description": "Casa espaçosa com piscina...",
  "address": "Rua das Flores, 123 - São Paulo, SP",
  "maxGuests": 30,
  "pricePerNight": 500.00,
  "images": [
    {
      "id": "uuid-img-1",
      "url": "http://localhost:9000/party-listings/images/uuid-456/image-1.jpg"
    }
  ],
  "videos": [
    {
      "id": "uuid-vid-1",
      "url": "http://localhost:9000/party-listings/videos/uuid-456/video-1.mp4"
    }
  ],
  "amenities": ["piscina", "churrasqueira", "wifi", "ar-condicionado", "som-ambiente"],
  "rating": 4.8,
  "reviewCount": 15,
  "createdAt": "2024-12-16T10:30:00Z",
  "updatedAt": "2024-12-16T10:30:00Z"
}
```

**Erros:**
- `404` - Listagem não encontrada

---

### PUT `/listings/{id}`
Atualizar uma listagem (apenas o dono).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:** (qualquer campo pode ser omitido)
```json
{
  "title": "Casa com Piscina - Melhorada",
  "pricePerNight": 550.00,
  "amenities": ["piscina", "churrasqueira", "wifi"]
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-456",
  "title": "Casa com Piscina - Melhorada",
  "pricePerNight": 550.00,
  ...
}
```

**Erros:**
- `401` - Não autenticado
- `403` - Não é o dono
- `404` - Listagem não encontrada

---

### DELETE `/listings/{id}`
Deletar uma listagem (apenas o dono).

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `204 No Content`

**Erros:**
- `401` - Não autenticado
- `403` - Não é o dono
- `404` - Listagem não encontrada

---

### GET `/listings/search`
Buscar listagens com filtros avançados (Elasticsearch).

**Query Parameters:**
```
?q=casa+piscina          # Busca full-text
&location=São+Paulo      # Localização
&minPrice=300            # Preço mínimo
&maxPrice=1000           # Preço máximo
&maxGuests=20            # Número mínimo de hóspedes
&amenities=piscina,wifi  # Comodidades (comma-separated)
&page=0                  # Paginação
&size=20
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "uuid-456",
      "title": "Casa com Piscina",
      "description": "Casa espaçosa...",
      "address": "Rua das Flores, 123",
      "maxGuests": 30,
      "pricePerNight": 500.00,
      "images": ["http://localhost:9000/..."],
      "amenities": ["piscina", "churrasqueira"],
      "rating": 4.8,
      "score": 12.5  // Relevância Elasticsearch
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "currentPage": 0
}
```

---

## 🛏️ Reservas

### POST `/bookings`
Criar nova reserva.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "listingId": "uuid-456",
  "checkInDate": "2024-12-25",
  "checkOutDate": "2024-12-26",
  "numberOfGuests": 10
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-booking-1",
  "listingId": "uuid-456",
  "userId": "uuid-123",
  "checkInDate": "2024-12-25",
  "checkOutDate": "2024-12-26",
  "numberOfGuests": 10,
  "totalPrice": 500.00,
  "status": "PENDING",
  "listing": {
    "id": "uuid-456",
    "title": "Casa com Piscina"
  },
  "createdAt": "2024-12-16T10:30:00Z"
}
```

**Erros:**
- `400` - Datas inválidas, listagem não existe
- `401` - Não autenticado
- `409` - Datas indisponíveis
- `422` - Validação falhou

---

### GET `/bookings`
Obter todas as reservas do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?status=PENDING    # Filtrar por status: PENDING, CONFIRMED, CANCELLED
&page=0
&size=20
```

**Response:** `200 OK`
```json
{
  "content": [
    {
      "id": "uuid-booking-1",
      "listingId": "uuid-456",
      "listing": {
        "id": "uuid-456",
        "title": "Casa com Piscina",
        "address": "Rua das Flores, 123",
        "images": ["http://localhost:9000/..."]
      },
      "checkInDate": "2024-12-25",
      "checkOutDate": "2024-12-26",
      "totalPrice": 500.00,
      "status": "PENDING",
      "createdAt": "2024-12-16T10:30:00Z"
    }
  ],
  "totalElements": 5,
  "totalPages": 1,
  "currentPage": 0
}
```

---

### GET `/bookings/{id}`
Obter detalhes de uma reserva específica.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-booking-1",
  "listingId": "uuid-456",
  "userId": "uuid-123",
  "listing": {
    "id": "uuid-456",
    "title": "Casa com Piscina",
    "user": {
      "id": "uuid-456-owner",
      "firstName": "Maria",
      "lastName": "Santos"
    }
  },
  "user": {
    "id": "uuid-123",
    "firstName": "João",
    "lastName": "Silva"
  },
  "checkInDate": "2024-12-25",
  "checkOutDate": "2024-12-26",
  "numberOfGuests": 10,
  "totalPrice": 500.00,
  "status": "PENDING",
  "createdAt": "2024-12-16T10:30:00Z"
}
```

---

### PUT `/bookings/{id}/status`
Atualizar status de uma reserva (confirmar/cancelar).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "status": "CONFIRMED"  // ou "CANCELLED"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid-booking-1",
  "status": "CONFIRMED",
  ...
}
```

**Erros:**
- `401` - Não autenticado
- `403` - Sem permissão para atualizar
- `404` - Reserva não encontrada
- `409` - Status inválido

---

### DELETE `/bookings/{id}`
Cancelar uma reserva.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `204 No Content`

**Erros:**
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Reserva não encontrada

---

## 💬 Chat

### GET `/chat/bookings`
Listar chats (reservas com mensagens) do usuário.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "bookingId": "uuid-booking-1",
    "listingId": "uuid-456",
    "listingTitle": "Casa com Piscina",
    "otherUser": {
      "id": "uuid-456-owner",
      "firstName": "Maria",
      "lastName": "Santos",
      "profilePicture": "http://localhost:9000/..."
    },
    "lastMessage": "Ótimo! Já está tudo preparado.",
    "lastMessageTime": "2024-12-16T15:30:00Z",
    "unreadCount": 2
  }
]
```

---

### GET `/chat/{bookingId}`
Obter histórico de mensagens de um booking.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
```
?page=0&size=50  # Paginação (mais recentes primeiro)
```

**Response:** `200 OK`
```json
{
  "bookingId": "uuid-booking-1",
  "messages": [
    {
      "id": "uuid-msg-1",
      "senderId": "uuid-123",
      "sender": {
        "id": "uuid-123",
        "firstName": "João",
        "lastName": "Silva"
      },
      "content": "Oi! Gostaria de confirmar a reserva.",
      "createdAt": "2024-12-16T10:30:00Z"
    },
    {
      "id": "uuid-msg-2",
      "senderId": "uuid-456",
      "sender": {
        "id": "uuid-456",
        "firstName": "Maria",
        "lastName": "Santos"
      },
      "content": "Ótimo! Já está tudo preparado.",
      "createdAt": "2024-12-16T15:30:00Z"
    }
  ],
  "totalMessages": 2
}
```

---

### POST `/chat/{bookingId}`
Enviar mensagem (fallback HTTP se WebSocket falhar).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "content": "Qual é o horário de check-in?"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-msg-3",
  "bookingId": "uuid-booking-1",
  "senderId": "uuid-123",
  "content": "Qual é o horário de check-in?",
  "createdAt": "2024-12-16T16:00:00Z"
}
```

---

### WebSocket `/ws`
Conectar ao chat em tempo real via STOMP.

**JavaScript (Frontend):**
```javascript
import { StompClient } from "@stomp/stompjs";

const client = new StompClient({
  brokerURL: "ws://localhost:8080/ws",
  connectHeaders: {
    Authorization: `Bearer ${token}`
  }
});

client.onConnect = () => {
  // Inscrever no tópico
  client.subscribe(`/topic/chat/${bookingId}`, (message) => {
    const msgData = JSON.parse(message.body);
    console.log("Nova mensagem:", msgData);
  });
};

// Enviar mensagem
client.publish({
  destination: `/app/chat/${bookingId}`,
  body: JSON.stringify({ content: "Oi! Tudo bem?" })
});

client.activate();
```

---

## 📤 Upload de Mídia

### POST `/media/upload/image`
Fazer upload de imagem.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: (binary) Arquivo de imagem (max 100MB)
- `listingId`: UUID da listagem (opcional, para contexto)

**Response:** `201 Created`
```json
{
  "id": "uuid-img-1",
  "fileName": "image-1.jpg",
  "url": "http://localhost:9000/party-listings/images/uuid-456/image-1.jpg",
  "size": 2048576,
  "uploadedAt": "2024-12-16T10:30:00Z"
}
```

**Erros:**
- `400` - Arquivo inválido, tipo não suportado
- `401` - Não autenticado
- `413` - Arquivo muito grande

---

### POST `/media/upload/video`
Fazer upload de vídeo.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: (binary) Arquivo de vídeo (max 100MB)
- `listingId`: UUID da listagem

**Response:** `201 Created`
```json
{
  "id": "uuid-vid-1",
  "fileName": "video-1.mp4",
  "url": "http://localhost:9000/party-listings/videos/uuid-456/video-1.mp4",
  "duration": 120,  // segundos
  "uploadedAt": "2024-12-16T10:30:00Z"
}
```

---

### DELETE `/media/{id}`
Deletar arquivo de mídia.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `204 No Content`

---

## 🏷️ Amenidades

### GET `/amenities`
Listar todas as amenidades disponíveis.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-amenity-1",
    "name": "Piscina",
    "icon": "🏊"
  },
  {
    "id": "uuid-amenity-2",
    "name": "Churrasqueira",
    "icon": "🔥"
  },
  {
    "id": "uuid-amenity-3",
    "name": "WiFi",
    "icon": "📡"
  },
  {
    "id": "uuid-amenity-4",
    "name": "Ar-condicionado",
    "icon": "❄️"
  }
]
```

---

## ❌ Códigos de Erro

| Código | Descrição | Solução |
|--------|-----------|---------|
| `400` | Requisição inválida | Verifique os dados enviados |
| `401` | Não autenticado | Faça login e envie um token válido |
| `403` | Proibido / Sem permissão | Você não tem acesso a este recurso |
| `404` | Não encontrado | Verifique o ID do recurso |
| `409` | Conflito (ex: datas indisponíveis) | Verifique a disponibilidade |
| `413` | Arquivo muito grande | Reduza o tamanho do arquivo |
| `422` | Validação falhou | Verifique os dados de entrada |
| `500` | Erro interno do servidor | Tente novamente ou contate suporte |

---

## 🔄 Exemplo de Fluxo Completo

### 1. Registrar
```bash
POST /auth/register
{
  "email": "novo@example.com",
  "password": "Senha123!",
  "firstName": "João",
  "lastName": "Silva"
}
```

### 2. Fazer Login
```bash
POST /auth/login
{
  "email": "novo@example.com",
  "password": "Senha123!"
}
# Retorna token
```

### 3. Criar Listagem
```bash
POST /listings
Authorization: Bearer {token}
{
  "title": "Casa para Festa",
  "description": "Ótima casa...",
  ...
}
```

### 4. Buscar Listagens
```bash
GET /listings/search?q=casa&minPrice=300&maxPrice=1000
```

### 5. Fazer Reserva
```bash
POST /bookings
Authorization: Bearer {token}
{
  "listingId": "uuid-456",
  "checkInDate": "2024-12-25",
  "checkOutDate": "2024-12-26"
}
```

### 6. Iniciar Chat
```bash
WebSocket ws://localhost:8080/ws
Subscribe /topic/chat/{bookingId}
Send /app/chat/{bookingId} com mensagem
```

---

## 🧪 Testar com Postman

1. **Importar endpoints**: Salve os exemplos acima em um arquivo `.json`
2. **Configurar variáveis**:
   - `base_url`: http://localhost:8080/api
   - `token`: Cole o token de login
3. **Usar em requisições**: `{{base_url}}/listings`

---

## 📊 Rate Limits (Futuro)

Quando implementado:
- 100 requisições por minuto para usuários autenticados
- 10 requisições por minuto para não autenticados
- Upload de mídia: 10 arquivos por minuto

---

**Última atualização**: Dezembro 2025
