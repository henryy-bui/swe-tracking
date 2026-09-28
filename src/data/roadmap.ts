/* Roadmap content, transcribed from swe_software_engineer_roadmap_golang_systems.md (the Google Sheets
   roadmap: Weekly Checklist, Reading & Resources, Side Projects, Dashboard).
   Static reference data only. Progress lives in the store, keyed by the ids below, so ids must never
   change once shipped; text may. Add a new task with a new id; drop one by deleting it and mapping its
   old key in src/data/legacy.ts. */
import { parseDsa, type DsaDef } from '@/data/dsa';

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

export interface RoadmapTask {
  id: string; // short ascii slug, unique within the week, never all digits
  text: string;
}

export interface WeekDef {
  week: number;
  phase: number;
  topic: string;
  tasks: RoadmapTask[];
  dsa: DsaDef;
  reading: string; // the sheet's "Tài liệu / Sách đọc trong tuần" cell
  readingRefs?: string[]; // ResourceDef ids the reading belongs to
  milestone?: WeekMilestone;
}

export type ResourceType = 'course' | 'book' | 'docs';

export interface ResourceDef {
  id: string;
  domain: string;
  type: ResourceType;
  title: string;
  author: string;
  chapters: string; // courses / chapters to read
  goal: string;
  url: string;
  weeks: [number, number];
}

export type ProjectMilestoneKind = 'requirement' | 'deliverable';

export interface ProjectMilestoneDef {
  id: string; // unique within the project; never "m" + digits (legacy positional keys)
  title: string;
  kind: ProjectMilestoneKind;
}

export interface ProjectDef {
  id: ProjectId;
  number: number;
  title: string;
  tag: string;
  weeks: [number, number];
  problem: string;
  stack: string; // comma-separated
  milestones: ProjectMilestoneDef[];
}

export const TOTAL_WEEKS = 36;

export const PHASES: Phase[] = [
  { id: 1, title: 'Senior Frontend', focus: 'React Internals, Web Vitals, Headless UI & Next.js App Router.', weeks: [1, 10] },
  { id: 2, title: 'Backend Golang', focus: "Boot.dev track Go, PostgreSQL Deep Dive, Transactions & Let's Go / Let's Go Further.", weeks: [11, 20] },
  { id: 3, title: 'Distributed & Cloud', focus: 'gRPC, Hệ thống phân tán, AWS Networking/ECS và Terraform.', weeks: [21, 28] },
  { id: 4, title: 'Synthesis & Leadership', focus: 'RAG với pgvector, Generative UI, System Design Masterclass, Mock Interview.', weeks: [29, 36] },
];

/* The dashboard's "Nguyên tắc & hướng dẫn học" box. */
export const GUIDELINES = {
  hoursPerWeek: '20 - 25 giờ/tuần',
  dsaPerDay: '1 - 2 bài/ngày (Go/TS)',
  review: 'Spaced repetition cuối tuần',
  pace: '1 tuần lộ trình / tuần thực tế',
  sources: 'Boot.dev & Alex Edwards',
  goal: 'Senior Golang Engineer',
} as const;

const t = (id: string, text: string): RoadmapTask => ({ id, text });

