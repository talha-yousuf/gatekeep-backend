# TODO & Improvements

### 1. Implement a Distributed Cache for Horizontal Scaling

- **Issue:** The current `FlagsCacheService` is a local, in-memory cache. If the application is scaled horizontally (run on multiple servers/containers), each instance will have its own cache. A write operation on one instance will not update the caches on other instances, leading to inconsistent flag evaluations.
- **Suggestion:**
  - Replace the in-memory cache with a distributed cache like **Redis** or **Memcached**.
  - Create a new `CacheModule` that provides a standardized interface for interacting with the distributed cache. This would centralize the caching logic and make it available across the application.

### 2. Enhance Observability

- **Issue:** The application has very little logging or monitoring. It's difficult to know what's happening internally.
- **Update:** Basic logging for cache operations (refresh cycles, hits/misses) has been added.
- **Suggestion:**
  - **Further Logging:** Add structured logging (e.g., using `pino` or NestJS's built-in `Logger`) to other key areas, especially in the `FlagsService` (e.g., log evaluation latency).
  - **Metrics:** Instrument the code to expose key metrics (e.g., number of evaluations, cache hit/miss ratio) that can be scraped by a monitoring system like Prometheus.
