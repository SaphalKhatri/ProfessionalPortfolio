import { ProjectItem, SkillCategory, ExperienceItem } from '../types/portfolio';
import saphalProfileImg from '../assets/images/saphal_profile.png';

export const PERSONAL_INFO = {
  name: "Saphal Kumar Khatri",
  title: "Full-Stack Developer | Python & React",
  tagline: "Building modern full-stack applications with robust backend architectures and responsive frontend experiences.",
  location: "Kathmandu, Nepal",
  email: "khatrisaphal11@gmail.com",
  currentSite: "https://www.khatrisaphal.com.np",
  github: "https://github.com/SaphalKhatri",
  linkedin: "https://www.linkedin.com/in/saphal-kumar-khatri-840764280/",
  status: "Open to backend software engineering roles & internships",
  avatar: saphalProfileImg,
  bioParagraphs: [
    "I am a full-stack software developer with a strong backend focus, specializing in Python, FastAPI, Django REST Framework, PostgreSQL, React, and Tailwind CSS. I enjoy building complete, production-oriented applications—from responsive user interfaces and REST APIs to database architecture, business logic, and asynchronous processing.",
    "My projects include building a content recommendation system using TF-IDF and cosine similarity, integrating Google Gemini AI with PostgreSQL-based caching, and designing asynchronous background processing with Celery and Redis. On the frontend, I build responsive interfaces using React and Tailwind CSS and connect them with backend REST APIs.",
    "I am actively seeking software engineering internships and full-time opportunities where I can contribute across the stack, while continuing to strengthen my backend expertise in API development, database design, application architecture, and performance optimization."
  ],
  stats: [
    { label: "Core Stack", value: "Python · FastAPI · Django · PostgreSQL · React" },
    { label: "Primary Architecture", value: "RESTful · AsyncIO · Microservices" },
    { label: "API Design Style", value: "OpenAPI v3 · Pydantic v2 · ACID" },
    { label: "Location & Relocation", value: "Kathmandu, Nepal (Open to Remote / Relocation)" },
  ]
};

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "movie-recommendation-api",
    name: "Movie-Recommendation API",
    tagline: "Content-based movie recommendation system powered by scikit-learn, TF-IDF vectorization, and FastAPI.",
    category: "Machine Learning & AI",
    description: [
      "Engineered an automated movie recommendation REST API utilizing Python 3.12, FastAPI, and scikit-learn.",
      "Implemented a high-performance content-based filtering pipeline that transforms multi-dimensional movie synopsis descriptions into TF-IDF numerical vectors.",
      "Computed cosine similarity matrices with sub-15ms query execution to recommend top-k contextually similar titles.",
      "Designed clean OpenAPI endpoints with request validation, input sanitization, and structured JSON responses for easy client consumption."
    ],
    techStack: ["Python", "FastAPI", "scikit-learn", "TF-IDF", "Cosine Similarity", "NumPy", "Pydantic"],
    metrics: [
      { label: "Inference Latency", value: "< 14 ms" },
      { label: "Vector Dimension", value: "5,000 TF-IDF features" },
      { label: "Framework", value: "FastAPI + Uvicorn" }
    ],
    githubUrl: "https://github.com/SaphalKhatri/movie-recommendation-api",
    architectureHighlights: [
      "Memory-cached precomputed sparse matrices for zero-redundancy similarity computation.",
      "Vectorized Cosine Similarity calculation with NumPy for rapid matrix multiplication.",
      "Pydantic schema validation preventing corrupted payloads or malformed movie IDs.",
      "Comprehensive error handling returning standardized RFC-7807 problem details."
    ],
    endpointsSample: [
      {
        method: "POST",
        path: "/api/v1/recommend",
        description: "Submit a movie title or synopsis query to receive top-5 cosine similarity scored matches.",
        samplePayload: {
          movie_title: "Inception",
          top_k: 5,
          include_similarity_scores: true
        },
        sampleResponse: {
          status: "success",
          query: "Inception",
          latency_ms: 11.4,
          recommendations: [
            { id: 104, title: "Interstellar", similarity: 0.842, genre: ["Sci-Fi", "Drama"] },
            { id: 289, title: "Shutter Island", similarity: 0.781, genre: ["Mystery", "Thriller"] },
            { id: 412, title: "The Prestige", similarity: 0.765, genre: ["Drama", "Mystery"] },
            { id: 531, title: "Memento", similarity: 0.748, genre: ["Mystery", "Thriller"] },
            { id: 890, title: "The Matrix", similarity: 0.712, genre: ["Action", "Sci-Fi"] }
          ]
        }
      },
      {
        method: "GET",
        path: "/api/v1/health",
        description: "System health, vector cache status, and memory residency check.",
        sampleResponse: {
          status: "healthy",
          vectorizer_loaded: true,
          total_indexed_movies: 4803,
          memory_footprint_mb: 48.2
        }
      }
    ]
  },
  {
    id: "coffee-recipe-gemini-api",
    name: "Coffee_Recipe_gemini-API",
    tagline: "Intelligent coffee recipe generation and caching REST service blending PostgreSQL persistence with Google Gemini AI.",
    category: "FastAPI & AI Integration",
    description: [
      "Architected a hybrid intelligent coffee recipe REST API combining FastAPI, PostgreSQL relational persistence, and Google Gemini AI.",
      "Implemented a strict database-first search pattern: incoming recipe requests query existing indexed PostgreSQL records to bypass redundant AI inference.",
      "When a recipe does not exist, triggers structured Gemini AI prompts to synthesize brewing ratios, grind sizes, water temperatures, and step-by-step instructions.",
      "Automatically commits newly generated recipes to PostgreSQL, ensuring cache persistence, reduced AI quota consumption, and near-instant retrieval on repeated hits."
    ],
    techStack: ["FastAPI", "Python", "Google Gemini AI", "PostgreSQL", "SQLAlchemy", "Pydantic", "Docker"],
    metrics: [
      { label: "Cache Hit Speedup", value: "94% faster (<8ms vs 900ms)" },
      { label: "Database Isolation", value: "ACID Compliant (Postgres)" },
      { label: "AI Integration", value: "Gemini 2.5 Flash Structured" }
    ],
    githubUrl: "https://github.com/SaphalKhatri/coffee_recipe-gemini-api",
    architectureHighlights: [
      "Database-First Cache Invalidation & Persistence: avoids unnecessary external AI roundtrips.",
      "Structured output enforcement via Pydantic model schemas guaranteeing valid JSON from Gemini.",
      "PostgreSQL normalized relational tables for recipes, ingredients, and brewing methodologies.",
      "Resilient retry policies with exponential backoff on upstream AI rate limits."
    ],
    endpointsSample: [
      {
        method: "POST",
        path: "/api/v1/recipes/search-or-generate",
        description: "Searches PostgreSQL database for an exact recipe; falls back to Gemini generation if cache miss.",
        samplePayload: {
          drink_name: "Kyoto Cold Brew with Cardamom",
          roast_preference: "medium-dark",
          brew_equipment: "slow drip tower"
        },
        sampleResponse: {
          source: "gemini_generated_and_saved_to_db",
          recipe_id: "rec_91a0f44",
          cached: false,
          drink_name: "Kyoto Cold Brew with Cardamom",
          grind_size: "Coarse (Kosher salt consistency)",
          ratio: "1:10 (60g coffee / 600ml ice water)",
          drip_rate: "1 drop every 1.5 seconds (4-6 hour total)",
          tasting_notes: ["Dark chocolate", "Green cardamom", "Velvety mouthfeel"],
          db_saved_at: "2026-09-26T15:20:00Z"
        }
      },
      {
        method: "GET",
        path: "/api/v1/recipes?limit=10",
        description: "List stored recipes stored in PostgreSQL with pagination and filter criteria.",
        sampleResponse: {
          total_count: 87,
          page: 1,
          items: [
            { id: 1, name: "V60 Ethiopian Yirgacheffe", origin: "Ethiopia", temp_c: 93 },
            { id: 2, name: "Aeropress Inverted Method", origin: "Colombia", temp_c: 88 },
            { id: 3, name: "Traditional Chemex Pour", origin: "Guatemala", temp_c: 94 }
          ]
        }
      }
    ]
  },
  {
    id: "async-task-engine",
    name: "Redis + Fastapi",
    tagline: "High-throughput asynchronous job processor and event pipeline built with Python AsyncIO, Celery, and Redis.",
    category: "Distributed Systems & Tasks",
    description: [
      "Built a passwordless private notes application using FastAPI, PostgreSQL, and Redis as a practical project to learn and implement Redis in a real backend application.",
      "Implemented Redis-based OTP management with TTL (Time To Live) to automatically expire verification codes after a defined period.",
      "Implemented API rate limiting using Redis to restrict excessive requests within a specific time window and help protect endpoints from abuse.",
      "Added asynchronous OTP email processing and explored how Redis can support background tasks, temporary storage, expiration, and request control in a FastAPI application."
    ],
    techStack: ["Python/FastAPI", "Redis", "Pydantic", ],
    metrics: [
      { label: "Key-Value", value: "Learned Redis key & value operations" },
      { label: "OTP Expiration", value: "Learned TTL-based key expiration" },
      { label: "Rate Limiting", value: "Limited requests within a time window" }
    ],
    githubUrl: "https://github.com/SaphalKhatri/Redis-Implemtation",
    architectureHighlights: [
      "Redis-based OTP storage with TTL for automatic expiration of verification codes.",
      "Redis rate limiting to control repeated API requests within a defined time window.",
      "Separation of temporary Redis data from persistent PostgreSQL data for efficient backend data management."
    ],
    endpointsSample: [
      {
        method: "POST",
        path: "/api/auth/send-otp",
        description: "Generates a one-time password, stores it temporarily in Redis with an expiration time, and triggers asynchronous email delivery.",
        samplePayload: {
          email: "user@example.com"
        },
        sampleResponse: {
          message: "OTP sent successfully",
          expires_in: 300
        }
      }
    ]
  },
  {
    id: "portfolio-admin-service",
    name: "Ghar-Dhani",
    tagline: "Effortless flat management, seamless rent tracking.",
    category: "Full Stack & APIs",
    description: [
      "Enables landlords to manage all their properties in one dashboard, automatically tracking which flats are available or occupied in real time.",
      "Uses a dedicated Lease model to connect tenants and flats. This keeps a clean historical record over time—allowing tenants to rent multiple flats and flats to rotate through different tenants seamlessly.",
      "Records monthly rental dues with built-in support for partial payments. The system automatically calculates the remaining balance on the fly and updates payment statuses (pending, partial, paid, overdue) based on the payment date and due date.",
      "Built using FastAPI (Python), PostgreSQL, SQLAlchemy ORM, and Pydantic for fast performance, strict data validation, and clean REST APIs ready for a React + TypeScript frontend."
    ],
    techStack: ["React", "TypeScript", "Tailwind CSS", "FastAPI / Python","Uvicorn","Pydantic","PostgreSQL", "Sqlalchmey"],
    metrics: [
      { label: "API Architecture", value: "RESTful+Fastapi" },
      { label: "Data Integrity", value: "Postgress Relational Schema" },
      { label: "Billing Engine", value: "Real-Time Balance & Dues Computation" }
    ],
    githubUrl: "https://github.com/SaphalKhatri/Ghar-Dhani",
    architectureHighlights: [
      "Decoupled relational architecture connecting Flats and Tenants through an intermediary Lease model for full tenancy lifecycle history.",
      "Layered data flow combining Pydantic v2 schemas for strict request/response validation with SQLAlchemy ORM for transaction-safe persistence.",
      "State-driven billing engine that dynamically computes remaining balances and automates flat occupancy transitions."
    ]
  }
];

