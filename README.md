# Gatekeep Backend

Gatekeep is a backend service for a powerful and flexible feature flag management system. It allows administrators to control feature rollouts through a secure API, with features like percentage-based rollouts, targeted user-specific flags, and a full audit trail.

The service is built with [NestJS](https://nestjs.com/), a progressive Node.js framework for building efficient and scalable server-side applications.

## Features

- **Secure Authentication:** Admin endpoints are protected using JWT-based authentication.
- **Feature Flag Management:** Full CRUD API for creating, reading, updating, and deleting feature flags.
- **Flexible Evaluation Logic:**
  - Enable or disable flags globally.
  - Target specific users for a given feature.
  - Roll out features to a percentage of your user base.
- **Auditing:** All changes to feature flags are logged for complete traceability.
- **High Performance:** Flag evaluation is optimized using an in-memory cache to ensure low latency for client applications.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd gatekeep-backend
yarn install
```

### 2. Environment Configuration

Create a `.env` file in the root of the project and add the following environment variables. A `docker-compose.yml` is included for running a local PostgreSQL database.

```env
# Database Connection URL
DATABASE_URL=postgres://gatekeep:gatekeep@localhost:5432/gatekeep

# JWT Secret for signing authentication tokens
JWT_SECRET=your-super-secret-key

# Port for the application
PORT=3000
```

### 3. Database Setup

1.  **Start the database container:**

    ```bash
    docker-compose up -d
    ```

2.  **Run the initial database migration:**

    This command executes the initial SQL script to set up the required tables.

    ```bash
    docker exec -i gatekeep-backend-db-1 psql -U gatekeep -d gatekeep < migrations/001_init.sql
    ```

---

## Running the Application

```bash
# Development mode with watch
yarn run start:dev

# Production mode
yarn run start:prod
```

The application will be running at `http://localhost:3000`.

## Running Tests

```bash
# Run unit tests
yarn run test

# Run end-to-end (e2e) tests
yarn run test:e2e

# Run test coverage
yarn run test:cov
```

---

## API Endpoints

A brief overview of the main API endpoints.

### Authentication

- `POST /auth/login`: Authenticate an admin user and receive a JWT.

### Feature Flags (Admin-only)

- `GET /flags`: Get all feature flags.
- `POST /flags`: Create a new feature flag.
- `PUT /flags/:id`: Update a feature flag.
- `DELETE /flags/:id`: Delete a feature flag.
- `GET /flags/:id/audit`: View the audit history for a flag.
- `POST /flags/:id/target`: Target a specific user for a flag.
- `DELETE /flags/:id/target/:userId`: Remove a user from a flag's target list.

### Flag Evaluation (Public)

- `GET /flags/evaluate?userId=:userId`: Evaluate all flags for a given user ID and receive a key-value map of the results.

For detailed request/response formats, please refer to the DTOs in the `src` directory.