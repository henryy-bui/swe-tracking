/* Roadmap content, transcribed from swe_software_engineer_roadmap_golang_systems.md.
   Static reference data only. Progress lives in the store. */

export type ProjectId = 'p1' | 'p2' | 'p3' | 'p4';

export interface Phase {
  id: number;
  title: string;
  focus: string;
  weeks: [number, number];
}

export interface WeekMilestone {
  project: ProjectId;
  kind: 'start' | 'finish';
}

export interface WeekDef {
  week: number;
  phase: number;
  topic: string;
  tasks: string[];
  dsa: string;
  milestone?: WeekMilestone;
}

export interface ResourceDef {
  id: string;
  category: string;
  type: 'course' | 'book';
  title: string;
  description: string;
  url: string;
  weeks: [number, number];
}

export interface ProjectDef {
  id: ProjectId;
  number: number;
  title: string;
  tag: string;
  weeks: [number, number];
  goal: string;
  requirements: string;
  milestones: string[];
}

export const TOTAL_WEEKS = 36;

export const PHASES: Phase[] = [
  { id: 1, title: 'Senior Frontend Mastery & Performance', focus: 'React Internals, Web Vitals, Headless UI & Next.js App Router.', weeks: [1, 10] },
  { id: 2, title: 'Golang Backend Core', focus: "Boot.dev track Go, PostgreSQL Deep Dive, Transactions & Let's Go / Let's Go Further.", weeks: [11, 20] },
  { id: 3, title: 'Distributed Systems & AWS', focus: 'gRPC, Hệ thống phân tán, AWS Networking/ECS và Terraform.', weeks: [21, 28] },
  { id: 4, title: 'AI-Native, System Design & Leadership', focus: 'RAG với pgvector, Generative UI, System Design Masterclass, Mock Interview.', weeks: [29, 36] },
];

