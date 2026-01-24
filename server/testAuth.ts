/**
 * Script to test authentication
 * Run this with: npx tsx server/testAuth.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { storage } from "./storage.js";
import { authenticateUser } from "./auth.js";

async function testAuth() {
    try {
        console.log("🔐 Testing authentication...\n");

        // Test 1: Check if user exists
        console.log("Test 1: Checking if superadmin user exists in storage...");
        const user = await storage.getUserByUsername("superadmin");
        if (user) {
            console.log("✅ User found!");
            console.log("  - ID:", user.id);
            console.log("  - Username:", user.username);
            console.log("  - Email:", user.email);
            console.log("  - Password (stored):", user.password);
            console.log("  - Is Admin:", user.isAdmin);
        } else {
            console.log("❌ User NOT found!");
        }

        console.log("\nTest 2: Checking if admin user exists in storage...");
        const adminUser = await storage.getUserByUsername("admin");
        if (adminUser) {
            console.log("✅ User found!");
            console.log("  - ID:", adminUser.id);
            console.log("  - Username:", adminUser.username);
            console.log("  - Email:", adminUser.email);
            console.log("  - Password (stored):", adminUser.password);
            console.log("  - Is Admin:", adminUser.isAdmin);
        } else {
            console.log("❌ User NOT found!");
        }

        // Test 2: Try to authenticate
        console.log("\nTest 3: Attempting to authenticate superadmin...");
        const result = await authenticateUser({
            username: "superadmin",
            password: "SuperAdmin@2024!Secure"
        });

        if (result.success) {
            console.log("✅ Authentication successful!");
            console.log("  - User ID:", result.userId);
            console.log("  - Is Admin:", result.isAdmin);
        } else {
            console.log("❌ Authentication failed!");
        }

        // Test 3: Try to authenticate admin
        console.log("\nTest 4: Attempting to authenticate admin...");
        const adminResult = await authenticateUser({
            username: "admin",
            password: "admin123"
        });

        if (adminResult.success) {
            console.log("✅ Authentication successful!");
            console.log("  - User ID:", adminResult.userId);
            console.log("  - Is Admin:", adminResult.isAdmin);
        } else {
            console.log("❌ Authentication failed!");
        }

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }

    process.exit(0);
}

// Run the script
testAuth();
