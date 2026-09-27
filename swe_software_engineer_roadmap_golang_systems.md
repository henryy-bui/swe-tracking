# SWE Roadmap: Frontend to Software Engineer (Golang, Systems & AI)
**Mục tiêu:** Chuyển dịch từ Middle Frontend lên Senior Fullstack/Software Engineer trong 36 tuần (9 tháng) với trọng tâm là Hệ thống phân tán, AWS, và Backend Golang (Boot.dev + Alex Edwards).

---

## 📌 TAB 1: WEEKLY CHECKLIST (36 TUẦN)

### Phase 1: Senior Frontend Mastery & Performance (Tuần 1 - 10)
*Trọng tâm: React Internals, Web Vitals, Headless UI & Next.js App Router.*

| Tuần | Chủ đề | Nhiệm vụ / Checklist | Bổ trợ (DSA / Tài liệu) |
| :--- | :--- | :--- | :--- |
| **Tuần 1** | React Internals & Fiber | - Đào sâu cơ chế Reconciliation, Virtual DOM vs Fiber tree.<br>- Tự build mini-React (Fiber + render loop). | DSA: Arrays & Hashing (Two Sum, Valid Anagram) |
| **Tuần 2** | React Concurrent Mode | - Làm chủ `useTransition`, `useDeferredValue`.<br>- Tối ưu state scheduling, fix re-render thừa. | DSA: Arrays & Hashing (Group Anagrams, Top K) |
| **Tuần 3** | Browser Rendering & Vitals | - DOM, CSSOM, Layout, Paint, Composite.<br>- Đo đạc & tối ưu LCP, INP, CLS. | DSA: Two Pointers (3Sum, Two Sum II) |
| **Tuần 4** | Memory & Profiling | - Dùng Memory Heap Snapshot & Allocation timeline.<br>- Phát hiện/fix closure leaks, detached DOM nodes. | DSA: Two Pointers (Trapping Rain Water) |
| **Tuần 5** | Design Systems & Headless | - Compound Components, Slot/Polymorphic pattern.<br>- **Bắt đầu Side Project 1** (WAI-ARIA, Keyboard nav). | DSA: Sliding Window căn bản |
| **Tuần 6** | High Performance UI | - Tự viết Virtualized List/Table component.<br>- Xử lý 100k dòng ở 60fps, tối ưu DOM recycling. | DSA: Sliding Window nâng cao |
| **Tuần 7** | Next.js RSC & Streaming | - Phân tích RSC wire format, Server vs Client boundary.<br>- Streaming SSR với Suspense boundaries. | DSA: Stack (Min Stack, Valid Parentheses) |
| **Tuần 8** | Next.js Caching & Actions | - Kiểm soát 4 tầng cache của App Router.<br>- Server Actions kết hợp Optimistic UI. | DSA: Stack (Daily Temperatures, Car Fleet) |
| **Tuần 9** | Server State Sync | - TanStack Query deep dive (staleTime, structural sharing).<br>- So sánh chiến lược Caching vs Local State (Zustand). | DSA: Binary Search (Search in 2D Matrix) |
| **Tuần 10** | Testing & Đóng gói | - Unit test (Testing Library) & E2E test (Playwright).<br>- **Hoàn thiện Side Project 1**. | DSA: Binary Search (Rotated Array) |

### Phase 2: Golang Backend Core (Tuần 11 - 20)
*Trọng tâm: Boot.dev track Go, PostgreSQL Deep Dive, Transactions & Let's Go / Let's Go Further.*

