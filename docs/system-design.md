# Gatekeeper: Feature Flag Management System
## Architecture Documentation

> **Note**: This is a demonstration project showcasing feature flag system design and implementation patterns. The architecture balances production-ready concepts with implementation simplicity for portfolio presentation.

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture Design](#2-architecture-design)
3. [Data Flow & Request Lifecycle](#3-data-flow--request-lifecycle)
4. [Key Design Decisions](#4-key-design-decisions)
5. [Component Details](#5-component-details)
6. [Caching Strategy](#6-caching-strategy)
7. [Security Considerations](#7-security-considerations)
8. [Architecture Diagrams](#8-architecture-diagrams)
9. [Future Improvements & Production Considerations](#9-future-improvements--production-considerations)

---

## 1. System Overview

Gatekeeper is a feature flag management system that enables dynamic feature control and gradual rollouts without code deployments. The system provides both administrative interfaces for flag management and high-performance evaluation endpoints for client applications.

### Core Capabilities

- **Feature Flag Management**: Complete CRUD operations for feature flags with user targeting
- **Real-time Evaluation**: Low-latency flag evaluation with consistent hash-based rollouts
- **User Targeting**: Ability to target specific users or user segments
- **Audit Trail**: Comprehensive logging of all flag modifications
- **Rollout Control**: Percentage-based gradual feature rollouts using consistent hashing

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js | JavaScript runtime environment |
| **Framework** | NestJS (TypeScript) | Modular application architecture with dependency injection |
| **Database** | PostgreSQL | Primary data store for flags, users, and audit logs |
| **Authentication** | JWT + Passport.js | Stateless authentication for admin endpoints |
| **Data Access** | node-postgres (pg) | Raw SQL execution for performance and control |
| **API Documentation** | OpenAPI/Swagger | Auto-generated API documentation |

---

## 2. Architecture Design

### Architectural Pattern: Modular Monolith

Gatekeeper follows a **modular monolith** architecture, organizing code into cohesive modules with clear boundaries and responsibilities. This approach provides:

- **Development Simplicity**: Single deployable unit, easier debugging and testing
- **Clear Module Boundaries**: Logical separation that could evolve into microservices if needed
- **Performance**: In-process communication without network overhead
- **Transaction Support**: ACID guarantees across module interactions

### Module Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Module                            │
│                    (Root Orchestrator)                       │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┬──────────┬──────────┬──────────┐
    │                 │          │          │          │
┌───▼────┐   ┌───────▼──┐   ┌──▼─────┐ ┌──▼──────┐ ┌▼─────┐
│  Auth  │   │  Flags   │   │  User  │ │AdminUser│ │  DB  │
│ Module │   │  Module  │   │ Module │ │ Module  │ │Module│
└───┬────┘   └────┬─────┘   └────┬───┘ └────┬────┘ └──┬───┘
    │             │              │          │          │
    │        ┌────▼─────┐        │          │          │
    │        │  Flags   │        │          │          │
    │        │  Cache   │        │          │          │
    │        │ Service  │        │          │          │
    │        └──────────┘        │          │          │
    │                            │          │          │
    └────────────────────────────┴──────────┴──────────┘
                                 │
                        ┌────────▼────────┐
                        │   PostgreSQL    │
                        └─────────────────┘
```

### Module Responsibilities

| Module | Purpose | Key Components | Dependencies |
|--------|---------|----------------|--------------|
| **App** | Application bootstrap and module orchestration | `AppModule`, `AppController` | All modules |
| **Auth** | JWT-based authentication for admin users | `AuthService`, `JwtStrategy`, `AuthGuard` | DB Module |
| **Flags** | Core feature flag logic: CRUD, evaluation, audit | `FlagsService`, `FlagsCacheService`, `FlagsController` | DB Module |
| **User** | End-user management (subjects of feature flags) | `UserService`, `UserController` | DB Module |
| **AdminUser** | Administrative user management | `AdminUserService`, `AdminUserController` | DB Module |
| **DB** | Database abstraction and query execution | `DbService` | PostgreSQL |

---

## 3. Data Flow & Request Lifecycle

### 3.1 Admin Flag Management Flow

Administrative operations follow this request lifecycle:

```
1. Admin Login
   POST /auth/login → AuthService validates credentials → JWT issued

2. Authenticated Admin Request
   Request with JWT Bearer Token
   ↓
   JWT Guard validates token
   ↓
   Controller receives request with authenticated user context
   ↓
   Service layer executes business logic
   ↓
   DbService executes parameterized SQL queries
   ↓
   Audit log entry created
   ↓
   Cache invalidation/refresh triggered
   ↓
   Response returned to client
```

**Example: Creating a Feature Flag**

```typescript
// Request flow for POST /flags
Client → AuthGuard → FlagsController.create()
       → FlagsService.createFlag()
       → DbService.query("INSERT INTO feature_flags...")
       → DbService.query("INSERT INTO audit_log...")
       → FlagsCacheService.refreshCache()
       → Response { flagId, success: true }
```

### 3.2 Client Flag Evaluation Flow

The evaluation endpoint is designed for high throughput and low latency:

```
1. Client Application Request
   GET /flags/evaluate?userId={userId}
   ↓
   FlagsController.evaluate() (No authentication required)
   ↓
   FlagsService.evaluateFlagsForUser(userId)
   ↓
   Retrieve all flags from FlagsCacheService (in-memory, fast)
   ↓
   For each flag, run evaluation logic:
      a. Check if flag is globally enabled
      b. Query DB for user-specific targeting (targeted_users table)
      c. If not targeted, apply consistent hash for rollout percentage
      d. Fallback to default_value if needed
   ↓
   Return { flagKey: boolean } map
```

**Evaluation Algorithm**

```typescript
function evaluateFlag(flag, userId): boolean {
  // Step 1: Check global enable status
  if (!flag.enabled) {
    return flag.default_value;
  }
  
  // Step 2: Check explicit user targeting (DB query, not cached)
  const isTargeted = await checkTargetedUser(flag.id, userId);
  if (isTargeted !== null) {
    return isTargeted; // Explicit override
  }
  
  // Step 3: Consistent hash-based rollout
  const hashValue = consistentHash(userId, flag.key);
  const userPercentile = hashValue % 100;
  
  if (userPercentile < flag.rollout_percentage) {
    return true;
  }
  
  // Step 4: Default value
  return flag.default_value;
}
```

---

## 4. Key Design Decisions

### 4.1 NestJS Framework Choice

**Decision**: Build the application using NestJS rather than lightweight frameworks like Express or Fastify.

**Rationale**:
- **Modular Architecture**: NestJS enforces separation of concerns through its module system, making the codebase more maintainable as it grows
- **Dependency Injection**: Built-in DI container simplifies testing and reduces coupling between components
- **TypeScript First**: Strong typing catches errors at compile time and improves developer experience
- **Ecosystem**: Excellent integration with common libraries (Passport, Swagger, validation)
- **Scalability**: Clear patterns for organizing code that work well from prototype to production

**Trade-offs**:
- Higher learning curve compared to Express
- More boilerplate code for simple applications
- Framework "magic" can obscure control flow for developers unfamiliar with DI patterns
- Slightly higher memory footprint than minimalist frameworks

### 4.2 Raw SQL vs ORM

**Decision**: Use raw SQL queries through a thin `DbService` wrapper instead of a full ORM (TypeORM, Prisma, Sequelize).

**Rationale**:
- **Performance**: Raw SQL provides maximum control over query execution, critical for the read-heavy `/evaluate` endpoint
- **Transparency**: Explicit queries make it clear exactly what database operations are happening
- **Simplicity**: The schema is relatively simple; ORM abstraction adds complexity without proportional benefit
- **Query Optimization**: Easier to write optimized queries, use PostgreSQL-specific features, and analyze query plans

**Trade-offs**:
- **No Migration Management**: Must handle database schema versioning manually or with separate tools
- **Boilerplate**: More verbose code for CRUD operations
- **Type Safety**: No compile-time checks for SQL queries (ORMs can generate types from schema)
- **SQL Injection Risk**: Requires discipline to always use parameterized queries
- **Manual Relationship Handling**: No automatic joins or relationship loading

**Mitigation**: All queries use parameterized placeholders (`$1`, `$2`, etc.) to prevent SQL injection.

### 4.3 JWT Authentication

**Decision**: Use stateless JWT tokens for administrative authentication.

**Rationale**:
- **Stateless**: No server-side session storage required; scales horizontally without session synchronization
- **Decoupled Architecture**: Frontend and backend can be deployed independently
- **Standard**: Industry-standard authentication mechanism with broad library support
- **Self-Contained**: Token carries user identity and permissions, reducing database lookups

**Trade-offs**:
- **Revocation Complexity**: Cannot immediately invalidate tokens; must wait for expiry or implement token blacklist
- **Token Size**: JWTs are larger than session IDs, increasing request overhead
- **XSS Vulnerability**: If stored in localStorage, tokens can be stolen via XSS attacks
- **Expiry Management**: Short-lived tokens require refresh token mechanism for UX

**Implementation Notes**:
- Tokens should be stored in httpOnly cookies or secure client storage
- Short expiration times (15-30 minutes) reduce revocation concerns
- Refresh tokens can be implemented for longer-lived sessions

### 4.4 In-Memory Caching Strategy

**Decision**: Implement in-memory caching via `FlagsCacheService` for feature flag configurations.

**Rationale**:
- **Latency**: In-memory cache reduces `/evaluate` endpoint latency from ~10-50ms (DB query) to <1ms (memory lookup)
- **Database Load**: Dramatically reduces read load on PostgreSQL for high-traffic evaluation endpoints
- **Simplicity**: No external cache service (Redis) to manage for demonstration purposes
- **Cost**: Eliminates Redis infrastructure costs for small to medium deployments

**Trade-offs**:
- **Memory Usage**: All flags stored in application memory; can become problematic with thousands of flags
- **Single Instance Only**: Cache is not shared across multiple application instances
- **Stale Data Risk**: Cache can be briefly out of sync during updates
- **Scalability Ceiling**: Not suitable for horizontal scaling without migration to distributed cache

**Current Implementation Scope**: Designed for single-instance deployment demonstration. Production horizontal scaling would require migration to Redis (see [Future Improvements](#9-future-improvements--production-considerations)).

---

## 5. Component Details

### 5.1 DbService (Data Access Layer)

The `DbService` provides a centralized abstraction over PostgreSQL, ensuring consistent database interaction patterns.

**Key Responsibilities**:
- Connection pool management via `pg` library
- Parameterized query execution
- Transaction support
- Query logging (if enabled)

**Example Usage**:
```typescript
// Creating a feature flag with parameterized query
const result = await this.dbService.query(
  `INSERT INTO feature_flags (key, description, enabled, default_value, rollout_percentage)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *`,
  [key, description, enabled, defaultValue, rolloutPercentage]
);
```

**Why Centralized**:
- Single point for connection configuration
- Consistent error handling across the application
- Easy to add query logging, monitoring, or connection retry logic
- Enforces parameterized query pattern

### 5.2 FlagsCacheService (Caching Layer)

An in-memory singleton service that maintains a local cache of all feature flag configurations.

**Cache Strategy**: Hybrid approach combining event-based and scheduled refresh

1. **Event-Based Refresh**: Cache invalidation triggered on flag mutations
   - Flag created → `refreshCache()`
   - Flag updated → `refreshCache()`
   - Flag deleted → `refreshCache()`

2. **Scheduled Refresh**: Periodic full cache reload
   - Interval: Every N minutes (configurable, e.g., 5 minutes)
   - Purpose: Ensure consistency even if event-based updates fail
   - Implementation: `setInterval()` or NestJS scheduler

**Cache Structure**:
```typescript
class FlagsCacheService {
  private cache: Map<string, FlagConfig> = new Map();
  
  async refreshCache(): Promise<void> {
    const flags = await this.dbService.query('SELECT * FROM feature_flags');
    this.cache.clear();
    flags.forEach(flag => this.cache.set(flag.key, flag));
  }
  
  getFlag(key: string): FlagConfig | undefined {
    return this.cache.get(key);
  }
  
  getAllFlags(): FlagConfig[] {
    return Array.from(this.cache.values());
  }
}
```

**Important Limitation**: The `targeted_users` table data is **NOT** cached. User targeting checks query the database directly to ensure targeting changes take effect immediately without cache complexity.

### 5.3 FlagsService (Core Business Logic)

The `FlagsService` contains the most complex business logic in the system:

**Key Responsibilities**:

1. **CRUD Operations**: Create, read, update, delete feature flags
2. **Evaluation Engine**: Determine flag state for a given user
3. **User Targeting**: Manage which users receive specific flag values
4. **Audit Logging**: Record all flag modifications with timestamps and actor information
5. **Cache Coordination**: Trigger cache refreshes after mutations

**Evaluation Engine**:

The evaluation engine uses a waterfall logic with four levels of precedence:

```
1. Global Enabled Check (highest precedence)
   ↓
2. User Targeting Override (targeted_users table)
   ↓
3. Rollout Percentage (consistent hashing)
   ↓
4. Default Value (fallback)
```

**Consistent Hashing for Rollouts**:

To ensure users have a consistent experience (same user always gets the same result for a flag), the system uses consistent hashing:

```typescript
function consistentHash(userId: string, flagKey: string): number {
  // Combine userId and flagKey for deterministic hashing
  const input = `${userId}:${flagKey}`;
  
  // Hash function (e.g., MurmurHash, CRC32, or crypto hash)
  const hash = createHash('md5').update(input).digest('hex');
  
  // Convert to integer and normalize to 0-99 range
  return parseInt(hash.substring(0, 8), 16) % 100;
}
```

**Why This Matters**:
- User A at 45th percentile will always be in the 45th percentile for a given flag
- Increasing rollout from 30% to 50% includes the same first 30% of users (no churn)
- Decreasing rollout from 50% to 30% only removes users 31-50 (stable cohorts)

### 5.4 AuthService & JWT Strategy

**AuthService**:
- Validates admin credentials against `admin_user` table
- Hashes passwords using bcrypt (cost factor: 10)
- Generates JWT tokens with user payload

**JwtStrategy**:
- Passport.js strategy for validating JWT tokens
- Extracts token from `Authorization: Bearer <token>` header
- Validates signature and expiration
- Attaches user payload to request object

**Protected Endpoints**:
All admin endpoints use `@UseGuards(JwtAuthGuard)` decorator to enforce authentication.

---

## 6. Caching Strategy

### Cache Lifecycle

The caching system uses a dual-trigger refresh mechanism to balance real-time consistency with fault tolerance:

```
┌─────────────────────────────────────────────────────────┐
│                   Cache Lifecycle                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Application Start                                   │
│     └─→ Initial cache load (all flags from DB)          │
│                                                          │
│  2. Scheduled Refresh (Every 5 minutes)                 │
│     └─→ Full cache reload from DB                       │
│         (Ensures consistency if event-based fails)      │
│                                                          │
│  3. Event-Based Refresh (On flag mutations)             │
│     ├─→ Flag Created   → refreshCache()                 │
│     ├─→ Flag Updated   → refreshCache()                 │
│     └─→ Flag Deleted   → refreshCache()                 │
│                                                          │
│  Cache State: Map<flagKey, FlagConfig>                  │
│  Cache Operations: O(1) lookup by flag key              │
└─────────────────────────────────────────────────────────┘
```

### What Is Cached vs. Not Cached

| Data Type | Cached? | Rationale |
|-----------|---------|-----------|
| **Feature Flag Configs** | ✅ Yes | Read-heavy, relatively static, critical for evaluation performance |
| **Targeted Users** | ❌ No | More dynamic, targeting changes should take effect immediately |
| **Audit Logs** | ❌ No | Append-only, rarely queried, no performance benefit from caching |
| **Admin Users** | ❌ No | Low read frequency (only on login), sensitive data |

### Cache Consistency Considerations

**Scenario: Flag Update During High Traffic**

```
Time  Event
----  -----
T0    Admin updates flag "new_checkout" from 50% to 75% rollout
T0    Flag updated in database
T0    refreshCache() triggered
T1    Cache refresh completes (flags reloaded)
      
      Between T0 and T1 (typically <100ms):
      - Evaluation requests use stale 50% rollout value
      - Small inconsistency window acceptable for demo
```

**Production Consideration**: In a distributed system with multiple instances, each instance would have independent caches. This leads to brief inconsistencies across instances. Solution: migrate to Redis with pub/sub for cache invalidation.

---

## 7. Security Considerations

### SQL Injection Prevention

**Approach**: Parameterized queries enforced throughout the application.

**Safe Pattern**:
```typescript
// ✅ SAFE: Parameterized query
await dbService.query(
  'SELECT * FROM feature_flags WHERE key = $1',
  [flagKey]
);
```

**Unsafe Pattern** (Never Used):
```typescript
// ❌ DANGEROUS: String concatenation (NOT used in this project)
await dbService.query(
  `SELECT * FROM feature_flags WHERE key = '${flagKey}'`
);
```

**Enforcement**:
- All `DbService.query()` calls use positional parameters (`$1`, `$2`, etc.)
- The `pg` library handles proper escaping when parameters are provided
- Code reviews verify no string interpolation in SQL queries

**Note**: This is a demonstration project with simplified security. Production systems require additional measures (see [Future Improvements](#9-future-improvements--production-considerations)).

### Authentication Security

- **Password Storage**: Bcrypt hashing with salt (cost factor: 10)
- **JWT Expiration**: Tokens expire after configurable duration (e.g., 24 hours)
- **Token Storage**: Clients should use httpOnly cookies or secure storage
- **HTTPS Only**: In production, enforce HTTPS to prevent token interception

### Admin vs. Public Endpoints

- **Admin Endpoints**: Protected by `@UseGuards(JwtAuthGuard)`
  - All `/flags/*` POST/PUT/DELETE operations
  - `/admin-user/*` operations
  - `/user/*` management operations

- **Public Endpoints**: No authentication required
  - `GET /flags/evaluate` (client applications must access this freely)
  - `POST /auth/login` (authentication entry point)

---

## 8. Architecture Diagrams

### System Architecture

![System Architecture Diagram - Placeholder](./diagrams/system-architecture.png)

*Mermaid source available in original document*

### Admin Request Sequence

![Admin Request Flow - Placeholder](./diagrams/admin-request-sequence.png)

*Mermaid source available in original document*

### Evaluation Request Sequence

![Evaluation Request Flow - Placeholder](./diagrams/evaluation-sequence.png)

*Mermaid source available in original document*

---

## 9. Future Improvements & Production Considerations

This section outlines enhancements needed to make Gatekeeper production-ready at scale. These improvements address system design principles that are simplified in the current demonstration implementation.

### 9.1 Distributed Caching with Redis

**Current State**: In-memory cache limited to single instance.

**Why Needed**:
- **Horizontal Scaling**: Multiple application instances require shared cache
- **Cache Consistency**: Pub/sub pattern ensures all instances invalidate simultaneously
- **Memory Efficiency**: Move cache out of application heap to dedicated cache tier
- **Persistence**: Redis can persist cache to disk, faster recovery on restart

**Implementation Approach**:
```typescript
// Replace in-memory Map with Redis client
class FlagsCacheService {
  constructor(private redis: Redis) {}
  
  async getFlag(key: string): Promise<FlagConfig> {
    const cached = await this.redis.get(`flag:${key}`);
    return JSON.parse(cached);
  }
  
  async refreshCache(): Promise<void> {
    const flags = await this.dbService.query('SELECT * FROM feature_flags');
    const pipeline = this.redis.pipeline();
    
    flags.forEach(flag => {
      pipeline.set(`flag:${flag.key}`, JSON.stringify(flag));
    });
    
    await pipeline.exec();
    
    // Publish invalidation event
    await this.redis.publish('flag-cache-refresh', Date.now());
  }
}
```

**System Design Impact**: Adds network hop (app → Redis) but enables horizontal scaling. Latency increases from <1ms to ~2-3ms, still acceptable for most use cases.

### 9.2 Observability & Monitoring

**Current State**: No structured logging, metrics, or distributed tracing.

**Why Needed**:
- **Debugging Production Issues**: Need visibility into request flow across services
- **Performance Analysis**: Identify slow queries, cache hit rates, bottlenecks
- **Alerting**: Detect anomalies (error rate spikes, latency increases, cache failures)
- **Capacity Planning**: Understand usage patterns to inform scaling decisions

**Recommended Stack**:
- **Logging**: Structured JSON logs with request IDs (Winston or Pino)
- **Metrics**: Prometheus for time-series metrics
  - Request rate (QPS)
  - Response latency (P50, P95, P99)
  - Cache hit/miss ratio
  - Database query duration
- **Tracing**: OpenTelemetry for distributed tracing
- **Visualization**: Grafana dashboards

**Key Metrics to Track**:
```
/evaluate endpoint:
- Requests per second
- Latency percentiles (P50, P95, P99)
- Cache hit rate
- Error rate

Flag mutations:
- Update frequency
- Cache refresh duration
- Audit log write latency

Database:
- Query execution time
- Connection pool utilization
- Deadlock/timeout errors
```

### 9.3 Rate Limiting

**Current State**: No request rate limiting implemented.

**Why Needed**:
- **DDoS Protection**: Prevent abuse of public `/evaluate` endpoint
- **Fair Resource Allocation**: Ensure single client can't starve others
- **Cost Control**: Limit expensive operations (database writes, cache refreshes)
- **API Quality of Service**: Enforce tiered limits for different client types

**Implementation Approaches**:

1. **Application-Level** (NestJS Throttler):
```typescript
// Simple in-memory rate limiter
@Throttle(100, 60) // 100 requests per 60 seconds
@Get('/evaluate')
async evaluate() { ... }
```

2. **Distributed Rate Limiting** (Redis):
```typescript
// Token bucket algorithm with Redis
async checkRateLimit(userId: string): Promise<boolean> {
  const key = `rate:${userId}`;
  const limit = 1000; // requests per minute
  
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 60);
  }
  
  return current <= limit;
}
```

3. **Infrastructure-Level** (API Gateway):
- AWS API Gateway rate limiting
- Cloudflare rate limiting rules
- NGINX rate limiting module

**Recommended Limits**:
- `/evaluate`: 1000 req/min per client IP (adjust based on expected load)
- `/flags` mutations: 10 req/min per admin user (prevent accidental abuse)
- `/auth/login`: 5 req/min per IP (prevent credential stuffing)

### 9.4 Database Connection Pooling

**Current State**: Using `pg` library with default connection settings.

**Why Needed**:
- **Connection Reuse**: Establishing database connections is expensive (~20-50ms)
- **Resource Limits**: PostgreSQL has max connection limits (default: 100)
- **Failover Handling**: Connection pools can detect and recover from failed connections
- **Performance**: Reduce latency by maintaining warm connections

**Configuration**:
```typescript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'gatekeeper',
  user: 'app_user',
  password: process.env.DB_PASSWORD,
  
  // Pool settings
  max: 20,                    // Maximum connections
  min: 5,                     // Minimum idle connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast if pool exhausted
});
```

**Sizing Guidelines**:
- **Single Instance**: `max = 10-20` connections typically sufficient
- **Multiple Instances**: `max = total_pg_connections / num_instances`
- **Connection Math**: If PostgreSQL has 100 max connections and you run 5 app instances: `100 / 5 = 20` connections per instance

### 9.5 Advanced Security Hardening

**Current State**: Basic JWT auth and parameterized queries.

**Production Requirements**:

1. **API Security**:
   - Request signing (HMAC) for client authentication on `/evaluate`
   - Rate limiting (covered above)
   - Input validation with schemas (class-validator, Zod)
   - CORS configuration (restrict allowed origins)
   - Helmet.js for HTTP header security

2. **Secret Management**:
   - Environment variables via secret manager (AWS Secrets Manager, HashiCorp Vault)
   - JWT secret rotation strategy
   - Database credential rotation
   - Never commit secrets to version control

3. **Audit & Compliance**:
   - Comprehensive audit logging (who, what, when for all mutations)
   - Immutable audit log (append-only, no deletes)
   - Data retention policies
   - GDPR/compliance features (user data export, right to deletion)

4. **Network Security**:
   - TLS 1.3 for all traffic
   - Database connection encryption
   - VPC isolation (app tier separate from database tier)
   - Firewall rules (restrict database access to app tier only)

### 9.6 High Availability & Disaster Recovery

**Current State**: Single instance, single database.

**Production Requirements**:

1. **Application Tier**:
   - Multi-AZ deployment with load balancer
   - Auto-scaling based on CPU/memory/request metrics
   - Health check endpoints (`/health`, `/ready`)
   - Graceful shutdown handling

2. **Database Tier**:
   - PostgreSQL replication (primary + read replicas)
   - Automated backups (point-in-time recovery)
   - Failover automation (promote replica on primary failure)
   - Multi-region replication for DR

3. **Cache Tier**:
   - Redis cluster mode for high availability
   - Redis Sentinel for automatic failover
   - Cache warming strategy on cold start

4. **Deployment**:
   - Blue-green deployments (zero downtime)
   - Canary releases (gradual rollout of new versions)
   - Rollback procedures
   - Database migration strategy (backward-compatible changes)

### 9.7 Performance Optimization

**Why Needed**: Scale from demo (10 RPS) to production (1000+ RPS).

**Database Optimizations**:
```sql
-- Index on flag lookups
CREATE INDEX idx_flags_key ON feature_flags(key);

-- Index on user targeting
CREATE INDEX idx_targeted_users_lookup 
  ON targeted_users(flag_id, user_id);

-- Index on audit log queries
CREATE INDEX idx_audit_log_timestamp 
  ON audit_log(created_at DESC);
```

**Query Optimization**:
- Use `EXPLAIN ANALYZE` to identify slow queries
- Denormalize data for read-heavy operations if needed
- Consider materialized views for complex aggregations

**Caching Improvements**:
- Cache targeted user lists for frequently accessed flags
- Implement cache warming on startup (preload hot flags)
- Add cache metrics to monitor hit rate

**Application Optimizations**:
- Connection pooling (covered above)
- Batch operations where possible
- Async processing for audit logs (queue-based)

### 9.8 Schema Migrations & Versioning

**Current State**: Manual schema management.

**Why Needed**:
- **Version Control**: Track schema changes over time
- **Reproducibility**: Ensure dev, staging, prod have identical schemas
- **Rollback Safety**: Ability to revert schema changes
- **Team Coordination**: Multiple developers need safe way to modify schema

**Recommended Tools**:
- Flyway or Liquibase (JVM-based)
- node-pg-migrate or db-migrate (Node.js native)
- Prisma Migrate (if migrating to ORM)

**Migration Strategy**:
```
migrations/
  001_initial_schema.sql
  002_add_rollout_percentage.sql
  003_add_audit_log_index.sql
```

**Best Practices**:
- Never modify existing migrations (append new ones)
- Backward-compatible changes (additive, not breaking)
- Test migrations on copy of production data
- Include rollback scripts for each migration

### 9.9 Load Testing & Capacity Planning

**Why Needed**: Validate system can handle expected load.

**Approach**:
1. **Define SLOs** (Service Level Objectives):
   - `/evaluate` latency: P99 < 50ms
   - Error rate: < 0.1%
   - Availability: 99.9% uptime

2. **Load Testing Tools**:
   - k6 (modern, developer-friendly)
   - Apache JMeter (feature-rich GUI)
   - Gatling (Scala-based, detailed reports)

3. **Test Scenarios**:
```javascript
// k6 load test example
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Sustained load
    { duration: '2m', target: 200 },  // Spike test
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<50'], // P99 < 50ms
  },
};

export default function () {
  http.get('http://localhost:3000/flags