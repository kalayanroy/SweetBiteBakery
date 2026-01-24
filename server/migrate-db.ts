
import pg from 'pg';
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

async function migrate() {
    console.log("--- RUNNING MIGRATION ---");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        console.log("Checking 'users' table columns...");
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);

        const columns = res.rows.map(r => r.column_name);
        console.log("Current columns:", columns.join(", "));

        if (!columns.includes('role')) {
            console.log("⚠️  Column 'role' missing! Adding it...");
            await client.query(`ALTER TABLE users ADD COLUMN role text DEFAULT 'customer' NOT NULL`);
            console.log("✅ Column 'role' added successfully!");
        } else {
            console.log("✅ Column 'role' already exists.");
        }

        client.release();
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
