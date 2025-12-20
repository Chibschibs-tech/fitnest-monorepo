# Codebase Audit: Hero Section & Navbar Structure

## Layout Hierarchy

1. **Root Layout** (`apps/web/app/layout.tsx`)
   - Server component
   - Wraps everything in `<html><body>`
   - Imports `ClientLayout` and passes children

2. **Client Layout** (`apps/web/app/client-layout.tsx`)
   - Client component (uses hooks)
   - Structure: `<Providers><div className="flex min-h-screen flex-col"><Navbar/><main>{children}</main><Footer/></div></Providers>`
   - Main element: `className={isHomePage ? "flex-1 overflow-x-hidden p-0" : "flex-1"}`
   - Navbar is conditionally rendered (not on waitlist page)

3. **Root Page** (`apps/web/app/page.tsx`)
   - Server component
   - Simply imports and renders `HomePage` from `./home/page`

4. **Home Page** (`apps/web/app/home/page.tsx`)
   - Server component
   - Returns fragment `<>...</>` with hero section first
   - Hero section uses inline styles to break out of container

## Current Implementation Issues

### Hero Section
- **Location**: `apps/web/app/home/page.tsx` lines 9-43
- **Current approach**: Uses inline styles with viewport width calculations
- **Problem**: The hero is inside `<main>` which is inside a flex container, constraining the break-out
- **Styles applied**: `width: '100vw'`, `left: '50%'`, `marginLeft: '-50vw'`, `marginTop: '-64px'`, `paddingTop: '64px'`

### Navbar
- **Location**: `apps/web/components/Navbar.tsx`
- **Current approach**: Fixed positioning with conditional background
- **Problem**: Background uses both class `bg-transparent` AND inline style `backgroundColor: 'rgba(0, 0, 0, 0.1)'` which might conflict
- **Centering**: Uses `absolute left-1/2 transform -translate-x-1/2` which should work but might be affected by parent constraints

## CSS Files
- **Primary**: `apps/web/app/globals.css` (imported in client-layout)
- **Secondary**: `apps/web/styles/globals.css` (exists but not imported in main layout)
- **Tailwind Config**: `apps/web/tailwind.config.js`

## Solution Strategy

1. **Hero Section**: Make it truly full-screen by:
   - Using fixed positioning OR
   - Ensuring parent containers don't constrain it
   - Adding proper spacing for content below

2. **Navbar**: 
   - Remove conflicting background styles
   - Ensure proper centering
   - Make background truly transparent with backdrop blur

3. **Layout**: 
   - Ensure main element doesn't add constraints on home page
   - Add proper spacing for hero section



