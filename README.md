# Gatekeep Backend

> **Status**: 🚧 In Progress - Demo/Portfolio Project

A feature flag management system built to demonstrate backend system design principles, focusing on deterministic evaluation, cache optimization, and operational safety.

---

## Motivation

Modern applications need the ability to:
- Roll out features gradually to subsets of users
- Enable or disable functionality instantly without redeployment
- Target specific users or segments for A/B testing and beta programs
- Maintain audit trails for compliance and debugging

Gatekeep provides a centralized, API-driven solution for feature flag management with a focus on **low-latency evaluation** and **deterministic behavior**. This project demonstrates core backend engineering concepts including caching strategies, consistent hashing for rollouts, and separation of read/write concerns.

---

## System Overview

Gatekeep is a backend-only service built with **NestJS** (TypeScript) that exposes RESTful APIs for:

- **Administrative Operations**: Create, update, delete feature flags with JWT-protected endpoints
- **Flag Evaluation**: High-performance public endpoint for client applications to resolve flag states
- **User Targeting**: Explicit user-level overrides and percentage-based gradual rollouts
- **Audit Logging**: Complete traceability of all flag modifications

### Architecture Highlights

- **Cache-First Evaluation**: In-memory cache with dual refresh strategy (event-based + scheduled TTL)
- **Deterministic Rollouts**: Consistent hashing ensures same user gets same experience across requests
- **PostgreSQL**: Source of truth for flags, user targets, and audit logs
- **Raw SQL**: Explicit data access for performance and transparency (no ORM)
- **Fail-Safe Defaults**: Missing flags resolve to safe disabled values without blocking requests

### Technology Choices

| Technology | Rationale |
|------------|-----------|
| **NestJS** | Modular architecture with dependency injection, ideal for maintainable backend services |
| **PostgreSQL** | ACID compliance for critical configuration data, excellent performance for read-heavy workloads |
| **JWT Authentication** | Stateless admin authentication, scales horizontally without session storage |
| **Raw SQL** | Maximum control over queries and performance, simpler than ORM for this use case |
| **In-Memory Cache** | Sub-millisecond evaluation latency, suitable for single-instance demo (Redis-ready for scale) |

---

## Key Features

### Feature Flag Management
- Full CRUD operations for feature flags
- Global enable/disable toggle
- Default value fallback configuration
- Percentage-based rollout control (0-100%)

### Evaluation Engine
- **Deterministic**: Hash-based rollout using `(userId, flagKey)` for consistency
- **Fast**: In-memory cache serves most requests without database access
- **Safe**: Unknown flags return disabled state, never throw errors
- **Priority Logic**:
  1. Global enable check
  2. Explicit user targeting (if configured)
  3. Rollout percentage calculation
  4. Default value fallback

### Operational Features
- **Secure Admin API**: JWT-based authentication for management endpoints
- **Audit Trail**: All flag changes logged with timestamps and actor information
- **Cache Strategy**: Automatic refresh on schedule (5 min TTL) + event-based invalidation on updates
- **API Documentation**: Interactive Swagger UI for all endpoints

---

## Design Decisions & Tradeoffs

### What's Included
✅ Core feature flag logic with deterministic evaluation  
✅ JWT authentication for admin operations  
✅ Audit logging for compliance  
✅ In-memory caching for performance  
✅ Percentage rollouts with consistent hashing  
✅ User-specific targeting  

### What's Excluded (By Design)
❌ **Distributed caching** - Single-instance in-memory cache (Redis migration is straightforward)  
❌ **Frontend UI** - Backend-focused demonstration  
❌ **Analytics/metrics** - No exposure tracking or experiment analysis  
❌ **Complex auth** - Simple JWT only, no OAuth/SSO  
❌ **Historical versioning** - No soft deletes or flag history beyond audit log  

These exclusions keep the scope focused on **backend system design fundamentals** rather than building a complete platform.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gatekeep-backend
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Configure environment**

   Create a `.env` file in the project root:

   ```env
   # Database Connection
   DATABASE_URL=postgres://gatekeep:gatekeep@localhost:5432/gatekeep

   # JWT Secret (use a strong secret in production)
   JWT_SECRET=your-super-secret-key

   # Application Port
   PORT=3000
   ```

