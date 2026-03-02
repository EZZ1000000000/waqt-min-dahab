const { execSync } = require('child_process');

try {
    try { execSync('npx vercel env rm DATABASE_URL production --yes', { stdio: 'ignore' }); } catch (e) { }
    try { execSync('npx vercel env rm ADMIN_USER production --yes', { stdio: 'ignore' }); } catch (e) { }
    try { execSync('npx vercel env rm ADMIN_PASS production --yes', { stdio: 'ignore' }); } catch (e) { }

    execSync('npx vercel env add DATABASE_URL production', { input: "postgresql://neondb_owner:npg_lgZ4BOM5riyp@ep-calm-wildflower-aiiie5mr.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" });
    execSync('npx vercel env add ADMIN_USER production', { input: "admin" });
    execSync('npx vercel env add ADMIN_PASS production', { input: "watches2024" });
    console.log("Environment variables set successfully.");
} catch (err) {
    console.error("Error setting env vars:", err.message);
}
