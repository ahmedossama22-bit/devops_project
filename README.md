# Product Management System (ASP.NET Core + Angular + SQL Server)

A modern full-stack web application designed for containerized deployment, CI/CD pipelines, and microservice architectures.

---

## 🏗️ Architecture Overview

- **Backend**: ASP.NET Core 8.0 Web API with Entity Framework Core (SQL Server provider), Swagger/OpenAPI documentation, health checks, and automatic DB migration/seeding with retry logic.
- **Frontend**: Standalone Angular 18 Single Page Application (SPA) with responsive UI, reactive forms, search/filter capabilities, and dynamic state management.
- **Database**: Microsoft SQL Server (compatible with SQL Server 2019/2022 Linux container or local instance).

---

## 📂 Project Structure

```text
devops_project/
├── backend/
│   └── ProductApi/
│       ├── Controllers/
│       │   └── ProductsController.cs          # REST CRUD endpoints
│       ├── Data/
│       │   ├── AppDbContext.cs                # EF Core SQL Server DbContext
│       │   └── DbInitializer.cs               # Auto-migration & seed data with connection retries
│       ├── DTOs/
│       │   ├── CreateProductDto.cs            # Request validation model for creation
│       │   └── UpdateProductDto.cs            # Request validation model for updates
│       ├── Models/
│       │   └── Product.cs                     # Product entity
│       ├── Properties/
│       │   └── launchSettings.json            # Development launch profiles
│       ├── appsettings.json                   # Base configuration & connection string
│       ├── appsettings.Development.json       # Development logging overrides
│       ├── Program.cs                         # Application entrypoint, CORS, Swagger & DI
│       └── ProductApi.csproj                  # .NET 8 Web SDK project file
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── product-list/              # Inventory table with search/filter
│   │   │   │   └── product-form/              # Add & edit reactive forms
│   │   │   ├── models/
│   │   │   │   └── product.model.ts           # TypeScript interfaces
│   │   │   ├── services/
│   │   │   │   └── product.service.ts         # HttpClient CRUD API service
│   │   │   ├── app.component.ts               # Shell component with navigation
│   │   │   ├── app.config.ts                  # Application providers (Router, HttpClient)
│   │   │   └── app.routes.ts                  # Angular routing definition
│   │   ├── environments/
│   │   │   ├── environment.ts                 # Production API endpoint (/api)
│   │   │   └── environment.development.ts     # Local API endpoint (http://localhost:5000/api)
│   │   ├── index.html                         # HTML5 root
│   │   ├── main.ts                            # Bootstrap entrypoint
│   │   └── styles.css                         # Clean global theme & utility styles
│   ├── angular.json                           # Angular workspace build config
│   ├── package.json                           # NPM dependencies & build scripts
│   ├── tsconfig.json                          # Base TypeScript compiler settings
│   └── tsconfig.app.json                      # Application TypeScript config
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints Reference

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products (supports `?search=` and `?category=`) |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/{id}` | Update an existing product |
| `DELETE`| `/api/products/{id}` | Remove a product |
| `GET` | `/api/products/categories` | Retrieve distinct categories |
| `GET` | `/health` | Application & SQL Server health status probe |
| `GET` | `/` or `/swagger` | Interactive Swagger UI (OpenAPI) |

---

## 🐳 DevOps & Containerization Reference

### 1. SQL Server Connection & Environment Variable Overrides
In ASP.NET Core, configuration keys can be overridden via environment variables using double underscores (`__`):
```bash
ConnectionStrings__DefaultConnection="Server=sqlserver,1433;Database=ProductDb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;MultipleActiveResultSets=True;"
```

### 2. Startup Resilience (`DbInitializer.cs`)
In Docker Compose setups, SQL Server often takes 10–20 seconds to become healthy. The included `DbInitializer.cs` has built-in retry logic (10 retries with 3-second backoff) so the backend container does not crash if the database is still warming up.

### 3. Recommended Container Images
- **Backend Build**: `mcr.microsoft.com/dotnet/sdk:8.0`
- **Backend Runtime**: `mcr.microsoft.com/dotnet/aspnet:8.0`
- **Frontend Build**: `node:20-alpine` (building output to `dist/frontend/browser`)
- **Web Server & Reverse Proxy**: Host Nginx (serving `/dist/frontend/browser` static files and proxying `/api` requests to backend on port 5000)
- **Database**: `mcr.microsoft.com/mssql/server:2022-latest`

