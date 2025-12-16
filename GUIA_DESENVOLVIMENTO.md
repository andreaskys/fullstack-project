# 👨‍💻 Guia de Desenvolvimento - Party Platform

Este documento cobre fluxos de desenvolvimento, boas práticas, debugging e resolução de problemas.

---

## 📋 Índice

1. [Setup do Ambiente](#setup-do-ambiente)
2. [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
3. [Padrões de Código](#padrões-de-código)
4. [Debugging](#debugging)
5. [Testes](#testes)
6. [Commits e Versionamento](#commits-e-versionamento)
7. [Troubleshooting](#troubleshooting)
8. [Performance](#performance)
9. [Segurança](#segurança)

---

## Setup do Ambiente

### Pré-requisitos

```bash
# Verificar versões instaladas
java -version          # Deve ser Java 21+
node --version         # Deve ser Node 18+
npm --version          # Deve ser npm 9+
docker --version       # Docker CE/Desktop
docker-compose --version
git --version
```

### Instalação Inicial

```bash
# 1. Clonar repositório
git clone [repo-url]
cd fullstack-project

# 2. Criar arquivo .env (se necessário)
cp .env.example .env

# 3. Iniciar infraestrutura
docker-compose up -d

# 4. Aguardar inicialização
docker-compose logs postgres
# Procure por: "database system is ready to accept connections"

# 5. Backend
cd backend
mvn clean install
mvn spring-boot:run

# 6. Frontend (novo terminal)
cd frontend
npm install
npm run dev
```

### Verificação

```bash
# Endpoints de saúde
curl http://localhost:8080/actuator/health
curl http://localhost:3000
```

---

## Fluxo de Desenvolvimento

### 1. Criar Feature Branch

```bash
# Sempre partir da main atualizada
git checkout main
git pull origin main

# Criar branch com padrão
git checkout -b feature/nome-da-feature
# ou
git checkout -b bugfix/nome-do-bug
git checkout -b docs/nome-doc
```

### 2. Fazer Alterações

#### Backend (Java)

```bash
cd backend

# Exemplo: Criar novo endpoint de avaliações

# 1. Entity
src/main/java/com/party/backend/entity/Review.java

# 2. DTO
src/main/java/com/party/backend/dto/ReviewDTO.java

# 3. Repository
src/main/java/com/party/backend/repository/ReviewRepository.java

# 4. Service
src/main/java/com/party/backend/service/ReviewService.java

# 5. Controller
src/main/java/com/party/backend/controller/ReviewController.java

# 6. Teste
src/test/java/com/party/backend/controller/ReviewControllerTest.java
```

**Exemplo de Implementação:**

```java
// Entity
@Entity
@Table(name = "reviews")
@Getter @Setter @NoArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Min(1) @Max(5)
    private Integer rating;
    
    @Size(max = 500)
    private String comment;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}

// Service
@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    
    @Transactional
    public Review create(UUID listingId, CreateReviewDTO dto) {
        Review review = new Review();
        review.setListing(listingRepository.findById(listingId).orElseThrow());
        review.setUser(getCurrentUser());
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        
        return reviewRepository.save(review);
    }
}

// Controller
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;
    
    @PostMapping("/{listingId}")
    public ResponseEntity<ReviewDTO> create(
        @PathVariable UUID listingId,
        @Valid @RequestBody CreateReviewDTO dto
    ) {
        Review review = service.create(listingId, dto);
        return ResponseEntity.status(201).body(ReviewDTO.from(review));
    }
}
```

#### Frontend (React/Next.js)

```bash
cd frontend

# Exemplo: Criar página de avaliações

# 1. Página
src/app/listings/[id]/reviews/page.tsx

# 2. Component de Form
src/components/ReviewForm.tsx

# 3. Component de Card
src/components/ReviewCard.tsx

# 4. API Client (hook)
src/hooks/useReviews.ts

# 5. Tipo
src/lib/types.ts (adicionar Review)
```

**Exemplo de Implementação:**

```typescript
// hooks/useReviews.ts
import { useState } from "react";

export function useReviews(listingId: string) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const createReview = async (rating: number, comment: string) => {
    const res = await fetch(`/api/reviews/${listingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment })
    });
    return res.json();
  };
  
  return { reviews, loading, fetchReviews, createReview };
}

// components/ReviewForm.tsx
export function ReviewForm({ listingId, onSuccess }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { createReview } = useReviews(listingId);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReview(rating, comment);
    onSuccess();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        min={1}
        max={5}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Deixe seu comentário..."
      />
      <button type="submit">Enviar Avaliação</button>
    </form>
  );
}
```

### 3. Testar Alterações

#### Backend

```bash
cd backend

# Rodar testes unitários
mvn test

# Rodar testes de integração
mvn test -Dgroups=integration

# Testar endpoint específico
mvn spring-boot:run
# Depois com curl ou Postman
curl -X POST http://localhost:8080/api/reviews/uuid-123 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "comment": "Ótimo!"}'
```

#### Frontend

```bash
cd frontend

# Rodar linter
npm run lint

# Testar compilação
npm run build

# Testar no dev server
npm run dev
# Abrir http://localhost:3000
```

### 4. Commit e Push

```bash
# Verificar mudanças
git status
git diff

# Adicionar alterações
git add .

# Commit com mensagem descritiva
git commit -m "feat: adicionar sistema de avaliações de listagens

- Criar entity Review com rating e comentário
- Implementar ReviewService e ReviewController
- Adicionar UI para criar e exibir avaliações
- Integrar com backend via API REST"

# Push
git push origin feature/avaliacoes-listagens
```

### 5. Criar Pull Request

1. Ir ao GitHub
2. Clicar em "New Pull Request"
3. Descrever mudanças:
   - O que foi feito
   - Por quê foi feito
   - Como testar
   - Screenshots/vídeos se aplicável

---

## Padrões de Código

### Backend - Java/Spring

#### DTOs (Data Transfer Objects)

```java
// Request DTO - Validação
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewDTO {
    @NotNull(message = "Rating é obrigatório")
    @Min(value = 1, message = "Rating mínimo é 1")
    @Max(value = 5, message = "Rating máximo é 5")
    private Integer rating;
    
    @NotBlank(message = "Comentário não pode estar vazio")
    @Size(max = 500, message = "Comentário muito longo")
    private String comment;
}

// Response DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private UUID id;
    private Integer rating;
    private String comment;
    private UserDTO user;
    private LocalDateTime createdAt;
    
    public static ReviewDTO from(Review review) {
        return new ReviewDTO(
            review.getId(),
            review.getRating(),
            review.getComment(),
            UserDTO.from(review.getUser()),
            review.getCreatedAt()
        );
    }
}
```

#### Tratamento de Exceções

```java
// Custom Exception
public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }
}

