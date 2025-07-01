# Currency Converter

A fast, lightweight currency converter web app built with Vite and Lit. Features simultaneous multi-currency conversion with smart caching and offline support.

## 🚀 Features

- **Multi-currency conversion**: Click any currency to enter an amount, see all others update instantly
- **Smart caching**: Exchange rates fetched once and cached locally (24h expiration)
- **Offline ready**: PWA with service worker support (coming soon)
- **Lightning fast**: Built with Lit web components for minimal bundle size (~5KB)
- **Mobile-first**: Responsive design optimized for all devices

## 🛠️ Development Environment

### Prerequisites

- Node.js 18+ and npm
- Make (optional, for convenience commands)

### Setup

```bash
# Clone and setup
git clone <repository-url>
cd currency-converter
make setup  # or npm install
```

### Available Commands

```bash
# Development
make dev        # Start development server (http://localhost:5173)
make build      # Build for production
make preview    # Preview production build

# Code Quality
make format     # Format all files with Prettier
make lint       # Check code formatting
make clean      # Clean build artifacts

# Help
make help       # Show all available commands
```

### Manual Commands (without Make)

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build

npx prettier --write "**/*.{js,ts,html,css,json,md}"  # Format files
```

## 📁 Project Structure

```
currency-converter/
├── index.html              # Main HTML entry point
├── src/
│   ├── main.js            # App initialization
│   ├── store/             # State management
│   ├── services/          # API and data services
│   ├── components/        # Lit web components
│   ├── utils/             # Utility functions
│   └── styles/            # CSS styles
├── public/                # Static assets
├── Makefile              # Development commands
└── vite.config.js        # Vite configuration
```

## ⚡ Tech Stack

- **Build Tool**: Vite for fast development and optimized builds
- **Framework**: Lit (web components) for minimal overhead
- **API**: Fawazahmed0/Currency API (free, no rate limits)
- **Storage**: localStorage for caching and preferences
- **PWA**: Service worker for offline functionality (future)

## 🎯 Architecture

### Data Flow

1. **App Load**: Check cached rates → Fetch missing rates → Store locally
2. **User Input**: Calculate from cache → Update UI instantly
3. **Add Currency**: Fetch new rate → Update cache → Recalculate all

### Caching Strategy

- Exchange rates cached for 24 hours
- User preferences persisted in localStorage
- Smart cache invalidation and refresh

## 🧪 Development Workflow

1. **Start development**: `make dev`
2. **Make changes**: Edit files in `src/`
3. **Format code**: `make format` (run before commits)
4. **Build**: `make build` to test production build
5. **Preview**: `make preview` to test built version

## 📦 Bundle Size

- Target: < 50KB total bundle size
- Lit: ~5KB framework overhead
- App code: ~20-30KB estimated
- Zero runtime dependencies beyond Lit

## 🔄 API Integration

Using Fawazahmed0/Currency API:

- **Endpoint**: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.json`
- **Rate Limit**: None
- **CORS**: Enabled
- **Update Frequency**: Daily (suitable for our 24h cache)

## 🎨 UI/UX

- **Click-to-edit**: Any currency card becomes input on click
- **Real-time updates**: All currencies update as you type
- **Smart defaults**: Popular currencies pre-selected
- **Mobile optimized**: Touch-friendly with proper keyboard types

## 🚧 Roadmap

- [x] Basic project setup
- [ ] Core conversion functionality
- [ ] Settings panel
- [ ] PWA features
- [ ] Offline support
- [ ] Performance optimization
