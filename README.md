# Currency Converter

A fast, lightweight currency converter web app built with Vite and Lit. Features simultaneous multi-currency conversion with smart caching and offline support.

## 🌐 Live Demo

**[View Live App](https://lkollar.github.io/currency-converter/)**

The app is automatically deployed to GitHub Pages on every push to the main branch.

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

# Testing
make test       # Run tests in watch mode
make test-run   # Run tests once
make test-ui    # Run tests with interactive UI

# Code Quality
make format     # Format all files with Prettier
make lint       # Check code formatting
make clean      # Clean build artifacts

# Help
make help       # Show all available commands
```

### Manual Commands (without Make)

```bash
# Development
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build

# Testing
npm run test     # Run tests in watch mode
npm run test:run # Run tests once
npm run test:ui  # Run tests with interactive UI

# Code Quality
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
│   ├── tests/             # Unit tests
│   ├── utils/             # Utility functions
│   └── styles/            # CSS styles
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

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) for unit testing with [@open-wc/testing](https://open-wc.org/testing/) for web component testing utilities.

### Running Tests

```bash
# Run tests in watch mode (recommended during development)
make test           # or npm run test

# Run tests once (for CI)
make test-run       # or npm run test:run

# Run tests with interactive UI
make test-ui        # or npm run test:ui
```

### Test Structure

Tests are organized alongside source files in the `src/tests/` directory:

```
src/tests/
├── components.test.js      # Component unit tests
├── currency-api.test.js    # API service tests
└── currency-store.test.js  # Store/state management tests
```

### Writing Tests

- **Components**: Use `@open-wc/testing` for rendering and testing Lit components
- **Services**: Standard Vitest unit tests for business logic
- **Store**: Test state management and data flow

### Test Examples

```bash
# Run specific test file
npx vitest currency-store.test.js

# Run tests with coverage
npx vitest --coverage

# Run tests in specific directory
npx vitest src/tests/
```

## 🧪 Development Workflow

1. **Start development**: `make dev`
2. **Make changes**: Edit files in `src/`
3. **Run tests**: `make test` (keep running in background)
4. **Format code**: `make format` (run before commits)
5. **Build**: `make build` to test production build
6. **Preview**: `make preview` to test built version

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

## 🚀 Deployment

### GitHub Pages (Automatic)

The app is automatically deployed to GitHub Pages using GitHub Actions:

- **Live URL**: https://lkollar.github.io/currency-converter/
- **Trigger**: Every push to the `main` branch
- **Process**: Build → Test → Deploy
- **Status**: Check the Actions tab for deployment status

### Manual Deployment

To deploy elsewhere:

```bash
# Build the app
make build  # or npm run build

# Deploy the contents of the `dist/` folder to your hosting provider
# The app is a static site and can be hosted anywhere
```

### GitHub Pages Setup (One-time)

1. Go to repository **Settings** → **Pages**
2. Under "Source", select **"GitHub Actions"**
3. The deployment workflow is already configured in `.github/workflows/deploy.yml`

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory with your domain
2. Configure DNS to point to `<username>.github.io`
3. Enable "Enforce HTTPS" in repository settings
