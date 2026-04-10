# 🤖 Rosie

*"Your personal AI assistant, at your service!"*

Meet **Rosie** — your digital household helper inspired by the beloved robot maid from The Jetsons. Rosie is a Progressive Web App (PWA) chat interface for [synthetic.new](https://synthetic.new) AI models, designed to be helpful, friendly, and always ready to assist.

![Rosie Theme](https://rosie-chat.vercel.app/icon.svg)

## ✨ Features

- **🤖 Personal AI Assistant**: Chat with state-of-the-art AI models
- **🔒 PIN Protection**: 6-digit security code keeps your conversations private
- **🏠 PWA**: Install on iOS, Android, or desktop — works offline
- **💬 Streaming Responses**: Real-time replies for natural conversation
- **🎨 Retro-Futuristic Design**: Jetsons-inspired aesthetic with modern polish
- **📱 Mobile-First**: Optimized for phone use with touch-friendly UI

## 🎭 The Rosie Experience

Just like the original Rosie from The Jetsons, your Rosie is:
- **Helpful** — Answers questions, helps with tasks
- **Trustworthy** — Private and secure with PIN protection
- **Always Available** — Works offline, ready whenever you need her
- **Friendly** — Warm, retro-futuristic personality

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- UV package manager: `pip install uv`

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/rosie.git
cd rosie

# Install Python dependencies
uv pip install -e ".[dev]"

# Install Node.js dependencies
npm install

# Build the app
npm run build
```

### Running Locally

```bash
# Development mode
npm run dev

# Or with Python server
python -m http.server 8000 --directory dist
```

## 📱 Installing on iPhone

### Step 1: Deploy to Vercel (Free)

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Vercel auto-detects Vite settings
4. Deploy (takes ~1 minute)

Get your URL: `https://rosie-xyz123.vercel.app`

### Step 2: Install as PWA

1. Open the URL in Safari on your iPhone
2. **Set your 6-digit PIN** (first time setup)
3. Tap **Share** → **"Add to Home Screen"**
4. Done! Rosie is now on your home screen 📱

### Step 3: Share with Your Wife

- Text her the URL
- Share the PIN privately
- She installs the same way

## 🔐 Privacy & Security

### PIN Protection
- **6-digit PIN** required on first launch
- PIN is **SHA-256 hashed** locally (not stored in plain text)
- No server-side authentication — everything stays on your devices
- Reset PIN anytime from Settings → Security

### Data Storage
- API tokens stored in browser localStorage
- Conversations saved locally on each device
- No cloud sync, no analytics, no tracking
- Your data stays with you

## 🛠️ Development

```bash
# Run dev server
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Run tests
npm run test
```

## 🎨 Tech Stack

- **Frontend**: TypeScript + Lit (Web Components)
- **Build Tool**: Vite with PWA plugin
- **Styling**: CSS Custom Properties (Retro-futuristic theme)
- **Package Manager**: UV (Python) + npm (JavaScript)
- **Hosting**: Vercel (free tier)

## 📁 Project Structure

```
rosie/
├── src/
│   ├── components/      # Rosie UI components
│   │   ├── chat-container.ts
│   │   ├── chat-message.ts
│   │   ├── chat-input.ts
│   │   ├── model-selector.ts
│   │   ├── settings-panel.ts
│   │   └── pin-auth.ts   # Rosie PIN protection
│   ├── services/
│   │   ├── rosie-api.ts   # AI communication
│   │   └── storage.ts     # Local data persistence
│   ├── types/
│   │   └── chat.ts
│   ├── app.ts            # Rosie root component
│   ├── main.ts           # Entry point
│   └── server.py         # Optional backend
├── public/               # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── rosie-icon.svg   # Rosie branding
├── vercel.json         # Vercel config
└── README.md
```

## 🎨 The Rosie Aesthetic

- **Color Palette**: Warm oranges, space-age blues, retro greys
- **Typography**: Friendly, rounded fonts
- **Animations**: Smooth, floating effects inspired by 1960s sci-fi
- **Icons**: Rosie robot silhouette

## 🌟 Configuration

1. Open Rosie
2. Tap **Settings** (gear icon)
3. Add your synthetic.new API token
4. Select your preferred AI model
5. Choose your theme (Rosie Classic, Space Age, or Modern)

### Getting an API Token

1. Visit [synthetic.new](https://synthetic.new)
2. Sign in to your account
3. Navigate to API settings
4. Generate a new token
5. Paste it into Rosie's settings

## 📝 License

MIT — Built with 💙 for The Jetsons fans everywhere.

Auto-deployed to Vercel via GitHub Actions.

## 🤝 Credits

- Inspired by Rosie the Robot from [The Jetsons](https://en.wikipedia.org/wiki/The_Jetsons)
- Built with [synthetic.new](https://synthetic.new) AI models
- Icons and branding: Retro-futuristic style

---

*"Good morning! I'm Rosie. How can I help you today?"* 🤖
