/**
 * Script to check and update user passwords in the database
 * Run this with: npx tsx server/checkUsers.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';

async function checkUsers() {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        console.error("❌ DATABASE_URL not found in environment variables!");
        process.exit(1);
    }

    console.log("🔗 Connecting to database...");
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
            ? false
            : { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("✅ Database connection successful!\n");

        // Get all users
        const query = 'SELECT id, username, email, password, is_admin, created_at FROM users ORDER BY id';
        const result = await client.query(query);

        if (result.rows.length === 0) {
            console.log("⚠️  No users found in database!");
        } else {
            console.log("📋 Users in database:");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            result.rows.forEach(user => {
                console.log(`ID: ${user.id}`);
                console.log(`Username: ${user.username}`);
                console.log(`Email: ${user.email}`);
                console.log(`Password: ${user.password}`);
                console.log(`Is Admin: ${user.is_admin}`);
                console.log(`Created: ${user.created_at}`);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            });

            console.log("\n🔧 Updating passwords to match auth.ts expectations...\n");

            // Update superadmin password
            const superadminExists = result.rows.find(u => u.username === 'superadmin');
            if (superadminExists) {
                await client.query(
                    'UPDATE users SET password = $1 WHERE username = $2',
                    ['SuperAdmin@2024!Secure', 'superadmin']
                );
                console.log("✅ Updated superadmin password to: SuperAdmin@2024!Secure");
            }

            // Update admin password
            const adminExists = result.rows.find(u => u.username === 'admin');
            if (adminExists) {
                await client.query(
                    'UPDATE users SET password = $1 WHERE username = $2',
                    ['admin123', 'admin']
                );
                console.log("✅ Updated admin password to: admin123");
            }

            // Ensure they are admins
            await client.query(
                'UPDATE users SET is_admin = true WHERE username IN ($1, $2)',
                ['superadmin', 'admin']
            );
            console.log("✅ Ensured both users have admin privileges");

            console.log("\n✅ All done! You can now login with:");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("Username: superadmin | Password: SuperAdmin@2024!Secure");
            console.log("Username: admin      | Password: admin123");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }

        client.release();

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }

    process.exit(0);
}

// Run the script
checkUsers();
