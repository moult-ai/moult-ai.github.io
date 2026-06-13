# Moult AI Web

**Multi-provider AI gateway -- A unified interface to interact with multiple AI models through OpenRouter, Groq, and HuggingFace.**

Developed by [Lombard Web Services](https://lombard-web-services.com) ([@lombardweb](https://github.com/lombardweb))

---

## Overview

Moult AI Web is a progressive web application that provides a single, clean interface for querying multiple artificial intelligence models from different providers. It is designed to run entirely in the browser with no backend of its own -- it connects to a lightweight proxy server that routes requests to the appropriate AI provider.

## Features

- **Multi-provider support** -- OpenRouter, Groq, and HuggingFace models accessible from one interface
- **Real-time streaming** -- Responses are streamed token by token for instant feedback
- **6 visual themes** -- Dark, Light, Ocean, Forest, Sunset, and Midnight
- **12 languages** -- Full internationalization including Arabic (RTL), Chinese, Japanese, Hindi, Greek, and Tifinagh
- **Progressive Web App** -- Installable on any device, works offline with cached responses
- **Conversation history** -- All conversations are stored locally in the browser (no server-side storage)
- **Import and export** -- JSON, JSONL, Markdown, and Alpaca formats supported
- **Search** -- Full-text search across all stored conversations
- **Math rendering** -- KaTeX-powered LaTeX formula display
- **Code blocks** -- Syntax-highlighted code with one-click copy
- **Responsive design** -- Optimized for mobile, tablet, and desktop
- **Reasoning display** -- Toggle visibility of model reasoning chains when supported
- **System theme detection** -- Automatically matches your OS appearance setting

## Architecture

```
Browser (PWA)
  |
  +-- index.html / css / js  (static frontend)
  |
  +-- sw.js                  (service worker for offline + caching)
  |
  +-- manifest.json          (PWA manifest)
  |
  v
Proxy Server (Node.js)
  |
  +-- /api/models            (model listing per provider)
  +-- /api/chat              (streaming chat completions)
  |
  v
AI Providers
  +-- OpenRouter
  +-- Groq
  +-- HuggingFace
```

## Getting Started

### Local Development

A Python development server is included:

```bash
python3 server.py
```

This starts a local server at `http://localhost:8000`. You can specify a different port:

```bash
python3 server.py 3000
```

To bind on all network interfaces (for testing on mobile devices):

```bash
python3 server.py --host 0.0.0.0
```

### Production Deployment

1. Serve the project files from any static web server (Nginx, Apache, Caddy, etc.)
2. Ensure the proxy server is running and accessible
3. Update the proxy URL in the application settings if needed
4. The PWA will be automatically available for installation once served over HTTPS

### Proxy Server

The proxy server handles API key management and routes requests to the appropriate AI provider. See `install-moult-ai-proxy.sh` for setup instructions.

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Proxy URL | `https://api-moult-ai.lombard-web-services.com` | Backend proxy endpoint |
| Theme | Dark | Visual theme (6 options) |
| Font size | 14px | Interface text size (12-20px) |
| Export format | JSON | Format for conversation export |

All settings are persisted in the browser's localStorage.

## Supported Models

Models are fetched dynamically from the proxy server. The default fallback list (used when the API is unavailable) contains:

**OpenRouter:**
- nvidia/nemotron-3-nano-30b-a3b:free
- nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
- nvidia/nemotron-nano-12b-v2-vl:free
- nvidia/nemotron-3-ultra-550b-a55b:free
- poolside/laguna-m.1:free

**Groq:**
- llama-3.3-70b-versatile

## Adding or Removing Models

Models are filtered through an `ALLOWED_MODELS` constant at the top of `js/script.js`. This is the single source of truth for which models appear on the site, regardless of what the proxy API returns.

### 1. The allowed models list

Find the `ALLOWED_MODELS` constant near the top of the file:

```javascript
const ALLOWED_MODELS = {
    openrouter: [
        'nvidia/nemotron-3-nano-30b-a3b:free',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        'nvidia/nemotron-nano-12b-v2-vl:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'poolside/laguna-m.1:free'
    ],
    groq: ['llama-3.3-70b-versatile'],
    hf: []
};
```

To add a model, append its identifier to the appropriate provider array. To remove one, delete the corresponding line. The `fetchModels()` function filters the API response against this list, so only models present here will appear in the dropdown and on the welcome screen.

### 2. Model name display

The `simplifyModelName` function controls how model names are shortened in the UI. If you add a new model family, you can add a mapping entry to make the display name cleaner:

```javascript
const map = {
    'nemotron': 'Nemotron',
    'llama': 'Llama',
    // Add your own mappings here
};
```

### Model identifier format

The model identifier follows the format `provider/model-name`. For OpenRouter models, the format is `openrouter/vendor/model-name:variant`. For Groq models, it is simply `groq/model-name`.

## Technical Details

- **Frontend**: Vanilla JavaScript (no framework dependencies), HTML5, CSS3 with custom properties
- **Styling**: Glassmorphism design system with CSS custom properties for theming
- **Offline**: Service worker with stale-while-revalidate caching strategy
- **Storage**: Browser localStorage for conversations, settings, and preferences
- **Math**: KaTeX for LaTeX rendering
- **Build**: No build step required -- runs directly from source files

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome for Android)

## License

Copyright (c) Lombard Web Services. All rights reserved.

## Author

Developed by [Lombard Web Services](https://lombard-web-services.com)
