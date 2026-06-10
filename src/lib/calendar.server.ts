// Google Calendar via service-account JWT.
// Skips silently when GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_CALENDAR_ID
// are not configured, so booking still works without Calendar wired up.

import { createSign } from "crypto";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const b64 = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64(header)}.${b64(claim)}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key).toString("base64url");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function addBookingToCalendar(opts: {
  summary: string;
  description: string;
  startISO: string;
}): Promise<string | null> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!raw || !calendarId) return null;
  const sa = JSON.parse(raw) as ServiceAccount;
  const token = await getAccessToken(sa);
  const start = new Date(opts.startISO);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: opts.summary,
        description: opts.description,
        start: { dateTime: start.toISOString(), timeZone: "Africa/Douala" },
        end: { dateTime: end.toISOString(), timeZone: "Africa/Douala" },
      }),
    },
  );
  if (!res.ok) throw new Error(`calendar: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id: string };
  return json.id;
}
