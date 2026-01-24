// Direct database check and super admin creation
import dotenv from "dotenv";
dotenv.config();

import { DatabaseStorage } from "./database.js";

async function checkAndCreateSuperAdmin() {
    try {
        console.log("🔍 Checking for super admin in database...");
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

        const db = new DatabaseStorage();

        // Check if superadmin exists
        const existingUser = await db.getUserByUsername("superadmin");

        if (existingUser) {
            console.log("✅ Super admin already exists!");
            console.log("User ID:", existingUser.id);
            console.log("Username:", existingUser.username);
            console.log("Email:", existingUser.email);
            console.log("Is Admin:", existingUser.isAdmin);
            return;
        }

        console.log("❌ Super admin not found. Creating now...");

        // Create super admin
        const superAdminUser = {
            username: "superadmin",
            email: "superadmin@sweetbite.com",
            password: "SuperAdmin@2024!Secure", // Plain text - matches auth.ts check
            name: "Super Administrator",
            isAdmin: true
        };

        const created = await db.createUser(superAdminUser);

        console.log("✅ Super admin created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("User ID:", created.id);
        console.log("Username:", created.username);
        console.log("Email:", created.email);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("You can now login with:");
        console.log("Username: superadmin");
        console.log("Password: SuperAdmin@2024!Secure");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }

    process.exit(0);
}

checkAndCreateSuperAdmin();
