import { format } from "date-fns";
import { fr } from "date-fns/locale";

export { validateWhatsAppNumber } from "./phone-validation.ts";

export interface WhatsAppPayload {
  to: string;
  name: string;
  serviceName: string;
  scheduledAt: string;
  type:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "rescheduled"
    | "proposed_rescheduled";
  adminComment?: string | null;
}

/**
 * Standardize phone numbers to WhatsApp compatible format (e.g. +237xxxxxxxx)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  // If the number doesn't start with a plus or country code, prepend default Cameroon country code (+237)
  if (cleaned.length === 9 && (cleaned.startsWith("6") || cleaned.startsWith("2"))) {
    return `+237${cleaned}`;
  }
  if (!phone.startsWith("+")) {
    return `+${cleaned}`;
  }
  return phone;
}

/**
 * Maps payload data to parameters required by Meta WhatsApp templates
 */
export function getTemplateParams(
  payload: WhatsAppPayload,
  dateStr: string,
  timeStr: string,
): string[] {
  switch (payload.type) {
    case "pending":
    case "confirmed":
    case "cancelled":
    case "rescheduled":
      return [payload.name, payload.serviceName, dateStr, timeStr];
    case "completed":
      return [payload.name, payload.serviceName];
    case "proposed_rescheduled":
      return [
        payload.name,
        payload.serviceName,
        dateStr,
        timeStr,
        payload.adminComment || "Aucun commentaire",
      ];
    default:
      return [];
  }
}

/**
 * Sends a WhatsApp notification to a client based on their booking status change
 */
export async function sendWhatsAppNotification(payload: WhatsAppPayload) {
  const provider = process.env.WHATSAPP_API_PROVIDER || "meta";
  const toFormatted = formatPhoneNumber(payload.to);

  // Format the date/time nicely in French
  let dateStr = "—";
  let timeStr = "—";
  try {
    const dateObj = new Date(payload.scheduledAt);
    dateStr = format(dateObj, "EEEE d MMMM yyyy", { locale: fr });
    timeStr = format(dateObj, "HH:mm", { locale: fr });
  } catch (err) {
    console.error("[whatsapp] Date formatting failed", err);
  }

  // Create bilingual message template (French default) - used for mock and text fallback
  let message = "";
  switch (payload.type) {
    case "pending":
      message = `Bonjour ${payload.name}, votre demande de rendez-vous pour "${payload.serviceName}" le ${dateStr} à ${timeStr} a bien été reçue. Nous traitons votre demande et vous enverrons une confirmation très prochainement. Merci ! — NailHouse`;
      break;
    case "confirmed":
      message = `Bonjour ${payload.name}, votre rendez-vous pour "${payload.serviceName}" le ${dateStr} à ${timeStr} est CONFIRMÉ ! Nous nous réjouissons de vous accueillir chez NailHouse. — NailHouse`;
      break;
    case "cancelled":
      message = `Bonjour ${payload.name}, votre rendez-vous pour "${payload.serviceName}" le ${dateStr} à ${timeStr} a été ANNULÉ. Pour replanifier ou pour toute question, n'hésitez pas à nous recontacter. À bientôt ! — NailHouse`;
      break;
    case "completed":
      message = `Bonjour ${payload.name}, merci pour votre visite aujourd'hui ! Nous espérons que votre soin "${payload.serviceName}" vous a plu. Au plaisir de vous revoir bientôt ! — NailHouse`;
      break;
    case "rescheduled":
      message = `Bonjour ${payload.name}, votre rendez-vous pour "${payload.serviceName}" a été déplacé au ${dateStr} à ${timeStr}. Si cet horaire ne vous convient pas, contactez-nous au plus vite. — NailHouse`;
      break;
    case "proposed_rescheduled":
      message = `Bonjour ${payload.name}, suite à un impératif, nous vous proposons de décaler votre rendez-vous pour "${payload.serviceName}" au ${dateStr} à ${timeStr}.${payload.adminComment ? ` (Note: ${payload.adminComment})` : ""} Merci de nous confirmer votre accord en répondant à ce message. — NailHouse`;
      break;
  }

  console.log(
    `[WhatsApp Notification] Preparing to send to ${toFormatted} via provider: ${provider}`,
  );

  if (provider === "mock") {
    console.log("----------------------------------------");
    console.log(`TO: ${toFormatted} (${payload.name})`);
    console.log(`STATUS: ${payload.type.toUpperCase()}`);
    console.log(`MESSAGE: ${message}`);
    console.log("----------------------------------------");
    return {
      success: true,
      messageId: "mock-message-id-" + Math.random().toString(36).substr(2, 9),
    };
  }

  if (provider === "meta") {
    const accessToken = process.env.WHATSAPP_META_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_META_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      console.error("[whatsapp] Meta WhatsApp API configuration missing in env");
      throw new Error("Meta WhatsApp config missing");
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    // Map payload type to standard env templates
    const templateEnvMap: Record<WhatsAppPayload["type"], string | undefined> = {
      pending: process.env.WHATSAPP_META_TEMPLATE_PENDING,
      confirmed: process.env.WHATSAPP_META_TEMPLATE_CONFIRMED,
      cancelled: process.env.WHATSAPP_META_TEMPLATE_CANCELLED,
      completed: process.env.WHATSAPP_META_TEMPLATE_COMPLETED,
      rescheduled: process.env.WHATSAPP_META_TEMPLATE_RESCHEDULED,
      proposed_rescheduled: process.env.WHATSAPP_META_TEMPLATE_PROPOSED_RESCHEDULED,
    };

    const templateName = templateEnvMap[payload.type];
    let body: Record<string, unknown>;

    if (templateName) {
      // Send registered template message (free tier compatible, bypassing the 24h window constraint)
      const params = getTemplateParams(payload, dateStr, timeStr);
      body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toFormatted,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "fr",
          },
          components: [
            {
              type: "body",
              parameters: params.map((param) => ({
                type: "text",
                text: param,
              })),
            },
          ],
        },
      };
      console.log(`[whatsapp] Sending Meta Template Message: "${templateName}" to ${toFormatted}`);
    } else {
      // Fallback to text message (requires user-initiated session in the last 24h)
      body = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toFormatted,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      };
      console.log(`[whatsapp] Sending Meta Text Message (fallback) to ${toFormatted}`);
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        error?: { message: string };
        messages?: Array<{ id: string }>;
      };

      if (!response.ok) {
        throw new Error(data.error?.message || "Meta API request failed");
      }
      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (err: unknown) {
      console.error("[whatsapp] Meta API send error:", err);
      throw err;
    }
  }

  throw new Error(`Unsupported WhatsApp provider: ${provider}`);
}

