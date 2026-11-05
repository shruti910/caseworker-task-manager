# HMCTS DTS Caseworker Task Management System

## 1. Project Overview

The Caseworker Task Management System is a full-stack web application developed as part of the HMCTS Digital Technology Services (DTS) Developer Technical Challenge. The system enables HMCTS caseworkers to create, view, update, and delete administrative tasks associated with court and tribunal workflows.

---

## 2. Business Objective

This system provides a single, responsive operational dashboard allowing caseworkers to:

- Create tasks with titles, descriptions, due dates, and statuses.
- Monitor active workloads through categorized summary metrics (Total, To Do, In Progress, Completed, Overdue).
- Identify overdue tasks and upcoming deadlines.
- Update task statuses across the task lifecycle.
- Safely remove completed or redundant tasks with explicit confirmation dialogues.

---

## 3. Technology Stack

### Backend
- Language: Java 21 (LTS)
- Framework: Spring Boot 3.4.x
- REST API: Spring Web (MVC)
- Persistence: Spring Data JPA, Hibernate 6
- Validation: Jakarta Bean Validation (Hibernate Validator)
- Database Migrations: Flyway
- API Documentation: Springdoc OpenAPI / Swagger UI 2.8.x
- Observability: Spring Boot Actuator
- Testing: JUnit 5, Mockito, Spring Boot Test, JaCoCo
- Build Tool: Apache Maven 3.9+ with Maven Wrapper

### Frontend
- Framework: React 18
- Language: TypeScript 5.6
- Build Tool & Dev Server: Vite 6
- Routing: React Router 6
- Styling: Custom CSS compliant with GOV.UK Design System standards
- Testing: Vitest, React Testing Library, jsdom, v8 coverage

### Database and Infrastructure
- Database: PostgreSQL 16
- Containerization: Docker, Docker Compose (multi-stage builds)

---

## 4. Architecture Overview

The system employs a layered backend architecture with strict separation of concerns, decoupling presentation, business logic, persistence, and external contracts.

```
                    +--------------------------------+
                    |  React Frontend (TypeScript)   |
                    |  - Dashboard & Task Listing    |
                    |  - Modals & Forms              |
                    +---------------+----------------+
                                    | REST (JSON)
                                    v
+--------------------------------------------------------------------+
| Backend Application (Spring Boot 3 / Java 21)                      |
|                                                                    |
|  +--------------------+    DTOs     +---------------------------+  |
|  | Controller Layer   | <---------> | DTO & Mapper Layer        |  |
|  | (REST Endpoints)   |             | (Validation & Conversion) |  |
|  +---------+----------+             +---------------------------+  |
|            |                                                       |
|            v                                                       |
|  +--------------------+             +---------------------------+  |
|  | Service Layer      |             | Exception Layer           |  |
|  | (Business Logic)   |             | (@RestControllerAdvice)   |  |
|  +---------+----------+             +---------------------------+  |
|            |                                                       |
|            v                                                       |
|  +--------------------+             +---------------------------+  |
|  | Repository Layer   | <---------> | Entity Layer              |  |
|  | (Spring Data JPA)  |             | (JPA Mappings)            |  |
|  +---------+----------+             +---------------------------+  |
+------------|-------------------------------------------------------+
             v
+----------------------------+
| PostgreSQL 16 Database     |
| (Flyway Schema Migrations) |
+----------------------------+
```

---

## 5. Prerequisites & Environment Configuration

### Prerequisites
- **Java Development Kit (JDK)**: Version 21 (LTS)
- **Apache Maven**: Version 3.9+
- **Node.js**: Version 20.x or 22.x LTS
- **npm**: Version 10.x or 11.x
- **PostgreSQL**: Version 15+ (if running database locally)
- **Docker & Docker Compose**: Recommended for running the complete stack with zero configuration

### Configuration
Configuration is managed via environment variables with defaults defined in `.env.example`:

| Variable | Description | Default Value | Target Component |
|---|---|---|---|
| `SERVER_PORT` | HTTP port for Spring Boot backend | `8080` | Backend |
| `DB_HOST` | Hostname of PostgreSQL server | `localhost` | Backend |
| `DB_PORT` | Port of PostgreSQL server | `5432` | Backend |
| `DB_NAME` | Database name | `caseworker_tasks` | Backend |
| `DB_USERNAME` | Database username | `postgres` | Backend |
| `DB_PASSWORD` | Database password | `postgres` | Backend |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `http://localhost:5173,http://localhost:3000` | Backend |
| `VITE_API_BASE_URL` | Base URL for REST API calls | Empty (uses Vite proxy to port 8080) | Frontend |

