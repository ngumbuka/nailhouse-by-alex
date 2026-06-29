// Google Calendar via service-account JWT.
// Skips silently when GOOGLE_SERVICE_ACCOUNT_JSON / GOOGLE_CALENDAR_ID
// are not configured, so booking still works without Calendar wired up.
//
// ENV VARS REQUIRED:
//   GOOGLE_SERVICE_ACCOUNT_JSON  – Full JSON content of the service account key file
//   GOOGLE_CALENDAR_ID           – Calendar ID (e.g. "primary" or "xxx@group.calendar.google.com")
//
// SETUP STEPS:
//   1. Go to https://console.cloud.google.com/ → APIs & Services → Enable "Google Calendar API"
//   2. Create a Service Account → generate a JSON key
//   3. Share your NailHouse Google Calendar with the service account email (editor access)
//   4. Set GOOGLE_SERVICE_ACCOUNT_JSON=<paste the entire JSON content, minified>
//   5. Set GOOGLE_CALENDAR_ID=<your calendar id>

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
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
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

/** Returns the configured service account + calendarId, or null if not configured */
function getCalendarConfig(): { sa: ServiceAccount; calendarId: string } | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!raw || !calendarId) return null;
  try {
    return { sa: JSON.parse(raw) as ServiceAccount, calendarId };
  } catch {
    console.error("[calendar] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON");
    return null;
  }
}

/** Create a calendar event for a new booking. Returns the Google event ID or null. */
export async function addBookingToCalendar(opts: {
  summary: string;
  description: string;
  startISO: string;
  durationMins?: number;
}): Promise<string | null> {
  const config = getCalendarConfig();
  if (!config) return null;

  const token = await getAccessToken(config.sa);
  const start = new Date(opts.startISO);
  const end = new Date(start.getTime() + (opts.durationMins ?? 60) * 60 * 1000);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events`,
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
  if (!res.ok) throw new Error(`calendar create: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id: string };
  console.log(`[calendar] Event created: ${json.id}`);
  return json.id;
}

/** Update an existing calendar event (e.g. when a booking is rescheduled). */
export async function updateCalendarEvent(opts: {
  eventId: string;
  summary?: string;
  description?: string;
  startISO?: string;
  durationMins?: number;
}): Promise<boolean> {
  const config = getCalendarConfig();
  if (!config) return false;
  if (!opts.eventId) return false;

  const token = await getAccessToken(config.sa);

  // First fetch the existing event so we only patch what changed
  const getRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${opts.eventId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!getRes.ok) {
    console.warn(`[calendar] Event ${opts.eventId} not found, skipping update`);
    return false;
  }
  const existing = (await getRes.json()) as {
    summary: string;
    description: string;
    start: { dateTime: string };
    end: { dateTime: string };
  };

  const start = opts.startISO ? new Date(opts.startISO) : new Date(existing.start.dateTime);
  const end = opts.startISO
    ? new Date(start.getTime() + (opts.durationMins ?? 60) * 60 * 1000)
    : new Date(existing.end.dateTime);

  const patch = {
    summary: opts.summary ?? existing.summary,
    description: opts.description ?? existing.description,
    start: { dateTime: start.toISOString(), timeZone: "Africa/Douala" },
    end: { dateTime: end.toISOString(), timeZone: "Africa/Douala" },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${opts.eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    },
  );
  if (!res.ok) throw new Error(`calendar update: ${res.status} ${await res.text()}`);
  console.log(`[calendar] Event updated: ${opts.eventId}`);
  return true;
}

/** Delete a calendar event (e.g. when a booking is cancelled). */
export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const config = getCalendarConfig();
  if (!config) return false;
  if (!eventId) return false;

  const token = await getAccessToken(config.sa);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(config.calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // 204 = deleted, 404 = already gone — both are acceptable
  if (!res.ok && res.status !== 404) {
    throw new Error(`calendar delete: ${res.status} ${await res.text()}`);
  }
  console.log(`[calendar] Event deleted: ${eventId}`);
  return true;
}
