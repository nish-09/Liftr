import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DATABASE_URL set in .env.local");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function inspect() {
  try {
    console.log("Connecting to database at:", (connectionString || "").replace(/:[^:@]+@/, ":****@"));

    const tables = [
      "personal_records",
      "set_logs",
      "session_exercises",
      "workout_sessions",
      "plan_exercises",
      "plan_days",
      "workout_plans",
      "training_phases",
      "offline_sync_operations",
      "body_measurements",
      "weight_logs",
      "user_body_profiles",
      "user_preferences",
      "exercises",
      "profiles",
    ];

    const counts: Record<string, number> = {};

    for (const table of tables) {
      try {
        const result = await sql`SELECT count(*) FROM ${sql(table)}`;
        counts[table] = parseInt(result[0].count, 10);
      } catch (err: any) {
        counts[table] = -1; // table might not exist or error
        console.error(`Error querying ${table}:`, err.message);
      }
    }

    console.log("\n=== APPLICATION TABLE COUNTS ===");
    for (const [table, count] of Object.entries(counts)) {
      console.log(`- ${table}: ${count}`);
    }

    // Check auth.users
    try {
      const authUsers = await sql`SELECT count(*), json_agg(json_build_object('id', id, 'email', email, 'created_at', created_at)) as users FROM auth.users`;
      console.log(`\n=== AUTH.USERS COUNT ===: ${authUsers[0].count}`);
      console.log("Users:", JSON.stringify(authUsers[0].users, null, 2));
    } catch (err: any) {
      console.log("Could not query auth.users:", err.message);
    }

  } catch (err: any) {
    console.error("Database connection failed:", err.message);
  } finally {
    await sql.end();
  }
}

inspect();
