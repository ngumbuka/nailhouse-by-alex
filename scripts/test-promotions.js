import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = resolve(__dirname, "../src/data/mock-db.json");

console.log("=== RUNNING PROMOTIONS & SEASONAL PRICING LOGIC TESTS ===");

try {
  // 1. Load mock database
  const rawDb = readFileSync(dbPath, "utf-8");
  const db = JSON.parse(rawDb);

  const promotions = db.promotions || [];
  const services = db.services || [];

  console.log(
    `✓ Read mock-db.json successfully: found ${promotions.length} promotions, ${services.length} services.`,
  );

  // 2. Validate Promotions Schema Integrity
  for (const promo of promotions) {
    const { id, code, discount_percent, active, service_id, start_date, end_date } = promo;

    if (!id || typeof id !== "string") {
      throw new Error(`Invalid promotion ID: ${JSON.stringify(promo)}`);
    }
    if (!code || typeof code !== "string" || code !== code.toUpperCase()) {
      throw new Error(`Promo code must be uppercase string: ${code}`);
    }
    if (typeof discount_percent !== "number" || discount_percent < 0 || discount_percent > 100) {
      throw new Error(`Discount percent must be a number between 0 and 100: ${discount_percent}`);
    }
    if (typeof active !== "boolean") {
      throw new Error(`Promo active must be a boolean: ${active}`);
    }
    if (service_id !== null && typeof service_id !== "string") {
      throw new Error(`Promo service_id must be string or null: ${service_id}`);
    }
    if (start_date && isNaN(Date.parse(start_date))) {
      throw new Error(`Promo start_date is not a valid date string: ${start_date}`);
    }
    if (end_date && isNaN(Date.parse(end_date))) {
      throw new Error(`Promo end_date is not a valid date string: ${end_date}`);
    }
  }
  console.log("✓ Promotion database schema integrity test passed.");

  // 3. Test Promo Validation Logic Simulator
  function simulateValidatePromo(promo, serviceId, currentDate) {
    if (!promo.active) {
      throw new Error("Ce code promo n'est pas actif");
    }

    if (promo.start_date && currentDate < new Date(promo.start_date)) {
      throw new Error("Ce code promo n'est pas encore valide");
    }

    if (promo.end_date && currentDate > new Date(promo.end_date)) {
      throw new Error("Ce code promo a expiré");
    }

    if (promo.service_id && promo.service_id !== serviceId) {
      throw new Error("Ce code promo ne s'applique pas à cette prestation");
    }

    return {
      code: promo.code,
      discount_percent: promo.discount_percent,
    };
  }

  // Define test cases for Promo Code Validation
  const now = new Date("2026-06-22T12:00:00Z");

  const promoBase = {
    code: "WELCOME10",
    discount_percent: 10,
    active: true,
    service_id: null,
    start_date: null,
    end_date: null,
  };

  // Test case A: standard active promo
  const resA = simulateValidatePromo(promoBase, "svc-123", now);
  if (resA.code !== "WELCOME10" || resA.discount_percent !== 10) {
    throw new Error("Test A failed: expected valid validation response");
  }

  // Test case B: inactive promo
  try {
    simulateValidatePromo({ ...promoBase, active: false }, "svc-123", now);
    throw new Error("Test B failed: inactive promo should be rejected");
  } catch (err) {
    if (err.message !== "Ce code promo n'est pas actif") throw err;
  }

  // Test case C: date ranges
  const promoWithDates = {
    ...promoBase,
    start_date: "2026-06-20T00:00:00Z",
    end_date: "2026-06-25T00:00:00Z",
  };
  const resC = simulateValidatePromo(promoWithDates, "svc-123", now);
  if (resC.code !== "WELCOME10") {
    throw new Error("Test C failed: promo within date ranges should be valid");
  }

  // Test case D: start date in future
  try {
    simulateValidatePromo(
      { ...promoWithDates, start_date: "2026-06-24T00:00:00Z" },
      "svc-123",
      now,
    );
    throw new Error("Test D failed: future promo should be invalid");
  } catch (err) {
    if (err.message !== "Ce code promo n'est pas encore valide") throw err;
  }

  // Test case E: end date in past
  try {
    simulateValidatePromo({ ...promoWithDates, end_date: "2026-06-21T00:00:00Z" }, "svc-123", now);
    throw new Error("Test E failed: expired promo should be invalid");
  } catch (err) {
    if (err.message !== "Ce code promo a expiré") throw err;
  }

  // Test case F: service specificity
  const promoSpecific = { ...promoBase, service_id: "svc-target" };
  const resF = simulateValidatePromo(promoSpecific, "svc-target", now);
  if (resF.code !== "WELCOME10") {
    throw new Error("Test F failed: matching service id should be valid");
  }

  try {
    simulateValidatePromo(promoSpecific, "svc-wrong", now);
    throw new Error("Test F2 failed: non-matching service id should be rejected");
  } catch (err) {
    if (err.message !== "Ce code promo ne s'applique pas à cette prestation") throw err;
  }

  console.log("✓ Promotion validation logic unit tests passed.");

  // 4. Test Seasonal Pricing Logic
  function getActiveServicePrice(s, currentDate) {
    if (
      s.seasonal_price_fcfa !== undefined &&
      s.seasonal_price_fcfa !== null &&
      s.seasonal_price_start &&
      s.seasonal_price_end
    ) {
      const start = new Date(s.seasonal_price_start);
      const end = new Date(s.seasonal_price_end);
      if (currentDate >= start && currentDate <= end) {
        return s.seasonal_price_fcfa;
      }
    }
    return s.price_fcfa;
  }

  const testService = {
    price_fcfa: 15000,
    seasonal_price_fcfa: 10000,
    seasonal_price_start: "2026-06-20T00:00:00Z",
    seasonal_price_end: "2026-06-25T00:00:00Z",
  };

  // Test Case G: active seasonal pricing
  const priceG = getActiveServicePrice(testService, now);
  if (priceG !== 10000) {
    throw new Error(`Test G failed: expected seasonal price 10000, got ${priceG}`);
  }

  // Test Case H: date before seasonal start
  const priceH = getActiveServicePrice(testService, new Date("2026-06-19T00:00:00Z"));
  if (priceH !== 15000) {
    throw new Error(`Test H failed: expected base price 15000, got ${priceH}`);
  }

  // Test Case I: date after seasonal end
  const priceI = getActiveServicePrice(testService, new Date("2026-06-26T00:00:00Z"));
  if (priceI !== 15000) {
    throw new Error(`Test I failed: expected base price 15000, got ${priceI}`);
  }

  console.log("✓ Seasonal pricing logic unit tests passed.");
  console.log("=== ALL PROMOTIONS & SEASONAL PRICING TESTS PASSED SUCCESSFULLY ===");
  process.exit(0);
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
