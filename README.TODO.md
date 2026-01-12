# TODO & Improvement List

This document lists prioritized suggestions for improving the Gatekeep backend project, focusing on reliability, scalability, and maintainability.

---

## High Priority (Core Architecture)

### 1. Optimize Flag Evaluation Performance

- **Issue:** The `FlagsService.evaluateFlag` method currently queries the `targeted_users` table for _every flag_ being evaluated. This creates a large number of database queries (N+1 problem) on the hottest path in the application, which will lead to significant performance degradation under load.
- **Suggestion:**
  - **Cache Targeted Users:** When `FlagsCacheService` refreshes, it should cache not only the flags but also a map of `flag_id -> user_id[]` for all targeted users.
  - **Modify `evaluateFlag`:** The evaluation logic should read from this cached map instead of querying the database directly. This would make the entire evaluation process an in-memory operation.

### 2. Implement a Distributed Cache for Horizontal Scaling

- **Issue:** The current `FlagsCacheService` is a local, in-memory cache. If the application is scaled horizontally (run on multiple servers/containers), each instance will have its own cache. A write operation on one instance will not update the caches on other instances, leading to inconsistent flag evaluations.
- **Suggestion:**
  - Replace the in-memory cache with a distributed cache like **Redis** or **Memcached**.
  - Create a new `CacheModule` that provides a standardized interface for interacting with the distributed cache. This would centralize the caching logic and make it available across the application.

### 3. Adopt an ORM or Query Builder

- **Issue:** The project uses raw SQL strings for all database interactions. This is not type-safe, is prone to SQL injection vulnerabilities if not handled carefully, and tightly couples the services to the database schema. A schema change could lead to runtime errors that are not caught by TypeScript.
- **Suggestion:**
  - **Integrate TypeORM:** Since `typeorm` is already a dependency, fully adopt it. Define entities for each table (`FeatureFlag`, `User`, `AdminUser`, etc.) and refactor services to use the TypeORM repository pattern.
  - **Benefits:** This will provide full type safety between your database and your application code, reduce boilerplate, and make data access more maintainable.

---

## Medium Priority

### 4. Set Up Automated Database Migrations

- **Issue:** The database schema is currently applied manually by executing a SQL file. This is error-prone and makes it difficult to manage schema changes over time, especially in a team environment.
- **Suggestion:**
  - Use TypeORM's migration system. Generate an initial migration from your new entities and create new migration files for any subsequent schema changes.
  - Add a script to `package.json` to run migrations (e.g., `yarn run migration:run`).

### 6. Enhance Observability

- **Issue:** The application has very little logging or monitoring. It's difficult to know what's happening internally.
- **Suggestion:**
  - **Logging:** Add structured logging (e.g., using `pino` or NestJS's built-in `Logger`) to key areas, especially in the `FlagsService` (e.g., log evaluation latency, cache refreshes).
  - **Metrics:** Instrument the code to expose key metrics (e.g., number of evaluations, cache hit/miss ratio) that can be scraped by a monitoring system like Prometheus.

---

## Low Priority (Code Quality & Security Hardening)

### 7. Soft Deletes for Feature Flags

- **Issue:** Deleting a feature flag via `DELETE /flags/:id` is a hard delete. If done accidentally, the flag and its configuration are gone forever.
- **Suggestion:**
  - Implement a soft-delete pattern. Add a `deleted_at` timestamp to the `feature_flags` table.
  - The `deleteFlag` service method would then set this timestamp instead of removing the row.
  - Update `getAllFlags` and other read queries to exclude flags where `deleted_at` is not null.

### 8. API Documentation

- **Issue:** The API is only documented in the README.
- **Suggestion:**
  - Integrate `swagger` (`@nestjs/swagger`) to automatically generate OpenAPI documentation from the controllers and DTOs.
  - This provides an interactive API explorer and serves as living documentation that stays in sync with the code.