export async function sendBookingUpdateNotification(
  booking: {
    id: string;
    name: string;
    phone: string;
    email: string;
    service_name: string;
    scheduled_at: string;
    followup_preference?: "call" | "messages" | "email" | null;
  },
  type:
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "rescheduled"
    | "proposed_rescheduled",
  extra?: { proposedTime?: string; adminComment?: string | null },
) {
  const pref = booking.followup_preference || "messages";
  if (pref === "email") {
    try {
      const { sendBookingEmailNotification } = await import("./resend.ts");
      let emailType: "pending" | "confirmed" | "completed" | "cancelled" | "reschedule" =
        "confirmed";
      if (type === "proposed_rescheduled") {
        emailType = "reschedule";
      } else if (type === "rescheduled") {
        emailType = "confirmed";
      } else if (
        type === "pending" ||
        type === "confirmed" ||
        type === "completed" ||
        type === "cancelled"
      ) {
        emailType = type;
      }
      await sendBookingEmailNotification({
        to: booking.email,
        name: booking.name,
        serviceName: booking.service_name,
        scheduledAt: extra?.proposedTime || booking.scheduled_at,
        type: emailType,
        proposedTime: extra?.proposedTime,
      });
    } catch (emailErr) {
      console.error("[email] failed to send booking status email reminder", emailErr);
    }
  } else if (pref === "messages") {
    try {
      await sendWhatsAppNotification({
        to: booking.phone,
        name: booking.name,
        serviceName: booking.service_name,
        scheduledAt: extra?.proposedTime || booking.scheduled_at,
        type: type,
        adminComment: extra?.adminComment,
      });
    } catch (wsErr) {
      console.error("[whatsapp] failed to send booking status update notification", wsErr);
    }
  } else {
    console.log(
      `[notifications] preference is '${pref}' for client ${booking.name}. Manual follow-up recommended.`,
    );
  }
}