Create your local `.env` file from the example:
```sh
cp .env.example .env
```

---

## 6. How to Run the Application

You can run the entire system using Docker Compose or run each component natively.

### Option 1: With Docker Compose (Recommended)

Docker Compose starts the PostgreSQL database, backend service, and frontend web server together in an isolated network:

```sh
# Start all services
docker-compose up --build -d

# Verify services are running
docker-compose ps
```

Once started, access the application:
- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8080/api/tasks](http://localhost:8080/api/tasks)
- **Swagger UI (Interactive API Docs)**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Healthcheck Endpoint**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

To stop the services:
```sh
# Stop containers (preserves database data)
docker-compose down

# Stop containers and reset database data volume
docker-compose down -v
```

---

### Option 2: Without Docker (Local Development)

If running the application components natively on your machine:

#### Step 1: Start Local PostgreSQL Database
Ensure your local PostgreSQL service is running:
- **macOS (Homebrew)**: `brew services start postgresql@16` (or `brew services start postgresql`)
- **Linux (systemd)**: `sudo systemctl start postgresql`
- **Windows**: Start the PostgreSQL service from Services (`services.msc`)

Create the application database:
```sh
createdb caseworker_tasks
```
Or via the PostgreSQL shell:
```sql
CREATE DATABASE caseworker_tasks;
```

Ensure your `.env` configuration (`DB_USERNAME`, `DB_PASSWORD`, `DB_PORT=5432`) matches your local PostgreSQL credentials.

Database schema migrations (`V1__create_tasks_table.sql`) are applied automatically by Flyway on backend startup.

#### Step 2: Start the Backend
Navigate to the `backend` directory and start Spring Boot:
```sh
cd backend
./mvnw spring-boot:run
```
*(Or `mvn -f backend/pom.xml spring-boot:run`)*

- Backend starts at: [http://localhost:8080](http://localhost:8080)
- Verify health: `curl http://localhost:8080/actuator/health`

#### Step 3: Start the Frontend
In a separate terminal, navigate to the `frontend` directory and start Vite:
```sh
cd frontend
npm install
npm run dev
```

- Frontend starts at: [http://localhost:5173](http://localhost:5173)
- Vite automatically proxies `/api` calls directly to `http://localhost:8080`.

---

## 7. How to Execute Tests

### Backend Tests
Execute unit and web MVC test suites:
```sh
mvn -f backend/pom.xml test
```

Generate JaCoCo test code coverage report:
```sh
mvn -f backend/pom.xml test jacoco:report
```
The HTML coverage report is generated at:
```
backend/target/site/jacoco/index.html
```

### Frontend Tests
Execute Vitest test suite with React Testing Library:
```sh
cd frontend
npm test
```

Generate frontend test coverage report:
```sh
cd frontend
npm run test:coverage
```
The HTML coverage report is generated at:
```
frontend/coverage/index.html
```
---

## 8. API Endpoint Documentation

All endpoints return JSON responses and use standard HTTP status codes.

| HTTP Method | Endpoint | Description | Request Body | Success Code | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/tasks` | Create a new task | JSON (`title`, `description`, `status`, `dueDateTime`) | `201 Created` | `400 Bad Request` |
| `GET` | `/api/tasks` | Retrieve tasks (with sorting and status filter) | None (query params: `status`, `sortBy`, `sortDirection`) | `200 OK` | `500 Internal Error` |
| `GET` | `/api/tasks/{id}` | Retrieve a task by ID | None | `200 OK` | `400 Bad Request`, `404 Not Found` |
| `PATCH` | `/api/tasks/{id}/status` | Update task status | JSON (`status`) | `200 OK` | `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/api/tasks/{id}` | Delete a task by ID | None | `204 No Content` | `400 Bad Request`, `404 Not Found` |

### Sample Request Payloads

#### Create Task (`POST /api/tasks`)
```json
{
  "title": "Review Immigration Appeal Statement",
  "description": "Examine bundle documents 1 through 45 and check appellant statement",
  "status": "TODO",
  "dueDateTime": "2026-11-20T17:00:00Z"
}
```

#### Update Task Status (`PATCH /api/tasks/{id}/status`)
```json
{
  "status": "IN_PROGRESS"
}
```

### Standard Error Response Format
```json
{
  "timestamp": "2026-11-05T00:15:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for one or more fields",
  "path": "/api/tasks",
  "fieldErrors": [
    {
      "field": "title",
      "message": "Title cannot be blank"
    }
  ]
}
```

---
