import { Pool } from 'pg';
import { readFileSync } from 'fs';

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_C5O1kmbZuGNz@ep-small-bonus-a8cyikm3-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
});

const sql = readFileSync('/tmp/create-schema.sql', 'utf-8');

(async () => {
  try {
    await pool.query(sql);
    console.log('✅ Database schema created successfully');
    await pool.end();
  } catch (e) {
    console.error('❌ Error:', (e as Error).message);
    await pool.end();
    process.exit(1);
  }
})();
