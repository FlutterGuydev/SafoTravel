# Ipak Yo'li — Travel Agency Website

A bright, glassmorphism-styled website for the "Ipak Yo'li" ("Silk Road") travel agency,
with a booking form that forwards submissions directly to a Telegram chat.

## Tech stack

- **Frontend**: static HTML5 + CSS3 + vanilla JavaScript (`/public`), with full UZ / RU / EN translations and no build step required.
- **Backend**: Node.js + Express (`/server`) exposing a single `POST /api/order` endpoint that relays booking-form submissions to a Telegram bot. The bot token and chat id live only in a server-side `.env` file — they are never sent to the browser.

## Project structure

```
/public
  /assets
  index.html
  styles.css
  main.js
/server
  server.js
  routes/order.js
  .env.example
package.json
README.md
```

## Requirements

- Node.js 18 or newer (the backend uses the built-in `fetch`, available in Node 18+)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file from the example:

   ```bash
   cp server/.env.example server/.env
   ```

   (On Windows PowerShell: `Copy-Item server/.env.example server/.env`)

3. Fill in `server/.env` with your own Telegram bot token and chat id (see the section below for how to get these).

4. Start the server:

   ```bash
   npm start
   ```

   or, for auto-restart on file changes during development:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser. The Express server both serves the frontend and handles `/api/order`.

## Telegram bot setup (step by step)

The booking modal on the site sends form data to your backend, which then posts a formatted message to a Telegram chat via the Telegram Bot API. Here's how to set that up:

1. **Create a bot.** In Telegram, open a chat with **[@BotFather](https://t.me/BotFather)** and send `/newbot`. Follow the prompts (choose a name and a username ending in `bot`). BotFather will reply with a **bot token** that looks like `123456789:AAExampleTokenString`. Copy it.

2. **Decide where notifications should go.**
   - To receive bookings in a **group**: create a Telegram group, add your new bot to it as a member.
   - To receive bookings in a **direct chat** with the bot: open a chat with your bot and send it any message (e.g. `/start`) so it's allowed to message you back.

3. **Find the chat id.**
   - Send a test message in the group (or to the bot directly) first.
   - Then open this URL in your browser, replacing `<TOKEN>` with your bot token:
     ```
     https://api.telegram.org/bot<TOKEN>/getUpdates
     ```
   - Look for `"chat":{"id": ...}` in the JSON response. For a group chat this id is usually a negative number (e.g. `-1001234567890`); for a direct chat it's a positive number matching your Telegram user id.

4. **Fill in `server/.env`:**

   ```
   PORT=3000
   TELEGRAM_BOT_TOKEN=123456789:AAExampleTokenString
   TELEGRAM_CHAT_ID=-1001234567890
   ```

5. **Restart the server** (`npm start`) so it picks up the new environment variables.

6. Test it: open the site, click any "Book now" button, fill in the form, and submit. You should see a formatted message like this appear in your Telegram chat/group within a second or two:

   ```
   🆕 New booking!
   Tour: Classic Silk Road
   Price: $690
   Name: Aziz Karimov
   Phone: +998901234567
   Message: We'd like to go in July
   Language: EN
   ```

If the token/chat id aren't configured yet, the backend responds with a clear error and the frontend tells the visitor to call instead — it never crashes or exposes the missing configuration.

## Notes on the frontend

- Every translatable piece of text is tagged with `data-i18n="key"` (or `data-i18n-ph="key"` for input placeholders); translations live in the `dict` object at the top of `public/main.js`. The active language is persisted in `localStorage`.
- Hero background scenes are drawn with inline SVG/CSS so no copyrighted photography is required. Each slide is structured so a real photo can later be dropped in by adding a `background-image` rule to its `.illustration-*` class in `styles.css`.
- The booking modal validates the phone number and name on the client for instant feedback, and the backend (`server/routes/order.js`) re-validates everything server-side before contacting Telegram.
- Respects `prefers-reduced-motion` (hero autoplay, marquee scroll, and other animations are disabled for users who request reduced motion).

## Adding real photography later

Replace any `.hero-illustration` background or swap in an `<img>`/`background-image: url(/assets/images/your-photo.jpg)` — the slide markup, captions, and dot indicators all keep working unchanged.
