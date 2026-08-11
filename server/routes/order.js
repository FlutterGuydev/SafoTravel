const express = require('express');

const router = express.Router();

// Basic international-friendly phone check: optional +, 7-15 digits total, spaces/dashes/parens allowed.
const PHONE_RE = /^\+?[0-9()\-\s]{7,20}$/;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Validates the incoming booking payload; returns an error string or null if valid.
function validateOrder(body) {
  const { tour, price, name, phone, message, lang } = body || {};

  if (!tour || typeof tour !== 'string' || tour.trim().length === 0) {
    return 'Tour name is required.';
  }
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return 'Please provide a valid name.';
  }
  if (!phone || typeof phone !== 'string' || !PHONE_RE.test(phone.trim())) {
    return 'Please provide a valid phone number.';
  }
  if (price !== undefined && typeof price !== 'string') {
    return 'Invalid price format.';
  }
  if (message !== undefined && typeof message !== 'string') {
    return 'Invalid message format.';
  }
  if (lang !== undefined && typeof lang !== 'string') {
    return 'Invalid language format.';
  }
  return null;
}

router.post('/', async (req, res) => {
  const validationError = validateOrder(req.body);
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === 'your_bot_token_here') {
    console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID is not configured on the server.');
    return res.status(500).json({
      success: false,
      error: 'Booking notifications are not configured yet. Please call us instead.',
    });
  }

  const { tour, price, name, phone, message, lang } = req.body;

  const text = [
    '🆕 New booking!',
    `Tour: ${escapeHtml(tour)}`,
    price ? `Price: ${escapeHtml(price)}` : null,
    `Name: ${escapeHtml(name)}`,
    `Phone: ${escapeHtml(phone)}`,
    message ? `Message: ${escapeHtml(message)}` : 'Message: —',
    `Language: ${escapeHtml((lang || 'en').toUpperCase())}`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return res.status(502).json({
        success: false,
        error: 'Could not deliver your booking right now. Please call us instead.',
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Failed to reach Telegram API:', err);
    return res.status(502).json({
      success: false,
      error: 'Could not deliver your booking right now. Please call us instead.',
    });
  }
});

module.exports = router;
