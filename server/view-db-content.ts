
import pg from 'pg';
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

async function listUsers() {
    console.log("--- VPS DATABASE USER CHECK ---");
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();

        // List Tables
        console.log("\n[ Tables in Database ]");
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        tables.rows.forEach(row => console.log(`- ${row.table_name}`));

        // List Users
        console.log("\n[ Users Table Data ]");
        const res = await client.query('SELECT id, username, email, is_admin, role, created_at FROM users');

        if (res.rows.length === 0) {
            console.log("⚠️  No users found in database!");
        } else {
            console.table(res.rows);
        }

        // Check password for 'kalayan'
        const user = await client.query("SELECT password FROM users WHERE username = 'kalayan'");
        if (user.rows.length > 0) {
            console.log("\n[ Password Verification for 'kalayan' ]");
            console.log(`Stored Password: ${user.rows[0].password}`);
        }

        client.release();
    } catch (err) {
        console.error("❌ Error querying database:", err);
    } finally {
        await pool.end();
    }
}

listUsers();
