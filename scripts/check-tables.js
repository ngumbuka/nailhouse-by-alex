import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env manually
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.DB_SUPABASE_URL;
const supabaseServiceKey = process.env.DB_SUPABASE_SERVICE_ROLE_KEY || process.env.DB_SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing DB_SUPABASE_URL or DB_SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log("Checking Supabase tables...");
  const tables = ["services", "promotions", "videos", "gallery_images"];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("count").limit(1);
    if (error) {
      console.log(`✗ Table "${table}" does NOT exist or has error:`, error.message);
    } else {
      console.log(`✓ Table "${table}" exists.`);
    }
  }
}

check();
