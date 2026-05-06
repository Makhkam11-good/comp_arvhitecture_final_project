# ShopApp Diagrams

## Architecture Diagram

```mermaid
flowchart LR
    Client[Client / Postman / Browser] --> API[REST API Controllers]
    API --> AuthController[AuthController]
    API --> CategoryController[CategoryController]
    API --> ProductController[ProductController]
    API --> OrderController[OrderController]
    API --> ReviewController[ReviewController]

    AuthController --> AuthService[AuthService]
    CategoryController --> CategoryService[CategoryService]
    ProductController --> ProductService[ProductService]
    OrderController --> OrderService[OrderService]
    ReviewController --> ReviewService[ReviewService]

    AuthService --> UserRepository[UserRepository]
    CategoryService --> CategoryRepository[CategoryRepository]
    ProductService --> ProductRepository[ProductRepository]
    ProductService --> CategoryRepository
    OrderService --> OrderRepository[OrderRepository]
    OrderService --> ProductRepository
    OrderService --> UserRepository
    ReviewService --> ReviewRepository[ReviewRepository]
    ReviewService --> ProductRepository
    ReviewService --> UserRepository

    UserRepository --> DB[(PostgreSQL)]
    CategoryRepository --> DB
    ProductRepository --> DB
    OrderRepository --> DB
    ReviewRepository --> DB

    JwtFilter[JwtAuthFilter] --> API
    JwtUtil[JwtUtil] --> JwtFilter
```

## UML Class Diagram

```mermaid
classDiagram
    class User {
        Long id
        String username
        String email
        String password
        Role role
        LocalDateTime createdAt
    }

    class Category {
        Long id
        String name
        String description
        List~Product~ products
    }

    class Product {
        Long id
        String name
        String description
        BigDecimal price
        Integer stock
        String imageUrl
        LocalDateTime createdAt
    }

    class Order {
        Long id
        OrderStatus status
        BigDecimal totalPrice
        String address
        LocalDateTime createdAt
    }

    class OrderItem {
        Long id
        Integer quantity
        BigDecimal price
    }

    class Review {
        Long id
        Integer rating
        String comment
        LocalDateTime createdAt
    }

    class Role {
        <<enumeration>>
        USER
        ADMIN
    }

    class OrderStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        SHIPPED
        DELIVERED
        CANCELLED
    }

    User --> Role
    Category "1" --> "many" Product
    User "1" --> "many" Order
    Order "1" --> "many" OrderItem
    Product "1" --> "many" OrderItem
    User "1" --> "many" Review
    Product "1" --> "many" Review
    Order --> OrderStatus
```

## Database Schema / ERD

```mermaid
erDiagram
    users {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar password
        varchar role
        timestamp created_at
    }

    categories {
        bigint id PK
        varchar name UK
        text description
    }

    products {
        bigint id PK
        varchar name
        text description
        numeric price
        integer stock
        varchar image_url
        bigint category_id FK
        timestamp created_at
    }

    orders {
        bigint id PK
        bigint user_id FK
        varchar status
        numeric total_price
        text address
        timestamp created_at
    }

    order_items {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        integer quantity
        numeric price
    }

    reviews {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        integer rating
        text comment
        timestamp created_at
    }

    users ||--o{ orders : places
    orders ||--o{ order_items : contains
    products ||--o{ order_items : included_in
    categories ||--o{ products : contains
    users ||--o{ reviews : writes
    products ||--o{ reviews : receives
```

## Component Responsibilities

- Controller layer accepts HTTP requests, validates DTOs, and returns REST responses.
- Service layer contains business logic: authentication, category/product CRUD, order totals, review ownership checks.
- Repository layer uses Spring Data JPA to access PostgreSQL tables.
- Security layer uses JWT tokens and role checks for protected operations.
- PostgreSQL stores users, products, categories, orders, order items, and reviews.
