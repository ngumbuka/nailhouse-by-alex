import { Resend } from "resend";

// SDK first pattern: initialize Resend client
const resendApiKey =
  process.env.RESEND_API_KEY || import.meta?.env?.RESEND_API_KEY || "re_mock_key";
export const resend = new Resend(resendApiKey);

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Low-level sender helper using Resend SDK
 */
export async function sendEmailNotification(payload: EmailPayload) {
  const isMock =
    resendApiKey === "re_mock_key" || !resendApiKey || process.env.RESEND_API_PROVIDER === "mock";

  console.log(
    `[Email Notification] Preparing to send to ${payload.to} with subject: "${payload.subject}"`,
  );

  if (isMock) {
    console.log(`[Email Simulation] (No RESEND_API_KEY set, logging contents):`);
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`HTML Body Preview: \n--------------------\n${payload.html}\n--------------------`);
    return { success: true, id: "mock-email-id-" + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "NailHouse <noreply@resend.dev>", // Fallback sandbox domain for testing, or custom domain if configured
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (error) {
      console.error("[Resend SDK Error]", error);
      throw error;
    }

    console.log("[Resend SDK Success]", data);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Resend SDK Exception]", err);
    throw err;
  }
}

interface BookingEmailNotificationPayload {
  to: string;
  name: string;
  serviceName: string;
  scheduledAt: string;
  type: "pending" | "confirmed" | "completed" | "cancelled" | "reschedule";
  proposedTime?: string;
}

/**
 * Formats and sends bilingual booking update emails via Resend SDK
 */
export async function sendBookingEmailNotification({
  to,
  name,
  serviceName,
  scheduledAt,
  type,
  proposedTime,
}: BookingEmailNotificationPayload) {
  const dateObj = new Date(scheduledAt);
  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let subject = "";
  let html = "";

  const headerStyle =
    "background-color: #111; color: #d4af37; padding: 24px; text-align: center; font-family: sans-serif;";
  const bodyStyle = "padding: 24px; font-family: sans-serif; line-height: 1.6; color: #333;";
  const containerStyle =
    "max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; background-color: #fff;";
  const footerStyle =
    "background-color: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #666; font-family: sans-serif; border-top: 1px solid #eaeaea;";
  const goldButtonStyle =
    "display: inline-block; background-color: #d4af37; color: #111; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin-top: 16px;";

  if (type === "pending") {
    subject = "Demande de rendez-vous enregistrée - NailHouse";
    html = `
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NAILHOUSE</h1>
        </div>
        <div style="${bodyStyle}">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Votre demande de rendez-vous a bien été enregistrée et est actuellement en attente de confirmation par notre équipe.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Détails du rendez-vous :</strong></p>
          <ul>
            <li><strong>Prestation :</strong> ${serviceName}</li>
            <li><strong>Date :</strong> ${formattedDate}</li>
            <li><strong>Heure :</strong> ${formattedTime}</li>
          </ul>
          <p>Vous recevrez un nouvel e-mail dès que votre rendez-vous sera confirmé.</p>
          <p>Merci pour votre confiance !</p>
        </div>
        <div style="${footerStyle}">
          <p>NailHouse - Espace Beauté & Onglerie Prestige</p>
          <p>Si vous avez des questions, contactez-nous par WhatsApp ou téléphone.</p>
        </div>
      </div>
    `;
  } else if (type === "confirmed") {
    subject = "Rendez-vous Confirmé ! - NailHouse";
    html = `
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NAILHOUSE</h1>
        </div>
        <div style="${bodyStyle}">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p style="color: #27ae60; font-weight: bold; font-size: 18px;">Bonne nouvelle ! Votre rendez-vous est confirmé.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Détails du rendez-vous :</strong></p>
          <ul>
            <li><strong>Prestation :</strong> ${serviceName}</li>
            <li><strong>Date :</strong> ${formattedDate}</li>
            <li><strong>Heure :</strong> ${formattedTime}</li>
          </ul>
          <p>Nous nous réjouissons de vous accueillir pour votre moment de détente.</p>
          <p><em>Veuillez vous présenter 5 minutes avant l'heure de votre rendez-vous. En cas d'annulation, merci de nous prévenir au moins 24 heures à l'avance.</em></p>
        </div>
        <div style="${footerStyle}">
          <p>NailHouse - Espace Beauté & Onglerie Prestige</p>
          <p>Si vous avez des questions, contactez-nous par WhatsApp ou téléphone.</p>
        </div>
      </div>
    `;
  } else if (type === "cancelled") {
    subject = "Rendez-vous Annulé - NailHouse";
    html = `
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NAILHOUSE</h1>
        </div>
        <div style="${bodyStyle}">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p style="color: #c0392b; font-weight: bold;">Nous vous informons que votre rendez-vous a été annulé.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Détails du rendez-vous annulé :</strong></p>
          <ul>
            <li><strong>Prestation :</strong> ${serviceName}</li>
            <li><strong>Date initiale :</strong> ${formattedDate} à ${formattedTime}</li>
          </ul>
          <p>Vous pouvez planifier un nouveau rendez-vous à tout moment sur notre site.</p>
          <a href="https://nailhouse.example.com/booking" style="${goldButtonStyle}">Prendre un nouveau rendez-vous</a>
        </div>
        <div style="${footerStyle}">
          <p>NailHouse - Espace Beauté & Onglerie Prestige</p>
        </div>
      </div>
    `;
  } else if (type === "reschedule") {
    const propDateObj = proposedTime ? new Date(proposedTime) : dateObj;
    const propDate = propDateObj.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const propTime = propDateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    subject = "Proposition de report de rendez-vous - NailHouse";
    html = `
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NAILHOUSE</h1>
        </div>
        <div style="${bodyStyle}">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Nous avons une contrainte d'agenda pour votre rendez-vous du <strong>${formattedDate} à ${formattedTime}</strong>.</p>
          <p>Nous vous proposons de reporter votre rendez-vous au :</p>
          <div style="background-color: #fcf8e3; border: 1px solid #fbeed5; border-radius: 4px; padding: 16px; margin: 16px 0; text-align: center;">
            <strong style="color: #c09853; font-size: 18px;">${propDate} à ${propTime}</strong>
          </div>
          <p>Veuillez vous connecter sur votre portail client pour accepter cette proposition ou choisir un autre horaire.</p>
          <a href="https://nailhouse.example.com/portal" style="${goldButtonStyle}">Accéder à mon portail</a>
        </div>
        <div style="${footerStyle}">
          <p>NailHouse - Espace Beauté & Onglerie Prestige</p>
        </div>
      </div>
    `;
  } else {
    // completed
    subject = "Merci pour votre visite ! - NailHouse";
    html = `
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">NAILHOUSE</h1>
        </div>
        <div style="${bodyStyle}">
          <p>Bonjour <strong>${name}</strong>,</p>
          <p>Merci pour votre confiance et pour votre visite d'aujourd'hui chez NailHouse ! Nous espérons que vous avez apprécié votre prestation de <strong>${serviceName}</strong>.</p>
          <p>N'hésitez pas à laisser votre avis sur notre site pour nous aider à nous améliorer.</p>
          <a href="https://nailhouse.example.com" style="${goldButtonStyle}">Donner mon avis</a>
        </div>
        <div style="${footerStyle}">
          <p>NailHouse - Espace Beauté & Onglerie Prestige</p>
        </div>
      </div>
    `;
  }

  return sendEmailNotification({
    to,
    subject,
    html,
  });
}
