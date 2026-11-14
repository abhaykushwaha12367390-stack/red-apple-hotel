import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';

export type NotificationChannelStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'not_configured';

export interface ChannelAttemptResult {
  status: NotificationChannelStatus;
  attempts: number;
  lastAttemptAt: string | null;
  deliveredAt: string | null;
  recipient: string;
  providerMessageId?: string;
  errorMessage?: string;
  missingConfigKeys?: string[];
}

export interface BookingNotificationLog {
  bookingId: string;
  idempotencyKey: string;
  roomName: string;
  guestName: string;
  estimatedAmountFormatted: string;
  createdAt: string;
  updatedAt: string;
  whatsapp: ChannelAttemptResult;
  email: ChannelAttemptResult;
}

interface SanitizedBookingNotificationPayload {
  bookingId: string;
  idempotencyKey?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  estimatedAmount: number;
  currencySymbol: string;
  bookingStatus: string;
}

const PORT = 3000;
const DEFAULT_OWNER_WHATSAPP = '+91 88601 51690';
const DEFAULT_OWNER_EMAIL = 'kmalkushwaha353@gmail.com';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const LOGS_FILE_PATH = path.join(DATA_DIR, 'notification-logs.json');

const notificationStore = new Map<string, BookingNotificationLog>();

function loadPersistedLogs(): void {
  try {
    if (!fs.existsSync(LOGS_FILE_PATH)) return;
    const raw = fs.readFileSync(LOGS_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as BookingNotificationLog[];
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && typeof item.bookingId === 'string') {
          notificationStore.set(item.bookingId, item);
        }
      }
    }
  } catch {
    // Ignore read failure in ephemeral environments
  }
}

function persistLogs(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const items = Array.from(notificationStore.values()).slice(0, 200);
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(items, null, 2), 'utf8');
  } catch {
    // Non-fatal in read-only runtimes
  }
}

loadPersistedLogs();

function getOwnerWhatsappDisplay(): string {
  return process.env.OWNER_WHATSAPP_NUMBER?.trim() || DEFAULT_OWNER_WHATSAPP;
}

function getOwnerWhatsappDigits(): string {
  return getOwnerWhatsappDisplay().replace(/[^\d]/g, '');
}

function getOwnerEmail(): string {
  return process.env.OWNER_NOTIFICATION_EMAIL?.trim() || DEFAULT_OWNER_EMAIL;
}

function isConfiguredValue(val: string | undefined, placeholderPrefix = 'YOUR_'): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith(placeholderPrefix)) return false;
  return true;
}

function getNotificationConfigStatus() {
  const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT;
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const whatsappTemplate = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || '';

  const formspreeConfigured =
    isConfiguredValue(formspreeEndpoint, 'YOUR_FORMSPREE') &&
    /^https:\/\/.+/i.test(formspreeEndpoint!.trim());

  const missingWhatsappKeys: string[] = [];
  if (!isConfiguredValue(whatsappToken, 'YOUR_WHATSAPP')) {
    missingWhatsappKeys.push('WHATSAPP_ACCESS_TOKEN');
  }
  if (!isConfiguredValue(whatsappPhoneId, 'YOUR_WHATSAPP')) {
    missingWhatsappKeys.push('WHATSAPP_PHONE_NUMBER_ID');
  }

  return {
    ownerWhatsapp: getOwnerWhatsappDisplay(),
    ownerEmail: getOwnerEmail(),
    whatsapp: {
      configured: missingWhatsappKeys.length === 0,
      missingEnvVars: missingWhatsappKeys,
      templateMode: whatsappTemplate ? `template:${whatsappTemplate}` : 'text',
    },
    email: {
      configured: formspreeConfigured,
      missingEnvVars: formspreeConfigured ? [] : ['FORMSPREE_ENDPOINT'],
      provider: 'Formspree',
    },
  };
}

