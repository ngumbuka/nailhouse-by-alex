import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load env
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

function parseSqlTuples(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const startIdx = text.indexOf("(", i);
    if (startIdx === -1) break;

    // Skip if in policy/table definitions
    const lineStart = text.lastIndexOf("\n", startIdx);
    const lineText = text.substring(lineStart + 1, startIdx);
    if (
      lineText.includes("CREATE") ||
      lineText.includes("INDEX") ||
      lineText.includes("POLICY") ||
      lineText.includes("TABLE") ||
      lineText.includes("ALTER") ||
      lineText.includes("TRIGGER")
    ) {
      i = startIdx + 1;
      continue;
    }

    let currentTuple = [];
    let currentVal = "";
    let inString = false;
    let stringChar = "";
    let j = startIdx + 1;
    while (j < text.length) {
      const char = text[j];
      if (inString) {
        if (char === "'" && text[j + 1] === "'") {
          currentVal += "'";
          j += 2;
          continue;
        } else if (char === stringChar) {
          inString = false;
          j++;
        } else {
          currentVal += char;
          j++;
        }
      } else {
        if (char === "'" || char === '"') {
          inString = true;
          stringChar = char;
          j++;
        } else if (char === ")") {
          currentTuple.push(currentVal.trim());
          j++;
          break;
        } else if (char === ",") {
          currentTuple.push(currentVal.trim());
          currentVal = "";
          j++;
        } else {
          currentVal += char;
          j++;
        }
      }
    }

    rows.push(currentTuple);
    i = j;
  }
  return rows;
}

async function run() {
  const sqlPath = path.resolve(process.cwd(), "setup_new_supabase_project.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error("Missing setup_new_supabase_project.sql");
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, "utf-8");

  // 1. SERVICES
  console.log("Parsing services...");
  const servicesBlockMatch = sqlContent.match(
    /INSERT INTO public\.services[\s\S]+?VALUES([\s\S]+?)ON CONFLICT/i,
  );
  if (servicesBlockMatch) {
    const tuples = parseSqlTuples(servicesBlockMatch[1]);
    const services = tuples.map((row) => ({
      id: row[0],
      category: row[1],
      name: row[2],
      name_en: row[3],
      price_fcfa: parseInt(row[4], 10),
      sort: parseInt(row[5], 10),
      duration_mins: parseInt(row[6], 10),
      slug: row[7],
      is_active: row[8] === "true",
      is_addon: row[9] === "true",
      description: row[10],
      description_en: row[11],
    }));

    console.log(`Upserting ${services.length} services...`);
    const { error } = await supabase.from("services").upsert(services);
    if (error) console.error("Error upserting services:", error.message);
    else console.log("✓ Services successfully populated!");
  } else {
    console.error("Could not find services insert block in SQL file");
  }

  // 2. PROMOTIONS
  console.log("Parsing promotions...");
  const promotionsBlockMatch = sqlContent.match(
    /INSERT INTO public\.promotions[\s\S]+?VALUES([\s\S]+?)ON CONFLICT/i,
  );
  if (promotionsBlockMatch) {
    const tuples = parseSqlTuples(promotionsBlockMatch[1]);
    const promotions = tuples.map((row) => ({
      id: row[0],
      code: row[1],
      discount_percent: parseInt(row[2], 10),
      description: row[3],
      active: row[4] === "true",
    }));

    console.log(`Upserting ${promotions.length} promotions...`);
    const { error } = await supabase.from("promotions").upsert(promotions);
    if (error) console.error("Error upserting promotions:", error.message);
    else console.log("✓ Promotions successfully populated!");
  }

  // 3. VIDEOS
  console.log("Parsing videos...");
  const videosBlockMatch = sqlContent.match(
    /INSERT INTO public\.videos[\s\S]+?VALUES([\s\S]+?)ON CONFLICT/i,
  );
  if (videosBlockMatch) {
    const tuples = parseSqlTuples(videosBlockMatch[1]);
    const videos = tuples.map((row) => ({
      id: row[0],
      url: row[1],
      title: row[2],
      description: row[3],
      category: row[4],
      active: row[5] === "true",
      sort: parseInt(row[6], 10),
    }));

    console.log(`Upserting ${videos.length} videos...`);
    const { error } = await supabase.from("videos").upsert(videos);
    if (error) console.error("Error upserting videos:", error.message);
    else console.log("✓ Videos successfully populated!");
  }

  // 4. GALLERY IMAGES
  console.log("Parsing gallery images...");
  const galleryBlockMatch = sqlContent.match(
    /INSERT INTO public\.gallery_images[\s\S]+?VALUES([\s\S]+?)ON CONFLICT/i,
  );
  if (galleryBlockMatch) {
    const tuples = parseSqlTuples(galleryBlockMatch[1]);
    const galleryImages = tuples.map((row) => ({
      id: row[0],
      url: row[1],
      caption: row[2],
      sort: parseInt(row[3], 10),
    }));

    console.log(`Upserting ${galleryImages.length} gallery images...`);
    const { error } = await supabase.from("gallery_images").upsert(galleryImages);
    if (error) console.error("Error upserting gallery_images:", error.message);
    else console.log("✓ Gallery images successfully populated!");
  }

  console.log("All data population tasks completed!");
}

run();
