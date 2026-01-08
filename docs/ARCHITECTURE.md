# Architecture Overview

Technical design decisions and architectural patterns used in jyami-page.

## Project Goals

- **Showcase Claude-generated components** - Personal portfolio of interactive tools
- **Easy component management** - Simple public/private categorization
- **Auto-deployment** - Automatic GitHub Pages deployment on code push
- **Low maintenance** - Minimal infrastructure, no backend services
- **Extensible** - Easy to add new components for future work

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│              GitHub Pages                           │
│  (Hosted at jyami-kim.github.io/gitbook-page/)    │
└─────────────────────────────────────────────────────┘
                        ↑
                        │ Auto-deployed by
                        │ GitHub Actions
                        │
┌─────────────────────────────────────────────────────┐
│            GitHub Repository                        │
│  (jyami-kim/gitbook-page)                          │
│                                                     │
│  ├── src/                                          │
│  │   ├── components/public/    (Visible on home)  │
│  │   ├── components/private/   (URL-only access)  │
│  │   ├── pages/Home.jsx        (Gallery)          │
│  │   └── App.jsx               (Routes)           │
│  │                                                 │
│  └── .github/workflows/deploy.yml                 │
│      (Triggers on push to main)                   │
└─────────────────────────────────────────────────────┘
                        ↑
                        │ Push code
                        │
┌─────────────────────────────────────────────────────┐
│        Local Development                            │
│  (npm run dev, edit components)                    │
└─────────────────────────────────────────────────────┘
```

## Core Architectural Decisions

### 1. Component Gallery Pattern

**Decision**: Separate public and private components using folder structure and component registry

**Why**:
- Provides visibility control without additional configuration
- Public/private separation is explicit and easy to understand
- Scaling to many components is manageable
- No database required for component discovery

**Implementation**:
- `src/components/public/` - Components shown on home page
- `src/components/private/` - Components accessible only by direct URL
- `publicComponents` array in `Home.jsx` - Registry of visible components

**Example Flow**:
```
User visits home page
    ↓
Home.jsx renders publicComponents array
    ↓
Public components show as cards with links
    ↓
User clicks card → navigates to /table-to-chart
    ↓
React Router matches route and renders TableToChart
```

### 2. Single-Page Application (SPA) with Client-Side Routing

**Decision**: Use React Router for client-side navigation instead of traditional multi-page app

**Why**:
- Fast navigation without page reloads
- Smooth transitions between components
- Single codebase for all pages
- Easy to share URLs for any component route

**How It Works**:
- `BrowserRouter` with `basename="/gitbook-page"` in `App.jsx`
- `<Routes>` define all component paths
- Client-side rendering handles navigation

**GitHub Pages Special Handling**:
GitHub Pages normally only serves index.html for root requests. For direct URLs to any route, we need a workaround:

1. **404.html Redirect** - When user tries any direct URL, GitHub Pages serves `public/404.html`
2. **Path Preservation** - 404.html encodes the path and redirects to `index.html?redirect=[encoded-path]`
3. **JavaScript Decoding** - index.html script decodes the path and updates browser history
4. **React Router** - Takes over and renders the correct component

### 3. Vite as Build Tool

**Decision**: Use Vite instead of Create React App or Webpack

**Why**:
- **Fast development** - HMR (Hot Module Replacement) is instant
- **Small footprint** - Minimal build configuration needed
- **Modern tooling** - Native ES modules support
- **GitHub Pages compatible** - Easy configuration for `/gitbook-page/` subpath

**Configuration** (`vite.config.js`):
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/gitbook-page/',  // Subpath for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

### 4. Tailwind CSS for Styling

**Decision**: Use utility-first CSS with Tailwind instead of styled-components or SCSS

**Why**:
- **Fast development** - No context switching between HTML and CSS files
- **Consistent styling** - Limited color palette and spacing scale
- **Small bundle** - PurgeCSS removes unused utilities
- **Dark theme built-in** - Easy dark mode support
- **Component reuse** - Copy-paste Tailwind classes

**Theme**:
- Dark background: `bg-gray-900`, `bg-gray-800`
- Blue accent: `bg-blue-600`, `border-blue-500`
- Text: `text-white` (primary), `text-gray-300` (secondary)

### 5. Recharts for Data Visualization

**Decision**: Use Recharts for charts instead of D3.js or other libraries

**Why**:
- **React-native** - Built for React components
- **Easy to use** - Declarative API similar to React
- **Good defaults** - Looks great without much customization
- **Responsive** - Built-in responsive container
- **Active development** - Well-maintained and documented

**Used in**:
- TableToChart - Pie chart visualization

### 6. GitHub Actions for Deployment

**Decision**: Automatic deployment to GitHub Pages via GitHub Actions

**Why**:
- **Free** - GitHub Actions included with repository
- **Automatic** - Triggered on push to main branch
- **Reliable** - GitHub maintains the infrastructure
- **Fast** - Deployed in 1-2 minutes

**Workflow** (`.github/workflows/deploy.yml`):
1. Trigger on push to main
2. Checkout code
3. Setup Node.js
4. Install dependencies (`npm ci`)
5. Build project (`npm run build`)
6. Deploy dist/ to GitHub Pages

### 7. No Backend Services

**Decision**: Store all data in component state/files, no API or database

**Why**:
- **Simplicity** - No server to manage or pay for
- **Fast** - No network latency
- **Portfolio** - Shows component UI/logic, not backend
- **Private data** - Company-specific components contain hardcoded data

**Limitation**: Components can't persist user input across sessions

**Future**: Could add APIs if needed (fetch from external service, localStorage for client-side persistence)

## Data Flow

### Public Component Discovery

```
User visits https://jyami-kim.github.io/gitbook-page/

  ↓

