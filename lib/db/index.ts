/**
 * MySQL (mysql2) — havuz + modül bazlı sorgular.
 * Yeni tablolar için `lib/db/<alan>.ts` ekleyin; `pool` tek kaynak.
 */
export { getPool, default } from "./pool";
export * from "./company";
export * from "./note";
export * from "./document-ingest";
