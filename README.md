# Employee Skill Graph

## Project Overview

Employee Skill Graph is a full-stack demo that models **employees**, **skills**, **projects**, and **reporting relationships** as a graph instead of relational tables.

It shows how a graph database can:

- Link employees to skills (`HAS_SKILL`) and projects (`WORKED_ON`)
- Represent org hierarchy (`REPORTS_TO`)
- Recommend similar employees by shared skills
- Find the shortest path between two employees through the reporting chain
- Visualize the skill/project graph in the UI

---

## Architecture

```
┌─────────────────────┐
│  Angular SPA        │
│  localhost:4200     │
└──────────┬──────────┘
           │ HTTP REST
           ▼
┌─────────────────────┐
│  Spring Boot API    │
│  localhost:8080     │
└──────────┬──────────┘
           │ Bolt (Neo4j Driver)
           ▼
┌─────────────────────┐
│  CognoDB            │
│  (Neo4j-compatible) │
└─────────────────────┘
```

### Graph model

| Node        | Key properties                                      |
|-------------|-----------------------------------------------------|
| `Employee`  | `employeeId`, `name`, `email`, `designation`        |
| `Skill`     | `skillId`, `skillName`, `description`               |
| `Project`   | `projectId`, `projectName`, `clientName`, `description` |

| Relationship | Meaning                                      |
|--------------|----------------------------------------------|
| `HAS_SKILL`  | Employee possesses a skill                   |
| `WORKED_ON`  | Employee worked on a project                 |
| `REPORTS_TO` | Employee reports to another employee         |

### Layers

- **Frontend** — Angular standalone pages call REST services
- **Backend** — Controllers → Services → Repositories (Cypher via Neo4j Java Driver)
- **Database** — CognoDB Bolt endpoint configured in `application.yml`

---

## Tech Stack

| Layer    | Technology              | Version        |
|----------|-------------------------|----------------|
| Language | Java                    | 21             |
| Backend  | Spring Boot             | 3.5.5          |
| Driver   | Neo4j Java Driver       | 5.28.5         |
| Database | CognoDB (Bolt)          | Hosted         |
| Frontend | Angular                 | 21             |
| UI       | Bootstrap               | 5.3            |
| Runtime  | TypeScript / RxJS       | 5.9 / 7.8      |
| Build    | Maven / npm             | Wrapper / 10.8 |

---

## Backend

**Location:** `backend/`  
**Base package:** `com.wexa.backend`

| Area         | Contents                                                                 |
|--------------|--------------------------------------------------------------------------|
| Controllers  | `EmployeeController`, `SkillController`, `ProjectController`, `TestController` |
| Services     | `EmployeeService`, `SkillService`, `ProjectService`, `DatabaseService`   |
| Repositories | Cypher queries via Neo4j `Driver` (no Spring Data Neo4j OGM)             |
| Models       | `Employee`, `Skill`, `Project`, `Recommendation`                         |
| Exceptions   | `BusinessException` + `GlobalExceptionHandler` (conflicts → HTTP 409)    |

### Features

- CRUD for employees, skills, and projects
- Assign skills, projects, and managers (with duplicate / self-manager / cycle checks)
- Skill-based peer recommendations
- Shortest path along `REPORTS_TO*`
- Connection check at `GET /test`

### Configuration

Edit `backend/src/main/resources/application.yml`:

```yaml
app:
  cognodb:
    uri: bolt+s://<your-cognodb-host>
    username: <username>
    password: <password>
```

Default API port: **8080**

---

## Frontend

**Location:** `frontend/`  
**Brand:** Skill Graph

### Pages / routes

