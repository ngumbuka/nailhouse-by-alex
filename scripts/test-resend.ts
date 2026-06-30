import path from "path";
import fs from "fs";

// Load .env manually BEFORE importing any other modules
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

// Make sure we use the live API provider instead of mock
process.env.RESEND_API_PROVIDER = "live";

const recipientEmail = process.argv[2] || "onboarding@resend.dev";

console.log("=== RUNNING RESEND EMAIL INTEGRATION TEST ===");
console.log(`Sending test email to: ${recipientEmail}`);
console.log("Using API Key:", process.env.RESEND_API_KEY ? "Configured" : "NOT FOUND");

async function run() {
  try {
    // Dynamic import to prevent hoisting and ensure process.env is populated first
    const { sendBookingEmailNotification } = await import("../src/lib/resend.ts");

    const res = await sendBookingEmailNotification({
      to: recipientEmail,
      name: "Alex",
      serviceName: "Pédicure Spa Luxe",
      scheduledAt: new Date().toISOString(),
      type: "confirmed",
    });

    console.log("✓ Resend API call succeeded!");
    console.log("Response:", res);
    console.log(
      "\n💡 Note: If you are using a Resend sandbox account, emails can ONLY be sent to the email address registered with your Resend account, or to 'onboarding@resend.dev'.",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("✗ Resend API call failed:", message);
  }
}

run();
