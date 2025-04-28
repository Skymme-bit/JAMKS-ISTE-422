# ISTE-422 - Address API

## Project Overview
AddressDock is a modern, scalable address management system built with TypeScript and Express.js.

It offers dynamic routing, modular endpoint design, and robust error handling for reliability and maintainability.

The system is designed for easy development, testing, and production deployment, with full support for CI/CD pipelines and automated health monitoring.

---

## Key Features & Improvements

- **Health Check Endpoint**
    - `GET /health` endpoint verifies server health and uptime, critical for deployment monitoring and health checks.

- **Dynamic Modular Routing**
    - Endpoints are dynamically resolved based on URL structure.
    - Supports `GET`, `POST`, `PUT`, `DELETE` methods without hardcoded routes.

- **Robust Error Handling**
    - Structured JSON error responses for 404 (Not Found) and 500 (Internal Server Error).
    - Internal logging of all errors with full stack traces.
    - Invalid endpoints are gracefully handled without crashing the app.

- **Built-in Structured Logging**
    - Centralized log management with categorized logs: `info`, `warning`, and `error`.
    - Future-ready for integration with external systems like **Prometheus**, **Grafana**, or **Datadog**.

- **Advanced Address Services**
    - **Distance Calculation**: Accurate kilometers and miles calculation between two coordinates, with flexible unit support.
    - **City Lookup**: Optimized city retrieval based on zip code, with in-memory caching for improved performance.
    - **Pagination**: Efficient slicing of address results via `/address/request` with page and limit parameters.

- **Comprehensive Unit Testing**
    - Built with **Jest**.
    - Full coverage for core services like pagination, city lookup, and distance calculation.
    - Protects against regressions with automated validation.

- **Improved Code Quality & Documentation**
    - Extended comments for every class, public/protected method, and complex logic (e.g., caching, manual pagination).
    - Codebase is easier to maintain, onboard, and review.

- **CI/CD Automation**
    - GitHub Actions pipeline runs:
        - Static analysis (ESLint)
        - Unit tests (Jest)
        - Build step (TypeScript)
    - Any failure blocks merging — ensuring only clean, working code reaches production.

- **Flexible Deployment Tooling**
    - `deploy.sh` script automates install, lint, test, build, server start, and health check verification.

- **Developer Productivity Enhancements**
    - **Nodemon** for live reloads during development.
    - Full **TypeScript** support across the entire codebase for strong typing and early error detection.

---

## Set Up Your Local Dev Environment and Run

1. Install **NVM** and **Node.js v20.13.1**
2. From the root directory, run `npm install`
3. Create a .env file in the root directory:
4. In the .env file set `SERVER_PORT` to a port of your choosing
5. In the .env file set `ENV` to "dev"
6. Start the app using `npm run dev`


### How to build

Compile the TypeScript code:
  ```bash
  npm run build
  ```

### Run the compiled app
Launch the compiled app:
  ```bash
  npm run start
  ```

### How to run tests
Execute all unit tests:
  ```bash
  npm run test
  ```
---
## Available Endpoints and Usage

All endpoints accept `POST` requests and expect `Content-Type: application/json`.

| Endpoint | Description | Example Request Body |
|:---|:---|:---|
| `/address/count` | Count addresses matching a city or zip. | `{ "city": "Rochester" }` |
| `/address/request` | Retrieve addresses, with optional pagination. | `{ "city": "Rochester", "page": 1, "limit": 5 }` |
| `/address/distance` | Calculate distance between two coordinate points. | `{ "lat1": "43.084847", "lon1": "-77.674194", "lat2": "40.712776", "lon2": "-74.005974", "unit": "mi" }` |
| `/address/city` | Find city by zip code. | `{ "zip": "14623" }` |

**Example cURL:**
```bash
curl -X POST http://localhost:8081/address/count -H "Content-Type: application/json" -d '{"city":"Rochester"}'
```
Or you can use Postman or build an integration, and send a request using "http://localhost:<port>/address/request".

---

## Testing and Logs

### Running Unit Tests
Jest is configured for all service methods.

Run tests:
  ```bash
  npm run test
  ```
### Tests include:
- Valid data handling
- Missing fields error
- API failure simulation
- Pagination behavior

### Viewing Logs
Logs output to the terminal:
- `[info]` - successful operations
- `[warning]` - bad input detected
- `[error]` - failed requests or system errors

---

## CI/CD Pipeline (GitHub Actions)

**CI Pipeline runs automatically** on every push or pull request.

It ensures:
- ✅ Linting (`npm run lint`) — Static analysis
- ✅ Unit Testing (`npm run test`) — Validation of all logic
- ✅ Build (`npm run build`) — Compilation check
- ❌ If any step fails, the build is blocked and the PR cannot merge.

To simulate locally:
```bash
npm run lint
npm run test
npm run build
```

---

## Deployment & Build Tooling

### Automated Deployment Script

Use the provided `deploy.sh`:
```bash
chmod +x deploy.sh
./deploy.sh
```
It will:
- Install dependencies
- Run linting
- Run tests
- Build project
- Start server
- Perform health check (`/health` returns "OK")

---

## Summary  

AddressDock is now a fully modular, type-safe, test-driven, and CI/CD-enabled application ready for production-grade deployment.  
It combines robust error handling, scalable services, and developer-friendly practices.

---

## Assumptions and Limitations

- Assumes upstream address API is always available and responsive.
- Pagination assumes upstream service returns a complete list (not paginated).
- No authentication required; open REST API for testing purposes.

---

# How to Verify Everything Works

| Task | How |
|:---|:---|
| Start the app | `npm run dev` |
| Hit endpoints | Postman / cURL |
| Run tests | `npm run test` |
| View logs | In console output |
| Deploy locally | `./deploy.sh` |
| Check health | http://localhost:8081/health |