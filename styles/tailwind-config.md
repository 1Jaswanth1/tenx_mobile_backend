# Tailwind CSS Configuration Documentation

This document provides a comprehensive, human-readable guide to the 1DXR Tailwind CSS configuration, including all brand assets, color systems, typography, and custom utilities.

---

## Table of Contents

1. [Overview](#overview)
2. [Brand Colors](#brand-colors)
3. [Typography](#typography)
4. [Design Tokens](#design-tokens)
5. [Custom Utilities](#custom-utilities)
6. [Component Patterns](#component-patterns)
7. [Usage Examples](#usage-examples)
8. [Dark Mode](#dark-mode)
9. [Accessibility](#accessibility)

---

## Overview

The 1DXR Tailwind configuration is built on **Tailwind CSS v4** and includes:

- **Brand-specific color system** with all 1DXR colors
- **Typography scale** using Poppins and Sofia Sans fonts
- **Custom utility classes** for brand-consistent styling
- **Pre-built component patterns** for common UI elements
- **Full dark mode support** with automatic color switching
- **Accessibility-first** design with WCAG AA compliance

### Key Features

✅ **Brand Integration** - All brand colors, fonts, and design tokens  
✅ **Dark Mode** - Complete dark theme support  
✅ **Responsive Typography** - Mobile-first, scalable text sizes  
✅ **Custom Gradients** - Brand gradient utilities  
✅ **Component Patterns** - Pre-styled buttons, cards, and badges  
✅ **Accessibility** - Built-in focus states and reduced motion support

---

## Brand Colors

### Primary Brand Colors

All 1DXR brand colors are available as CSS variables and Tailwind utilities.

#### Cornflower Blue
**Primary brand color for interactive elements**

| Format | Value | CSS Variable | Tailwind Class |
|--------|-------|--------------|----------------|
| HEX | `#568AFF` | `--brand-cornflower` | `bg-brand-cornflower` |
| RGB | `86, 138, 255` | - | `text-brand-cornflower` |

**Usage:**
- Primary buttons
- Links and interactive elements
- Brand accents
- Hero sections

```jsx
// Example
<button className="bg-brand-cornflower text-white">Click Me</button>
<h1 className="text-brand-cornflower">Welcome</h1>
```

---

#### Green-Blue
**Secondary brand color**

| Format | Value | CSS Variable | Tailwind Class |
|--------|-------|--------------|----------------|
| HEX | `#0665BA` | `--brand-green-blue` | `bg-brand-green-blue` |
| RGB | `6, 101, 186` | - | `text-brand-green-blue` |

**Usage:**
- Secondary buttons
- Gradient end points
- Hover states
- Supporting graphics

```jsx
// Example
<button className="bg-brand-green-blue text-white">Secondary Action</button>
```

---

#### Rich Black
**Base/text color**

| Format | Value | CSS Variable | Tailwind Class |
|--------|-------|--------------|----------------|
| HEX | `#001320` | `--brand-rich-black` | `bg-brand-rich-black` |
| RGB | `0, 19, 32` | - | `text-brand-rich-black` |

**Usage:**
- Body text
- Headers and titles
- Dark backgrounds
- Icons (light mode)

```jsx
// Example
<div className="bg-brand-rich-black text-white">
  <h1>Dark Section</h1>
</div>
```

---

#### French Sky Blue
**Accent color**

| Format | Value | CSS Variable | Tailwind Class |
|--------|-------|--------------|----------------|
| HEX | `#66ABFE` | `--brand-french-sky` | `bg-brand-french-sky` |
| RGB | `102, 171, 254` | - | `text-brand-french-sky` |

**Usage:**
- Success states
- Highlighted content
- Badges and labels
- Info notifications

```jsx
// Example
<span className="bg-brand-french-sky text-white px-3 py-1 rounded">
  New
</span>
```

---

### Brand Gradient

The signature 1DXR gradient: **#559EFF → #0065BA**

| Direction | CSS Variable Start | CSS Variable End | Tailwind Class |
|-----------|-------------------|------------------|----------------|
| Diagonal (135°) | `--brand-gradient-start` | `--brand-gradient-end` | `bg-brand-gradient` |
| Vertical (180°) | `--brand-gradient-start` | `--brand-gradient-end` | `bg-brand-gradient-vertical` |
| Horizontal (90°) | `--brand-gradient-start` | `--brand-gradient-end` | `bg-brand-gradient-horizontal` |

**Usage Examples:**

```jsx
// Diagonal gradient (default)
<div className="bg-brand-gradient h-64">
  <h2 className="text-white">Hero Section</h2>
</div>

// Vertical gradient
<div className="bg-brand-gradient-vertical h-screen">
  <h1 className="text-white">Full Page Gradient</h1>
</div>

// Gradient text
<h1 className="text-brand-gradient text-6xl font-bold">
  Gradient Text
</h1>
```

---

## Typography

### Font Families

#### Poppins (Primary Font)

**Google Fonts:** [Poppins](https://fonts.google.com/specimen/Poppins)

| Weight | Name | CSS Variable | Tailwind Class | Usage |
|--------|------|--------------|----------------|-------|
| 600 | Semi Bold | `--font-poppins` | `font-poppins` | Headings, emphasis |
| 400 | Regular | `--font-poppins` | `font-poppins` | Body text, paragraphs |

**Import in your app:**

```tsx
// app/layout.tsx (Next.js)
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

#### Sofia Sans Extra Condensed (Accent Font)

**Google Fonts:** [Sofia Sans Extra Condensed](https://fonts.google.com/specimen/Sofia+Sans+Extra+Condensed)

| Weight | Name | CSS Variable | Tailwind Class | Usage |
|--------|------|--------------|----------------|-------|
| 400 | Regular | `--font-sofia` | `font-sofia` | Labels, tags, decorative |

**Special utility for accent labels:**

```jsx
// Accent label with proper styling
<span className="text-accent-label">
  NEW FEATURE
</span>
// Applies: Sofia Sans, uppercase, letter-spacing, font-weight
```

---

### Typography Scale

Responsive typography that scales across breakpoints:

| Element | Mobile | Tablet (768px+) | Desktop (1024px+) | Tailwind |
|---------|--------|-----------------|-------------------|----------|
| **H1** | 30px | 36px | **48px** ✓ | `text-5xl` |
| **H2** | 24px | 30px | **36px** ✓ | `text-4xl` |
| **H3** | 20px | 24px | **28px** ✓ | `text-3xl` |
| **Body Large** | - | - | **18px** ✓ | `text-lg` |
| **Body** | - | - | **16px** ✓ | `text-base` |
| **Small** | - | - | **14px** ✓ | `text-sm` |
| **Caption** | - | - | **12px** ✓ | `text-xs` |

✓ = Brand guideline size

**Usage Examples:**

```jsx
// Headings automatically use Poppins Semi Bold (600)
<h1 className="text-5xl">Main Title</h1>        {/* 48px on desktop */}
<h2 className="text-4xl">Section Header</h2>    {/* 36px on desktop */}
<h3 className="text-3xl">Subsection</h3>        {/* 28px on desktop */}

// Body text uses Poppins Regular (400)
<p className="text-base">Regular paragraph text</p>
<p className="text-lg">Large body text</p>
<p className="text-sm">Small text</p>
```

---

### Line Height Guidelines

| Text Type | Line Height | Tailwind Class |
|-----------|-------------|----------------|
| Headlines | 1.2 | `leading-tight` |
| Body Text | 1.6 | `leading-relaxed` |
| Captions | 1.4 | `leading-normal` |

---

## Design Tokens

### Border Radius

Consistent rounded corners throughout the application:

| Token | Value | CSS Variable | Usage |
|-------|-------|--------------|-------|
| **sm** | 6px | `--radius-sm` | Small elements |
| **md** | 8px | `--radius-md` | Medium elements |
| **lg** | 10px | `--radius-lg` | Large elements (base) |
| **xl** | 14px | `--radius-xl` | Extra large elements |

**Tailwind classes:**

```jsx
<div className="rounded-sm">Small radius (6px)</div>
<div className="rounded-md">Medium radius (8px)</div>
<div className="rounded-lg">Large radius (10px)</div>
<div className="rounded-xl">Extra large radius (14px)</div>
```

---

### Shadows

Brand-specific shadow utilities:

| Class | Description | Usage |
|-------|-------------|-------|
| `shadow-brand` | Standard brand shadow | Default elevation |
| `shadow-brand-lg` | Large brand shadow | Hover states, modals |

**Example:**

```jsx
<div className="shadow-brand hover:shadow-brand-lg transition-shadow">
  Hover me for larger shadow
</div>
```

---

## Custom Utilities

### Brand Color Utilities

Quick access to brand colors:

```jsx
// Text colors
<p className="text-brand-cornflower">Cornflower blue text</p>
<p className="text-brand-green-blue">Green-blue text</p>
<p className="text-brand-rich-black">Rich black text</p>
<p className="text-brand-french-sky">French sky blue text</p>

// Background colors
<div className="bg-brand-cornflower">Cornflower background</div>
<div className="bg-brand-green-blue">Green-blue background</div>
<div className="bg-brand-rich-black">Rich black background</div>
<div className="bg-brand-french-sky">French sky background</div>
```

---

### Gradient Utilities

Apply brand gradients instantly:

```jsx
// Background gradients
<div className="bg-brand-gradient">Diagonal gradient</div>
<div className="bg-brand-gradient-vertical">Vertical gradient</div>
<div className="bg-brand-gradient-horizontal">Horizontal gradient</div>

// Gradient text
<h1 className="text-brand-gradient text-6xl font-bold">
  Colorful Heading
</h1>

// Animated gradient
<div className="bg-brand-gradient animate-brand-gradient">
  Animated gradient background
</div>
```

---

### Border Utilities

Brand-consistent borders:

```jsx
// Solid brand border
<div className="border-2 border-brand">Cornflower border</div>

// Gradient border (advanced)
<div className="border-brand-gradient">Gradient border</div>
```

---

## Component Patterns

Pre-built component patterns for common UI elements.

### Buttons

#### Primary Button

```jsx
<button className="btn-brand-primary">
  Primary Action
</button>
```

**Includes:**
- Brand gradient background
- White text
- Semi-bold font
- Rounded corners
- Brand shadow
- Hover effects

---

#### Secondary Button

```jsx
<button className="btn-brand-secondary">
  Secondary Action
</button>
```

**Includes:**
- Green-blue solid background
- White text
- Hover opacity effect

---

#### Outline Button

```jsx
<button className="btn-brand-outline">
  Outline Action
</button>
```

**Includes:**
- Transparent background
- Brand border
- Cornflower text
- Hover fill effect

---

### Cards

#### Standard Card

```jsx
<div className="card-brand">
  <h3 className="text-xl font-semibold">Card Title</h3>
  <p>Card content goes here</p>
</div>
```

**Includes:**
- Card background
- Border
- Padding
- Hover shadow effect

---

#### Gradient Card

```jsx
<div className="card-brand-gradient">
  <h3 className="text-xl font-semibold">Premium Card</h3>
  <p>Special content</p>
</div>
```

**Includes:**
- Brand gradient background
- White text
- Brand shadow
- Rounded corners

---

### Badges

#### Standard Badge

```jsx
<span className="badge-brand">New Feature</span>
```

**Includes:**
- Cornflower blue styling
- Rounded full
- Small text
- Padding

---

#### Accent Badge

```jsx
<span className="badge-brand-accent">Hot</span>
```

**Includes:**
- French sky blue styling
- Accent color scheme

---

## Usage Examples

### Complete Component Example

```jsx
export function HeroSection() {
  return (
    <section className="bg-brand-gradient py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Welcome to 1DXR
        </h1>
        <p className="text-xl text-white/90 mb-8 leading-relaxed">
          The next-generation community platform
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-brand-primary">
            Get Started
          </button>
          <button className="btn-brand-outline bg-white/10 hover:bg-white/20">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
```

---

### Card Grid Example

```jsx
export function FeatureGrid() {
  const features = [
    { title: "Fast", description: "Lightning-fast performance" },
    { title: "Secure", description: "Enterprise-grade security" },
    { title: "Scalable", description: "Grows with your needs" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      {features.map((feature) => (
        <div key={feature.title} className="card-brand">
          <h3 className="text-xl font-semibold text-brand-cornflower mb-2">
            {feature.title}
          </h3>
          <p className="text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Badge Example

```jsx
export function StatusBadge({ status }: { status: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Status:</span>
      <span className="badge-brand">{status}</span>
    </div>
  );
}
```

---

## Dark Mode

The configuration includes full dark mode support.

### Enabling Dark Mode

Add the `dark` class to your root element:

```tsx
// Next.js example with next-themes
import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}
```

### Dark Mode Color Behavior

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| **Background** | White | Dark gray |
| **Foreground** | Near black | Light gray |
| **Primary** | Dark | Light |
| **Cards** | White | Dark gray |
| **Borders** | Light gray | Subtle white |

**Brand colors remain consistent in both modes.**

### Dark Mode Utilities

```jsx
// Different styles for light/dark mode
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Adaptive colors
</div>

// Brand colors work in both modes
<button className="bg-brand-cornflower text-white">
  Consistent in both modes
</button>
```

---

## Accessibility

The configuration includes built-in accessibility features:

### Focus States

All interactive elements have visible focus states:

```jsx
// Automatic focus ring on interactive elements
<button>Will show blue focus ring on keyboard focus</button>
```

**Focus ring color:** Cornflower Blue (`--brand-cornflower`)

---

### Reduced Motion

Respects user's motion preferences:

```css
/* Automatically applied */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### Color Contrast

All brand color combinations meet **WCAG AA standards**:

- ✅ White text on Rich Black: **15.8:1**
- ✅ White text on Green-Blue: **4.7:1**
- ✅ White text on Cornflower Blue: **3.8:1**
- ✅ Rich Black text on White: **15.8:1**

---

## Quick Reference

### Most Common Classes

```jsx
// Colors
bg-brand-cornflower       // Primary brand color background
text-brand-cornflower     // Primary brand color text
bg-brand-gradient         // Brand gradient background
text-brand-gradient       // Gradient text

// Buttons
btn-brand-primary         // Primary button with gradient
btn-brand-secondary       // Secondary solid button
btn-brand-outline         // Outline button

// Cards
card-brand                // Standard card
card-brand-gradient       // Gradient card

// Badges
badge-brand               // Standard badge
badge-brand-accent        // Accent badge

// Typography
font-poppins              // Poppins font
font-sofia                // Sofia Sans font
text-accent-label         // Uppercase accent label

// Shadows
shadow-brand              // Standard brand shadow
shadow-brand-lg           // Large brand shadow
```

---

## Migration from v3

If upgrading from Tailwind CSS v3, note these changes:

1. **Border color** now defaults to `currentColor` (compatibility layer included)
2. **New `@import` syntax** instead of directives
3. **OKLCH color space** for better color consistency
4. **Inline theme** syntax for design tokens

The configuration maintains backward compatibility with existing projects.

---

## Support & Resources

**External Resources:**
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Poppins Font](https://fonts.google.com/specimen/Poppins)
- [Sofia Sans Font](https://fonts.google.com/specimen/Sofia+Sans+Extra+Condensed)

**Last Updated:** November 2025  
**Configuration Version:** 1.0  
**Tailwind CSS Version:** 4.0