// Global Exception Handler
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse(
            404,
            ex.getMessage(),
            LocalDateTime.now()
        ));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
            .getAllErrors()
            .stream()
            .map(ObjectError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        return ResponseEntity.status(422).body(new ErrorResponse(
            422,
            message,
            LocalDateTime.now()
        ));
    }
}
```

#### Logging

```java
@Service
@Slf4j
public class ReviewService {
    
    public Review create(UUID listingId, CreateReviewDTO dto) {
        log.info("Criando review para listing: {}", listingId);
        
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> {
                log.error("Listing não encontrada: {}", listingId);
                return new EntityNotFoundException("Listing não encontrada");
            });
        
        log.debug("Listing encontrada: {} - {}", listing.getId(), listing.getTitle());
        
        Review review = new Review();
        // ... criar review
        
        Review saved = reviewRepository.save(review);
        log.info("Review criada com sucesso: {}", saved.getId());
        
        return saved;
    }
}
```

### Frontend - TypeScript/React

#### Hooks Customizados

```typescript
// Padrão: use + Funcionalidade
export function useApiCall<T>(
  url: string,
  options?: RequestInit
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        },
        ...options
      });
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, options]);
  
  useEffect(() => {
    fetch();
  }, [fetch]);
  
  return { data, loading, error, refetch: fetch };
}

// Uso
function MyComponent() {
  const { data: reviews, loading } = useApiCall("/api/listings/123/reviews");
  
  if (loading) return <div>Carregando...</div>;
  return <div>{reviews?.length} avaliações</div>;
}
```

#### Components

```typescript
// Props bem tipadas
interface ReviewCardProps {
  review: Review;
  onDelete?: (id: string) => void;
  isOwner?: boolean;
}

export function ReviewCard({ review, onDelete, isOwner }: ReviewCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{review.user.firstName}</p>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i}>
                {i < review.rating ? "⭐" : "☆"}
              </span>
            ))}
          </div>
        </div>
        {isOwner && (
          <button onClick={() => onDelete?.(review.id)}>
            Deletar
          </button>
        )}
      </div>
      <p className="mt-2">{review.comment}</p>
    </Card>
  );
}
```

#### Erros Comuns a Evitar

```typescript
// ❌ Evitar: Any
function getUser(id: any) {
  return fetch(`/api/users/${id}`);
}

// ✅ Fazer: Type safety
function getUser(id: string | UUID) {
  return fetch(`/api/users/${id}`);
}

