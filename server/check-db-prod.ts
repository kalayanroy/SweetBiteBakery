
import pg from 'pg';
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();
import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');

async function checkConnection() {
    console.log("--- PROD DB CONNECTION CHECK ---");
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
        console.error("❌ DATABASE_URL missing");
        process.exit(1);
    }

    console.log(`Connecting to: ${DATABASE_URL.split('@')[1]}`); // Log host only

    const pool = new Pool({
        connectionString: DATABASE_URL,
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("✅ Socket Connected!");
        const res = await client.query('SELECT NOW() as time, version()');
        console.log(`✅ Query OK! Time: ${res.rows[0].time}`);
        console.log(`ℹ️  Version: ${res.rows[0].version}`);
        client.release();
        await pool.end();
        console.log("--------------------------------");
        process.exit(0);
    } catch (err: any) {
        console.error("❌ CONNECTION FAILED");
        console.error(err);
        process.exit(1);
    }
}

checkConnection();