export const WEEKS: WeekDef[] = [
  // Phase 1
  { week: 1, phase: 1, topic: 'React Internals & Fiber',
    tasks: ['Đào sâu cơ chế Reconciliation, Virtual DOM vs Fiber tree.', 'Tự build mini-React (Fiber + render loop).'],
    dsa: 'Arrays & Hashing (Two Sum, Valid Anagram)' },
  { week: 2, phase: 1, topic: 'React Concurrent Mode',
    tasks: ['Làm chủ useTransition, useDeferredValue.', 'Tối ưu state scheduling, fix re-render thừa.'],
    dsa: 'Arrays & Hashing (Group Anagrams, Top K)' },
  { week: 3, phase: 1, topic: 'Browser Rendering & Vitals',
    tasks: ['DOM, CSSOM, Layout, Paint, Composite.', 'Đo đạc & tối ưu LCP, INP, CLS.'],
    dsa: 'Two Pointers (3Sum, Two Sum II)' },
  { week: 4, phase: 1, topic: 'Memory & Profiling',
    tasks: ['Dùng Memory Heap Snapshot & Allocation timeline.', 'Phát hiện/fix closure leaks, detached DOM nodes.'],
    dsa: 'Two Pointers (Trapping Rain Water)' },
  { week: 5, phase: 1, topic: 'Design Systems & Headless',
    tasks: ['Compound Components, Slot/Polymorphic pattern.', 'Bắt đầu Side Project 1 (WAI-ARIA, Keyboard nav).'],
    dsa: 'Sliding Window căn bản', milestone: { project: 'p1', kind: 'start' } },
  { week: 6, phase: 1, topic: 'High Performance UI',
    tasks: ['Tự viết Virtualized List/Table component.', 'Xử lý 100k dòng ở 60fps, tối ưu DOM recycling.'],
    dsa: 'Sliding Window nâng cao' },
  { week: 7, phase: 1, topic: 'Next.js RSC & Streaming',
    tasks: ['Phân tích RSC wire format, Server vs Client boundary.', 'Streaming SSR với Suspense boundaries.'],
    dsa: 'Stack (Min Stack, Valid Parentheses)' },
  { week: 8, phase: 1, topic: 'Next.js Caching & Actions',
    tasks: ['Kiểm soát 4 tầng cache của App Router.', 'Server Actions kết hợp Optimistic UI.'],
    dsa: 'Stack (Daily Temperatures, Car Fleet)' },
  { week: 9, phase: 1, topic: 'Server State Sync',
    tasks: ['TanStack Query deep dive (staleTime, structural sharing).', 'So sánh chiến lược Caching vs Local State (Zustand).'],
    dsa: 'Binary Search (Search in 2D Matrix)' },
  { week: 10, phase: 1, topic: 'Testing & Đóng gói',
    tasks: ['Unit test (Testing Library) & E2E test (Playwright).', 'Hoàn thiện Side Project 1.'],
    dsa: 'Binary Search (Rotated Array)', milestone: { project: 'p1', kind: 'finish' } },

  // Phase 2
  { week: 11, phase: 2, topic: 'Go Fundamentals & Memory',
    tasks: ['Boot.dev: Pointers, Slice internals, Structs, Interfaces.', 'Hiểu Escape Analysis (Stack vs Heap).'],
    dsa: 'Linked List (Reverse, Merge)' },
  { week: 12, phase: 2, topic: 'Go Concurrency Deep Dive',
    tasks: ['Boot.dev: Goroutines, Channels, WaitGroup, Mutex.', 'Làm chủ context.Context (Cancellation, Deadlines).'],
    dsa: 'Linked List (Remove Nth Node)' },
  { week: 13, phase: 2, topic: "Web Server & Let's Go (Ch1-6)",
    tasks: ["Let's Go: Dựng server net/http, middleware, routing.", 'Graceful shutdown server chuẩn Unix signal.'],
    dsa: 'Trees (Invert, Max Depth)' },
  { week: 14, phase: 2, topic: "PostgreSQL & Let's Go (Ch7-10)",
    tasks: ['Boot.dev SQL: 3NF, Window functions, CTEs.', "Let's Go: Kết nối pgx, Connection pool, HTML Templates."],
    dsa: 'Trees (Balanced, Subtree)' },
  { week: 15, phase: 2, topic: "REST API & Let's Go Further (1-5)",
    tasks: ["Let's Go Further: Structuring REST API, JSON Encoding an toàn.", 'Tích hợp công cụ sqlc gen code type-safe.', 'Bắt đầu Side Project 2.'],
    dsa: 'Trees (Lowest Common Ancestor)', milestone: { project: 'p2', kind: 'start' } },
  { week: 16, phase: 2, topic: "Migrations & Let's Go Further (6-8)",
    tasks: ["Let's Go Further: SQL Migrations, Advanced CRUD, Pagination.", 'Transactions, Pessimistic Locking, Advisory Locks.'],
    dsa: 'Trees (Kth Smallest Element)' },
  { week: 17, phase: 2, topic: "Rate Limit & Let's Go Further (9-10)",
    tasks: ["Let's Go Further: Tự cài Rate Limiter (Token Bucket).", 'Redis Cache-aside, chống Cache Stampede với singleflight.'],
    dsa: 'Tries (Implement Trie)' },
  { week: 18, phase: 2, topic: "Pub/Sub & Let's Go Further (11)",
    tasks: ["Let's Go Further: Background Goroutines an toàn.", 'Boot.dev Pub/Sub: Redis Queue (hibiken/asynq), Retry logic.'],
    dsa: 'Priority Queue (K Closest Points)' },
  { week: 19, phase: 2, topic: "Auth & Let's Go Further (12-14)",
    tasks: ["Let's Go Further: Bearer Tokens, SHA-256, User Activation.", 'RBAC Permissions middleware, CORS.'],
    dsa: 'Heap (Median from Data Stream)' },
  { week: 20, phase: 2, topic: 'Testing, Prod & Đóng gói',
    tasks: ["Let's Go Further (15-18): Metrics, Compile -ldflags.", 'Hoàn thiện Side Project 2.'],
    dsa: 'Backtracking (Subsets, Permutations)', milestone: { project: 'p2', kind: 'finish' } },

  // Phase 3
  { week: 21, phase: 3, topic: 'gRPC & RPC Performance',
    tasks: ['Định nghĩa Schema Protobuf 3, sinh mã Go.', 'Unary & Streaming gRPC, benchmark vs REST.'],
    dsa: 'Backtracking (Word Search)' },
  { week: 22, phase: 3, topic: 'Microservices Patterns',
    tasks: ['Transactional Outbox Pattern, Idempotency key.', 'Circuit Breaker (sony/gobreaker).'],
    dsa: 'Graphs (Islands, Clone Graph)' },
  { week: 23, phase: 3, topic: 'Distributed Rate Limiting',
    tasks: ['Token Bucket bằng Redis Lua Script (Atomic).', 'Bắt đầu Side Project 3.'],
    dsa: 'Graphs (Pacific Atlantic, Courses)', milestone: { project: 'p3', kind: 'start' } },
  { week: 24, phase: 3, topic: 'AWS Networking & Containers',
    tasks: ['Cấu hình VPC, Subnets, Security Groups, NAT Gateway.', 'Multi-stage Dockerfile (<15MB), deploy ECS Fargate.'],
    dsa: 'Graphs (Course Schedule II)' },
  { week: 25, phase: 3, topic: 'AWS Storage, CDN & Edge',
    tasks: ['AWS S3 Go SDK (Presigned URL).', 'CloudFront edge caching & invalidation.'],
    dsa: '1-D DP (Climbing Stairs)' },
  { week: 26, phase: 3, topic: 'Infrastructure as Code (IaC)',
    tasks: ['Viết Terraform script cho VPC, ECS, RDS.', 'GitHub Actions CI/CD pipeline.'],
    dsa: '1-D DP (Longest Palindromic)' },
  { week: 27, phase: 3, topic: 'Distributed Observability',
    tasks: ['OpenTelemetry Go SDK tracing.', 'Structured Logging (slog), Prometheus metrics.'],
    dsa: '1-D DP (Coin Change, Max Product)' },
  { week: 28, phase: 3, topic: 'Load Testing & Đóng gói',
    tasks: ['Chạy k6 load test đạt 5.000+ RPS, tối ưu latency.', 'Hoàn thiện Side Project 3.'],
    dsa: '1-D DP (Longest Increasing Subsequence)', milestone: { project: 'p3', kind: 'finish' } },

  // Phase 4
  { week: 29, phase: 4, topic: 'AI-Native Streaming',
    tasks: ['API streaming bằng Go (Server-Sent Events).', 'Vercel AI SDK render Generative UI mượt mà.', 'Bắt đầu Side Project 4.'],
    dsa: '2-D DP (Unique Paths)', milestone: { project: 'p4', kind: 'start' } },
  { week: 30, phase: 4, topic: 'Vector Search & RAG',
    tasks: ['PostgreSQL pgvector, sinh embeddings qua Go worker.', 'Tính Cosine Similarity, HNSW index, hybrid search.'],
    dsa: '2-D DP (Coin Change II)' },
  { week: 31, phase: 4, topic: 'System Design (Fullstack)',
    tasks: ['Thiết kế Collaborative Editor (CRDT/OT, WebSockets).', 'Thiết kế Flash Sale System (inventory locking, Redis).'],
    dsa: 'Greedy (Max Subarray)' },
  { week: 32, phase: 4, topic: 'System Design (Data Streams)',
    tasks: ['Thiết kế Real-time Chat (Go WebSockets).', 'Thiết kế Notification Pipeline, vẽ sơ đồ C4 Model.'],
    dsa: 'Intervals (Merge, Insert)' },
  { week: 33, phase: 4, topic: 'Tech RFC & Leadership',
    tasks: ['Viết RFC: Migration sang Go Microservices.', 'Viết RFC: Giải pháp Real-time Data Sync.'],
    dsa: 'Bit Manipulation' },
  { week: 34, phase: 4, topic: 'Mock Interview Round 1',
    tasks: ['Giải 2 bài Medium dưới 45 phút, giải thích Big-O.', 'NeetCode 150 Sprint: Reverse LL, LRU Cache.'],
    dsa: 'Interview Prep' },
  { week: 35, phase: 4, topic: 'Mock Interview Round 2',
    tasks: ['Mock System Design 60 phút: DB indexing, caching.', 'Giải thích sâu Go memory model, goroutine pool.'],
    dsa: 'Interview Prep' },
  { week: 36, phase: 4, topic: 'Go-to-Market & Portfolio',
    tasks: ['Đóng gói 4 side projects lên GitHub (Demo, C4 Diagram).', 'Tối ưu CV nhấn mạnh throughput, Fullstack/Lead.'],
    dsa: 'NeetCode 150 Final Revision', milestone: { project: 'p4', kind: 'finish' } },
];

