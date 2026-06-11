# Moult AI Web

> Interface web unifiée et élégante pour interroger plusieurs modèles d'intelligence artificielle via une API proxy unique.

> Elegant and unified web interface to query multiple AI language models through a single proxy API.

---

## 🇫🇷 Français

### 📋 Description

**Moult AI Web** est une application web Progressive (PWA) qui offre une interface unifiée et moderne pour interagir avec plusieurs modèles d'IA : Llama, Mistral, Qwen, DeepSeek, Gemma, Nemotron, Phi et bien d'autres. L'application communique via un serveur proxy qui gère les appels à **OpenRouter**, **GroqCloud** et **HuggingFace**.

### ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🧠 **Multi-modèles** | Accès à des dizaines de modèles LLM via un seul menu déroulant |
| 💬 **Chat en streaming** | Réponses en temps réel avec animation de frappe |
| 🎨 **6 thèmes** | Sombre, Clair, Océan, Forêt, Coucher de soleil, Minuit + Système |
| 🌍 **12 langues** | FR, EN, ES, DE, IT, PT, JA, ZH-CN, AR (RTL), HI, EL, ZGH (Tamazight) |
| 📱 **PWA** | Installable, fonctionne hors-ligne (page d'accueil) |
| 💾 **Historique local** | Conversations sauvegardées dans localStorage (max. 50) |
| 📦 **Import / Export** | JSON, JSONL, Markdown, Format Alpaca |
| 🔍 **Recherche** | Recherche instantanée dans les conversations |
| 📐 **Responsive** | Adapté mobile, tablette et desktop |
| 🧩 **Markdown avancé** | Rendu des titres, listes, code, tableaux, liens, images |
| ⚙️ **Paramètres** | Thème, langue, taille de police, URL proxy personnalisable |
| 🤖 **Modes de chat** | Assistant, Code, Créatif, Concis, Académique, Debug |
| ♿ **Accessibilité** | Labels ARIA, navigation clavier, contraste WCAG |
| 🌐 **SEO** | Meta tags OpenGraph, Twitter Card, JSON-LD, robots.txt |
| 🔒 **Sécurité** | Protection XSS, HTTPS, CSP compatible |

### 🏗️ Architecture

```
new/
├── index.html          # Page principale (PWA, SEO, Meta tags)
├── css/
│   └── style.css       # Design System complet (Glassmorphism, 6 thèmes, RTL)
├── js/
│   └── script.js       # Logique frontend (chat, dropdowns, stockage, streaming)
├── images/
│   ├── logo*.png       # Logos et favicons
│   ├── logo500-white.png
│   └── favicon/        # Favicons multi-tailles
├── manifest.json       # Manifest PWA
├── sw.js               # Service Worker
└── install*.sh         # Scripts d'installation du proxy
```

### 🚀 Installation

#### 1. Serveur Proxy (requis)

Le proxy gère les appels aux APIs d'IA et assure la sécurité des clés API.

```bash
# Installer avec Node.js
bash install-with-node.sh

# Installer avec Bun
bash install-with-bun.sh
```

#### 2. Configuration

Modifiez l'URL du proxy dans les **Paramètres** de l'application, ou éditez le code :

```javascript
DEFAULT_SERVER: 'https://api-moult-ai.lombard-web-services.com'
```

#### 3. Déploiement

Hébergez les fichiers `new/` sur n'importe quel serveur web (Nginx, Apache, Netlify, Vercel, GitHub Pages...).

### 🎨 Thèmes

| Thème | Description |
|---|---|
| 🌙 Sombre | Fond sombre avec accents indigo/violet |
| ☀️ Clair | Fond blanc, textes sombres |
| 🌊 Océan | Tons bleus apaisants |
| 🌲 Forêt | Tons verts naturels |
| 🌅 Coucher de soleil | Tons chauds orange/rouge |
| 🌌 Minuit | Bleu nuit profond |
| 💻 Système | Suit les préférences OS |

### 🌍 Langues supportées

| Code | Langue | RTL |
|---|---|---|
| `fr` | 🇫🇷 Français | ❌ |
| `en` | 🇬🇧 English | ❌ |
| `es` | 🇪🇸 Español | ❌ |
| `de` | 🇩🇪 Deutsch | ❌ |
| `it` | 🇮🇹 Italiano | ❌ |
| `pt` | 🇵🇹 Português | ❌ |
| `ja` | 🇯🇵 日本語 | ❌ |
| `zh-CN` | 🇨🇳 简体中文 | ❌ |
| `ar` | 🇸🇦 العربية | ✅ |
| `hi` | 🇮🇳 हिंदी | ❌ |
| `el` | 🇬🇷 Ελληνικά | ❌ |
| `zgh` | 🇲🇦 ⵜⴰⵎⴰⵣⵉⵖⵜ | ❌ |

### 🧩 Modèles supportés

L'application s'adapte dynamiquement aux modèles fournis par le proxy. Par défaut :

- **OpenRouter** : Nemotron, Llama, Qwen, Gemma, DeepSeek, Poolside, Mistral, Phi...
- **GroqCloud** : Llama 3.3 70B
- **HuggingFace** : (selon configuration du proxy)

### 📐 Design System

- **Typographie** : Roboto (principal), Inter (secondaire), JetBrains Mono (code), Noto Sans Arabic (arabe)
- **Approche visuelle** : Glassmorphism avec backdrop-filter blur
- **Espacement** : Système de tokens (xs → 2xl)
- **Border-radius** : sm → full (pill)
- **Animations** : Transitions fluides avec cubic-bezier

### 🔧 Technologies

- **Frontend** : HTML5, CSS3 (Custom Properties), JavaScript vanilla (ES2022+)
- **PWA** : Service Worker, Manifest, Splash Screen
- **Pas de framework** : Zéro dépendance, performance maximale

### 📄 Licence

© 2026 Lombard Web Services — Tous droits réservés

---

## 🇬🇧 English

### 📋 Description

**Moult AI Web** is a Progressive Web App (PWA) that provides a unified, modern interface for interacting with multiple AI models: Llama, Mistral, Qwen, DeepSeek, Gemma, Nemotron, Phi, and many more. The application communicates through a proxy server that manages API calls to **OpenRouter**, **GroqCloud**, and **HuggingFace**.

### ✨ Features

| Feature | Description |
|---|---|
| 🧠 **Multi-model** | Access dozens of LLMs through a single dropdown |
| 💬 **Streaming chat** | Real-time responses with typing animation |
| 🎨 **6 themes** | Dark, Light, Ocean, Forest, Sunset, Midnight + System |
| 🌍 **12 languages** | FR, EN, ES, DE, IT, PT, JA, ZH-CN, AR (RTL), HI, EL, ZGH (Tamazight) |
| 📱 **PWA** | Installable, works offline (home page) |
| 💾 **Local history** | Conversations saved in localStorage (max 50) |
| 📦 **Import / Export** | JSON, JSONL, Markdown, Alpaca format |
| 🔍 **Search** | Instant search across conversations |
| 📐 **Responsive** | Mobile, tablet, and desktop optimized |
| 🧩 **Advanced Markdown** | Headings, lists, code blocks, tables, links, images |
| ⚙️ **Settings** | Theme, language, font size, custom proxy URL |
| 🤖 **Chat modes** | Assistant, Code, Creative, Concise, Academic, Debug |
| ♿ **Accessibility** | ARIA labels, keyboard navigation, WCAG contrast |
| 🌐 **SEO** | OpenGraph meta, Twitter Card, JSON-LD, robots.txt |
| 🔒 **Security** | XSS protection, HTTPS, CSP compatible |

### 🏗️ Architecture

```
new/
├── index.html          # Main page (PWA, SEO, Meta tags)
├── css/
│   └── style.css       # Complete Design System (Glassmorphism, 6 themes, RTL)
├── js/
│   └── script.js       # Frontend logic (chat, dropdowns, storage, streaming)
├── images/
│   ├── logo*.png       # Logos and favicons
│   ├── logo500-white.png
│   └── favicon/        # Multi-size favicons
├── manifest.json       # PWA Manifest
├── sw.js               # Service Worker
└── install*.sh         # Proxy installation scripts
```

### 🚀 Installation

#### 1. Proxy Server (required)

The proxy handles AI API calls and secures API keys.

```bash
# Install with Node.js
bash install-with-node.sh

# Install with Bun
bash install-with-bun.sh
```

#### 2. Configuration

Change the proxy URL in the app **Settings**, or edit the code:

```javascript
DEFAULT_SERVER: 'https://api-moult-ai.lombard-web-services.com'
```

#### 3. Deployment

Host the `new/` directory on any web server (Nginx, Apache, Netlify, Vercel, GitHub Pages...).

### 🎨 Themes

| Theme | Description |
|---|---|
| 🌙 Dark | Dark background with indigo/violet accents |
| ☀️ Light | White background, dark text |
| 🌊 Ocean | Calming blue tones |
| 🌲 Forest | Natural green tones |
| 🌅 Sunset | Warm orange/red tones |
| 🌌 Midnight | Deep night blue |
| 💻 System | Follows OS preferences |

### 🌍 Supported Languages

| Code | Language | RTL |
|---|---|---|
| `fr` | 🇫🇷 Français | No |
| `en` | 🇬🇧 English | No |
| `es` | 🇪🇸 Español | No |
| `de` | 🇩🇪 Deutsch | No |
| `it` | 🇮🇹 Italiano | No |
| `pt` | 🇵🇹 Português | No |
| `ja` | 🇯🇵 日本語 | No |
| `zh-CN` | 🇨🇳 简体中文 | No |
| `ar` | 🇸🇦 العربية | ✅ |
| `hi` | 🇮🇳 हिंदी | No |
| `el` | 🇬🇷 Ελληνικά | No |
| `zgh` | 🇲🇦 ⵜⴰⵎⴰⵣⵉⵖⵜ | No |

### 🧩 Supported Models

The app dynamically adapts to models provided by the proxy. Default:

- **OpenRouter**: Nemotron, Llama, Qwen, Gemma, DeepSeek, Poolside, Mistral, Phi...
- **GroqCloud**: Llama 3.3 70B
- **HuggingFace**: (depends on proxy configuration)

### 📐 Design System

- **Typography**: Roboto (primary), Inter (secondary), JetBrains Mono (code), Noto Sans Arabic (Arabic)
- **Visual approach**: Glassmorphism with backdrop-filter blur
- **Spacing**: Token system (xs → 2xl)
- **Border-radius**: sm → full (pill)
- **Animations**: Smooth transitions with cubic-bezier

### 🔧 Technologies

- **Frontend**: HTML5, CSS3 (Custom Properties), vanilla JavaScript (ES2022+)
- **PWA**: Service Worker, Manifest, Splash Screen
- **No framework**: Zero dependencies, maximum performance

### 📄 License

© 2026 Lombard Web Services — All rights reserved