function formatEstimatedAmount(amount: number, currencySymbol: string): string {
  const sym = currencySymbol || '$';
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${sym}${safeAmount.toLocaleString('en-US')}`;
}

function buildWhatsAppMessageText(
  payload: SanitizedBookingNotificationPayload
): string {
  const estimatedFormatted = formatEstimatedAmount(
    payload.estimatedAmount,
    payload.currencySymbol
  );

  return [
    'NEW HOTEL BOOKING REQUEST',
    '',
    `Booking ID: ${payload.bookingId}`,
    '',
    `Customer Name: ${payload.customerName}`,
    `Mobile Number: ${payload.customerPhone}`,
    `Email: ${payload.customerEmail || 'Not provided'}`,
    '',
    `Selected Room: ${payload.roomName}`,
    `Check-in: ${payload.checkIn}`,
    `Check-out: ${payload.checkOut}`,
    '',
    `Adults: ${payload.adults}`,
    `Children: ${payload.children}`,
    '',
    `Estimated Amount: ${estimatedFormatted} (${payload.nights} night${
      payload.nights === 1 ? '' : 's'
    })`,
    'Booking Status: PENDING',
    '',
    'Please open the Admin Dashboard to review this booking.',
  ].join('\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithBoundedRetry(
  url: string,
  init: RequestInit,
  maxAttempts = 3
): Promise<globalThis.Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, init);
      // Do not retry 4xx client/auth/template errors except 429 rate-limit
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      if (attempt < maxAttempts) {
        const delayMs = 500 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 150);
        await sleep(delayMs);
        continue;
      }
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delayMs = 500 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 150);
        await sleep(delayMs);
        continue;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Network request failed');
}

async function sendWhatsAppBusinessNotification(
  payload: SanitizedBookingNotificationPayload,
  previousAttempts = 0
): Promise<ChannelAttemptResult> {
  const recipientDisplay = getOwnerWhatsappDisplay();
  const recipientDigits = getOwnerWhatsappDigits();
  const nowIso = new Date().toISOString();

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || 'v21.0';
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME?.trim() || '';
  const templateLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || 'en_US';

  const missingKeys: string[] = [];
  if (!isConfiguredValue(accessToken, 'YOUR_WHATSAPP')) {
    missingKeys.push('WHATSAPP_ACCESS_TOKEN');
  }
  if (!isConfiguredValue(phoneNumberId, 'YOUR_WHATSAPP')) {
    missingKeys.push('WHATSAPP_PHONE_NUMBER_ID');
  }

  if (missingKeys.length > 0) {
    return {
      status: 'not_configured',
      attempts: previousAttempts,
      lastAttemptAt: nowIso,
      deliveredAt: null,
      recipient: recipientDisplay,
      missingConfigKeys: missingKeys,
      errorMessage: `WhatsApp Business Cloud API credentials missing: ${missingKeys.join(
        ', '
      )}`,
    };
  }

  const endpoint = `https://graph.facebook.com/${encodeURIComponent(
    apiVersion
  )}/${encodeURIComponent(phoneNumberId!)}/messages`;

  const estimatedFormatted = formatEstimatedAmount(
    payload.estimatedAmount,
    payload.currencySymbol
  );

  const bodyPayload = templateName
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientDigits,
        type: 'template',
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: payload.bookingId },
                { type: 'text', text: payload.customerName },
                { type: 'text', text: payload.customerPhone },
                { type: 'text', text: payload.customerEmail || 'Not provided' },
                { type: 'text', text: payload.roomName },
                { type: 'text', text: payload.checkIn },
                { type: 'text', text: payload.checkOut },
                { type: 'text', text: String(payload.adults) },
                { type: 'text', text: String(payload.children) },
                { type: 'text', text: estimatedFormatted },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientDigits,
        type: 'text',
        text: {
          preview_url: false,
          body: buildWhatsAppMessageText(payload),
        },
      };

  try {
    const response = await fetchWithBoundedRetry(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return {
        status: 'failed',
        attempts: previousAttempts + 1,
        lastAttemptAt: nowIso,
        deliveredAt: null,
        recipient: recipientDisplay,
        errorMessage:
          data.error?.message ||
          `WhatsApp Cloud API returned HTTP ${response.status}`,
      };
    }

    return {
      status: 'sent',
      attempts: previousAttempts + 1,
      lastAttemptAt: nowIso,
      deliveredAt: nowIso,
      recipient: recipientDisplay,
      providerMessageId: data.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      status: 'failed',
      attempts: previousAttempts + 1,
      lastAttemptAt: nowIso,
      deliveredAt: null,
      recipient: recipientDisplay,
      errorMessage:
        err instanceof Error ? err.message : 'WhatsApp delivery request failed',
    };
  }
}

async function sendFormspreeEmailNotification(
  payload: SanitizedBookingNotificationPayload,
  previousAttempts = 0
): Promise<ChannelAttemptResult> {
  const ownerEmail = getOwnerEmail();
  const endpoint = process.env.FORMSPREE_ENDPOINT?.trim();
  const nowIso = new Date().toISOString();

  if (
    !isConfiguredValue(endpoint, 'YOUR_FORMSPREE') ||
    !/^https:\/\/.+/i.test(endpoint!)
  ) {
    return {
      status: 'not_configured',
      attempts: previousAttempts,
      lastAttemptAt: nowIso,
      deliveredAt: null,
      recipient: ownerEmail,
      missingConfigKeys: ['FORMSPREE_ENDPOINT'],
      errorMessage:
        'FORMSPREE_ENDPOINT is not configured in backend environment variables.',
    };
  }

  const estimatedFormatted = formatEstimatedAmount(
    payload.estimatedAmount,
    payload.currencySymbol
  );

  // Strictly exclude ID document numbers and uploaded verification files
  const formspreePayload = {
    _subject: `New Hotel Booking Request – ${payload.bookingId}`,
    ...(payload.customerEmail && payload.customerEmail.includes('@')
      ? { _replyto: payload.customerEmail }
      : {}),
    bookingId: payload.bookingId,
    bookingStatus: 'PENDING',
    ownerRecipientEmail: ownerEmail,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    customerEmail: payload.customerEmail || 'Not provided',
    selectedRoom: payload.roomName,
    checkInDate: payload.checkIn,
    checkOutDate: payload.checkOut,
    nights: payload.nights,
    adults: payload.adults,
    children: payload.children,
    estimatedAmount: estimatedFormatted,
    message: buildWhatsAppMessageText(payload),
  };

  try {
    const response = await fetchWithBoundedRetry(endpoint!, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formspreePayload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      errors?: Array<{ message?: string }>;
    };

    if (!response.ok) {
      const errText =
        data.error ||
        data.errors?.map((e) => e.message).filter(Boolean).join('; ') ||
        `Formspree returned HTTP ${response.status}`;
      return {
        status: 'failed',
        attempts: previousAttempts + 1,
        lastAttemptAt: nowIso,
        deliveredAt: null,
        recipient: ownerEmail,
        errorMessage: errText,
      };
    }

    return {
      status: 'sent',
      attempts: previousAttempts + 1,
      lastAttemptAt: nowIso,
      deliveredAt: nowIso,
      recipient: ownerEmail,
    };
  } catch (err) {
    return {
      status: 'failed',
      attempts: previousAttempts + 1,
      lastAttemptAt: nowIso,
      deliveredAt: null,
      recipient: ownerEmail,
      errorMessage:
        err instanceof Error ? err.message : 'Formspree request failed',
    };
  }
}

function validateBookingPayload(
  raw: unknown
): SanitizedBookingNotificationPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as Record<string, unknown>;

  const bookingId =
    typeof body.bookingId === 'string' ? body.bookingId.trim() : '';
  const customerName =
    typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const customerPhone =
    typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
  const roomName =
    typeof body.roomName === 'string' ? body.roomName.trim() : '';
  const checkIn =
    typeof body.checkIn === 'string' ? body.checkIn.trim() : '';
  const checkOut =
    typeof body.checkOut === 'string' ? body.checkOut.trim() : '';

  if (
    !bookingId ||
    !customerName ||
    !customerPhone ||
    !roomName ||
    !checkIn ||
    !checkOut
  ) {
    return null;
  }

  return {
    bookingId,
    idempotencyKey:
      typeof body.idempotencyKey === 'string' && body.idempotencyKey.trim()
        ? body.idempotencyKey.trim()
        : bookingId,
    customerName,
    customerPhone,
    customerEmail:
      typeof body.customerEmail === 'string' && body.customerEmail.trim()
        ? body.customerEmail.trim()
        : undefined,
    roomName,
    checkIn,
    checkOut,
    nights: Math.max(1, Number(body.nights) || 1),
    adults: Math.max(1, Number(body.adults) || 1),
    children: Math.max(0, Number(body.children) || 0),
    estimatedAmount: Math.max(0, Number(body.estimatedAmount) || 0),
    currencySymbol:
      typeof body.currencySymbol === 'string' && body.currencySymbol.trim()
        ? body.currencySymbol.trim()
        : '$',
    bookingStatus: 'PENDING',
  };
}

async function dispatchNotifications(
  payload: SanitizedBookingNotificationPayload,
  options: { retryFailedOnly?: boolean } = {}
): Promise<{ log: BookingNotificationLog; deduplicated: boolean }> {
  const existing = notificationStore.get(payload.bookingId);
  const nowIso = new Date().toISOString();

  // Idempotency guard: if this exact booking & key was already processed and not a manual retry, return existing log without duplicating messages.
  if (
    existing &&
    !options.retryFailedOnly &&
    existing.idempotencyKey === (payload.idempotencyKey || payload.bookingId)
  ) {
    return { log: existing, deduplicated: true };
  }

  const shouldSendWhatsapp = !existing || existing.whatsapp.status !== 'sent';
  const shouldSendEmail = !existing || existing.email.status !== 'sent';

  if (!shouldSendWhatsapp && !shouldSendEmail && existing) {
    return { log: existing, deduplicated: true };
  }

  const [waSettlement, emailSettlement] = await Promise.allSettled([
    shouldSendWhatsapp
      ? sendWhatsAppBusinessNotification(
          payload,
          existing?.whatsapp.attempts || 0
        )
      : Promise.resolve(existing!.whatsapp),
    shouldSendEmail
      ? sendFormspreeEmailNotification(payload, existing?.email.attempts || 0)
      : Promise.resolve(existing!.email),
  ]);

  const whatsappResult: ChannelAttemptResult =
    waSettlement.status === 'fulfilled'
      ? waSettlement.value
      : {
          status: 'failed',
          attempts: (existing?.whatsapp.attempts || 0) + 1,
          lastAttemptAt: nowIso,
          deliveredAt: null,
          recipient: getOwnerWhatsappDisplay(),
          errorMessage:
            waSettlement.reason instanceof Error
              ? waSettlement.reason.message
              : 'Unexpected WhatsApp dispatch failure',
        };

  const emailResult: ChannelAttemptResult =
    emailSettlement.status === 'fulfilled'
      ? emailSettlement.value
      : {
          status: 'failed',
          attempts: (existing?.email.attempts || 0) + 1,
          lastAttemptAt: nowIso,
          deliveredAt: null,
          recipient: getOwnerEmail(),
          errorMessage:
            emailSettlement.reason instanceof Error
              ? emailSettlement.reason.message
              : 'Unexpected email dispatch failure',
        };

  const nextLog: BookingNotificationLog = {
    bookingId: payload.bookingId,
    idempotencyKey: payload.idempotencyKey || payload.bookingId,
    roomName: payload.roomName,
    guestName: payload.customerName,
    estimatedAmountFormatted: formatEstimatedAmount(
      payload.estimatedAmount,
      payload.currencySymbol
    ),
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso,
    whatsapp: whatsappResult,
    email: emailResult,
  };

  notificationStore.set(payload.bookingId, nextLog);
  persistLogs();

  return { log: nextLog, deduplicated: false };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Health & Config Readiness Endpoint (never exposes secrets)
  app.get('/api/notifications/config-status', (_req: Request, res: Response) => {
    res.json(getNotificationConfigStatus());
  });

  // Fetch Notification Delivery Logs for Admin Dashboard
  app.get('/api/notifications/logs', (_req: Request, res: Response) => {
    const logs = Array.from(notificationStore.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
    res.json({ logs });
  });

  // Trigger Automatic Booking Notifications after DB Save (Idempotent)
  app.post('/api/notifications/booking', async (req: Request, res: Response) => {
    const payload = validateBookingPayload(req.body);
    if (!payload) {
      return res.status(400).json({
        error:
          'Invalid booking notification payload. bookingId, customerName, customerPhone, roomName, checkIn, and checkOut are required.',
      });
    }

    const result = await dispatchNotifications(payload, {
      retryFailedOnly: false,
    });

    console.log(
      `[BookingNotification] ${payload.bookingId} | deduplicated=${result.deduplicated} | WhatsApp=${result.log.whatsapp.status} | Formspree=${result.log.email.status}`
    );

    return res.status(200).json(result);
  });

  // Safe Manual Retry Endpoint (Only retries channels that are NOT already 'sent')
  app.post(
    '/api/notifications/booking/:bookingId/retry',
    async (req: Request, res: Response) => {
      const payload = validateBookingPayload({
        ...req.body,
        bookingId: req.params.bookingId,
      });

      if (!payload) {
        return res.status(400).json({
          error: 'Valid sanitized booking summary fields are required to retry.',
        });
      }

      const result = await dispatchNotifications(payload, {
        retryFailedOnly: true,
      });

      console.log(
        `[BookingNotificationRetry] ${payload.bookingId} | WhatsApp=${result.log.whatsapp.status} | Formspree=${result.log.email.status}`
      );

      return res.status(200).json(result);
    }
  );

  // Mount Vite middleware in development or serve built SPA in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
