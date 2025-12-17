# HRIS Backend

The backend system for the HRIS (Human Resource Information System) application. This project is structured as a **NestJS Monorepo**, consisting of an API Gateway and multiple microservices.

## Architecture

The project consists of the following applications:

*   **API Gateway** (`apps/api-gateway`): The main entry point for client requests. It routes requests to the appropriate microservices.
*   **Auth Service** (`apps/auth-service`): Handles authentication and authorization.
*   **Attendance Service** (`apps/attendance-service`): Manages employee attendance records.

## Prerequisites

Ensure you have the following installed on your machine:

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [npm](https://www.npmjs.com/)
*   [MySQL](https://www.mysql.com/)

## Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd hris-backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

1.  **Environment Variables**:
    Copy the example environment file to create your local `.env` configuration:
    ```bash
    cp .env.example .env
    ```

2.  **Database Connection**:
    Open the `.env` file and configure your database connection string and service ports.
    
    ```env
    # Database
    DATABASE_URL="mysql://root:root@localhost:3306/dexa_db"

    # JWT Configuration
    JWT_SECRET="your-secret-key"
    JWT_EXPIRES_IN="24h"

    # Service Ports
    PORT=3000                     # API Gateway
    AUTH_SERVICE_PORT=3001
    ATTENDANCE_SERVICE_PORT=3002
    ```

## Database Setup

This project uses **Prisma** as the ORM.

1.  **Generate Prisma Client**:
    Generate the type-safe client based on the schema located in `libs/shared/src/prisma/schema.prisma`.
    ```bash
    npm run prisma:generate
    ```

2.  **Sync Database Schema**:
    Push the schema state to your database.
    ```bash
    npm run prisma:push
    ```
    *Alternatively, for migration-based workflows:* `npm run prisma:migrate`

3.  **Seed Database (Optional)**:
    Populate the database with initial data.
    ```bash
    npm run prisma:seed
    ```

## Running the Applications

Since this is a microservices architecture, you need to run the services required for your feature.

### Development Mode

You can run services individually in separate terminal instances:

*   **Run API Gateway** (Main entry point):
    ```bash
    npm run start:gateway
    ```

*   **Run Auth Service**:
    ```bash
    npm run start:auth
    ```

*   **Run Attendance Service**:
    ```bash
    npm run start:attendance
    ```

*   **Run All (Concurrent)**:
    If you want to run everything, simply open multiple terminals and run the commands above.

### Production Mode

Build and run the production version:

```bash
npm run build
npm run start:prod
```

## Testing

*   **Unit Tests**:
    ```bash
    npm run test
    ```

*   **E2E Tests**:
    ```bash
    npm run test:e2e
    ```

## Useful Commands

| Command | Description |
| :--- | :--- |
| `npm run lint` | Lint the codebase using ESLint |
| `npm run format` | Format code using Prettier |
| `npm run build` | Build the application for production |
