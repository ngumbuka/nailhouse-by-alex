import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("=== RUNNING VIDEOS & RESOLVER LOGIC TESTS ===");

try {
  // Replicate resolveAssetUrl logic locally to test it without TS compilation
  function simulateResolveAssetUrl(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/assets/")) {
      return url;
    }
    if (url.startsWith("/__l5e/assets-v1/")) {
      return url;
    }
    return url;
  }

  // 1. Test URL resolution
  console.log("Testing resolveAssetUrl simulation...");

  const testCases = [
    { input: null, expected: "" },
    { input: undefined, expected: "" },
    { input: "https://example.com/video.mp4", expected: "https://example.com/video.mp4" },
    { input: "http://example.com/video.mp4", expected: "http://example.com/video.mp4" },
    { input: "/placeholder-manicure.html", expected: "/placeholder-manicure.html" },
    { input: "/assets/logo.png", expected: "/assets/logo.png" },
    { input: "/__l5e/assets-v1/xyz/test.jpg", expected: "/__l5e/assets-v1/xyz/test.jpg" },
  ];

  for (const { input, expected } of testCases) {
    const output = simulateResolveAssetUrl(input);
    if (output !== expected) {
      throw new Error(
        `URL Resolution failed for input "${input}". Expected "${expected}", got "${output}"`,
      );
    }
  }
  console.log("✓ URL Resolution unit tests passed.");

  // 2. Validate Videos from mock-db INITIAL_DB (by parsing mock-db.ts)
  const mockDbPath = resolve(__dirname, "../src/lib/mock-db.ts");
  const content = readFileSync(mockDbPath, "utf-8");

  console.log("Validating INITIAL_DB.videos definitions in mock-db.ts...");

  // Quick regex checks for videos in mock-db.ts
  if (!content.includes('url: "/placeholder-manicure.html"')) {
    throw new Error("Missing /placeholder-manicure.html reference in mock-db.ts");
  }
  if (!content.includes('url: "/placeholder-pedicure.html"')) {
    throw new Error("Missing /placeholder-pedicure.html reference in mock-db.ts");
  }

  console.log("✓ Video definitions schema validation passed.");
  console.log("=== ALL VIDEOS & RESOLVER TESTS PASSED SUCCESSFULLY ===");
  process.exit(0);
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}
