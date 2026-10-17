
/**
 * HEYBIO transactional email adapter.
 *
 * Uses Resend REST API.
 * Only import from server-side code.
 *
 * Requires:
 * RESEND_API_KEY
 * HEYBIO_EMAIL_FROM
 *
 * The sending domain must be verified.
 */

export type EmailBindings = {
  RESEND_API_KEY?: string;
  HEYBIO_EMAIL_FROM?: string;
};

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type EmailSendResult = {
  id: string;
};

const EMAIL =
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function validEmail(
  value: string,
): boolean {
  return (
    value.length <= 254 &&
    EMAIL.test(value)
  );
}

export async function sendTransactionalEmail(
  env: EmailBindings,
  message: TransactionalEmail,
): Promise<EmailSendResult> {
  const key = env.RESEND_API_KEY?.trim();
  const from = env.HEYBIO_EMAIL_FROM?.trim();

  if (!key || !from) {
    throw new Error(
      "Transactional email is not configured.",
    );
  }

  if (
    !validEmail(message.to) ||
    /[\r\n]/.test(message.to)
  ) {
    throw new Error(
      "Invalid email recipient.",
    );
  }

  if (
    !message.subject.trim() ||
    message.subject.length > 160 ||
    /[\r\n]/.test(message.subject)
  ) {
    throw new Error(
      "Invalid email subject.",
    );
  }

  if (
    !message.text.trim() ||
    message.text.length > 100_000
  ) {
    throw new Error(
      "Invalid email content.",
    );
  }

  if (
    message.replyTo &&
    !validEmail(message.replyTo)
  ) {
    throw new Error(
      "Invalid reply-to address.",
    );
  }

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,

        ...(message.replyTo
          ? { reply_to: message.replyTo }
          : {}),
      }),

      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Email provider rejected request (${response.status}).`,
    );
  }

  const payload = (await response.json()) as {
    id?: unknown;
  };

  if (
    typeof payload.id !== "string" ||
    !payload.id
  ) {
    throw new Error(
      "Email provider did not return a message ID.",
    );
  }

  return {
    id: payload.id,
  };
}