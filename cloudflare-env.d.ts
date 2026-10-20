declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
declare namespace Cloudflare { interface Env { AI_CONFIG_ENCRYPTION_KEY?: string; } }

declare namespace Cloudflare {interface Env { AURORA_OWNER_EMAIL?: string; }}
