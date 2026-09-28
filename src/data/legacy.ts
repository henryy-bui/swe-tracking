/* Where progress saved under the pre-v3 positional keys goes now.
   v2 keyed roadmap tasks by index ("w15-2"), project milestones by index ("p2-m4") and had separate
   Boot.dev course resources. Each entry maps an old key to its new key, or to null when the old item
   has no counterpart (the tick is dropped). Never delete entries: migrateData runs on every load,
   import and cloud pull, and an old device may still push a v2 document. */

export const LEGACY_TASK_RE = /^w(\d+)-(\d+)$/;
export const LEGACY_MS_RE = /^(p\d)-m(\d+)$/;

export const LEGACY_TASK_MAP: Record<string, string | null> = {
  'w1-0': 'w1-reconcile', 'w1-1': 'w1-mini-react',
  'w2-0': 'w2-hooks', 'w2-1': 'w2-rerender',
  'w3-0': 'w3-pipeline', 'w3-1': 'w3-vitals',
  'w4-0': 'w4-heap-snapshot', 'w4-1': 'w4-leaks',
  'w5-0': 'w5-patterns', 'w5-1': 'w5-start-sp1',
  'w6-0': 'w6-grid', 'w6-1': 'w6-fps',
  'w7-0': 'w7-rsc', 'w7-1': 'w7-streaming',
  'w8-0': 'w8-cache-layers', 'w8-1': 'w8-server-actions',
  'w9-0': 'w9-query', 'w9-1': 'w9-local-state',
  'w10-0': 'w10-testing', 'w10-1': 'w10-finish-sp1',
  'w11-0': 'w11-bootdev-go', 'w11-1': 'w11-memory',
  'w12-0': 'w12-bootdev-concurrency', 'w12-1': 'w12-context',
  'w13-0': 'w13-server', 'w13-1': 'w13-middleware',
  'w14-0': 'w14-bootdev-sql', 'w14-1': 'w14-pgx',
  'w15-0': 'w15-json', 'w15-1': 'w16-sqlc', 'w15-2': 'w15-start-sp2',
  'w16-0': 'w16-migrations', 'w16-1': 'w17-locking',
  'w17-0': 'w17-rate-limit', 'w17-1': null, // Redis cache-aside moved into project 3's requirements
  'w18-0': 'w18-workers', 'w18-1': 'w18-queue',
  'w19-0': 'w19-auth', 'w19-1': 'w19-cors',
  'w20-0': 'w20-build', 'w20-1': 'w20-finish-sp2',
  'w21-0': 'w21-protobuf', 'w21-1': 'w21-benchmark',
  'w22-0': 'w22-outbox', 'w22-1': 'w22-outbox',
  'w23-0': 'w23-redis-lua', 'w23-1': 'w23-start-sp3',
  'w24-0': 'w24-vpc', 'w24-1': 'w24-docker',
  'w25-0': 'w25-s3', 'w25-1': 'w25-cdn',
  'w26-0': 'w26-terraform', 'w26-1': 'w26-cicd',
  'w27-0': 'w27-otel', 'w27-1': 'w27-logs-metrics',
  'w28-0': 'w28-k6', 'w28-1': 'w28-finish-sp3',
  'w29-0': 'w29-sse', 'w29-1': 'w29-ai-sdk', 'w29-2': 'w29-start-sp4',
  'w30-0': 'w30-pgvector', 'w30-1': 'w30-hybrid',
  'w31-0': 'w31-editor', 'w31-1': 'w31-flash-sale',
  'w32-0': 'w32-chat', 'w32-1': 'w32-c4',
  'w33-0': 'w33-rfc-migration', 'w33-1': 'w33-rfc-sync',
  'w34-0': 'w34-mock', 'w34-1': 'w34-dsa',
  'w35-0': 'w35-mock', 'w35-1': 'w35-go-internals',
  'w36-0': 'w36-portfolio', 'w36-1': 'w36-apply',
};

export const LEGACY_MILESTONE_MAP: Record<string, string | null> = {
  'p1-m0': 'p1-headless', 'p1-m1': 'p1-recycling', 'p1-m2': 'p1-aria', 'p1-m3': 'p1-headless', 'p1-m4': null, 'p1-m5': 'p1-docs',
  'p2-m0': 'p2-idiomatic', 'p2-m1': 'p2-migrations-tests', 'p2-m2': 'p2-no-double-exec', 'p2-m3': 'p2-auth', 'p2-m4': null, 'p2-m5': 'p2-auth', 'p2-m6': null,
  'p3-m0': null, 'p3-m1': null, 'p3-m2': 'p3-cache', 'p3-m3': 'p3-terraform', 'p3-m4': 'p3-terraform', 'p3-m5': null, 'p3-m6': 'p3-k6-report',
  'p4-m0': 'p4-sse', 'p4-m1': 'p4-generative-ui', 'p4-m2': 'p4-vector-pipeline', 'p4-m3': 'p4-vector-pipeline', 'p4-m4': 'p4-live-app',
};

/* Old resource id -> the resource that now covers it. */
export const LEGACY_RESOURCE_MAP: Record<string, string> = {
  'bootdev-go-concurrency': 'bootdev-go',
  'bootdev-sql': 'sql-index-luke',
};