export const WEEKS: WeekDef[] = [
  // Phase 1: Senior Frontend
  { week: 1, phase: 1, topic: 'React Internals & Fiber Architecture',
    tasks: [
      t('reconcile', 'Đào sâu Reconciliation, Virtual DOM vs Fiber tree, double buffering, lanes priority.'),
      t('mini-react', 'Tự build mini-React (Fiber + render loop).'),
    ],
    dsa: parseDsa('Arrays & Hashing (Contains Duplicate, Valid Anagram, Two Sum)'),
    reading: 'Patterns.dev (Component Patterns) + React Docs (Under the hood)' },
  { week: 2, phase: 1, topic: 'React Concurrent Mode & Hooks Deep Dive',
    tasks: [
      t('hooks', 'useTransition, useDeferredValue, useSyncExternalStore.'),
      t('rerender', 'Phân tích re-render thừa và batched updates.'),
    ],
    dsa: parseDsa('Arrays & Hashing (Group Anagrams, Top K Frequent, Product of Array Except Self)'),
    reading: 'Patterns.dev (Hooks Pattern) + Deep dive useSyncExternalStore' },
  { week: 3, phase: 1, topic: 'Browser Rendering Pipeline & Core Web Vitals',
    tasks: [
      t('pipeline', 'DOM, CSSOM, Render Tree, Layout, Paint, Composite.'),
      t('vitals', 'Tối ưu LCP, INP, CLS; dùng Chrome DevTools Performance tab đo đạc.'),
    ],
    dsa: parseDsa('Two Pointers (Valid Palindrome, Two Sum II, 3Sum)'),
    reading: 'High Performance Browser Networking (Ch. 1-2) + web.dev/vitals' },
  { week: 4, phase: 1, topic: 'Memory Management & Profiling',
    tasks: [
      t('heap-snapshot', 'Memory Heap Snapshot, allocation timeline.'),
      t('leaks', 'Tìm và sửa 3 dạng memory leaks: closures, detached DOM, event listeners.'),
    ],
    dsa: parseDsa('Two Pointers (Container With Most Water, Trapping Rain Water)'),
    reading: 'Chrome DevTools Memory Profiling Docs + V8 Garbage Collection' },
  { week: 5, phase: 1, topic: 'Design Systems & Headless UI Architecture',
    tasks: [
      t('patterns', 'Compound Components pattern, Slot/Polymorphic components, tích hợp WAI-ARIA và keyboard navigation chuẩn WCAG AA.'),
      t('start-sp1', 'Bắt đầu Side Project 1 (Headless Design System & Data Grid).'),
    ],
    dsa: parseDsa('Sliding Window (Best Time to Buy/Sell Stock, Longest Substring Without Repeating)'),
    reading: 'Radix UI Primitives Architecture Guide + W3C WAI-ARIA Authoring',
    milestone: { project: 'p1', kind: 'start' } },
  { week: 6, phase: 1, topic: 'High Performance Virtualization',
    tasks: [
      t('grid', 'Tự viết Virtualized Data Grid xử lý 100k items.'),
      t('fps', 'Đo frame-rate 60fps khi scroll nhanh, tối ưu DOM recycling.'),
    ],
    dsa: parseDsa('Sliding Window (Longest Repeating Character Replacement, Permutation in String)'),
    reading: 'TanStack Virtual internals & DOM recycling principles' },
  { week: 7, phase: 1, topic: 'Next.js App Router & Server Components (RSC)',
    tasks: [
      t('rsc', 'RSC wire format, Server vs Client boundary, Data Fetching trên RSC.'),
      t('streaming', 'Streaming SSR với Suspense boundaries.'),
    ],
    dsa: parseDsa('Stack (Valid Parentheses, Min Stack, Evaluate RPN)'),
    reading: 'Next.js Docs (Deep dive RSC, Caching Layers)' },
  { week: 8, phase: 1, topic: 'Next.js Advanced Caching & Server Actions',
    tasks: [
      t('cache-layers', 'Làm chủ 4 tầng cache Next.js (Request Memoization, Data Cache, Full Route Cache, Router Cache).'),
      t('server-actions', 'Server Actions + Optimistic UI.'),
    ],
    dsa: parseDsa('Stack (Generate Parentheses, Daily Temperatures, Car Fleet)'),
    reading: 'Web Performance in Action (Wagner)' },
  { week: 9, phase: 1, topic: 'State Management & Server State Synchronization',
    tasks: [
      t('query', 'TanStack Query deep dive (staleTime, gcTime, invalidation, structural sharing).'),
      t('local-state', 'So sánh với Local state (Zustand).'),
    ],
    dsa: parseDsa('Binary Search (Binary Search, Search a 2D Matrix, Koko Eating Bananas)'),
    reading: "TkDodo's blog: Practical React Query series" },
  { week: 10, phase: 1, topic: 'Frontend Testing & Side Project 1 Wrap-up',
    tasks: [
      t('testing', 'Testing Library, Playwright (E2E), Component testing, Storybook automated visual regression testing.'),
      t('finish-sp1', 'Hoàn thiện Side Project 1.'),
    ],
    dsa: parseDsa('Binary Search (Find Min in Rotated Sorted Array, Search in Rotated Sorted Array)'),
    reading: 'Testing JavaScript (Kent C. Dodds guide)',
    milestone: { project: 'p1', kind: 'finish' } },

  // Phase 2: Backend Golang
  { week: 11, phase: 2, topic: 'Go Fundamentals & Memory Model (Boot.dev)',
    tasks: [
      t('bootdev-go', "Boot.dev: 'Learn Go'. Hiểu sâu Pointers, Slices internals (Header, Cap, Len), Structs, Interfaces, Value vs Pointer Receivers."),
      t('memory', 'Memory Allocation (Stack vs Heap, Escape Analysis).'),
    ],
    dsa: parseDsa('Linked List (Reverse Linked List, Merge Two Sorted Lists, Reorder List)'),
    reading: 'The Go Programming Language (Ch. 1-4)', readingRefs: ['bootdev-go'] },
  { week: 12, phase: 2, topic: 'Go Concurrency Deep Dive (Boot.dev)',
    tasks: [
      t('bootdev-concurrency', "Boot.dev: 'Learn Go Concurrency'. Goroutines, Channels (Buffered vs Unbuffered), Select statement, Sync package (Mutex, RWMutex, WaitGroup, Once)."),
      t('context', 'Context package (Cancellation, Timeouts).'),
    ],
    dsa: parseDsa('Linked List (Remove Nth Node From End, Copy List with Random Pointer)'),
    reading: 'Concurrency in Go (Ch. 3 & 4)', readingRefs: ['bootdev-go', 'book-concurrency-in-go'] },
  { week: 13, phase: 2, topic: 'Production Web Servers & Routing (net/http)',
    tasks: [
      t('server', 'Xây dựng HTTP server chuẩn với net/http và Chi/Gin.'),
      t('middleware', 'Middleware pattern (logging, panic recovery, security headers), graceful shutdown, cấu trúc project chuẩn idiomatic Go.'),
    ],
    dsa: parseDsa('Trees (Invert Binary Tree, Max Depth of Binary Tree, Diameter of Binary Tree)'),
    reading: "Sách: Let's Go (Alex Edwards) - Ch. 1-6 (Foundations, Routing, Configuration & Middleware)", readingRefs: ['book-lets-go', 'bootdev-go'] },
  { week: 14, phase: 2, topic: 'PostgreSQL, Connection Pools & SQL (Boot.dev)',
    tasks: [
      t('bootdev-sql', "Boot.dev: 'Learn SQL'. Relational Modeling, 3NF, Window functions, CTEs."),
      t('pgx', 'Kết nối Go với PostgreSQL qua pgx / database/sql, quản lý connection pool (SetMaxOpenConns, SetMaxIdleConns).'),
    ],
    dsa: parseDsa('Trees (Balanced Binary Tree, Same Tree, Subtree of Another Tree)'),
    reading: "Sách: Let's Go (Alex Edwards) - Ch. 7-10 (Database-Driven Apps, Dynamic HTML & State)", readingRefs: ['book-lets-go', 'sql-index-luke'] },
  { week: 15, phase: 2, topic: 'RESTful API Architecture & JSON Streaming (Bắt đầu SP2)',
    tasks: [
      t('start-sp2', 'Bắt đầu Side Project 2 theo chuẩn production REST API.'),
      t('json', 'Đọc/ghi JSON streaming an toàn, error handling tập trung, custom validation, cấu trúc project theo dự án Greenlight.'),
    ],
    dsa: parseDsa('Trees (Lowest Common Ancestor of a BST, Binary Tree Level Order Traversal)'),
    reading: "Sách: Let's Go Further (Alex Edwards) - Ch. 1-5 (Structuring API, JSON Encoding/Decoding, Error Handling)", readingRefs: ['book-lets-go-further'],
    milestone: { project: 'p2', kind: 'start' } },
  { week: 16, phase: 2, topic: 'PostgreSQL Migrations, Indexing & sqlc',
    tasks: [
      t('indexing', 'Cơ chế B-Tree, GIN, GiST. Dùng EXPLAIN (ANALYZE, BUFFERS) tối ưu query.'),
      t('sqlc', 'Áp dụng sqlc generate type-safe code từ SQL.'),
      t('migrations', 'Quản lý migrations bằng golang-migrate.'),
    ],
    dsa: parseDsa('Trees (Kth Smallest Element in a BST, Construct Tree from Preorder & Inorder)'),
    reading: "Sách: Let's Go Further (Alex Edwards) - Ch. 6-8 (SQL Migrations, Advanced CRUD, Filtering & Pagination) + Use The Index, Luke!", readingRefs: ['book-lets-go-further', 'sql-index-luke'] },
  { week: 17, phase: 2, topic: 'Rate Limiting & Concurrency Control in Go',
    tasks: [
      t('rate-limit', 'Tự triển khai Token Bucket Rate Limiting (dùng x/time/rate hoặc Redis Lua script).'),
      t('locking', 'Xử lý Concurrency conflicts: Pessimistic Locking (SELECT FOR UPDATE) và Advisory Locks.'),
    ],
    dsa: parseDsa('Tries (Implement Trie, Design Add and Search Words Data Structure)'),
    reading: "Sách: Let's Go Further (Alex Edwards) - Ch. 9 & 10 (Rate Limiting, Graceful Shutdown) + DDIA (Ch. 7)", readingRefs: ['book-lets-go-further', 'book-ddia'] },
  { week: 18, phase: 2, topic: 'Background Goroutines & Safe Task Queues',
    tasks: [
      t('workers', 'Chạy background workers an toàn bằng Goroutines (xử lý panic recovery, tránh goroutine leak).'),
      t('queue', "Boot.dev: 'Learn Pub/Sub'. Tích hợp Asynq / BullMQ cho hàng đợi phân tán."),
    ],
    dsa: parseDsa('Heap / Priority Queue (Kth Largest Element in a Stream, Last Stone Weight)'),
    reading: "Sách: Let's Go Further (Alex Edwards) - Ch. 11 (Sending Emails & Running Background Goroutines Safely)", readingRefs: ['book-lets-go-further', 'bootdev-pubsub'] },
  { week: 19, phase: 2, topic: 'Token Authentication, RBAC & Security',
    tasks: [
      t('auth', 'Triển khai Bearer Token auth (SHA-256), activation tokens, permissions table (RBAC).'),
      t('cors', 'CORS middleware cross-origin cho Next.js, HTTP security headers.'),
    ],
    dsa: parseDsa('Heap / Priority Queue (K Closest Points to Origin, Find Median from Data Stream)'),
    reading: "Sách: Let's Go Further (Alex Edwards) - Ch. 12-14 (User Authentication, Permissions, CORS) + OWASP API Top 10", readingRefs: ['book-lets-go-further'] },
  { week: 20, phase: 2, topic: 'Testing, Production Builds & SP2 Wrap-up',
    tasks: [
      t('testing', 'Table-driven tests trong Go, Testcontainers-Go cho PostgreSQL.'),
      t('build', 'Tối ưu build flags (-ldflags), binary packaging.'),
      t('finish-sp2', 'Hoàn thiện toàn diện Side Project 2.'),
    ],
    dsa: parseDsa('Backtracking (Subsets, Combination Sum, Permutations)'),
    reading: "Sách: Let's Go Further (Alex Edwards) - Ch. 15-18 (Managing Metrics, Building & Deploying) + Learn Go with Tests", readingRefs: ['book-lets-go-further'],
    milestone: { project: 'p2', kind: 'finish' } },

  // Phase 3: Distributed & Cloud
  { week: 21, phase: 3, topic: 'gRPC & High-Performance RPC in Go',
    tasks: [
      t('protobuf', 'Protobuf 3 schema definition, gRPC unary & streaming (client, server, bi-directional) trong Go.'),
      t('benchmark', 'So sánh benchmark latency với REST/JSON.'),
    ],
    dsa: parseDsa('Backtracking (Subsets II, Combination Sum II, Word Search)'),
    reading: 'gRPC: Up and Running (Kasun Indrasiri, Danesh Kuruppu)', readingRefs: ['book-grpc'] },
  { week: 22, phase: 3, topic: 'Microservices & Distributed Patterns',
    tasks: [
      t('outbox', 'Triển khai Transactional Outbox Pattern trong Go, Idempotency key middleware, Circuit Breaker (gobreaker).'),
      t('clean-arch', 'Clean Architecture cho Go microservices.'),
    ],
    dsa: parseDsa('Graphs (Number of Islands, Clone Graph, Max Area of Island)'),
    reading: 'Microservices Patterns (Chris Richardson) - Ch. 3 & 4' },
  { week: 23, phase: 3, topic: 'Distributed Rate Limiter in Go (Bắt đầu SP3)',
    tasks: [
      t('redis-lua', 'Cài đặt thuật toán Token Bucket & Sliding Window Counter bằng Redis Lua script gọi từ Go.'),
      t('load', 'Chịu tải hàng chục ngàn requests không bị race condition.'),
      t('start-sp3', 'Bắt đầu Side Project 3 (URL Shortener & Analytics).'),
    ],
    dsa: parseDsa('Graphs (Pacific Atlantic Water Flow, Surrounded Regions, Course Schedule)'),
    reading: 'System Design Interview (Alex Xu Vol 1 - Ch. 4: Rate Limiter)', readingRefs: ['book-sdi'],
    milestone: { project: 'p3', kind: 'start' } },
  { week: 24, phase: 3, topic: 'AWS Networking & Go Container Deployment',
    tasks: [
      t('vpc', 'VPC, Public/Private Subnets, NAT Gateway, Security Groups.'),
      t('docker', 'Multi-stage Dockerfile cho Go (Scratch/Alpine image < 20MB) deploy lên AWS ECS Fargate.'),
    ],
    dsa: parseDsa('Graphs (Course Schedule II, Graph Valid Tree, Number of Connected Components)'),
    reading: 'AWS Certified Solutions Architect Associate Study Guide (Sybex)', readingRefs: ['aws-terraform'] },
  { week: 25, phase: 3, topic: 'AWS Storage, CDN & Edge Caching',
    tasks: [
      t('s3', 'AWS S3 Go SDK (Presigned URLs upload trực tiếp).'),
      t('cdn', 'CloudFront CDN edge caching, cache invalidation automation.'),
      t('lambda', 'Serverless Lambda with Go custom runtime.'),
    ],
    dsa: parseDsa('1-D Dynamic Programming (Climbing Stairs, Min Cost Climbing Stairs, House Robber)'),
    reading: 'AWS Well-Architected Framework: Performance Efficiency Pillar', readingRefs: ['aws-terraform'] },
  { week: 26, phase: 3, topic: 'Infrastructure as Code (Terraform) & CI/CD',
    tasks: [
      t('terraform', 'Viết Terraform script quản lý VPC, ECS Fargate, RDS PostgreSQL Multi-AZ, ElastiCache Redis.'),
      t('cicd', 'Setup GitHub Actions CI/CD tự động lint (golangci-lint), test, build & deploy.'),
    ],
    dsa: parseDsa('1-D Dynamic Programming (House Robber II, Longest Palindromic Substring)'),
    reading: 'Terraform Up & Running (Yevgeniy Brikman)', readingRefs: ['aws-terraform'] },
  { week: 27, phase: 3, topic: 'Distributed Observability (OpenTelemetry in Go)',
    tasks: [
      t('otel', 'Tích hợp OpenTelemetry Go SDK trace qua các services.'),
      t('logs-metrics', 'Structured Logging với slog/zap, expose Prometheus metrics (/metrics endpoint) & Grafana dashboards.'),
    ],
    dsa: parseDsa('1-D Dynamic Programming (Coin Change, Maximum Product Subarray, Word Break)'),
    reading: 'Observability Engineering (Charity Majors, Liz Fong-Jones)' },
  { week: 28, phase: 3, topic: 'Load Testing, Benchmark & Side Project 3 Wrap-up',
    tasks: [
      t('k6', 'Chạy k6 load test hệ thống Go backend đạt 5.000+ RPS, đo p95 latency < 30ms, kiểm tra memory profile dưới tải cao.'),
      t('finish-sp3', 'Hoàn thiện Side Project 3.'),
    ],
    dsa: parseDsa('1-D Dynamic Programming (Longest Increasing Subsequence, Partition Equal Subset)'),
    reading: 'The Art of Capacity Planning (John Allspaw)',
    milestone: { project: 'p3', kind: 'finish' } },

  // Phase 4: Synthesis & Leadership
  { week: 29, phase: 4, topic: 'AI-Native Engineering & Generative UI (Bắt đầu SP4)',
    tasks: [
      t('sse', 'Next.js kết nối với Go backend qua SSE / Streaming response.'),
      t('ai-sdk', 'Vercel AI SDK on Frontend, Go LLM client xử lý embeddings và streaming responses.'),
      t('start-sp4', 'Bắt đầu Side Project 4 (AI-Native Knowledge Base).'),
    ],
    dsa: parseDsa('2-D Dynamic Programming (Unique Paths, Longest Common Subsequence)'),
    reading: "Vercel AI SDK Guides + Building LLM Applications (O'Reilly)",
    milestone: { project: 'p4', kind: 'start' } },
  { week: 30, phase: 4, topic: 'Vector Search & RAG Architecture',
    tasks: [
      t('pgvector', 'PostgreSQL pgvector extension, sinh embeddings qua Go worker.'),
      t('hybrid', 'Tính Cosine Similarity, cài đặt HNSW index và hybrid search kết hợp full-text search.'),
    ],
    dsa: parseDsa('2-D Dynamic Programming (Best Time to Buy and Sell Stock with Cooldown, Coin Change II)'),
    reading: 'pgvector documentation & Practical RAG Architecture' },
  { week: 31, phase: 4, topic: 'System Design: Fullstack & Distributed Systems',
    tasks: [
      t('editor', 'Thiết kế Collaborative Editor (CRDTs/OT, WebSockets Go backend).'),
      t('flash-sale', 'Thiết kế E-Commerce Flash Sale System (xử lý inventory locking bằng Go + Redis).'),
    ],
    dsa: parseDsa('Greedy (Maximum Subarray, Jump Game, Jump Game II)'),
    reading: 'Frontend System Design (GreatFrontEnd) + Alex Xu Vol 2', readingRefs: ['book-sdi'] },
  { week: 32, phase: 4, topic: 'System Design: Large-scale Messaging & Ingestion',
    tasks: [
      t('chat', 'Thiết kế Realtime Chat System (hàng triệu websocket connections quản lý bằng Go), Notification Pipeline đa kênh.'),
      t('c4', 'Vẽ sơ đồ kiến trúc C4 Model.'),
    ],
    dsa: parseDsa('Intervals (Insert Interval, Merge Intervals, Non-overlapping Intervals)'),
    reading: 'Designing Data-Intensive Applications (DDIA - Ch. 10 & 11: Stream Processing)', readingRefs: ['book-ddia'] },
  { week: 33, phase: 4, topic: 'Technical RFC Writing & Tech Leadership',
    tasks: [
      t('rfc-migration', 'Viết Technical RFC chuẩn FAANG (1): Architecture chuyển dịch từ Node.js Monolith sang Go Modular Services.'),
      t('rfc-sync', 'Viết Technical RFC chuẩn FAANG (2): Đề xuất giải pháp Real-time Data Synchronization.'),
    ],
    dsa: parseDsa('Bit Manipulation (Single Number, Number of 1 Bits, Counting Bits)'),
    reading: 'Staff Engineer (Will Larson - Ch. on RFCs & Technical Leadership)', readingRefs: ['book-staff-engineer'] },
  { week: 34, phase: 4, topic: 'Mock Interview 1: Coding & Algorithms (Go/TS)',
    tasks: [
      t('mock', 'Luyện mock interview 45 phút cho DSA: Giải quyết 2 bài Medium dưới áp lực thời gian, vừa code vừa giải thích Big-O & memory overhead.'),
    ],
    dsa: parseDsa('NeetCode 150 Review Sprint: Reverse Linked List, LRU Cache, Binary Search'),
    reading: 'Cracking the Coding Interview (Gayle Laakmann McDowell)' },
  { week: 35, phase: 4, topic: 'Mock Interview 2: System Design & Go Internals',
    tasks: [
      t('mock', 'Luyện mock System Design (60 phút): Trình bày trade-offs, database indexing, caching strategies.'),
      t('go-internals', 'Go concurrency patterns (Goroutine pool, worker patterns).'),
    ],
    dsa: parseDsa('NeetCode 150 Review Sprint: Merge Intervals, Word Search, Lowest Common Ancestor'),
    reading: 'A Philosophy of Software Design (John Ousterhout)' },
  { week: 36, phase: 4, topic: 'Portfolio, Tech Resume & Go-to-Market',
    tasks: [
      t('portfolio', 'Đóng gói 4 side project (Go backends + Next.js clients) lên GitHub (README chi tiết, C4 diagrams, k6 load test results).'),
      t('apply', 'Tự tin nộp hồ sơ Senior / Lead.'),
    ],
    dsa: parseDsa('NeetCode 150 Final Polish & Blind 75 Revision'),
    reading: 'The Tech Resume Inside Out (Gergely Orosz)',
    milestone: { project: 'p4', kind: 'finish' } },
];

