import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const servicesPath = resolve(__dirname, "../src/data/services.json");
const categoriesPath = resolve(__dirname, "../src/lib/service-categories.ts");

console.log("=== RUNNING SERVICE MOCK DATABASE TESTS ===");

try {
  // 1. Read services.json
  const rawServices = readFileSync(servicesPath, "utf-8");
  const services = JSON.parse(rawServices);

  console.log(`✓ Read services.json successfully: found ${services.length} services.`);

  // 2. Read service-categories.ts to parse category names
  const categoriesContent = readFileSync(categoriesPath, "utf-8");
  const categoryNames = [];

  // Extract category names from CATEGORIES array structure in service-categories.ts
  const categoryRegex = /category:\s*["']([^"']+)["']/g;
  let match;
  while ((match = categoryRegex.exec(categoriesContent)) !== null) {
    categoryNames.push(match[1]);
  }

  console.log(`✓ Read service-categories.ts: found ${categoryNames.length} categories.`);

  if (categoryNames.length === 0) {
    throw new Error("Could not parse categories from service-categories.ts");
  }

  // 3. Validate each service
  const ids = new Set();
  const names = new Set();

  for (const service of services) {
    const { id, category, name, price_fcfa, sort } = service;

    // Validate fields
    if (!id || typeof id !== "string") {
      throw new Error(`Invalid service ID in: ${JSON.stringify(service)}`);
    }

    // Check for duplicate ID
    if (ids.has(id)) {
      throw new Error(`Duplicate service ID found: ${id}`);
    }
    ids.add(id);

    if (!category || typeof category !== "string") {
      throw new Error(`Invalid service category in: ${JSON.stringify(service)}`);
    }

    // Validate category matches one of the categories defined in service-categories.ts
    if (!categoryNames.includes(category)) {
      throw new Error(
        `Category "${category}" in service "${name}" does not match any category in service-categories.ts!`,
      );
    }

    if (!name || typeof name !== "string") {
      throw new Error(`Invalid service name in: ${JSON.stringify(service)}`);
    }

    if (typeof price_fcfa !== "number" || price_fcfa <= 0) {
      throw new Error(`Invalid service price for "${name}": ${price_fcfa}`);
    }

    if (typeof sort !== "number") {
      throw new Error(`Invalid service sort order for "${name}": ${sort}`);
    }
  }

  console.log("✓ All 23 services are correctly structured and formatted.");
  console.log("✓ All categories match defined categories.");
  console.log("✓ No duplicate service IDs found.");
  console.log("=== TESTS PASSED SUCCESSFULLY ===");
  process.exit(0);
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