Browser loads index.html

  ↓

React renders App.jsx

  ↓

React Router matches "/" route → renders Home.jsx

  ↓

Home.jsx reads publicComponents array:
[
  {
    id: 'table-to-chart',
    title: 'Table to Chart',
    path: '/table-to-chart',
    ...
  }
]

  ↓

Renders component cards for each entry

  ↓

User sees cards on home page
User clicks "Table to Chart" card

  ↓

React Router navigates to /table-to-chart

  ↓

Renders TableToChart component

  ↓

Shows interactive pie chart
```

### Private Component Access

Private components (in `src/components/private/`) are accessible only via direct URL without appearing in the public gallery.

**Access Flow**:
1. User navigates to a private component URL (e.g., `/private-component`)
2. GitHub Pages 404 serves the redirect middleware (`public/404.html`)
3. 404.html encodes the path and redirects to `index.html`
4. index.html decodes and restores the original path
5. React Router matches and renders the private component
6. User sees the component but it's not discoverable from the home page

## Directory Structure Philosophy

```
src/
├── components/
│   ├── public/           # Components shown in gallery
│   │   └── TableToChart.jsx
│   └── private/          # Components hidden from gallery
│       └── PrivateComponent.jsx
├── pages/
│   └── Home.jsx          # Gallery/home page (not a component)
├── App.jsx               # Routes (routing config, not a component)
└── main.jsx              # Entry point
```

**Naming**:
- `components/` - Reusable UI elements
- `pages/` - Full-page components
- `components/public/` - Meant to be discovered
- `components/private/` - Meant to be accessed directly

**Note**: `Home.jsx` is in `pages/` not `components/` because it's a full page, not a reusable component.

## Routing Architecture

**Base Path**: `/gitbook-page/`

**Routes**:
```
/                    → Home (gallery)
/table-to-chart      → TableToChart component
/[private-route]     → Private components (URL-only access)
```

**URL Structure**:
```
https://jyami-kim.github.io/gitbook-page/
                                ^          ^
                                |          └─ Route path
                                └─────────── Base path
```

**React Router Config** (App.jsx):
```jsx
<BrowserRouter basename="/gitbook-page">
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/table-to-chart" element={<TableToChart />} />
    {/* Private components added here */}
  </Routes>
</BrowserRouter>
```

The `basename` tells React Router that all routes are under `/gitbook-page/` prefix.

## Component Registry Pattern

**Why Registry?**

Instead of automatically discovering components, we use an explicit registry:

```jsx
// Good - Explicit control
const publicComponents = [
  { id: 'table-to-chart', title: 'Table to Chart', ... }
]

// Not used - Automatic discovery
// const components = getAllComponentsFromPublicFolder()
```

**Benefits**:
- Explicit control over which components are public
- Can add metadata (title, description, tags)
- Can order components intentionally
- Easy to see what's public at a glance

**Example Registry**:
```jsx
const publicComponents = [
  {
    id: 'unique-id',              // Must be unique
    title: 'Display Name',         // Shown to users
    description: 'What it does',   // Card description
    path: '/route-path',           // Must match App.jsx route
    tags: ['visualization']        // For future filtering
  }
]
```

## Styling Architecture

### Tailwind CSS Organization

No separate CSS files - all styling done with Tailwind utility classes:

```jsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
  <h1 className="text-4xl font-bold text-white">Title</h1>
  <p className="text-gray-300">Description</p>
</div>
```

**Benefits**:
- Colocated styling and markup
- Consistent design tokens
- Easy to maintain
- Small CSS bundle

**Theme Colors**:
- Gray scale: gray-50 to gray-900 (light to dark)
- Blue: blue-400 to blue-900 (light to dark)
- Red, green, yellow for alerts/status

**Responsive Modifiers**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  // 1 column on mobile, 2 on tablet, 3 on desktop
</div>
```

## State Management Philosophy

**Current Approach**: React built-in state (useState, useCallback)

**Why**:
- Components are independent - no shared state needed
- Simple and sufficient for current use cases
- Avoids Redux/Context complexity

**When to Use**:
- `useState` - Local component state (sliders, form inputs)
- `useMemo` - Memoize expensive calculations
- `useCallback` - Memoize event handlers (if performance issue)

**Not Used**:
- ❌ Redux - No cross-component state needed
- ❌ Context API - No theme/auth to share
- ❌ External state library - Over-engineering for this project

