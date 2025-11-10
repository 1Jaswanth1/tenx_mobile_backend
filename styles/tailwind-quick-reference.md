# 1DXR Tailwind CSS Quick Reference

Quick reference guide for the most commonly used Tailwind utilities in the 1DXR platform.

---

## 🎨 Brand Colors

### Background Colors
```jsx
bg-brand-cornflower       // #568AFF - Primary blue
bg-brand-green-blue       // #0665BA - Secondary blue
bg-brand-rich-black       // #001320 - Dark base
bg-brand-french-sky       // #66ABFE - Accent blue
```

### Text Colors
```jsx
text-brand-cornflower     // #568AFF
text-brand-green-blue     // #0665BA
text-brand-rich-black     // #001320
text-brand-french-sky     // #66ABFE
```

### Gradients
```jsx
bg-brand-gradient                // Diagonal (135°)
bg-brand-gradient-vertical       // Top to bottom
bg-brand-gradient-horizontal     // Left to right
text-brand-gradient              // Gradient text
```

---

## 📝 Typography

### Fonts
```jsx
font-poppins              // Poppins (default body)
font-sofia                // Sofia Sans Extra Condensed
text-accent-label         // Uppercase accent label
```

### Scale
```jsx
text-5xl                  // H1: 48px
text-4xl                  // H2: 36px
text-3xl                  // H3: 28px
text-lg                   // Body Large: 18px
text-base                 // Body: 16px
text-sm                   // Small: 14px
text-xs                   // Caption: 12px
```

---

## 🔘 Component Patterns

### Buttons
```jsx
<button className="btn-brand-primary">
  Primary Button
</button>

<button className="btn-brand-secondary">
  Secondary Button
</button>

<button className="btn-brand-outline">
  Outline Button
</button>
```

### Cards
```jsx
<div className="card-brand">
  Standard Card
</div>

<div className="card-brand-gradient">
  Gradient Card
</div>
```

### Badges
```jsx
<span className="badge-brand">Badge</span>
<span className="badge-brand-accent">Accent</span>
```

---

## 🎭 Shadows
```jsx
shadow-brand              // Standard elevation
shadow-brand-lg           // Large elevation (hover)
```

---

## 🔲 Border Radius
```jsx
rounded-sm                // 6px
rounded-md                // 8px
rounded-lg                // 10px (base)
rounded-xl                // 14px
rounded-full              // Fully rounded
```

---

## 🌙 Dark Mode
```jsx
// Prefix with 'dark:' for dark mode styles
<div className="bg-white dark:bg-gray-900">
  Adaptive background
</div>

<p className="text-black dark:text-white">
  Adaptive text
</p>
```

---

## 📱 Responsive Design
```jsx
// Mobile first - add breakpoints as needed
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
```

---

## 🎬 Animations
```jsx
animate-brand-gradient    // Animated gradient
transition-all           // Smooth transitions
duration-200             // 200ms duration
hover:opacity-90         // Hover effect
```

---

## ♿ Accessibility
```jsx
focus-visible:outline-brand-cornflower  // Focus ring
focus:ring-2                             // Focus ring width
sr-only                                  // Screen reader only
```

---

## 💡 Common Patterns

### Hero Section
```jsx
<section className="bg-brand-gradient py-20 px-4">
  <h1 className="text-5xl font-bold text-white">Title</h1>
  <button className="btn-brand-primary">CTA</button>
</section>
```

### Feature Card
```jsx
<div className="card-brand hover:shadow-brand-lg transition-shadow">
  <h3 className="text-brand-cornflower font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Badge with Status
```jsx
<span className="badge-brand inline-flex items-center gap-1">
  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
  Active
</span>
```

---

## 🚀 Quick Start Template

```jsx
export function Component() {
  return (
    <div className="bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-brand-cornflower mb-2">
          Page Title
        </h1>
        <p className="text-muted-foreground">Subtitle goes here</p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-brand">
          <h3 className="font-semibold mb-2">Card Title</h3>
          <p>Card content</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <button className="btn-brand-primary">Primary</button>
        <button className="btn-brand-outline">Secondary</button>
      </div>
    </div>
  );
}
```

---

## 📚 Full Documentation

For complete documentation, see:
- [tailwind-config.md](./tailwind-config.md) - Full configuration guide

---

**Last Updated:** November 2025  
**Version:** 1.0