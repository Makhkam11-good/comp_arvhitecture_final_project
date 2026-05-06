# ShopApp — Online Store Platform

ShopApp is a REST API for an online store built with Java Spring Boot. The platform supports product and category management, user registration and login, JWT-based authorization, order creation, stock updates, reviews, and Swagger/OpenAPI documentation. It is designed as a layered backend application with controllers, services, repositories, JPA entities, and PostgreSQL persistence.

## Team

| Member | Responsibility |
| --- | --- |
| Махкамбек | Security / Orders |
| Шохруз | Products / Categories |
| Иброхим | Users / Reviews / Infra |

## Technologies

| Technology | Purpose |
| --- | --- |
| Java 17 | Main programming language |
| Spring Boot 3.2 | Application framework |
| PostgreSQL | Relational database |
| JWT | Stateless authentication and authorization |
| Swagger / OpenAPI | API documentation and manual testing |

## Requirements

- Java 17+
- Maven 3.9+
- PostgreSQL 15+

## Run Locally

```bash
git clone <url>
cd shopapp

# Create database:
createdb shopapp_db

# Configure src/main/resources/application.properties:
# spring.datasource.username=<your_postgres_user>
# spring.datasource.password=<your_postgres_password>

mvn clean install
mvn spring-boot:run

# API is available at:
# http://localhost:8080

# Swagger UI:
# http://localhost:8080/swagger-ui.html
```

## API Endpoints

| Method | URL | Description | Access |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register a new user and return JWT | Public |
| POST | `/api/auth/login` | Authenticate user and return JWT | Public |
| GET | `/api/products` | Get paginated product list | Public |
| GET | `/api/products/{id}` | Get product by id | Public |
| GET | `/api/products/search?name={name}` | Search products by name | Public |
| GET | `/api/products/category/{categoryId}` | Get products by category | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/{id}` | Update product | Admin |
| DELETE | `/api/products/{id}` | Delete product | Admin |
| GET | `/api/categories` | Get all categories | Public |
| GET | `/api/categories/{id}` | Get category by id | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/{id}` | Update category | Admin |
| DELETE | `/api/categories/{id}` | Delete category | Admin |
| POST | `/api/orders` | Create order and decrease product stock | Authenticated user |
| GET | `/api/orders/my` | Get current user's order history | Authenticated user |
| GET | `/api/orders/{id}` | Get order by id | Owner or Admin |
| GET | `/api/orders` | Get all orders | Admin |
| PUT | `/api/orders/{id}/status` | Update order status | Admin |
| GET | `/api/users/profile` | Get current user profile | Authenticated user |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/{id}` | Get user by id | Admin |
| DELETE | `/api/users/{id}` | Delete user | Admin |
| GET | `/api/products/{productId}/reviews` | Get product reviews | Public |
| POST | `/api/products/{productId}/reviews` | Create product review | Authenticated user |
| DELETE | `/api/reviews/{id}` | Delete review | Review owner or Admin |
| GET | `/swagger-ui.html` | Swagger UI | Public |
| GET | `/v3/api-docs` | OpenAPI JSON specification | Public |

## Curl Examples

Register:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo_user\",\"email\":\"demo@example.com\",\"password\":\"password123\"}"
```

Login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo_user\",\"password\":\"password123\"}"
```

Get products:

```bash
curl http://localhost:8080/api/products
```

Use JWT token:

```bash
curl http://localhost:8080/api/orders/my \
  -H "Authorization: Bearer <jwt_token>"
```

## Project Structure

```text
shopapp/
├── docs/
│   ├── architecture.png
│   ├── er-diagram.png
│   ├── use-case.png
│   ├── class-diagram.png
│   └── sequence-order.png
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── shopapp/
│       │           ├── config/
│       │           ├── controller/
│       │           ├── dto/
│       │           ├── exception/
│       │           ├── model/
│       │           ├── repository/
│       │           ├── security/
│       │           ├── service/
│       │           └── ShopAppApplication.java
│       └── resources/
│           ├── application.properties
│           └── data.sql
├── pom.xml
└── README.md
```

## Documentation

The `docs/` directory contains the project diagrams used for presentation and defense:

- `architecture.png` - layered architecture diagram.
- `er-diagram.png` - database ER diagram for the six main tables.
- `use-case.png` - Guest, User, and Admin use cases.
- `class-diagram.png` - core class diagram.
- `sequence-order.png` - order creation sequence diagram.

## Release Workflow

1. Each developer creates a Pull Request from their feature branch into `develop`.
2. The other two developers review and approve the Pull Request.
3. After all feature branches are merged into `develop`, create the final Pull Request from `develop` into `main`.
4. After merging into `main`, create the release tag:

```bash
git tag v1.0.0
```