**Future**: Could add Context for dark mode theme if needed.

## Error Handling Philosophy

**Current Approach**: No error boundaries or error handling

**Why**:
- Components are relatively simple
- No external APIs that can fail
- Portfolio project - uptime less critical
- Build catches most errors before deploy

**If Components Fail**:
- User sees white page
- Can refresh and try again
- GitHub Actions logs show build errors

**Future**: Add error boundaries if:
- Components use external APIs
- More complex state logic
- Uptime becomes critical

## Performance Considerations

### Current Optimizations

1. **Vite** - Fast builds and dev server
2. **Code splitting** - Each component is separate route
3. **Tailwind PurgeCSS** - Only includes used styles
4. **Responsive images** - No unnecessarily large images
5. **React.memo** - Could memoize components if needed

### Monitoring

**No monitoring in place** (portfolio project)

**Could add**:
- Google Analytics - Track user behavior
- Sentry - Error tracking
- Lighthouse - Performance audits

## Security Considerations

### Current Security Posture

1. **No user input processing** - No forms that submit to backend
2. **Hardcoded data** - No APIs to leak credentials
3. **Public repository** - Code is already visible
4. **GitHub Pages** - Static hosting, no server vulnerabilities

### Potential Risks

1. **Private data in public repo** - Could add sensitive data by accident
   - Mitigation: Code review before commit
   - Never put API keys, passwords, personal data

2. **XSS** - If components accept user input
   - React escapes by default
   - Safe from injection in current code

3. **Dependency vulnerabilities** - npm packages could have security issues
   - Monitor: `npm audit`
   - Update: `npm update`

## Deployment Architecture

### Build Process

```
Source Code (Git)
  ↓
GitHub Actions triggers (on push to main)
  ↓
npm ci (clean install)
  ↓
npm run build (Vite builds)
  ↓
dist/ folder created
  ↓
GitHub Pages deployment
  ↓
Files served at jyami-kim.github.io/gitbook-page/
```

### Environment

- **Development**: Local machine (`npm run dev`)
- **Staging**: None (test locally)
- **Production**: GitHub Pages (auto-deployed)

### Build Output

```
dist/
├── index.html          # Served for all routes (SPA)
├── 404.html           # Fallback for direct URLs
└── assets/
    ├── index-XXXXX.js # Bundled JavaScript
    └── index-XXXXX.css # Bundled CSS
```

## Scalability

### Current Limits

- **Components**: Can handle 50+ components without issues
- **Component size**: Each component should be < 1000 lines
- **Data**: Hardcoded data works up to ~1MB
- **Users**: GitHub Pages can handle thousands of concurrent users

### If Project Grows

**Add Backend**:
```
React App → API Backend → Database
```

**Add State Management**:
```
useState → Context API → Redux/Zustand
```

**Add More Infrastructure**:
```
GitHub Pages → Custom Domain + CDN → Own Servers
```

## Testing Architecture

See [TESTING.md](../TESTING.md) for comprehensive testing guide.

**Current Approach**: Minimal, focused testing
- Routing tests (navigation works)
- Smoke tests (components render)
- Build validation (no errors)
- Accessibility tests (a11y compliant)

**Why not comprehensive testing?**
- Portfolio project (uptime less critical)
- Components are relatively simple
- Manual testing sufficient for this scope
- Add tests as complexity grows

## Documentation Architecture

### Documentation Layers

1. **README.md** - Project overview and quick start
2. **DEVELOPMENT.md** - How to add components (for Claude or developers)
3. **TESTING.md** - Testing strategy and examples
4. **ARCHITECTURE.md** - This file (design decisions and reasoning)

### For Future Claude Sessions

When working on this project in Claude Code:
1. Read README.md for project overview
2. Read DEVELOPMENT.md for adding components
3. Read TESTING.md for testing approach
4. Reference existing components for patterns

## Decision Matrix

### Why Not [Technology X]?

| Technology | Why Not | What We Use Instead |
|-----------|---------|-------------------|
| Create React App | Slower, more config | Vite |
| TypeScript | Adds complexity, not needed for portfolio | JavaScript |
| Next.js | Overkill for static site | React Router SPA |
| Express.js | No backend needed | GitHub Pages only |
| Redux | No shared state | useState hooks |
| styled-components | No CSS file benefits | Tailwind CSS |
| D3.js | Complex to learn and maintain | Recharts |
| Docker | No container needed | Deploy directly to Pages |
| Database | Stateless portfolio | Hardcoded data |

## Summary

**jyami-page** is a component gallery using:
- **React** for UI components
- **Vite** for fast builds
- **React Router** for SPA routing
- **Tailwind CSS** for styling
- **GitHub Pages** for hosting
- **GitHub Actions** for auto-deployment

**Key Architectural Principles**:
- ✅ Simple and maintainable
- ✅ Easy to add components
- ✅ Explicit public/private separation
- ✅ No backend dependencies
- ✅ Zero configuration for new developers (just read DEVELOPMENT.md)