export const RESOURCES: ResourceDef[] = [
  { id: 'bootdev-go', category: 'Boot.dev Platform', type: 'course', title: 'Learn Go',
    description: 'Cú pháp, Pointers, Slices, Structs, Interfaces.', url: 'https://www.boot.dev/courses/learn-golang', weeks: [11, 11] },
  { id: 'bootdev-go-concurrency', category: 'Boot.dev Platform', type: 'course', title: 'Learn Go Concurrency',
    description: 'Goroutines, Channels, Mutexes, Select.', url: 'https://www.boot.dev/courses/learn-concurrency-golang', weeks: [12, 12] },
  { id: 'bootdev-sql', category: 'Boot.dev Platform', type: 'course', title: 'Learn SQL',
    description: 'Relational DB, PostgreSQL, Window Functions, CTEs.', url: 'https://www.boot.dev/courses/learn-sql', weeks: [14, 14] },
  { id: 'bootdev-pubsub', category: 'Boot.dev Platform', type: 'course', title: 'Learn Pub/Sub',
    description: 'Message queues, RabbitMQ/Redis Streams concepts.', url: 'https://www.boot.dev/courses/learn-pub-sub-rabbitmq-golang', weeks: [18, 18] },

  { id: 'book-lets-go', category: 'Sách tiêu chuẩn (Bắt buộc)', type: 'book', title: "Let's Go (Alex Edwards)",
    description: 'Cẩm nang dựng Web Server chuẩn mực từ số 0 với thư viện chuẩn net/http. Học cách cấu trúc project, routing, template và middleware đúng kiểu Go.',
    url: 'https://lets-go.alexedwards.net/', weeks: [13, 14] },
  { id: 'book-lets-go-further', category: 'Sách tiêu chuẩn (Bắt buộc)', type: 'book', title: "Let's Go Further (Alex Edwards)",
    description: 'Kinh thánh xây dựng Production-grade REST API. Chứa mọi pattern thực tế: Token Bucket rate limit, graceful shutdown, migrations, password hashing an toàn, CORS, deployment.',
    url: 'https://lets-go-further.alexedwards.net/', weeks: [15, 20] },
  { id: 'book-ddia', category: 'Sách tiêu chuẩn (Bắt buộc)', type: 'book', title: 'Designing Data-Intensive Applications (Martin Kleppmann)',
    description: 'Bắt buộc đọc để hiểu sâu về Transactions, Isolation Levels, Replication và Partitioning.',
    url: 'https://dataintensive.net/', weeks: [16, 28] },
  { id: 'book-sdi', category: 'Sách tiêu chuẩn (Bắt buộc)', type: 'book', title: 'System Design Interview (Alex Xu, Vol 1 & 2)',
    description: 'Khung tư duy thiết kế hệ thống phân tán chịu tải cao.',
    url: 'https://bytebytego.com/', weeks: [31, 35] },
];