export const SKILLS_DATA: SkillCategory[] = [
  {
    title: "Backend Engineering",
    subtitle: "Server-side logic, high-performance web frameworks, and async runtime execution",
    skills: [
      { name: "Python", level: "Primary Language", description: "AsyncIO, typing, OOP, Pydantic v2, data structures, and algorithms." },
      { name: "FastAPI", level: "Advanced", description: "Asynchronous REST APIs, dependency injection, OpenAPI documentation, Swagger UI." },
      { name: "Django", level: "Proficient", description: "Full-stack web architecture, MVC pattern, Django ORM, authentication system." },
      { name: "Django REST Framework", level: "Proficient", description: "Serializers, ViewSets, API permissions, token authentication, pagination." },
      { name: "RESTful API Design", level: "Advanced", description: "Idempotent HTTP verbs, clean resource hierarchies, RFC error formatting, versioning." },
      { name: "AsyncIO & uvloop", level: "Proficient", description: "Non-blocking concurrency, coroutine scheduling, event loops, thread offloading." }
    ]
  },
  {
    title: "Databases & Caching",
    subtitle: "Relational persistence, query optimization, indexing, and high-speed in-memory stores",
    skills: [
      { name: "PostgreSQL", level: "Advanced", description: "Relational schema modeling, foreign keys, indexes, transactions, ACID guarantees." },
      { name: "Supabase", level: "Proficient", description: "Managed PostgreSQL, row-level security, realtime subscriptions, database hosting." },
      { name: "Redis", level: "Proficient", description: "Key-value caching, Pub/Sub, task broker queues, rate-limiting counters, TTLs." },
      { name: "SQLAlchemy & ORM", level: "Proficient", description: "Declarative models, connection pooling, eager/lazy loading, query profiling." }
    ]
  },
  {
    title: "AI & Machine Learning",
    subtitle: "Practical ML models, vector similarity, and generative AI integrations into APIs",
    skills: [
      { name: "scikit-learn", level: "Intermediate", description: "TF-IDF vectorizer, Cosine Similarity, classification, clustering, feature extraction." },
      { name: "Google Gemini AI", level: "Proficient", description: "Structured output parsing, system prompts, automated fallback caching architectures." },
      { name: "NumPy & Pandas", level: "Intermediate", description: "Matrix operations, tabular data wrangling, vector transformations." }
    ]
  },
  {
    title: "DevOps & Tools",
    subtitle: "Containerization, version control, testing environments, and cloud deployment",
    skills: [
      { name: "Docker", level: "Proficient", description: "Multi-stage Dockerfiles, Docker Compose service orchestration, environment isolation." },
      { name: "Git & GitHub", level: "Advanced", description: "Branching strategies, pull requests, semantic versioning, CI/CD workflows." },
      { name: "Linux / Bash", level: "Proficient", description: "Shell scripting, server management, process inspection (htop/curl/systemd)." },
      { name: "Postman & cURL", level: "Advanced", description: "API contract testing, environment variables, automated collection testing." }
    ]
  },
  {
    title: "Frontend & Full Stack",
    subtitle: "Building clean, interactive user interfaces to complement backend services",
    skills: [
      { name: "React", level: "Proficient", description: "Component lifecycle, custom hooks, state management, SPA routing." },
      { name: "TypeScript", level: "Proficient", description: "Strict static typing, interfaces, generic types, safe API contracts." },
      { name: "Tailwind CSS", level: "Advanced", description: "Modern responsive utility styling, dark mode systems, custom typography." },
      { name: "HTML5 & Modern CSS", level: "Advanced", description: "Semantic markup, CSS Grid/Flexbox, accessible UI design." }
    ]
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    role: "Backend & Full-Stack Developer (Independent / Projects)",
    organization: "Personal & Open Source Software",
    period: "2023 — Present",
    location: "Kathmandu, Nepal",
    type: "Project",
    bullets: [
      "Engineered multiple production-ready REST APIs using FastAPI, Django, and PostgreSQL with robust error handling and automated documentation.",
      "Developed a content-based recommendation engine leveraging scikit-learn's TF-IDF vectorization and cosine similarity.",
      "Built an AI-enhanced coffee recipe API with Google Gemini, implementing a PostgreSQL-first caching pattern to eliminate redundant LLM calls.",
      "Architected clean front-end web clients with React, TypeScript, and Tailwind CSS to interface seamlessly with backend services."
    ],
    technologies: ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker", "React", "TypeScript"]
  }
];

