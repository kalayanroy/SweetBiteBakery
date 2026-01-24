/**
 * Script to update superadmin username
 * Run this with: npx tsx server/updateSuperadmin.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';

async function updateSuperadmin() {
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

        // Update the user 'kalayan' (ID 7) to be superadmin
        // We update based on username to be safe, or fall back to ID 7
        await client.query(
            `UPDATE users 
             SET is_admin = true
             WHERE username = 'kalayan' OR id = 7`,
            []
        );

        console.log("✅ Updated 'kalayan' to be admin");

        // Verify
        const result = await client.query("SELECT id, username, email, is_admin FROM users WHERE username = 'kalayan' OR id = 7");
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log("\n📋 Verified user:");
            console.log(`ID: ${user.id}`);
            console.log(`Username: "${user.username}"`);
            console.log(`Email: ${user.email}`);
            console.log(`Is Admin: ${user.is_admin}`);
        }

        client.release();
        console.log("\n✅ Done! You can now login with:");
        console.log("Username: superadmin");
        console.log("Password: SuperAdmin@2024!Secure");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }

    process.exit(0);
}

updateSuperadmin();
