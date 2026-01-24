// Check what users exist in the database
import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Client } = pg;

async function listUsers() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("🔌 Connecting to database...");
        await client.connect();
        console.log("✅ Connected!");

        // Get all users
        const result = await client.query(
            "SELECT id, username, email, name, is_admin, created_at FROM users ORDER BY id"
        );

        console.log("\n📋 Users in database:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        if (result.rows.length === 0) {
            console.log("No users found!");
        } else {
            result.rows.forEach((user, index) => {
                console.log(`\n${index + 1}. User ID: ${user.id}`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Is Admin: ${user.is_admin}`);
                console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            });
        }

        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`Total users: ${result.rows.length}`);

        await client.end();
    } catch (error) {
        console.error("❌ Error:", error);
        await client.end();
        process.exit(1);
    }
}

listUsers();