| Path                         | Purpose                                      |
|------------------------------|----------------------------------------------|
| `/`                          | Dashboard (counts, designation breakdown)    |
| `/employees`                 | Employee list and CRUD                       |
| `/employees/:employeeId`     | Employee profile, skills, and projects       |
| `/skills`                    | Skill CRUD                                   |
| `/projects`                  | Project CRUD                                 |
| `/graph`                     | Force-style graph visualization              |
| `/relationships`             | Assign skill / project / manager             |
| `/recommendations`           | Similar employees by shared skills           |
| `/shortest-path`             | Path between employees via reporting chain   |

Services under `src/app/services/` call `http://localhost:8080`.

---

## How to Run

### Prerequisites

- JDK **21**
- Maven (or use `backend/mvnw` / `mvnw.cmd`)
- Node.js + npm
- A reachable CognoDB Bolt endpoint with valid credentials

### 1. Start the backend

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

On Windows:

```bash
cd backend
.\mvnw.cmd clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

- API: [http://localhost:8080](http://localhost:8080)
- Verify DB: [http://localhost:8080/test](http://localhost:8080/test) → `Connected Successfully`

### 2. Start the frontend

```bash
cd frontend
npm install
npm start
```

- App: [http://localhost:4200](http://localhost:4200)

---

## API Endpoints

Base URL: `http://localhost:8080`

### Health

| Method | Path     | Description                    |
|--------|----------|--------------------------------|
| GET    | `/test`  | Verify CognoDB / Neo4j connection |

### Employees

| Method | Path                                         | Description                          |
|--------|----------------------------------------------|--------------------------------------|
| POST   | `/employees`                                 | Create employee                      |
| GET    | `/employees`                                 | List all employees                   |
| GET    | `/employees/{employeeId}`                    | Get employee by ID                   |
| PUT    | `/employees/{employeeId}`                    | Update employee                      |
| DELETE | `/employees/{employeeId}`                    | Delete employee                      |
| POST   | `/employees/{employeeId}/skills/{skillId}`   | Assign skill (`HAS_SKILL`)           |
| GET    | `/employees/{employeeId}/skills`             | List skills for employee             |
| GET    | `/employees/skills/{skillId}`                | List employees with a skill          |
| POST   | `/employees/{employeeId}/projects/{projectId}` | Assign project (`WORKED_ON`)       |
| GET    | `/employees/{employeeId}/projects`           | List projects for employee           |
| GET    | `/employees/{employeeId}/recommendations`    | Recommend similar employees          |
| POST   | `/employees/{employeeId}/manager/{managerId}`| Assign manager (`REPORTS_TO`)        |
| GET    | `/employees/path/{emp1}/{emp2}`              | Shortest path via reporting hierarchy|

### Skills

| Method | Path                | Description     |
|--------|---------------------|-----------------|
| POST   | `/skills`           | Create skill    |
| GET    | `/skills`           | List skills     |
| GET    | `/skills/{skillId}` | Get skill       |
| PUT    | `/skills/{skillId}` | Update skill    |
| DELETE | `/skills/{skillId}` | Delete skill    |

### Projects

| Method | Path                    | Description     |
|--------|-------------------------|-----------------|
| POST   | `/projects`             | Create project  |
| GET    | `/projects`             | List projects   |
| GET    | `/projects/{projectId}` | Get project     |
| PUT    | `/projects/{projectId}` | Update project  |
| DELETE | `/projects/{projectId}` | Delete project  |

Business rule conflicts (e.g. duplicate assignment, reporting cycle) return **HTTP 409** with a message body.

---

## Screenshots

Add images under `docs/screenshots/` and link them here.

| Screen           | Preview |
|------------------|---------|
| Dashboard        | ![Dashboard](docs/screenshots/dashboard.png) |
| Employees        | ![Employees](docs/screenshots/employees.png) |
| Graph            | ![Graph](docs/screenshots/graph.png) |
| Recommendations  | ![Recommendations](docs/screenshots/recommendations.png) |
| Shortest Path    | ![Shortest Path](docs/screenshots/shortest-path.png) |

> Place PNG files at the paths above, or update the links to your own assets.