4. **Start the database**

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**

   Execute the initial schema setup:

   ```bash
   docker exec -i gatekeep-backend-db-1 psql -U gatekeep -d gatekeep < migrations/001_init.sql
   ```

6. **Start the application**

   ```bash
   # Development mode with hot reload
   yarn start:dev

   # Production mode
   yarn start:prod
   ```

   The API will be available at `http://localhost:3000`

---

## API Documentation

Interactive API documentation is available via **Swagger UI**:

📍 **http://localhost:3000/docs**

The Swagger interface provides:
- Complete endpoint documentation
- Request/response schemas
- Interactive API testing
- Authentication support for protected endpoints

### Using Protected Endpoints

Admin endpoints require JWT authentication:

1. Send a `POST` request to `/auth/login` with valid credentials to obtain an `access_token`
2. Click the **"Authorize"** button in Swagger UI
3. Enter the token in the format: `Bearer YOUR_ACCESS_TOKEN`
4. Now you can test protected endpoints

### API Overview

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/auth/login` | POST | Public | Authenticate and receive JWT |
| `/flags` | GET | Admin | List all feature flags |
| `/flags` | POST | Admin | Create a new flag |
| `/flags/:id` | PUT | Admin | Update a flag |
| `/flags/:id` | DELETE | Admin | Delete a flag |
| `/flags/:id/audit` | GET | Admin | View flag modification history |
| `/flags/:id/target` | POST | Admin | Target specific user for a flag |
| `/flags/:id/target/:userId` | DELETE | Admin | Remove user targeting |
| `/flags/evaluate` | GET | Public | Evaluate all flags for a user |

---

## Running Tests

```bash
# Unit tests
yarn test

# End-to-end tests
yarn test:e2e

# Test coverage report
yarn test:cov
```

Tests cover core business logic including evaluation engine, cache behavior, and critical API flows.

---

## Caching Strategy

The `FlagsCacheService` implements a hybrid caching approach:

### Dual Refresh Mechanism

1. **Scheduled Refresh (TTL-based)**
   - Automatic cache reload every 5 minutes (configurable)
   - Ensures eventual consistency even if event triggers fail
   - Prevents unbounded cache staleness

2. **Event-Based Refresh**
   - Cache invalidation triggered on flag mutations
   - Immediate consistency for create/update/delete operations
   - Minimizes stale data window

### Cache Behavior

- **Cache Hit**: Flag configuration served from memory (< 1ms latency)
- **Cache Miss**: Flag not found returns safe disabled default value
- **Observability**: Cache operations logged for monitoring hit/miss rates and refresh cycles

### What's Cached

- ✅ **Feature flag configurations** (key, enabled status, rollout %, default value)
- ❌ **User targeting data** (queried from database for immediate effect)
- ❌ **Audit logs** (append-only, no read optimization needed)

**Note**: Current implementation uses in-memory cache suitable for single-instance deployment. Migration to Redis for horizontal scaling is straightforward (see architecture documentation).

---

## Project Scope

This project demonstrates proficiency in:

- **Backend System Design**: Cache-first architecture for read-heavy workloads
- **Data Consistency**: Deterministic evaluation using consistent hashing
- **API Design**: Clear separation of public vs. administrative concerns
- **Operational Safety**: Fail-safe defaults and comprehensive audit logging
- **Security Fundamentals**: JWT authentication, parameterized SQL queries
- **Performance Optimization**: In-memory caching, database query control

**Target Use Cases**: Internal tooling, configuration services, platform APIs, and infrastructure-adjacent backend systems.

---

## What's Next

See the architecture documentation for:
- Detailed system design decisions and tradeoffs
- Production considerations (Redis, observability, rate limiting)
- Scalability improvements (horizontal scaling, HA database)
- Complete data flow diagrams and component interactions

---

## License

This is a portfolio/demonstration project.