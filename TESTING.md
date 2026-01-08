# Testing Guide

## Testing Philosophy

This project uses a **minimal, focused testing approach** that validates the most critical aspects of the component gallery:

1. **Routing & Navigation** - Verify component access works correctly
2. **Build Validation** - Catch errors before deployment
3. **Manual Testing** - Verify components render and work as expected

## Why This Approach?

This is a **personal component showcase project** deployed to GitHub Pages with auto-deployment. The priority is:
- Components render and don't break
- Users can navigate the gallery
- No build errors

## Manual Testing Checklist

Before deploying, verify:

### Component Rendering
- [ ] Component loads without errors
- [ ] UI displays correctly
- [ ] No console errors or warnings
- [ ] Interactive elements work (buttons, inputs, etc.)

### Responsive Design
- [ ] Works on mobile devices
- [ ] Works on tablets
- [ ] Works on desktop
- [ ] Layout doesn't break at any resolution

### Navigation
- [ ] Can navigate from home page to component
- [ ] Can access component via direct URL
- [ ] Page refresh doesn't break navigation
- [ ] Back button works

### Build Validation
```bash
# Verify build completes without errors
npm run build

# Preview the production build
npm run preview
```

## Build Process

The build process is the primary validation step:

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

GitHub Actions automatically runs `npm run build` on every push to `main`. If the build fails, the deployment is blocked.

## Testing in Development

```bash
# Start dev server
npm run dev

# Visit http://localhost:5173/gitbook-page/
# - Check home page loads
# - Click on components to test navigation
# - Use browser DevTools to check for errors
# - Test responsive design (F12 → Device Emulation)
```

## Deployment Validation

After deploying to GitHub Pages:

1. Visit https://jyami-kim.github.io/gitbook-page/
2. Verify home page loads
3. Test component links
4. Verify direct URL access works
5. Check browser console for errors

## When to Test Locally

- Before every push to `main`
- After adding a new component
- After modifying existing components
- After updating dependencies

## Key Files to Watch

- `src/App.jsx` - Routes configuration
- `src/pages/Home.jsx` - Component registry
- `src/components/` - Component files
- `.github/workflows/deploy.yml` - Deployment workflow

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check error message, fix syntax errors |
| Component not showing | Verify in `publicComponents` array in Home.jsx |
| Route doesn't work | Verify route added in App.jsx |
| Styles not applied | Check class names, restart dev server |
| GitHub Pages not updating | Wait 2-3 minutes, clear browser cache |

## Next Steps

- Read [README.md](./README.md) for project overview
- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for component development
- Review existing components for patterns
