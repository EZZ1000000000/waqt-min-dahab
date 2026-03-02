const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');

const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_lgZ4BOM5riyp@ep-calm-wildflower-aiiie5mr.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
    try {
        const sql = fs.readFileSync('C:/Users/GIGABYTE/.gemini/antigravity/brain/6a83986a-ef15-4873-8616-33813689ec42/neon_schema.sql', 'utf8');
        await pool.query(sql);
        console.log("Database seeded successfully.");
    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        process.exit(0);
    }
}
run();