// ❌ Evitar: Forgot dependencies
useEffect(() => {
  fetchData(userId);
}, []); // userId faltando!

// ✅ Fazer: Todas as dependências
useEffect(() => {
  fetchData(userId);
}, [userId]);

// ❌ Evitar: Memory leak
useEffect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  // Sem cleanup!
}, []);

// ✅ Fazer: Cleanup
useEffect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

---

## Debugging

### Backend - Java

#### Logs

```bash
# Ver logs em tempo real
docker-compose logs -f backend

# Filtrar por nível
docker-compose logs -f backend | grep ERROR
docker-compose logs -f backend | grep WARN
```

#### Debugger Remoto (IntelliJ)

1. Adicionar ao `mvn` ou `application.properties`:
```bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar backend.jar
```

2. No IntelliJ:
   - Run → Edit Configurations → Debug
   - Host: localhost, Port: 5005

#### Inspeção de Banco

```bash
# Conectar ao PostgreSQL
psql -h localhost -U admin -d partydb

# Queries úteis
SELECT * FROM listings LIMIT 10;
SELECT * FROM bookings WHERE status = 'PENDING';
SELECT COUNT(*) FROM chat_messages WHERE booking_id = 'uuid-123';
```

### Frontend - TypeScript/React

#### Console do Browser

```typescript
// Logs úteis
console.log('User:', user);
console.warn('Token expiring');
console.error('API Error:', error);

// Condicional (só em dev)
if (process.env.NODE_ENV === 'development') {
  console.log('Dev info:', data);
}

// Com variáveis
const listingId = 'uuid-123';
console.log(`[Listing ${listingId}] Loading...`);
```

#### React DevTools

1. Instalar extension no Chrome/Firefox
2. Inspecionar componentes, props, state
3. Editar props para testar

#### Network Tab

1. F12 → Network
2. Filtrar por tipo (XHR, Fetch)
3. Ver requests/responses em tempo real
4. Copiar requisição como cURL

---

## Testes

### Backend - JUnit + Mockito

```java
@SpringBootTest
@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {
    
    @Mock
    private ReviewRepository reviewRepository;
    
    @Mock
    private ListingRepository listingRepository;
    
    @InjectMocks
    private ReviewService reviewService;
    
    @Test
    void testCreateReview() {
        // Arrange
        UUID listingId = UUID.randomUUID();
        CreateReviewDTO dto = new CreateReviewDTO(5, "Ótimo!");
        
        Listing listing = new Listing();
        listing.setId(listingId);
        
        when(listingRepository.findById(listingId))
            .thenReturn(Optional.of(listing));
        
        // Act
        Review result = reviewService.create(listingId, dto);
        
        // Assert
        assertNotNull(result);
        assertEquals(5, result.getRating());
        verify(reviewRepository).save(any(Review.class));
    }
}
```

### Frontend - Jest + React Testing Library

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewForm from "@/components/ReviewForm";

describe("ReviewForm", () => {
  it("renders form fields", () => {
    render(<ReviewForm listingId="123" onSuccess={() => {}} />);
    
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/comentário/i)).toBeInTheDocument();
  });
  
  it("submits form with correct data", async () => {
    const onSuccess = jest.fn();
    const { container } = render(
      <ReviewForm listingId="123" onSuccess={onSuccess} />
    );
    
    const input = screen.getByPlaceholderText(/comentário/i);
    await userEvent.type(input, "Ótimo!");
    
    await userEvent.click(screen.getByText(/enviar/i));
    
    expect(onSuccess).toHaveBeenCalled();
  });
});
```

### Rodar Testes

```bash
# Backend - todos os testes
mvn test

# Backend - teste específico
mvn test -Dtest=ReviewServiceTest

# Frontend - todos os testes
npm test

# Frontend - modo watch
npm test -- --watch
```

---

## Commits e Versionamento

### Padrão de Commits

Seguir Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Bug fix
- `docs`: Documentação
- `style`: Formatação (sem mudanças lógicas)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Testes

**Exemplos:**

```bash
git commit -m "feat(reviews): adicionar sistema de avaliações"
git commit -m "fix(chat): corrigir reconexão WebSocket"
git commit -m "docs(api): atualizar documentação de endpoints"
git commit -m "refactor(listing): simplificar serviço de busca"
git commit -m "perf(elasticsearch): otimizar queries de índice"
```

### Versionamento Semântico

Formato: `MAJOR.MINOR.PATCH`

- `MAJOR`: Mudanças incompatíveis (breaking changes)
- `MINOR`: Nova funcionalidade (compatível)
- `PATCH`: Bug fix (compatível)

Exemplo: `v1.2.3`

```bash
# Tag de release
git tag v1.0.0
git push origin v1.0.0
```

---

## Troubleshooting

### Docker

#### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs -f [service-name]

# Inspecionar container
docker inspect [container-id]

# Remover e recriar
docker-compose down -v
docker-compose up -d
```

