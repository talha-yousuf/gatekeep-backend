# Gatekeep Backend

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![NestJS](https://img.shields.io/badge/NestJS-v10-orange)
![Node.js](https://img.shields.io/badge/node-v18%2B-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-Non--Commercial-orange)

Backend for a feature flag management MVP.

---

## Table of Contents

1. [Motivation](#motivation)
2. [System Overview](#system-overview)
3. [Tech Stack](#tech-stack)
4. [Key Features](#key-features)
   - [Feature Flag Management](#feature-flag-management)
   - [Evaluation Engine & Caching](#evaluation-engine--caching)
   - [Operational Features](#operational-features)
5. [Design Decisions & Tradeoffs](#design-decisions-and-tradeoffs)
   - [Included](#included)
   - [Excluded / Planned for Later](#excluded--planned-for-later)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
7. [API Documentation](#api-documentation)
8. [Running Tests](#running-tests)
9. [What's Next](#whats-next)
10. [License](#license)

## Motivation

Modern applications need the ability to:

- Roll out features gradually to subsets of users
- Enable or disable functionality instantly without redeployment
- Target specific users or segments for A/B testing and beta programs
- Maintain audit trails for compliance and debugging
- Allowing both technical and non-technical stakeholders to safely manage feature rollouts, experiments, and staged releases.

> **Target Users and Audience:**
>
> platform engineers, internal tooling engineers, DevOps engineers, backend & frontend engineers, QA engineers, product managers, release managers, and business analysts

## System Overview

This backend service, built with **NestJS** (TypeScript), exposes RESTful APIs for:

- **Administrative Operations**: Create, update, delete feature flags with JWT-protected endpoints
- **Flag Evaluation**: Cached public endpoint for client applications to resolve flag states
- **User Targeting**: Explicit user-level overrides and percentage-based gradual rollouts
- **Audit Logging**: History of all flag modifications

The project implements:

- **Cache-first architecture** for read-heavy workloads
- **Deterministic rollouts** using consistent hashing to ensure same user gets the same experience
- **Fail-safe defaults**: Missing flags resolve to safe disabled values
- **Separation of concerns**: Public vs administrative endpoints
- **Security measures**: JWT authentication, parameterized SQL queries
- **Performance optimization**: In-memory caching, controlled database queries

## Tech Stack

| Technology             | Rationale                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **NestJS**             | Modular architecture with dependency injection, ideal for maintainable backend services         |
| **PostgreSQL**         | ACID compliance for critical configuration data, excellent performance for read-heavy workloads |
| **JWT Authentication** | Stateless admin authentication, scales horizontally without session storage                     |
| **Raw SQL**            | Maximum control over queries and performance, simpler than ORM for the MVP use-case             |
| **In-Memory Cache**    | Sub-millisecond evaluation latency, suitable for single-instance MVP (Redis-ready for scale)    |

## Key Features

### Feature Flag Management

- Full CRUD operations for feature flags
- Global enable/disable toggle
- Default value fallback configuration
- Percentage-based rollout control (0-100%)
- Explicit user targeting

### Evaluation Engine & Caching

- **Deterministic**: Hash-based rollout using `(userId, flagKey)` for consistency
- **Fast**: In-memory cache serves most requests without database access
- **Safe**: Unknown flags return disabled state, never throw errors
- **Priority Logic**:
  1. Global enable check
  2. Explicit user targeting (if configured)
  3. Rollout percentage calculation
  4. Default value fallback
- **Cache Strategy**:
  - **Dual refresh approach**:
    - Scheduled Refresh (TTL-based) ensures eventual consistency
    - Event-Based Refresh triggers on flag mutations for immediate consistency
  - **Cache Behavior**:
    - Cache hit: served from memory (<1ms latency)
    - Cache miss: returns safe disabled value
    - Observability: cache operations logged for monitoring

### Operational Features

- **Secure Admin API**: JWT-based authentication for management endpoints
- **Audit Trail**: All flag changes logged with timestamps and actor information
- **API Documentation**: Swagger UI for interactive API testing

## Design Decisions and Tradeoffs

### Included

✅ Core feature flag logic with deterministic evaluation  
✅ JWT authentication for admin operations  
✅ Audit logging for compliance  
✅ In-memory caching for performance  
✅ Percentage rollouts with consistent hashing  
✅ User-specific targeting

### Excluded / Planned for Later

❌ Distributed caching (Redis-ready for scaling)  
❌ Analytics/metrics (no exposure tracking or experiment analysis)  
❌ Complex auth (simple JWT only, no OAuth/SSO)  
❌ Historical versioning (no soft deletes or flag history beyond audit log)

These exclusions keep the scope narrow for an MVP.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd gatekeep-backend
   ```

2. Install dependencies

   ```bash
   yarn install
   ```

3. Configure/Create a `.env` file in the project root

   ```env
   DB_HOST=<DB_HOST>
   DB_PORT=<DB_PORT>
   DB_USER=<DB_USER>
   DB_PASSWORD=<DB_PASSWORD>
   DB_NAME=<DB_NAME>

   PORT=3000 # NestJs server port

   JWT_SECRET=<SUPER_SECRET_KEY>
   ```

4. Start the container

   ```bash
   docker-compose up -d
   ```

5. Run database migrations for the initial schema setup

   ```bash
   docker exec -i [container_name] psql -U [db_user] -d [db_name] < migrations/[sql_schema].sql

   ## Example
   docker exec -i gatekeep-backend-db-1 psql -U gatekeep -d gatekeep < migrations/001_init.sql
   ```

6. Start the application

   ```bash
   # Development mode with hot reload
   yarn start:dev

   # Production mode
   yarn start:prod
   ```

   The API will be available at `http://localhost:3000`

## API Documentation

Interactive API documentation is available via **Swagger UI** at `http://localhost:3000/docs`.

| Endpoint                    | Method | Access | Description                     |
| --------------------------- | ------ | ------ | ------------------------------- |
| `/auth/login`               | POST   | Public | Authenticate and receive JWT    |
| `/flags`                    | GET    | Admin  | List all feature flags          |
| `/flags`                    | POST   | Admin  | Create a new flag               |
| `/flags/:id`                | PUT    | Admin  | Update a flag                   |
| `/flags/:id`                | DELETE | Admin  | Delete a flag                   |
| `/flags/:id/audit`          | GET    | Admin  | View flag modification history  |
| `/flags/:id/target`         | POST   | Admin  | Target specific user for a flag |
| `/flags/:id/target/:userId` | DELETE | Admin  | Remove user targeting           |
| `/flags/evaluate`           | GET    | Public | Evaluate all flags for a user   |

## Running Tests

```bash
# Unit tests
yarn test

# End-to-end tests
yarn test:e2e

# Test coverage report
yarn test:cov
```

## What's Next

See the architecture documentation for:

- Detailed system design decisions and tradeoffs
- Production considerations
- Scalability improvements
- Data flow diagrams and component interactions

## License

This is an early MVP of Gatekeep. The source code is publicly available for **evaluation, learning, or non-commercial use only**.

**Commercial use, deployment, or incorporation into a SaaS product is not permitted without explicit permission.**

See [LICENSE](./LICENSE) for full details.
