import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = "admin@nailhouse.com";
  const password = "adminpassword";

  console.log("Checking if auth user exists...");
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  let user = users.find((u) => u.email === email);

  if (!user) {
    console.log("Creating auth user...");
    const {
      data: { user: newUser },
      error: createError,
    } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      console.error("Error creating user:", createError.message);
      process.exit(1);
    }
    user = newUser;
    console.log("Auth user created successfully.");
  } else {
    console.log("Auth user already exists.");
  }

  console.log("Upserting profile for user ID:", user.id);
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email,
    name: "NailHouse Admin",
    role: "admin",
    phone: "+237 677 216 185",
  });

  if (profileError) {
    console.error("Error upserting profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin user profile ready.");
}

main();
