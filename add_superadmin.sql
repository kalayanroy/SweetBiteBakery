-- SQL Script to add Super Admin user to the database
-- Run this directly in your PostgreSQL database

-- Check if superadmin exists
SELECT * FROM users WHERE username = 'superadmin';

-- If not exists, insert super admin
INSERT INTO users (username, email, password, name, "isAdmin", "createdAt")
VALUES (
  'superadmin',
  'superadmin@sweetbite.com',
  'SuperAdmin@2024!Secure',
  'Super Administrator',
  true,
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Verify the super admin was created
SELECT id, username, email, name, "isAdmin", "createdAt" 
FROM users 
WHERE username = 'superadmin';
