/**
 * One-time script to add Super Admin user to the database
 * Run this with: npx tsx server/addSuperAdmin.ts
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

// Now import storage and other modules after env vars are loaded
import { storage } from "./storage.js";
import { hashPassword } from "./auth.js";

async function addSuperAdmin() {
    try {
        console.log("🔐 Adding Super Admin user...");

        // Check if super admin already exists
        const existingUser = await storage.getUserByUsername("superadmin");

        if (existingUser) {
            console.log("✅ Super Admin already exists!");
            console.log("Username: superadmin");
            console.log("User ID:", existingUser.id);
            return;
        }

        // Create SUPER ADMIN user
        const superAdminPassword = await hashPassword("SuperAdmin@2024!Secure");
        const superAdminUser = {
            username: "superadmin",
            email: "superadmin@sweetbite.com",
            password: superAdminPassword,
            name: "Super Administrator",
            isAdmin: true
        };

        const createdUser = await storage.createUser(superAdminUser);

        console.log("✅ Super Admin user created successfully!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📋 CREDENTIALS:");
        console.log("Username: superadmin");
        console.log("Password: SuperAdmin@2024!Secure");
        console.log("Email: superadmin@sweetbite.com");
        console.log("User ID:", createdUser.id);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("⚠️  IMPORTANT: Change the password after first login!");

    } catch (error) {
        console.error("❌ Error adding Super Admin:", error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the script
addSuperAdmin();
