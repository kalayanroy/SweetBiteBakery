/**
 * Script to fix usernames by trimming whitespace
 * Run this with: npx tsx server/fixUsernames.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';

async function fixUsernames() {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        console.error("❌ DATABASE_URL not found!");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
            ? false
            : { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("✅ Connected to database\n");

        // Get all users
        const result = await client.query('SELECT id, username, email FROM users');

        console.log("📋 Current users:");
        result.rows.forEach(user => {
            console.log(`ID: ${user.id}, Username: "${user.username}", Email: ${user.email}`);
        });

        // Update usernames to trim whitespace
        console.log("\n🔧 Trimming usernames...");
        await client.query('UPDATE users SET username = TRIM(username)');
        await client.query('UPDATE users SET email = TRIM(email)');

        // Get updated users
        const updatedResult = await client.query('SELECT id, username, email FROM users');

        console.log("\n✅ Updated users:");
        updatedResult.rows.forEach(user => {
            console.log(`ID: ${user.id}, Username: "${user.username}", Email: ${user.email}`);
        });

        client.release();
        console.log("\n✅ Done!");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }

    process.exit(0);
}

fixUsernames();
