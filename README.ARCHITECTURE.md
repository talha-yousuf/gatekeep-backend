# Architecture Overview

This document provides an overview of the technical architecture, data flow, and components of the Gatekeep backend.

## Core Architecture

The Gatekeep backend is a **modular monolith** built with the **NestJS** framework and written in **TypeScript**.

- **Framework**: NestJS on Node.js.
- **Language**: TypeScript.
- **Database**: PostgreSQL. Data access is handled through a custom `DbService` that executes raw SQL queries.
- **Authentication**: Secure JWT (JSON Web Tokens) for administrative users, managed by Passport.js.
- **Caching**: A singleton, in-memory `FlagsCacheService` is used to cache feature flag configurations to ensure high performance for read-heavy evaluation endpoints.

The application is structured into several modules, each encapsulating a specific business domain.

---

## Component Breakdown

### Modules, Services, and Controllers

Here is a breakdown of the responsibilities for each major component:

#### `App`
*   **`AppModule`**: The root module that imports all other feature modules and sets up the main application structure.
*   **`AppController`**: A basic controller with a default health-check-like endpoint.
*   **`AppService`**: A basic service with a default method.

#### `Db`
*   **`DbService`**: A crucial service that acts as a wrapper around the `pg` library. It is responsible for all communication with the PostgreSQL database. It provides a generic `query` method to execute raw SQL statements.

#### `Auth`
*   **`AuthModule`**: Configures the authentication strategy, setting up `PassportModule` and `JwtModule`.
*   **`AuthController`**: Exposes the public `POST /auth/login` endpoint.
*   **`AuthService`**: Handles the logic of validating user credentials and generating JWTs.
*   **`JwtStrategy`**: The Passport.js strategy for validating JWTs on protected endpoints.

#### `AdminUser`
*   **`AdminUserModule`**: Manages components related to administrative users.
*   **`AdminUserController`**: Exposes the `POST /admin-user/create` endpoint.
*   **`AdminUserService`**: Handles business logic for creating (including password hashing) and retrieving admin users.

#### `User`
*   **`UserModule`**: Manages components related to the end-users who are the subjects of feature flagging.
*   **`UserController`**: Exposes admin-protected endpoints to list and create these users.
*   **`UserService`**: Handles business logic for creating and retrieving end-users.

#### `Flags`
*   **`FlagsModule`**: The core module of the application, responsible for all feature flag logic.
*   **`FlagsController`**: The main API for interacting with feature flags, with most endpoints protected for admins.
    *   **Public Endpoint**: `GET /flags/evaluate` for client-side evaluation.
    *   **Admin Endpoints**: Full CRUD for flags, user targeting management, and audit log retrieval.
*   **`FlagsService`**: The most complex service, containing the core business logic for flag management, the evaluation engine, auditing, and cache interaction.
*   **`FlagsCacheService`**: An in-memory cache for feature flag configurations to minimize database latency.

---

## Data Flow

There are two primary data flows in the application.

### 1. Admin-related Flow (Managing Flags)

This flow is for authenticated administrators who are managing the feature flags.

1.  **Login**: An admin sends credentials to `POST /auth/login`. The `AuthService` validates them against the `admin_user` table and returns a JWT.
2.  **API Request**: The admin client sends a request to a protected endpoint (e.g., `POST /flags`) with the JWT in the `Authorization` header.
3.  **Authorization**: The `AuthGuard` and `JwtStrategy` validate the token, ensuring the request is authorized.
4.  **Business Logic**: The `FlagsController` calls the `FlagsService`.
5.  **Database & Cache**:
    - The `FlagsService` performs the requested write operation (Create, Update, or Delete) on the database tables (`feature_flags`, `targeted_users`).
    - It creates a record of the change in the `audit_log` table.
    - It triggers a refresh of the `FlagsCacheService` to ensure the in-memory cache is up-to-date.
6.  **Response**: The result of the operation is returned to the client.

### 2. Client-side Flag Evaluation Flow

This flow is for client applications (e.g., a frontend app) that need to determine which features should be active for a user.

1.  **Request**: A client sends a request to the public `GET /flags/evaluate?userId=:userId` endpoint.
2.  **Controller**: The `FlagsController` calls the `flagsService.evaluateFlagsForUser()` method.
3.  **Cache Read**: The `FlagsService` retrieves all flag configurations from the `FlagsCacheService`. This is a fast, in-memory operation.
4.  **Evaluation Logic**: For each flag, the service runs its evaluation engine:
    a. Checks if the flag is globally `enabled`.
    b. **(Database Read)** Checks if the user is in the flag's specific target list by querying the `targeted_users` table.
    c. If not targeted, it calculates if the user falls within the `rollout_percentage`.
    d. If none of the above apply, it returns the `default_value`.
5.  **Response**: The service returns a key-value object of all flag keys and their final boolean values to the client application.
