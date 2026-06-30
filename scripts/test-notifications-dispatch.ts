import { sendBookingUpdateNotification } from "../src/lib/whatsapp.ts";
import path from "path";
import fs from "fs";

// Load .env manually if available
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

console.log("=== RUNNING NOTIFICATIONS DISPATCH TESTS ===");

// Set provider environments to mock for unit tests to prevent actual API calls
process.env.WHATSAPP_API_PROVIDER = "mock";
process.env.RESEND_API_PROVIDER = "mock";

async function runTests() {
  const baseBooking: {
    id: string;
    name: string;
    phone: string;
    email: string;
    service_name: string;
    scheduled_at: string;
    followup_preference?: "call" | "messages" | "email" | null;
  } = {
    id: "test-booking-id",
    name: "Jean Test",
    phone: "677123456",
    email: "jean@example.com",
    service_name: "Pédicure Spa",
    scheduled_at: new Date().toISOString(),
  };

  try {
    // Test Case 1: WhatsApp preference
    console.log("\n--- Test Case 1: WhatsApp Preference (messages) ---");
    await sendBookingUpdateNotification(
      { ...baseBooking, followup_preference: "messages" },
      "confirmed",
    );
    console.log("✓ WhatsApp notification triggered successfully");

    // Test Case 2: Email preference
    console.log("\n--- Test Case 2: Email Preference (email) ---");
    await sendBookingUpdateNotification(
      { ...baseBooking, followup_preference: "email" },
      "confirmed",
    );
    console.log("✓ Email notification triggered successfully");

    // Test Case 3: Call preference (Manual follow-up)
    console.log("\n--- Test Case 3: Call Preference (call) ---");
    await sendBookingUpdateNotification(
      { ...baseBooking, followup_preference: "call" },
      "confirmed",
    );
    console.log("✓ Manual call preference handled successfully");

    // Test Case 4: Default preference (messages)
    console.log("\n--- Test Case 4: Default Preference (undefined) ---");
    await sendBookingUpdateNotification(baseBooking, "pending");
    console.log("✓ Default notification handled successfully");

    console.log("\n✓ All notifications dispatch tests passed successfully.");
  } catch (error) {
    console.error("✗ Test failed:", error);
    process.exit(1);
  }
}

runTests();
