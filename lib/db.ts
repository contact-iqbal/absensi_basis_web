import mysql from "mysql2/promise";

// Mendefinisikan tipe untuk global scope agar tidak error di TypeScript
const globalForPool = global as unknown as {
  pool: mysql.Pool | undefined;
};

// Membuat pool koneksi
export const pool =
  globalForPool.pool ??
  mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

// Helper function untuk eksekusi query
export async function query({
  query,
  values,
}: {
  query: string;
  values?: any[];
}) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
