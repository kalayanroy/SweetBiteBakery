/**
 * Test script to verify that regular users can login
 * Run this with: npx tsx server/testRegularUserLogin.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { storage } from "./storage.js";
import { authenticateUser } from "./auth.js";

async function testRegularUserLogin() {
    console.log("🔐 Testing Regular User Login...\n");

    try {
        // First, create a test regular user
        console.log("1. Creating a test regular user...");
        const testUser = await storage.createUser({
            username: "testuser",
            email: "testuser@example.com",
            password: "password123",
            name: "Test User",
            isAdmin: false
        });
        console.log(`✅ Created user: ${testUser.username} (ID: ${testUser.id}, isAdmin: ${testUser.isAdmin})\n`);

        // Test authentication
        console.log("2. Testing authentication...");
        const authResult = await authenticateUser({
            username: "testuser",
            password: "password123"
        });

        if (authResult.success) {
            console.log("✅ Authentication successful!");
            console.log(`   - User ID: ${authResult.userId}`);
            console.log(`   - Is Admin: ${authResult.isAdmin}`);
            console.log("\n✅ Regular users CAN login to the system!");

            if (authResult.isAdmin === false) {
                console.log("✅ User is correctly identified as non-admin");
                console.log("\n📝 Regular users should use:");
                console.log("   - Login page: /login");
                console.log("   - API endpoint: POST /api/auth/login");
                console.log("\n📝 Admin users should use:");
                console.log("   - Login page: /admin/login");
                console.log("   - API endpoint: POST /api/admin/login");
            }
        } else {
            console.log("❌ Authentication failed!");
        }

        // Clean up - delete test user
        console.log("\n3. Cleaning up test user...");
        if (storage.deleteUser) {
            await storage.deleteUser(testUser.id);
            console.log("✅ Test user deleted");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }

    process.exit(0);
}

testRegularUserLogin();
