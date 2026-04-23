import mysql from "mysql2/promise";

function getPoolConfig(): mysql.PoolOptions {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("mysql://")) {
    throw new Error("DATABASE_URL must be a mysql://... connection string");
  }
  const u = new URL(url);
  const database = u.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_URL must include a database name in the path");
  }
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: u.password != null && u.password !== "" ? decodeURIComponent(u.password) : undefined,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
  };
}

const globalForPool = globalThis as unknown as { mysqlPool: mysql.Pool | undefined };

function createPool(): mysql.Pool {
  return mysql.createPool(getPoolConfig());
}

export function getPool(): mysql.Pool {
  if (!globalForPool.mysqlPool) {
    globalForPool.mysqlPool = createPool();
  }
  return globalForPool.mysqlPool;
}

export default getPool;
