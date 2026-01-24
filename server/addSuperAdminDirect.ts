// Simple script to add super admin using pg directly
import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Client } = pg;

async function addSuperAdminDirectly() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🔌 Connecting to database...");
        await client.connect();
        console.log("✅ Connected!");

        // Check if superadmin exists
        console.log("🔍 Checking for existing super admin...");
        const checkResult = await client.query(
            "SELECT * FROM users WHERE username = $1",
            ["superadmin"]
        );

        if (checkResult.rows.length > 0) {
            console.log("✅ Super admin already exists!");
            console.log("User ID:", checkResult.rows[0].id);
            console.log("Username:", checkResult.rows[0].username);
            console.log("Email:", checkResult.rows[0].email);
            await client.end();
            return;
        }

        console.log("❌ Super admin not found. Creating now...");

        // Insert super admin - using snake_case column names
        const insertResult = await client.query(
            `INSERT INTO users (username, email, password, name, is_admin, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
            [
                "superadmin",
                "superadmin@sweetbite.com",
                "SuperAdmin@2024!Secure",
                "Super Administrator",
                true,
            ]
        );

        console.log("✅ Super admin created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📋 CREDENTIALS:");
        console.log("Username: superadmin");
        console.log("Password: SuperAdmin@2024!Secure");
        console.log("Email: superadmin@sweetbite.com");
        console.log("User ID:", insertResult.rows[0].id);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("\n✅ You can now login at: http://localhost:5000/admin/login");

        await client.end();
    } catch (error) {
        console.error("❌ Error:", error);
        await client.end();
        process.exit(1);
    }
}

addSuperAdminDirectly();