export const PROJECTS: ProjectDef[] = [
  { id: 'p1', number: 1, title: 'Enterprise Headless Data Grid', tag: 'Frontend & Performance', weeks: [5, 10],
    goal: 'Chứng minh năng lực tối ưu DOM, Web Vitals và Design Systems.',
    requirements: 'Render mượt mà 100.000 dòng dữ liệu (DOM Recycling), hỗ trợ đầy đủ WAI-ARIA (Keyboard navigation), không phụ thuộc UI Framework bên ngoài. Áp dụng Compound Components.',
    milestones: [
      'Thiết kế API Compound Components (Grid, Header, Row, Cell)',
      'Virtualization / DOM recycling cho 100.000 dòng ở 60fps',
      'WAI-ARIA grid pattern + keyboard navigation đầy đủ',
      'Không phụ thuộc UI framework bên ngoài (headless)',
      'Unit test (Testing Library) & E2E test (Playwright)',
      'Demo + README + đo Web Vitals',
    ] },
  { id: 'p2', number: 2, title: 'Distributed Task Scheduler & REST API', tag: 'Golang Backend', weeks: [15, 20],
    goal: "Áp dụng toàn bộ sách Let's Go Further & Boot.dev vào thực tế.",
    requirements: 'Viết bằng Go thuần. Tự build hệ thống Rate Limiting. Sử dụng PostgreSQL với sqlc và transactions chặn Race Conditions (Advisory Locks). Chạy background workers với Redis Queue (Asynq) xử lý retry logic.',
    milestones: [
      "Cấu trúc REST API theo Let's Go Further (Go thuần, net/http)",
      'PostgreSQL + sqlc, migrations',
      'Transactions + Advisory Locks chặn race conditions',
      'Rate Limiter tự build (Token Bucket)',
      'Background workers với Redis Queue (Asynq) + retry logic',
      'Auth (Bearer tokens), RBAC, CORS',
      'Metrics, build -ldflags, deploy',
    ] },
  { id: 'p3', number: 3, title: 'High-Throughput URL Shortener', tag: 'AWS Cloud & Systems', weeks: [23, 28],
    goal: 'Vận hành hệ thống phân tán tải cao (5000+ RPS).',
    requirements: 'gRPC hoặc REST API backend cực nhẹ. Cache dữ liệu bằng Redis và CloudFront. Triển khai bằng Terraform (VPC, ECS Fargate). Tích hợp load testing (k6) và OpenTelemetry tracing.',
    milestones: [
      'Backend gRPC/REST cực nhẹ',
      'Distributed rate limiting (Redis Lua)',
      'Cache bằng Redis + CloudFront',
      'Dockerfile multi-stage (<15MB) + ECS Fargate',
      'Terraform: VPC, ECS, RDS; GitHub Actions CI/CD',
      'OpenTelemetry tracing, slog, Prometheus',
      'k6 load test đạt 5.000+ RPS',
    ] },
  { id: 'p4', number: 4, title: 'AI-Enhanced Workflow / RAG Platform', tag: 'Generative AI', weeks: [29, 36],
    goal: 'Đón đầu xu hướng AI-Native.',
    requirements: 'Kết hợp Next.js (Frontend UI streaming) và Go Backend. Lưu trữ vector embeddings bằng pgvector trong PostgreSQL. Thiết kế luồng Hybrid Search (Semantic + Full-text) và trả kết quả realtime qua Server-Sent Events (SSE).',
    milestones: [
      'Go backend streaming qua Server-Sent Events',
      'Next.js + Vercel AI SDK Generative UI',
      'pgvector + Go embedding worker',
      'Hybrid Search (Semantic + Full-text), HNSW index',
      'C4 diagram + demo + README',
    ] },
];

export const weekDef = (n: number): WeekDef => WEEKS[n - 1];
export const phaseOfWeek = (n: number): Phase => PHASES.find((p) => n >= p.weeks[0] && n <= p.weeks[1]) ?? PHASES[0];
export const phaseById = (id: number): Phase => PHASES.find((p) => p.id === id) ?? PHASES[0];
export const projectById = (id: ProjectId): ProjectDef => PROJECTS.find((p) => p.id === id) ?? PROJECTS[0];
