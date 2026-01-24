/**
 * Script to add users directly to the PostgreSQL database
 * Run this with: npx tsx server/createDbUsers.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { Pool } from 'pg';

async function createUsers() {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        console.error("❌ DATABASE_URL not found in environment variables!");
        console.error("Please check your .env file.");
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
        // Test connection
        const client = await pool.connect();
        console.log("✅ Database connection successful!");

        // Check if superadmin exists
        const checkQuery = 'SELECT * FROM users WHERE username = $1';
        const checkResult = await client.query(checkQuery, ['superadmin']);

        if (checkResult.rows.length > 0) {
            console.log("✅ Super Admin already exists!");
            console.log("Username: superadmin");
            console.log("User ID:", checkResult.rows[0].id);
            console.log("Email:", checkResult.rows[0].email);
        } else {
            // Create super admin user
            const insertQuery = `
                INSERT INTO users (username, email, password, name, is_admin, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `;

            const values = [
                'superadmin',
                'superadmin@sweetbite.com',
                'SuperAdmin@2024!Secure', // Plain password (matches auth.ts logic)
                'Super Administrator',
                true
            ];

            const result = await client.query(insertQuery, values);
            const user = result.rows[0];

            console.log("✅ Super Admin user created successfully!");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📋 CREDENTIALS:");
            console.log("Username: superadmin");
            console.log("Password: SuperAdmin@2024!Secure");
            console.log("Email: superadmin@sweetbite.com");
            console.log("User ID:", user.id);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }

        // Check if admin demo user exists
        const checkAdminQuery = 'SELECT * FROM users WHERE username = $1';
        const checkAdminResult = await client.query(checkAdminQuery, ['admin']);

        if (checkAdminResult.rows.length > 0) {
            console.log("\n✅ Demo Admin already exists!");
            console.log("Username: admin");
            console.log("User ID:", checkAdminResult.rows[0].id);
        } else {
            // Create demo admin user
            const insertAdminQuery = `
                INSERT INTO users (username, email, password, name, is_admin, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `;

            const adminValues = [
                'admin',
                'admin@sweetbite.com',
                'admin123', // Plain password (matches auth.ts logic)
                'Demo Administrator',
                true
            ];

            const adminResult = await client.query(insertAdminQuery, adminValues);
            const adminUser = adminResult.rows[0];

            console.log("\n✅ Demo Admin user created successfully!");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📋 CREDENTIALS:");
            console.log("Username: admin");
            console.log("Password: admin123");
            console.log("Email: admin@sweetbite.com");
            console.log("User ID:", adminUser.id);
            console.log("User ID:", adminUser.id);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }

        // Check if 'kalayan' user exists (Requested by user)
        const checkUserQuery = 'SELECT * FROM users WHERE username = $1';
        const checkUserResult = await client.query(checkUserQuery, ['kalayan']);

        if (checkUserResult.rows.length > 0) {
            console.log("\n✅ User 'kalayan' already exists!");
            // Optional: Update password to ensure it matches
            const updatePassQuery = 'UPDATE users SET password = $1, is_admin = $2 WHERE username = $3';
            await client.query(updatePassQuery, ['1234567', true, 'kalayan']);
            console.log("Updated password to '1234567' and set as Admin.");
        } else {
            // Create kalayan user
            const insertUserQuery = `
                INSERT INTO users (username, email, password, name, is_admin, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `;

            const userValues = [
                'kalayan',
                'kalayan@sweetbite.com',
                '1234567', // Plain password as requested
                'Kalayan User',
                true // Set as admin for admin login test
            ];

            const userResult = await client.query(insertUserQuery, userValues);
            const newUser = userResult.rows[0];

            console.log("\n✅ User 'kalayan' created successfully!");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📋 CREDENTIALS:");
            console.log("Username: kalayan");
            console.log("Password: 1234567");
            console.log("Email: kalayan@sweetbite.com");
            console.log("User ID:", newUser.id);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }

        client.release();
        console.log("\n✅ All done! You can now login with these credentials.");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }

    process.exit(0);
}

// Run the script
createUsers();