#### Porta já em uso

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Backend

#### Erro de Conexão PostgreSQL

```
org.postgresql.util.PSQLException: Connection refused
```

**Solução:**
```bash
# 1. Verificar se PostgreSQL está rodando
docker-compose ps postgres

# 2. Aguardar inicialização
docker-compose logs postgres | grep "ready to accept"

# 3. Testar conexão
psql -h localhost -U admin -d partydb -c "SELECT 1"
```

#### Error em Elasticsearch

```
NoNodeAvailableException: No node available
```

**Solução:**
```bash
# Reiniciar Elasticsearch
docker-compose restart elasticsearch

# Aguardar saúde
curl http://localhost:9200/_cluster/health
```

#### RabbitMQ não conecta

```
org.springframework.amqp.AmqpConnectException
```

**Solução:**
```bash
# Verificar RabbitMQ
docker-compose logs rabbitmq

# Acessar UI
http://localhost:15672 (guest:guest)

# Reiniciar
docker-compose restart rabbitmq
```

### Frontend

#### Node modules corrompido

```bash
# Remover e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Porta 3000 em uso

```bash
# Usar porta diferente
npm run dev -- -p 3001

# Ou kill processo
lsof -i :3000 | grep node | awk '{print $2}' | xargs kill -9
```

#### Build fails

```bash
# Verificar types
npm run build

# Se falhar, compilar TypeScript
npx tsc --noEmit

# Limpar .next
rm -rf .next
npm run build
```

---

## Performance

### Backend

#### Monitorar Queries Lentas

```properties
# application.properties
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql=TRACE

# Spring Data JPA - mostrar queries
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

#### Cache com Redis

```java
// Usar @Cacheable para resultados frequentes
@Cacheable(value = "listings", key = "#id", unless = "#result == null")
public Listing getById(UUID id) {
    return repository.findById(id).orElse(null);
}

// Invalidar cache após update
@CacheEvict(value = "listings", key = "#id")
public void update(UUID id, UpdateListingDTO dto) {
    // update logic
}
```

#### Índices no PostgreSQL

```sql
-- Criar índice em coluna frequentemente filtrada
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

-- Verificar índices
\d listings
```

### Frontend

#### Lazy Loading

```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("@/components/Heavy"), {
  loading: () => <div>Carregando...</div>,
});

export default function Page() {
  return <HeavyComponent />;
}
```

#### Memoization

```typescript
import { memo, useMemo, useCallback } from "react";

// Memo: evita re-renders desnecessários
const ListingCard = memo(({ listing }: Props) => {
  return <div>{listing.title}</div>;
});

// useMemo: calcula valor apenas quando dependências mudam
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useCallback: memoriza função para passar como prop
const handleDelete = useCallback((id: string) => {
  deleteListing(id);
}, []);
```

#### Bundle Analysis

```bash
npm run build
npx webpack-bundle-analyzer .next/static
```

---

## Segurança

### Validar Input

```java
// Backend
@Valid @RequestBody CreateReviewDTO dto
// Zod valida automáticamente

// Frontend
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(500)
});

const validated = reviewSchema.parse(data);
```

### Proteger Endpoints

```java
// Apenas usuário autenticado
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ReviewDTO> create(...) { }

// Apenas admin
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> delete(...) { }

// Validar ownership
public void validateOwnership(UUID reviewId, UUID userId) {
    Review review = repository.findById(reviewId).orElseThrow();
    if (!review.getUser().getId().equals(userId)) {
        throw new ForbiddenException("Not the owner");
    }
}
```

### Secrets e Configurações

```properties
# NÃO commitar secrets!
# Usar variáveis de ambiente ou secrets manager

# application.properties (seguro)
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASS}

# JWT_SECRET em /etc/secrets ou var de ambiente
jwt.secret=${JWT_SECRET}
```

```bash
# Docker - usar secrets
docker run -e JWT_SECRET=xxxx backend
```

---

## Checklist de Deploy

- [ ] Rodar testes (backend + frontend)
- [ ] Lint sem erros
- [ ] Build sem warnings
- [ ] Atualizar CHANGELOG
- [ ] Tag de versão
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente configuradas
- [ ] Backup de dados
- [ ] Comunicar ao time

---

## Recursos Úteis

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Postman](https://www.postman.com/)
- [Git Docs](https://git-scm.com/doc)

---

**Última atualização**: Dezembro 2025
**Autor**: Time de Desenvolvimento
