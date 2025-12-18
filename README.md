# HRIS Backend

The backend system for the HRIS (Human Resource Information System) application. This project is structured as a **NestJS Monorepo**, consisting of an API Gateway and multiple microservices.

## Architecture

The project consists of the following applications:

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
    git clone https://github.com/rfrmdhn/test-dexa-hris-backend.git
    cd hris-backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Configuration

1.  **Environment Variables**:
    Create your local `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```

2.  **Database Connection**:
    Open the `.env` file and **update the `DATABASE_URL`** to match your local MySQL setup:
    ```env
    # Database
    DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/dexa_db"

    # JWT Configuration
    JWT_SECRET="your-secret-key"
    JWT_EXPIRES_IN="24h"

    # Service Ports
    AUTH_SERVICE_PORT=3001
    ATTENDANCE_SERVICE_PORT=3002
    ```
    *Ensure your MySQL server is running and the user has permissions.*

## Database Setup

1.  **Generate Prisma Client**:
    ```bash
    npm run prisma:generate
    ```

2.  **Migrate & Sync Database**:
    This command will create the tables and apply any pending migrations:
    ```bash
    npm run prisma:migrate
    ```

3.  **Seed Database**:
    Populate the database with initial data (Admin user, etc.):
    ```bash
    npx prisma db seed
    ```
    *Or using the script alias:* `npm run prisma:seed`

## Running the Applications

Open separate terminals for each service:

1.  **Auth Service**:
    ```bash
    npm run start:auth
    ```

2.  **Attendance Service**:
    ```bash
    npm run start:attendance
    ```

## Testing

*   **Unit Tests**: `npm run test`
*   **E2E Tests**: `npm run test:e2e`

## Useful Commands

| Command | Description |
| :--- | :--- |
| `npx prisma db seed` | Seed the database |
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run build` | Build for production |
| `npm run lint` | Lint code |
| `npm run format` | Format code using Prettier |
