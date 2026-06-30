import { sendBookingUpdateNotification } from "../src/lib/whatsapp.ts";
import path from "path";
import fs from "fs";

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

console.log("=== SENDING TEST BOOKING NOTIFICATIONS TO LIVE CLIENT ===");
console.log("Recipient Phone:", "+237697835780");

async function run() {
  const booking = {
    id: "test-real-booking-id",
    name: "Alex",
    phone: "+237697835780",
    email: "alex@nailhouse.com",
    service_name: "Manucure Couture & Nail Art",
    scheduled_at: new Date().toISOString(),
    followup_preference: "messages" as const,
  };

  try {
    // 1. Send Confirmed booking notification
    console.log("\n1. Triggering 'confirmed' notification...");
    const resConfirm = await sendBookingUpdateNotification(booking, "confirmed");
    console.log("✓ 'confirmed' response:", resConfirm);

    // 2. Send proposed rescheduling notification
    console.log("\n2. Triggering 'proposed_rescheduled' notification...");
    const resResched = await sendBookingUpdateNotification(booking, "proposed_rescheduled", {
      proposedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      adminComment: "Désolé pour le contretemps, Amina est souffrante ce jour-là.",
    });
    console.log("✓ 'proposed_rescheduled' response:", resResched);

    console.log("\n🎉 All test notifications sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send notifications:", error);
  }
}

run();