export const RESOURCES: ResourceDef[] = [
  { id: 'bootdev-go', domain: 'Go Foundations', type: 'course', title: 'Boot.dev (Backend in Go track)', author: 'Boot.dev',
    chapters: "Courses: 'Learn Go', 'Learn Go Concurrency', 'Learn HTTP Clients & Servers'",
    goal: 'Làm chủ cú pháp Go, tư duy statically typed, con trỏ, interface và Goroutines/Channels thực chiến.',
    url: 'https://www.boot.dev/tracks/backend-development-golang', weeks: [11, 13] },
  { id: 'bootdev-pubsub', domain: 'Go Foundations', type: 'course', title: 'Boot.dev: Learn Pub/Sub', author: 'Boot.dev',
    chapters: 'Message queues, RabbitMQ / Redis Streams, retry logic',
    goal: 'Chạy background workers và hàng đợi phân tán (Asynq) an toàn, có retry và panic recovery.',
    url: 'https://www.boot.dev/courses/learn-pub-sub-rabbitmq-golang', weeks: [18, 18] },
  { id: 'book-lets-go', domain: 'Go Web Fundamentals', type: 'book', title: "Let's Go", author: 'Alex Edwards',
    chapters: 'Toàn bộ sách: Ch. 1-6 (Foundations, Routing, Middleware) & Ch. 7-10 (Database, HTML Templates, Sessions)',
    goal: 'Học cách dựng Web Server chuẩn mực bằng thư viện chuẩn net/http, viết middleware tự chế và cấu trúc dự án idiomatic Go.',
    url: 'https://lets-go.alexedwards.net/', weeks: [13, 14] },
  { id: 'book-lets-go-further', domain: 'Production Go APIs', type: 'book', title: "Let's Go Further", author: 'Alex Edwards',
    chapters: 'Toàn bộ sách: Ch. 1-5 (JSON/REST APIs), Ch. 6-8 (SQL Migrations, Pagination), Ch. 9-11 (Rate Limiting, Background Tasks), Ch. 12-14 (Tokens, RBAC, CORS), Ch. 15-18 (Metrics, Deployment)',
    goal: 'Cẩm nang cốt lõi hoàn thiện Side Project 2: Production-grade REST API, graceful shutdown, token auth, rate limiting và zero-leak background tasks.',
    url: 'https://lets-go-further.alexedwards.net/', weeks: [15, 20] },
  { id: 'book-concurrency-in-go', domain: 'Go Concurrency', type: 'book', title: 'Concurrency in Go', author: 'Katherine Cox-Buday',
    chapters: "Chương 3 (Go's Concurrency Building Blocks), Chương 4 (Concurrency Patterns in Go: Pipelines, Context, Worker Pool)",
    goal: 'Xây dựng pipelines xử lý dữ liệu song song mượt mà, phòng ngừa goroutine leaks.',
    url: 'https://www.oreilly.com/library/view/concurrency-in-go/9781491941294/', weeks: [12, 16] },
  { id: 'book-ddia', domain: 'Databases & Storage', type: 'book', title: 'Designing Data-Intensive Applications (DDIA)', author: 'Martin Kleppmann',
    chapters: 'Chương 3 (Storage & Indexes), Chương 7 (Transactions), Chương 8 (The Trouble with Distributed Systems)',
    goal: 'Hiểu sâu về LSM-Trees, B-Trees, transaction isolation levels (ACID) và phân tán dữ liệu.',
    url: 'https://dataintensive.net/', weeks: [14, 17] },
  { id: 'sql-index-luke', domain: 'Database Optimization', type: 'docs', title: 'Use The Index, Luke! & Boot.dev SQL', author: 'Markus Winand / Boot.dev',
    chapters: "Boot.dev: 'Learn SQL' + Các chương Index anatomy, WHERE clause, Multi-column indexes",
    goal: 'Tối ưu query PostgreSQL với EXPLAIN ANALYZE, làm chủ sqlc để gen type-safe Go code.',
    url: 'https://use-the-index-luke.com/', weeks: [14, 16] },
  { id: 'book-grpc', domain: 'Distributed Systems', type: 'book', title: 'gRPC: Up and Running', author: 'Kasun Indrasiri & Danesh Kuruppu',
    chapters: 'Chương 2 (Service Definition), Chương 3 (gRPC Communication Patterns), Chương 4 (Under the Hood: HTTP/2)',
    goal: 'Thiết kế RPC APIs tốc độ cao kết nối các Go microservices qua binary Protobuf.',
    url: 'https://www.oreilly.com/library/view/grpc-up-and/9781492058328/', weeks: [21, 21] },
  { id: 'book-sdi', domain: 'System Design', type: 'book', title: "System Design Interview – An Insider's Guide (Vol 1 & 2)", author: 'Alex Xu',
    chapters: 'Vol 1: Ch. 4 (Rate Limiter), Ch. 6 (Key-Value Store). Vol 2: Ch. 2 (Distributed Message Queue), Ch. 4 (Payment System)',
    goal: 'Rèn luyện kỹ năng thiết kế hệ thống phân tán quy mô lớn, phân tích bottleneck và trade-offs.',
    url: 'https://bytebytego.com/', weeks: [23, 32] },
  { id: 'aws-terraform', domain: 'Cloud & DevOps', type: 'docs', title: 'AWS Well-Architected Framework & Terraform', author: 'AWS / Yevgeniy Brikman',
    chapters: "Whitepapers: Reliability & Performance Efficiency + Sách: 'Terraform Up & Running'",
    goal: 'Tự tay quản lý hạ tầng đám mây AWS bằng mã (IaC), deploy Go containers tự phục hồi.',
    url: 'https://aws.amazon.com/architecture/well-architected/', weeks: [24, 28] },
  { id: 'book-staff-engineer', domain: 'Engineering Leadership', type: 'book', title: 'Staff Engineer', author: 'Will Larson',
    chapters: 'Các chương: Technical Lead Archetypes, Operating at Senior/Staff Level, Writing Architecture RFCs',
    goal: 'Kỹ năng đề xuất giải pháp kỹ thuật có sức ảnh hưởng, dẫn dắt team và bảo vệ phương án kiến trúc.',
    url: 'https://staffeng.com/book', weeks: [33, 36] },
];

