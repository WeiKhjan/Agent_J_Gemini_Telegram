# Tele Agent J (Gemini)

Telegram bot that provides Gemini CLI access through Telegram messages.

## Prerequisites

1. **Node.js 20+**
2. **Gemini CLI** installed globally:
   ```bash
   npm install -g @google/gemini-cli
   ```
3. **Telegram Bot Token** from [@BotFather](https://t.me/BotFather)

## Setup

1. **Authenticate Gemini CLI with Google** (one-time):
   ```bash
   gemini
   ```
   - Select "Login with Google" when prompted
   - Browser will open for authentication
   - Your credentials are cached locally for future sessions
   - No API key needed! Uses your personal Google account.

2. Copy `.env.example` to `.env` and fill in your values:
   ```
   TELEGRAM_BOT_TOKEN=your_bot_token
   ALLOWED_TELEGRAM_IDS=your_telegram_id
   WORKSPACE_DIR=./workspace
   PORT=3001
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the bot:
   ```bash
   npm start
   ```

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/new` | Start new conversation |
| `/status` | Show bot status |
| `/test` | Test Gemini CLI |
| `/cd <path>` | Change workspace |
| `/sendfile <name>` | Send file from workspace |

## Features

- Full Gemini CLI access via Telegram
- Session persistence (conversation continuity)
- File upload support (images, documents)
- Automatic file sending with `[SEND_IMAGE:]` and `[SEND_FILE:]` tags
- Whitelist authentication
- Audit logging

## Architecture

```
User (Telegram) → Bot (Node.js/Telegraf) → Gemini CLI → Response
                           ↓
                    SQLite Database
                    (sessions + logs)
```

## Port Configuration

Default port is **3001** to avoid conflict with other bots (e.g., Claude bot on 3000).

Change in `.env`:
```
PORT=3001
```

## Security

- Only users in `ALLOWED_TELEGRAM_IDS` can access the bot
- All interactions logged to SQLite database
- Uses `--yolo` flag for auto-approval (be careful!)

## Google Login Benefits

Using Google login (instead of API key) gives you:
- Free access to **Gemini 2.5 Pro**
- **1 million token context window**
- 60 requests/minute, 1000 requests/day (free tier)

## License

MIT