| Tuần | Chủ đề | Nhiệm vụ / Checklist | Bổ trợ (DSA / Tài liệu) |
| :--- | :--- | :--- | :--- |
| **Tuần 11** | Go Fundamentals & Memory | - Boot.dev: Pointers, Slice internals, Structs, Interfaces.<br>- Hiểu Escape Analysis (Stack vs Heap). | DSA: Linked List (Reverse, Merge) |
| **Tuần 12** | Go Concurrency Deep Dive | - Boot.dev: Goroutines, Channels, WaitGroup, Mutex.<br>- Làm chủ `context.Context` (Cancellation, Deadlines). | DSA: Linked List (Remove Nth Node) |
| **Tuần 13** | Web Server & Let's Go (Ch1-6) | - *Let's Go:* Dựng server `net/http`, middleware, routing.<br>- Graceful shutdown server chuẩn Unix signal. | DSA: Trees (Invert, Max Depth) |
| **Tuần 14** | PostgreSQL & Let's Go (Ch7-10) | - Boot.dev SQL: 3NF, Window functions, CTEs.<br>- *Let's Go:* Kết nối pgx, Connection pool, HTML Templates. | DSA: Trees (Balanced, Subtree) |
| **Tuần 15** | REST API & Let's Go Further (1-5)| - *Let's Go Further:* Structuring REST API, JSON Encoding an toàn.<br>- Tích hợp công cụ `sqlc` gen code type-safe.<br>- **Bắt đầu Side Project 2.** | DSA: Trees (Lowest Common Ancestor) |
| **Tuần 16** | Migrations & Let's Go Further (6-8) | - *Let's Go Further:* SQL Migrations, Advanced CRUD, Pagination.<br>- Transactions, Pessimistic Locking, Advisory Locks. | DSA: Trees (Kth Smallest Element) |
| **Tuần 17** | Rate Limit & Let's Go Further (9-10)| - *Let's Go Further:* Tự cài Rate Limiter (Token Bucket).<br>- Redis Cache-aside, chống Cache Stampede với `singleflight`. | DSA: Tries (Implement Trie) |
| **Tuần 18** | Pub/Sub & Let's Go Further (11)| - *Let's Go Further:* Background Goroutines an toàn.<br>- Boot.dev Pub/Sub: Redis Queue (`hibiken/asynq`), Retry logic. | DSA: Priority Queue (K Closest Points) |
| **Tuần 19** | Auth & Let's Go Further (12-14) | - *Let's Go Further:* Bearer Tokens, SHA-256, User Activation.<br>- RBAC Permissions middleware, CORS. | DSA: Heap (Median from Data Stream) |
| **Tuần 20** | Testing, Prod & Đóng gói | - *Let's Go Further (15-18):* Metrics, Compile `-ldflags`.<br>- **Hoàn thiện Side Project 2**. | DSA: Backtracking (Subsets, Permut.) |

### Phase 3: Distributed Systems & AWS (Tuần 21 - 28)
*Trọng tâm: gRPC, Hệ thống phân tán, AWS Networking/ECS và Terraform.*

| Tuần | Chủ đề | Nhiệm vụ / Checklist | Bổ trợ (DSA / Tài liệu) |
| :--- | :--- | :--- | :--- |
| **Tuần 21** | gRPC & RPC Performance | - Định nghĩa Schema Protobuf 3, sinh mã Go.<br>- Unary & Streaming gRPC, benchmark vs REST. | DSA: Backtracking (Word Search) |
| **Tuần 22** | Microservices Patterns | - Transactional Outbox Pattern, Idempotency key.<br>- Circuit Breaker (`sony/gobreaker`). | DSA: Graphs (Islands, Clone Graph) |
| **Tuần 23** | Distributed Rate Limiting | - Token Bucket bằng Redis Lua Script (Atomic).<br>- **Bắt đầu Side Project 3**. | DSA: Graphs (Pacific Atlantic, Courses) |
| **Tuần 24** | AWS Networking & Containers | - Cấu hình VPC, Subnets, Security Groups, NAT Gateway.<br>- Multi-stage Dockerfile (<15MB), deploy ECS Fargate. | DSA: Graphs (Course Schedule II) |
| **Tuần 25** | AWS Storage, CDN & Edge | - AWS S3 Go SDK (Presigned URL).<br>- CloudFront edge caching & invalidation. | DSA: 1-D DP (Climbing Stairs) |
| **Tuần 26** | Infrastructure as Code (IaC) | - Viết Terraform script cho VPC, ECS, RDS.<br>- GitHub Actions CI/CD pipeline. | DSA: 1-D DP (Longest Palindromic) |
| **Tuần 27** | Distributed Observability | - OpenTelemetry Go SDK tracing.<br>- Structured Logging (`slog`), Prometheus metrics. | DSA: 1-D DP (Coin Change, Max Prod) |
| **Tuần 28** | Load Testing & Đóng gói | - Chạy k6 load test đạt 5.000+ RPS, tối ưu latency.<br>- **Hoàn thiện Side Project 3**. | DSA: 1-D DP (Longest Increasing Sub) |

### Phase 4: AI-Native, System Design & Leadership (Tuần 29 - 36)
*Trọng tâm: RAG với pgvector, Generative UI, System Design Masterclass, Mock Interview.*