const req = (id: string, title: string): ProjectMilestoneDef => ({ id, title, kind: 'requirement' });
const del = (id: string, title: string): ProjectMilestoneDef => ({ id, title, kind: 'deliverable' });

export const PROJECTS: ProjectDef[] = [
  { id: 'p1', number: 1, title: 'Enterprise Headless Design System & High-Performance Data Grid', tag: 'Senior Frontend', weeks: [5, 10],
    problem: 'Giải quyết bài toán render bảng dữ liệu 100.000 dòng mượt mà, hỗ trợ keyboard navigation, sorting, inline edit theo chuẩn WCAG 2.1 AA.',
    stack: 'React 19, TypeScript, Tailwind CSS, Radix UI Primitives, TanStack Virtual, Storybook, Playwright',
    milestones: [
      req('headless', 'Không dùng UI component library trọn gói; tự dựng kiến trúc headless.'),
      req('recycling', 'DOM recycling mượt mà ở 60fps khi scroll nhanh.'),
      req('aria', 'WAI-ARIA role grid, full keyboard accessible.'),
      req('bundle', 'Tree-shakeable, bundle size < 35KB gzipped.'),
      del('storybook', 'Storybook live preview deploy Vercel'),
      del('benchmark', 'Báo cáo benchmark hiệu năng so với MUI/AntD'),
      del('docs', 'Tài liệu hướng dẫn tích hợp component'),
    ] },
  { id: 'p2', number: 2, title: 'Distributed Task Scheduler & Production REST API in Go (Greenlight Pattern)', tag: 'Backend Golang', weeks: [15, 20],
    problem: "Xây dựng dịch vụ quản lý cron jobs và gửi notification đa kênh (Email, Push, Webhooks) chuẩn kiến trúc 'Let's Go Further'.",
    stack: 'Golang (Go 1.22+), Chi router, PostgreSQL, pgx, sqlc, Redis, Asynq, Docker Compose, Mailtrap',
    milestones: [
      req('idiomatic', "Kiến trúc idiomatic Go chuẩn Let's Go Further: Graceful shutdown, panic recovery cho background goroutines."),
      req('no-double-exec', 'Tránh double-execution bằng PostgreSQL Advisory Locks & Redis Mutex.'),
      req('auth', 'Token-based authentication, RBAC permissions, và Rate Limiting bằng Token Bucket.'),
      req('migrations-tests', 'Zero-downtime database migrations và integration test qua Testcontainers Go.'),
      del('repo', 'GitHub repo Go chuẩn Clean Architecture'),
      del('openapi', 'Swagger / OpenAPI doc đầy đủ'),
      del('crash-test', 'Kịch bản test giả lập crash server và worker tự khôi phục'),
    ] },
  { id: 'p3', number: 3, title: 'High-Throughput Distributed URL Shortener & Analytics in Go', tag: 'Distributed & Cloud', weeks: [23, 28],
    problem: 'Hệ thống rút gọn link quy mô lớn chịu tải 5.000+ RPS, thu thập log click thời gian thực qua Message Queue và phân tích analytics độ trễ thấp.',
    stack: 'Golang, gRPC, Protobuf, Redis (Lua scripts), Redis Streams / Kafka, PostgreSQL Sharded, AWS ECS Fargate, CloudFront, Terraform',
    milestones: [
      req('base62', 'Thuật toán Base62 ID Generator phân tán (Snowflake ID).'),
      req('cache', 'Cache đa tầng (CDN -> Redis -> PostgreSQL) + Go Singleflight chống Cache Stampede.'),
      req('ingestion', 'Asynchronous click ingestion qua Redis Streams / Kafka worker.'),
      req('terraform', 'Toàn bộ hạ tầng AWS deploy bằng Terraform.'),
      del('terraform-code', 'Terraform code hạ tầng AWS hoàn chỉnh'),
      del('k6-report', 'Báo cáo k6 load test p95 latency < 30ms ở mức 5k RPS'),
      del('c4', 'Sơ đồ kiến trúc System Design chuẩn C4 Model'),
    ] },
  { id: 'p4', number: 4, title: 'AI-Native Collaborative Knowledge Base (Go Backend + Next.js)', tag: 'Synthesis & Leadership', weeks: [29, 36],
    problem: 'Nền tảng quản lý tài liệu thông minh hỗ trợ hỏi đáp qua vector search (RAG) và giao diện sinh động bằng Generative UI streaming.',
    stack: 'Next.js App Router (Frontend), Golang (Backend API), PostgreSQL + pgvector, OpenAI / Claude API, SSE / WebSockets, Docker, AWS',
    milestones: [
      req('sse', 'Go Backend stream chunks câu trả lời và events qua Server-Sent Events (SSE).'),
      req('vector-pipeline', 'Vector search pipeline: chunking tài liệu, sinh embeddings và hybrid search trên PostgreSQL.'),
      req('generative-ui', 'Frontend hiển thị Generative UI tương ứng với tool call từ LLM.'),
      req('rbac', 'Phân quyền RBAC cho workspace nhiều thành viên.'),
      del('live-app', 'Live web application production'),
      del('rfc', 'Bản Technical RFC thuyết minh kiến trúc và trade-offs'),
      del('video', 'Video 3 phút demo giải thích kiến trúc cho nhà tuyển dụng'),
    ] },
];

export const weekDef = (n: number): WeekDef => WEEKS[n - 1];
export const phaseOfWeek = (n: number): Phase => PHASES.find((p) => n >= p.weeks[0] && n <= p.weeks[1]) ?? PHASES[0];
export const phaseById = (id: number): Phase => PHASES.find((p) => p.id === id) ?? PHASES[0];
export const projectById = (id: ProjectId): ProjectDef => PROJECTS.find((p) => p.id === id) ?? PROJECTS[0];
export const resourceById = (id: string): ResourceDef | undefined => RESOURCES.find((r) => r.id === id);