export const ENGINEERING_PRINCIPLES = [
  {
    id: "database-first",
    title: "Database-First Integrity & ACID Discipline",
    tagline: "Code is transient; database schemas are permanent.",
    invariant: "PostgreSQL · 3NF Modeling · B-Tree Indexes · Atomic Transactions",
    description: "I always design normalized relational schemas, explicit foreign key constraints, and indexing strategies before writing endpoint code. Business logic must respect transaction boundaries to prevent data corruption or partial writes.",
    rules: [
      "Explicit transaction blocks (BEGIN / COMMIT / ROLLBACK) around all multi-table state mutations.",
      "Indexing foreign keys and high-frequency WHERE / ORDER BY columns to eliminate sequential table scans.",
      "Connection pooling with pre-configured pool sizes and recycling to prevent socket exhaustion."
    ]
  },
  {
    id: "type-safety",
    title: "End-to-End Type Safety & Strict Contracts",
    tagline: "Reject malformed data at the network perimeter.",
    invariant: "Pydantic v2 · Python Type Hints · TypeScript Interfaces · OpenAPI 3.1",
    description: "Runtime errors in production are expensive. Every incoming HTTP request must pass strict Pydantic v2 validation models before reaching the service layer, guaranteeing that only sanitised, type-checked data enters the system.",
    rules: [
      "Strict typing on all function signatures, coroutine parameters, and return types.",
      "Single source of truth: Pydantic schemas auto-generate OpenAPI/Swagger documentation.",
      "Matching TypeScript interfaces on the client to prevent contract drift between frontend and backend."
    ]
  },
  {
    id: "fail-fast",
    title: "Fail Fast & Standardized RFC Error Details",
    tagline: "Never leak raw tracebacks or return generic HTTP 500s.",
    invariant: "RFC-7807 Problem Details · Custom Exception Handlers · Structured JSON Logs",
    description: "Exceptions should never pass silently. All errors are caught by custom global exception handlers, logged with structured contextual metadata, and mapped to standardized HTTP status codes with clear, actionable client feedback.",
    rules: [
      "Standardized error response shape with error code, message, timestamp, and parameter path.",
      "Sanitizing sensitive internal stack traces from client responses to avoid information disclosure.",
      "Centralized structured JSON logging for reproducible bug analysis and observability."
    ]
  },
  {
    id: "caching-discipline",
    title: "Cost & Latency Awareness (Cache Before Compute)",
    tagline: "Never compute or fetch twice what can be safely cached.",
    invariant: "Redis TTL Cache · DB-First Lookup · Deterministic Cache Keys",
    description: "External AI APIs (like Google Gemini) and heavy SQL joins are latency bottlenecks and cost drivers. I implement database-first lookup patterns and Redis caching layers with deterministic keys to drop repeat query latency from ~1s to sub-10ms.",
    rules: [
      "Deterministic cache keys based on normalized request parameters.",
      "Granular TTL policies and cache invalidation hooks on entity mutations.",
      "Graceful degradation: if cache or AI services fail, fallback to stale or default data paths."
    ]
  },
  {
    id: "async-concurrency",
    title: "Asynchronous Non-Blocking Execution",
    tagline: "Keep the main HTTP cycle snappy (< 50ms).",
    invariant: "Python AsyncIO · uvloop · Celery + Redis · Dead Letter Queues (DLQ)",
    description: "Web requests should never stall waiting on long batch computations, email sending, or heavy ML inferences. Long-running tasks are offloaded to asynchronous Celery worker queues with retry policies and dead-letter queues.",
    rules: [
      "Non-blocking coroutines with await for all network and database socket I/O.",
      "Offload compute-heavy or slow tasks to asynchronous worker processes.",
      "Idempotent task design ensuring repeated execution does not create duplicate records."
    ]
  },
  {
    id: "layered-architecture",
    title: "Separation of Concerns & Layered Architecture",
    tagline: "Keep controllers thin, services rich, and repositories focused.",
    invariant: "Routers (API) → Service Layer (Logic) → Repository / ORM (Persistence)",
    description: "Route handlers should solely parse incoming requests and serialize responses. Core business rules live in isolated service classes, and database queries are encapsulated in repository layers, enabling painless unit testing and modular refactoring.",
    rules: [
      "Controllers/Routers contain zero SQL queries or business logic.",
      "Dependency injection for database sessions and external API clients.",
      "Decoupled components allow swapping database engines or external providers with minimal diffs."
    ]
  }
];

