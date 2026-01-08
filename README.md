# jyami-page

> Claude로 만든 인터랙티브 컴포넌트 모음집

A component gallery showcasing interactive tools and visualizations built with Claude, deployed to GitHub Pages.

## 🎯 Overview

jyami-page is a personal portfolio of Claude-generated React components. The site features:

- **Public Components** - Shareable tools and visualizations visible on the home page
- **Private Components** - Internal tools accessible via direct URLs only
- **Auto-deployment** - Push to main branch → automatic deployment to GitHub Pages
- **Component Registry** - Easy to add/remove public components

## 🚀 Live Demo

Visit: https://jyami-kim.github.io/gitbook-page/

### Current Components

**Public:**
- [Data Visualizer](https://jyami-kim.github.io/gitbook-page/table-to-chart) - Interactive pie chart with customizable data, titles, and units

## 📦 Components

### Public Components (Visible on Home Gallery)

**Data Visualizer** (`/table-to-chart`)
- Create custom pie charts with dynamic data input
- Customize title, subtitle, and unit (원, $, 개, etc.)
- Real-time percentage calculations
- Glassmorphism design with dark theme
- Data persists across page refreshes
- Perfect for showcasing interactive data visualization

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite 5** - Fast build tool
- **React Router 6** - Client-side routing
- **Recharts 2** - Data visualization
- **Tailwind CSS 3** - Utility-first styling
- **GitHub Pages** - Hosting and deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:5173/gitbook-page/

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - How to add new components to the gallery
- **[TESTING.md](./TESTING.md)** - Testing strategy and examples
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture and decisions

## 📁 Project Structure

```
gitbook-page/
├── src/
│   ├── components/
│   │   ├── public/              # Components shown on home page
│   │   │   └── TableToChart.jsx
│   │   └── private/             # Components accessible via URL only
│   ├── pages/
│   │   └── Home.jsx             # Component gallery / home page
│   ├── App.jsx                  # Router configuration
│   └── main.jsx                 # Entry point
├── public/
│   └── 404.html                 # SPA routing fix for GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions auto-deployment
├── DEVELOPMENT.md               # Component development guide
├── TESTING.md                   # Testing strategy
├── README.md                    # This file
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # Dependencies and scripts
```

## 🔄 Public vs Private Components

### Public Components
- **Folder**: `src/components/public/`
- **Registry**: Must be added to `publicComponents` array in `src/pages/Home.jsx`
- **Visibility**: Listed on home page with card, title, description, and link
- **Use Case**: Shareable tools, demos, client-facing visualizations
- **Example**: TableToChart

### Private Components
- **Folder**: `src/components/private/`
- **Registry**: NOT added to `publicComponents` array
- **Visibility**: Accessible only via direct URL
- **Use Case**: Internal tools, work-in-progress, company-specific utilities

## ✨ Features

- ✅ **Component Gallery** - Browse public components on home page
- ✅ **Public/Private Separation** - Control which components are visible
- ✅ **Auto Deployment** - Push to main → auto-deploy to GitHub Pages
- ✅ **SPA Routing** - Direct URL access and page refresh work correctly
- ✅ **Responsive Design** - Mobile, tablet, and desktop support
- ✅ **Dark Theme** - Modern glassmorphism UI

## 🚀 Adding New Components

Quick overview (see [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed guide):

1. **Create component file**
   ```bash
   touch src/components/public/MyComponent.jsx
   ```

2. **Write component code**
   ```jsx
   export default function MyComponent() {
     return <div>My Component</div>
   }
   ```

3. **Add route** in `src/App.jsx`
   ```jsx
   <Route path="/my-component" element={<MyComponent />} />
   ```

4. **Register if public** in `src/pages/Home.jsx`
   ```jsx
   const publicComponents = [
     {
       id: 'my-component',
       title: 'My Component',
       description: 'Brief description',
       path: '/my-component',
       tags: ['category']
     }
   ]
   ```

5. **Test locally** - `npm run dev`
6. **Deploy** - `git push origin main`

## 🧪 Testing

Minimal, focused testing approach:
- ✅ Routing & navigation tests
- ✅ Component smoke tests
- ✅ Build validation
- ✅ Accessibility tests

```bash
npm run test                # Run tests
npm run test:watch         # Watch mode
npm run test:e2e          # E2E tests
```

See [TESTING.md](./TESTING.md) for details.

## 🚀 Deployment

**Automatic:**
1. Push to `main` branch
2. GitHub Actions runs automatically
3. Build → Deploy to GitHub Pages
4. Live in 1-2 minutes

**Workflow**: `.github/workflows/deploy.yml`

## 📖 Styling Guidelines

- **Dark Theme**: Gray-900 and blue-900 gradients
- **Components**: Tailwind utility classes only
- **Responsive**: Mobile-first, use `md:` and `lg:` breakpoints
- **Charts**: Use Recharts for data visualization

## 🤝 Contributing

This is a personal portfolio, but the architecture is designed for easy extension:
- Add components to `src/components/public/` or `src/components/private/`
- Register public components in `Home.jsx`
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed instructions

## 📄 License

Personal project for showcasing Claude-generated interactive components.