| Tuần | Chủ đề | Nhiệm vụ / Checklist | Bổ trợ (DSA / Tài liệu) |
| :--- | :--- | :--- | :--- |
| **Tuần 29** | AI-Native Streaming | - API streaming bằng Go (Server-Sent Events).<br>- Vercel AI SDK render Generative UI mượt mà.<br>- **Bắt đầu Side Project 4**. | DSA: 2-D DP (Unique Paths) |
| **Tuần 30** | Vector Search & RAG | - PostgreSQL `pgvector`, sinh embeddings qua Go worker.<br>- Tính Cosine Similarity, HNSW index, hybrid search. | DSA: 2-D DP (Coin Change II) |
| **Tuần 31** | System Design (Fullstack) | - Thiết kế Collaborative Editor (CRDT/OT, WebSockets).<br>- Thiết kế Flash Sale System (inventory locking, Redis). | DSA: Greedy (Max Subarray) |
| **Tuần 32** | System Design (Data Streams)| - Thiết kế Real-time Chat (Go WebSockets).<br>- Thiết kế Notification Pipeline, vẽ sơ đồ C4 Model. | DSA: Intervals (Merge, Insert) |
| **Tuần 33** | Tech RFC & Leadership | - Viết RFC: Migration sang Go Microservices.<br>- Viết RFC: Giải pháp Real-time Data Sync. | DSA: Bit Manipulation |
| **Tuần 34** | Mock Interview Round 1 | - Giải 2 bài Medium dưới 45 phút, giải thích Big-O.<br>- NeetCode 150 Sprint: Reverse LL, LRU Cache. | Interview Prep |
| **Tuần 35** | Mock Interview Round 2 | - Mock System Design 60 phút: DB indexing, caching.<br>- Giải thích sâu Go memory model, goroutine pool. | Interview Prep |
| **Tuần 36** | Go-to-Market & Portfolio | - Đóng gói 4 side projects lên GitHub (Demo, C4 Diagram).<br>- Tối ưu CV nhấn mạnh throughput, Fullstack/Lead. | NeetCode 150 Final Revision |

---

## 📚 TAB 2: READING & RESOURCES (GOLANG FOCUS)

### 1. Boot.dev Platform
*   **Learn Go:** Cú pháp, Pointers, Slices, Structs, Interfaces.
*   **Learn Go Concurrency:** Goroutines, Channels, Mutexes, Select.
*   **Learn SQL:** Relational DB, PostgreSQL, Window Functions, CTEs.
*   **Learn Pub/Sub:** Message queues, RabbitMQ/Redis Streams concepts.

### 2. Sách tiêu chuẩn (Bắt buộc)
*   **Let's Go (Alex Edwards):** Cẩm nang dựng Web Server chuẩn mực từ số 0 với thư viện chuẩn `net/http`. Học cách cấu trúc project, routing, template và middleware đúng kiểu Go.
*   **Let's Go Further (Alex Edwards):** Kinh thánh xây dựng Production-grade REST API. Chứa mọi pattern thực tế: Token Bucket rate limit, graceful shutdown, migrations, password hashing an toàn, CORS, deployment.
*   **Designing Data-Intensive Applications (DDIA - Martin Kleppmann):** Bắt buộc đọc để hiểu sâu về Transactions, Isolation Levels, Replication và Partitioning.
*   **System Design Interview (Alex Xu - Vol 1 & 2):** Khung tư duy thiết kế hệ thống phân tán chịu tải cao.

---

## 🚀 TAB 3: SIDE PROJECTS (4 DỰ ÁN THỰC CHIẾN)

### 1. Enterprise Headless Data Grid (Frontend & Performance)
*   **Mục tiêu:** Chứng minh năng lực tối ưu DOM, Web Vitals và Design Systems.
*   **Yêu cầu:** Render mượt mà 100.000 dòng dữ liệu (DOM Recycling), hỗ trợ đầy đủ WAI-ARIA (Keyboard navigation), không phụ thuộc UI Framework bên ngoài. Áp dụng Compound Components.

### 2. Distributed Task Scheduler & REST API (Golang Backend)
*   **Mục tiêu:** Áp dụng toàn bộ sách *Let's Go Further* & Boot.dev vào thực tế.
*   **Yêu cầu:** Viết bằng Go thuần. Tự build hệ thống Rate Limiting. Sử dụng PostgreSQL với `sqlc` và transactions chặn Race Conditions (Advisory Locks). Chạy background workers với Redis Queue (Asynq) xử lý retry logic.

### 3. High-Throughput URL Shortener (AWS Cloud & Systems)
*   **Mục tiêu:** Vận hành hệ thống phân tán tải cao (5000+ RPS).
*   **Yêu cầu:** gRPC hoặc REST API backend cực nhẹ. Cache dữ liệu bằng Redis và CloudFront. Triển khai bằng Terraform (VPC, ECS Fargate). Tích hợp load testing (k6) và OpenTelemetry tracing.

### 4. AI-Enhanced Workflow / RAG Platform (Generative AI)
*   **Mục tiêu:** Đón đầu xu hướng AI-Native.
*   **Yêu cầu:** Kết hợp Next.js (Frontend UI streaming) và Go Backend. Lưu trữ vector embeddings bằng `pgvector` trong PostgreSQL. Thiết kế luồng Hybrid Search (Semantic + Full-text) và trả kết quả realtime qua Server-Sent Events (SSE).