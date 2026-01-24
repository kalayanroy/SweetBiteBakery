// Check super admin password
import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Client } = pg;

async function checkPassword() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const result = await client.query(
            "SELECT id, username, password FROM users WHERE username = $1",
            ["superadmin"]
        );

        if (result.rows.length > 0) {
            console.log("✅ Super admin found!");
            console.log("Username:", result.rows[0].username);
            console.log("Password in DB:", result.rows[0].password);
            console.log("Expected password: SuperAdmin@2024!Secure");
            console.log("Passwords match:", result.rows[0].password === "SuperAdmin@2024!Secure");
        } else {
            console.log("❌ Super admin not found!");
        }

        await client.end();
    } catch (error) {
        console.error("Error:", error);
        await client.end();
    }
}

checkPassword();
