# Development Guide

How to add new components to the jyami-page component gallery.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Organization](#component-organization)
3. [Adding a New Component](#adding-a-new-component)
4. [Styling Guidelines](#styling-guidelines)
5. [Testing Your Component](#testing-your-component)
6. [Deployment](#deployment)
7. [Common Patterns](#common-patterns)
8. [Troubleshooting](#troubleshooting)

## Project Structure

```
gitbook-page/
├── src/
│   ├── components/
│   │   ├── public/              # Components shown on home page gallery
│   │   │   └── TableToChart.jsx # Example: Interactive data visualizer
│   │   └── private/             # Components accessible via direct URL only
│   │       └── [private-components]
│   ├── pages/
│   │   └── Home.jsx             # Component gallery / home page
│   ├── App.jsx                  # Router configuration (all routes)
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles + Tailwind
├── public/
│   └── 404.html                 # SPA routing fix for GitHub Pages
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions auto-deployment
├── DEVELOPMENT.md               # This file
├── TESTING.md                   # Testing guide
├── README.md                    # Project overview
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── package.json                 # Dependencies and scripts
```

## Component Organization

### Public Components

**Location**: `src/components/public/`

**Characteristics**:
- Listed on home page gallery
- Must be added to `publicComponents` array in `src/pages/Home.jsx`
- Include title, description, and tags
- Users see them when visiting the site

**Use Cases**:
- Shareable tools and visualizations
- Demos showing off capabilities
- Client-facing components
- General-audience utilities

**Example**: `TableToChart.jsx` - Interactive pie chart for data visualization

### Private Components

**Location**: `src/components/private/`

**Characteristics**:
- NOT listed on home page gallery
- Accessible only via direct URL
- No entry in `publicComponents` array
- Users won't discover them unless given direct link

**Use Cases**:
- Internal tools and dashboards
- Work-in-progress components
- Company-specific utilities
- Experimental features

## Adding a New Component

### Step 1: Create Component File

**For Public Component**:
```bash
touch src/components/public/MyComponent.jsx
```

**For Private Component**:
```bash
touch src/components/private/MyComponent.jsx
```

### Step 2: Write Component Code

**Minimal Example**:
```jsx
import React from 'react'

export default function MyComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          My Component Title
        </h1>
        <p className="text-gray-300 text-center">
          Component description and content
        </p>
      </div>
    </div>
  )
}
```

**More Complete Example with State**:
```jsx
import React, { useState } from 'react'

export default function MyComponent() {
  const [value, setValue] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          My Component
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <label className="block text-white mb-4">
            Value: {value}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
```

**With Recharts Visualization**:
```jsx
import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
]

export default function MyChart() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <h1 className="text-4xl font-bold text-white text-center mb-12">
        My Chart
      </h1>

      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-8">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### Step 3: Add Route in App.jsx

Open `src/App.jsx` and add your route:

```jsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MyComponent from './components/public/MyComponent'  // Import your component
import TableToChart from './components/public/TableToChart'

function App() {
  return (
    <BrowserRouter basename="/gitbook-page">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-component" element={<MyComponent />} />  {/* Add this line */}
        <Route path="/table-to-chart" element={<TableToChart />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

**Route Naming**:
- Use kebab-case for paths: `/my-component`, `/data-visualizer`, `/tool-name`
- Keep paths short and descriptive
- Match the component folder structure mentally

### Step 4: Register in Home Gallery (Public Components Only)

**SKIP THIS STEP FOR PRIVATE COMPONENTS**

Edit `src/pages/Home.jsx` and add your component to the `publicComponents` array:

```jsx
export default function Home() {
  const publicComponents = [
    {
      id: 'table-to-chart',
      title: 'Data Visualizer',
      description: 'Create custom pie charts with dynamic data input and real-time calculations',
      path: '/table-to-chart',
      tags: ['chart', 'visualization', 'data']
    },
    {
      id: 'my-component',              // Unique identifier (kebab-case)
      title: 'My Component',           // Display name on home page
      description: 'Brief one-line description of what this component does',  // Short summary
      path: '/my-component',           // Must match route in App.jsx
      tags: ['category', 'type']       // Optional tags for future filtering
    }
  ]

  // ... rest of component
}
```

**Registry Field Details**:
- `id`: Unique identifier within the components array (kebab-case)
- `title`: What users see on the home page card
- `description`: 1-2 sentence explanation of functionality
- `path`: The route path (must match `App.jsx` route exactly)
- `tags`: Array of keywords (useful for future search/filtering features)

**Example Descriptions**:
- ❌ Bad: "Chart component"
- ✅ Good: "Convert table data to interactive pie chart with glassmorphism design"
- ❌ Bad: "Calculator"
- ✅ Good: "Real-time expense calculator with category breakdown and visual charts"

### Step 5: Test Locally

```bash
# Start development server
npm run dev

# Visit http://localhost:5173/gitbook-page/
```

**For Public Component**:
- Go to home page
- You should see your component card in the gallery
- Click the card to navigate to your component
- Verify it renders correctly

**For Private Component**:
- Go directly to URL: `http://localhost:5173/gitbook-page/my-component`
- Verify it renders correctly
- Verify it's NOT on the home page

**Responsive Testing**:
- Test on mobile (DevTools device emulation)
- Test on tablet
- Test on desktop
- Verify dark theme looks good

### Step 6: Build and Deploy

```bash
# Verify build succeeds
npm run build

# If no errors, commit and push
git add .
git commit -m "Add MyComponent"
git push origin main
```

**GitHub Actions** will automatically:
1. Install dependencies
2. Run build
3. Deploy to GitHub Pages
4. Your component goes live in 1-2 minutes

**Verify Deployment**:
- Visit https://jyami-kim.github.io/gitbook-page/
- For public: Should appear in home gallery
- For both: Can access via direct URL

## Styling Guidelines

### Theme

**Background Gradient**:
```jsx
className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
```

**Text Colors**:
- Primary: `text-white` (headings, important text)
- Secondary: `text-gray-300` (descriptions, secondary info)
- Tertiary: `text-gray-400` or `text-gray-500` (hints, meta info)

**Card/Container**:
```jsx
className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500"
```

**Buttons**:
```jsx
className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
```

### Responsive Design

Use Tailwind breakpoints:
- Default: Mobile (< 640px)
- `sm:` - Small (640px+)
- `md:` - Medium (768px+)
- `lg:` - Large (1024px+)
- `xl:` - Extra large (1280px+)

**Example - Grid**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* content */}
</div>
```

**Example - Container**:
```jsx
<div className="container mx-auto px-6 max-w-4xl">
  {/* content - responsive padding and max-width */}
</div>
```

### Component Wrapper Pattern

```jsx
export default function MyComponent() {
  return (
    // Full-screen background with gradient
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      {/* Centered container with max-width */}
      <div className="container mx-auto max-w-2xl">

        {/* Header section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Component Title
          </h1>
          <p className="text-gray-300">
            Subtitle or description
          </p>
        </div>

        {/* Main content area */}
        <div className="space-y-6">
          {/* Your component content */}
        </div>

      </div>
    </div>
  )
}
```

### Spacing

Use consistent spacing with Tailwind:
- `mb-4` - Small spacing between elements
- `mb-8` - Medium spacing between sections
- `mb-12` - Large spacing between major sections
- `p-6` - Standard padding inside containers
- `gap-6` - Space between grid items

## Testing Your Component

See [TESTING.md](./TESTING.md) for comprehensive testing guide.

**Quick Checks Before Deploying**:

1. ✅ **Component renders** - No crashes or errors
2. ✅ **Responsive design** - Works on mobile, tablet, desktop
3. ✅ **No console errors** - Open DevTools console, verify no red errors
4. ✅ **Interactive elements work** - Test buttons, sliders, inputs
5. ✅ **Styling looks good** - Dark theme matches existing components
6. ✅ **Page title makes sense** - Browser tab shows page name
7. ✅ **Build succeeds** - `npm run build` completes without errors

**For Public Components**:
8. ✅ **Listed on home page** - Component appears in gallery with correct title/description
9. ✅ **Card clickable** - Can navigate from home page to component

## Deployment

### Automatic Deployment (Recommended)

```bash
# Make your changes, test locally with npm run dev
git add .
git commit -m "Add MyComponent"
git push origin main
```

**What happens automatically**:
1. GitHub Actions workflow triggers
2. Installs dependencies
3. Runs `npm run build`
4. Deploys `dist/` to GitHub Pages
5. Live in 1-2 minutes

**Check deployment status**:
- Go to https://github.com/jyami-kim/gitbook-page/actions
- See green checkmark when deployment succeeds

### Manual Deployment

If needed for testing:
```bash
npm run build         # Creates dist/ folder
npm run preview       # Preview production build locally
```

## Common Patterns

### Data Visualization with Recharts

```jsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 },
  { name: 'Category C', value: 200 },
]

const COLORS = ['#3b82f6', '#ef4444', '#10b981']

export default function MyChart() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <h1 className="text-4xl font-bold text-white text-center mb-12">
        My Chart
      </h1>

      <div className="max-w-2xl mx-auto">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### State Management

```jsx
import { useState } from 'react'

export default function MyComponent() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="container mx-auto max-w-xl">

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-white mb-4">Count: {count}</p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Increment
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mt-6">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
            className="w-full bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-500"
          />
          <p className="text-gray-300 mt-4">You typed: {text}</p>
        </div>

      </div>
    </div>
  )
}
```

### Memoization for Performance

```jsx
import { useMemo } from 'react'

export default function ExpensiveComponent() {
  const [value, setValue] = useState(0)

  // Memoize expensive calculation
  const result = useMemo(() => {
    return expensiveCalculation(value)
  }, [value])

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <p>Result: {result}</p>
    </div>
  )
}

function expensiveCalculation(value) {
  // Simulate expensive operation
  let sum = 0
  for (let i = 0; i < 1000000; i++) {
    sum += i * value
  }
  return sum
}
```

### Form Validation

```jsx
import { useState } from 'react'

export default function FormComponent() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setError('')
    // Do something with email
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email..."
        className="w-full bg-gray-700 text-white px-4 py-2 rounded"
      />
      {error && <p className="text-red-400">{error}</p>}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  )
}
```

## Troubleshooting

### Build Fails with Syntax Error

**Solution**: Check component syntax
- Verify all JSX is properly closed: `<div>...</div>`
- Check all imports are correct: `import React from 'react'`
- Look for typos in class names

### Component Not Showing on Home Page

**Problem**: Public component not appearing in gallery

**Solution**:
1. Verify component is in `src/components/public/`
2. Check that component is added to `publicComponents` array in `src/pages/Home.jsx`
3. Verify `path` in registry matches route in `App.jsx`
4. Verify `id` is unique (no duplicates)
5. Run `npm run build` and check for errors

### Routing Not Working

**Problem**: Component doesn't load when accessing URL

**Solution**:
1. Verify route is added to `src/App.jsx` with correct path
2. Check import path is correct: `./components/public/MyComponent`
3. Verify component file exists
4. Restart dev server: `Ctrl+C`, then `npm run dev`

### Styles Not Applied

**Problem**: Tailwind classes not working

**Solution**:
1. Check class names are spelled correctly (no typos)
2. Verify class names are used in JSX file (not in separate CSS)
3. For classes to work in Tailwind, they must be in template literals/strings in code files
4. Run `npm run build` to ensure Tailwind processes all files
5. Check for conflicting CSS

### Component Renders but Looks Wrong

**Problem**: Colors, spacing, or layout not matching design

**Solution**:
1. Compare with existing components (TableToChart, Home.jsx)
2. Check you're using correct theme colors (gray-900, blue-900, white)
3. Verify responsive classes: `md:`, `lg:` for breakpoints
4. Test in browser DevTools responsive mode
5. Check Tailwind documentation for class names

### GitHub Pages Not Updating

**Problem**: Pushed changes but site doesn't update

**Solution**:
1. Check GitHub Actions workflow: https://github.com/jyami-kim/gitbook-page/actions
2. Look for failed build or deploy steps
3. Clear browser cache (Ctrl+Shift+Delete)
4. Wait 2-3 minutes for deployment to complete
5. If still not working, check error logs in GitHub Actions

### Private Component Accidentally Listed on Home

**Problem**: Private component showing in gallery

**Solution**:
1. Remove component from `publicComponents` array in `src/pages/Home.jsx`
2. Verify it's only in `src/components/private/`
3. Rebuild and redeploy

## Next Steps

- Read [TESTING.md](./TESTING.md) to add tests for your component
- Check [README.md](./README.md) for project overview
- Review existing components for reference
- Ask questions if something is unclear!
