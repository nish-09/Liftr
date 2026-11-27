import postgres from "postgres";
import * as dotenv from "dotenv";
import { DEFAULT_SYSTEM_EXERCISES } from "../src/lib/constants/defaultExercises";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DATABASE_URL found in .env.local");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

async function seed() {
  try {
    console.log("Seeding system exercises into database...");
    
    // Ensure column exists
    await sql`ALTER TABLE exercises ADD COLUMN IF NOT EXISTS target_muscle_part text;`;

    console.log(`Total sample exercises to seed: ${DEFAULT_SYSTEM_EXERCISES.length}`);

    let inserted = 0;
    let updated = 0;

    for (const ex of DEFAULT_SYSTEM_EXERCISES) {
      const result = await sql`
        INSERT INTO exercises (
          id,
          user_id,
          name,
          primary_muscle_group,
          target_muscle_part,
          secondary_muscle_groups,
          equipment,
          weight_unit,
          default_rest_duration,
          progression_increment,
          description,
          is_system,
          is_favorite,
          is_archived
        ) VALUES (
          ${ex.id},
          NULL,
          ${ex.name},
          ${ex.primaryMuscleGroup},
          ${ex.targetMusclePart || null},
          ${sql.json(ex.secondaryMuscleGroups)},
          ${ex.equipment},
          ${ex.weightUnit},
          ${ex.defaultRestDuration},
          ${ex.progressionIncrement},
          ${ex.description || null},
          true,
          ${ex.isFavorite},
          false
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          primary_muscle_group = EXCLUDED.primary_muscle_group,
          target_muscle_part = EXCLUDED.target_muscle_part,
          secondary_muscle_groups = EXCLUDED.secondary_muscle_groups,
          equipment = EXCLUDED.equipment,
          weight_unit = EXCLUDED.weight_unit,
          default_rest_duration = EXCLUDED.default_rest_duration,
          progression_increment = EXCLUDED.progression_increment,
          description = EXCLUDED.description,
          is_system = true,
          updated_at = NOW()
        RETURNING id, (xmax = 0) AS is_insert;
      `;

      if (result[0]?.is_insert) {
        inserted++;
      } else {
        updated++;
      }
    }

    console.log(`Successfully processed exercises: ${inserted} inserted, ${updated} updated.`);

    const countRes = await sql`SELECT count(*) FROM exercises WHERE is_system = true`;
    console.log(`Current system exercises in DB: ${countRes[0].count}`);

    const groupCounts = await sql`
      SELECT primary_muscle_group, count(*) 
      FROM exercises 
      WHERE is_system = true 
      GROUP BY primary_muscle_group 
      ORDER BY primary_muscle_group
    `;
    console.log("\nExercises per muscle group in DB:");
    for (const row of groupCounts) {
      console.log(`- ${row.primary_muscle_group}: ${row.count}`);
    }

    await sql.end();
    console.log("\nExercise seeding complete!");
  } catch (err) {
    console.error("Error seeding exercises:", err);
    await sql.end();
    process.exit(1);
  }
}

seed();
