# Complete Codebase Audit: Hero Section & Navbar

## Layout Structure (Complete Hierarchy)

```
html (layout.tsx)
└── body (layout.tsx)
    └── ClientLayout (client-layout.tsx)
        └── Providers (providers.tsx)
            └── div.flex.min-h-screen.flex-col.relative
                ├── Navbar (fixed, z-50)
                ├── main.flex-1.overflow-x-hidden.p-0 (on home page)
                │   └── HomePage (home/page.tsx)
                │       └── Fragment <>
                │           ├── section.hero-fullscreen (fixed, z-0)
                │           └── div.relative.z-10.bg-white (marginTop: 100vh)
                └── Footer
```

## Critical Issues Identified

### Issue 1: Hero Section Positioning
- **Location**: `apps/web/app/home/page.tsx` line 10-12
- **Current**: Uses class `hero-fullscreen` with `position: fixed`
- **Problem**: Hero is inside `<main>` element which has `overflow-x-hidden` - this can clip fixed children
- **CSS Class**: Defined in `globals.css` line 255-264 with `!important` flags
- **Z-index**: Hero is `z-0`, Navbar is `z-50` (correct)

### Issue 2: Navbar Centering
- **Location**: `apps/web/components/Navbar.tsx` line 42
- **Current**: Uses `justify-center` on full width container
- **Problem**: Mobile menu button is `absolute left-4`, which might affect centering
- **Structure**: Logo + Nav + Subscribe button should be centered as one group

### Issue 3: Main Element Constraints
- **Location**: `apps/web/app/client-layout.tsx` line 24
- **Current**: `overflow-x-hidden` on main element for home page
- **Problem**: This can prevent fixed elements from breaking out properly

### Issue 4: CSS Loading
- **Primary CSS**: `apps/web/app/globals.css` (imported in both layout.tsx and client-layout.tsx)
- **Secondary CSS**: `apps/web/styles/globals.css` (exists but NOT imported - not used)
- **PostCSS**: Configured correctly with Tailwind and Autoprefixer

## Root Cause Analysis

The hero section is NOT covering the full screen because:
1. It's inside `<main>` which has `overflow-x-hidden` - this creates a new stacking context
2. Fixed positioning inside an element with overflow can be constrained
3. The CSS class might not be applying due to specificity or build issues

## Solution

Move hero section OUTSIDE of main element OR ensure main doesn't constrain it.



