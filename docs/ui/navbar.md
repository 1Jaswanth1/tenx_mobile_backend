# NavBar Component Documentation

## Overview

The `NavBar` component is a responsive, brand-aligned navigation bar designed for the 10xR Community Platform. It follows a Reddit-style layout with mobile-first responsive design and adheres to the 10xR brand guidelines.

---

## Component Location

**File:** `app/components/navBar.tsx`

**Integration:** Rendered globally in `app/layout.tsx` above the `{children}` prop to persist across all pages.

---

## Structure

The NavBar is divided into three main sections:

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]           [Search Bar]            [Sign In] [User]  │
└─────────────────────────────────────────────────────────────┘
```

### 1. **Logo Area (Left)**

- **Mobile Logo** (`logo_7.svg`)
  - Displays on screens < 1024px (lg breakpoint)
  - Height: 32px (h-8)
  - Icon-only variant for compact display

- **Desktop Logo** (`logo_1.svg`)
  - Displays on screens ≥ 1024px
  - Height: 28px (h-7)
  - Full logo with text for branding

- **Functionality:**
  - Wrapped in `Link` component to navigate to homepage (`/`)
  - Hover opacity transition for visual feedback
  - Both logos use `priority` prop for optimal loading

### 2. **Search Bar (Center)**

- **Visibility:**
  - Hidden on mobile (< 768px)
  - Visible on md breakpoint and above (≥ 768px)

- **Features:**
  - Full-width responsive container (max-width: 32rem)
  - Search icon (magnifying glass) on the left
  - Input field with placeholder: "Search communities, posts, or users..."
  - Styled with:
    - Background: `bg-muted`
    - Border: `border-border` (hover: `border-brand-cornflower`)
    - Rounded: `rounded-full`
    - Padding: `px-4 py-2`

- **Placeholder:** Non-functional input (ready for future search logic)

### 3. **User Authentication Area (Right)**

Contains two main elements:

#### a. **Sign In Button**
- Displays on sm breakpoint and above (≥ 640px)
- Hidden on mobile for space optimization
- Styled with brand colors:
  - Default: `text-brand-cornflower`
  - Hover: `text-brand-green-blue`
- Font: Medium weight, text-sm

#### b. **User Menu Dropdown**
- **User Icon Button:**
  - Circular button (40x40px)
  - Background: `bg-muted` (hover: `bg-accent`)
  - User profile icon (SVG)
  - ARIA labels for accessibility

- **Dropdown Menu:**
  - Absolute positioned (right-aligned)
  - Width: 192px (w-48)
  - Background: `bg-popover`
  - Border: `border-border`
  - Rounded: `rounded-xl`
  - Shadow: `shadow-lg`

- **Menu Items:**
  1. **Profile** - User icon
  2. **Settings** - Gear icon
  3. **Sign Out** - Log out icon (destructive color)

- **Interactions:**
  - Click user icon to toggle dropdown
  - Click outside to close (backdrop overlay)
  - Hover states on menu items

#### c. **Mobile Menu Button**
- Displays only on mobile (< 768px)
- Hamburger menu icon (3 horizontal lines)
- Circular button (40x40px)
- Placeholder for future mobile navigation

---

## Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| **Mobile** | < 640px | Mobile logo only, no sign-in button, search hidden |
| **sm** | ≥ 640px | Sign in button appears |
| **md** | ≥ 768px | Search bar becomes visible, mobile menu hidden |
| **lg** | ≥ 1024px | Desktop logo replaces mobile logo, full padding |

### Layout Changes

```
Mobile (< 768px):
┌─────────────────────────────────────┐
│  [Mobile Logo]       [User] [Menu]  │
└─────────────────────────────────────┘

Tablet (768px - 1023px):
┌──────────────────────────────────────────────────┐
│  [Mobile Logo]  [Search]  [Sign In] [User]       │
└──────────────────────────────────────────────────┘

Desktop (≥ 1024px):
┌──────────────────────────────────────────────────────────┐
│  [Desktop Logo]     [Search]      [Sign In] [User]       │
└──────────────────────────────────────────────────────────┘
```

---

## Design Tokens

All styling uses Tailwind CSS utilities and 10xR brand tokens:

### Colors
- `bg-background` - Page background
- `text-foreground` - Primary text
- `border-border` - Border color
- `bg-muted` - Muted background (search, user icon)
- `bg-accent` - Hover/active states
- `text-brand-cornflower` - Primary brand color (#568AFF)
- `text-brand-green-blue` - Secondary brand color (#0665BA)
- `text-destructive` - Destructive actions (sign out)

### Spacing
- Horizontal padding: `px-5` (mobile), `lg:px-14` (desktop)
- Height: `h-[10vh]` (10% of viewport height)
- Gaps: `gap-x-3` (12px horizontal spacing)

### Typography
- Font size: `text-sm` (14px)
- Font weight: `font-medium` (500)

### Borders
- Bottom border: `border-b border-border`
- Rounded corners: `rounded-full` (search), `rounded-xl` (dropdown)

### Transitions
- `transition-opacity` - Logo hover
- `transition-colors` - Button and input hover states

---

## Accessibility Features

1. **Semantic HTML:**
   - `<nav>` element for navigation landmark
   - Proper button elements for interactive items
   - `<ul>` for dropdown menu list

2. **ARIA Labels:**
   - `aria-label="Search"` on search input
   - `aria-label="User menu"` on user icon button
   - `aria-expanded` state on dropdown toggle
   - `aria-haspopup="true"` for dropdown menu
   - `role="menu"` and `role="menuitem"` for menu items

3. **Keyboard Navigation:**
   - All interactive elements are keyboard accessible
   - Dropdown can be closed with click outside

4. **Alt Text:**
   - All images have descriptive alt text
   - SVG icons use proper titles when needed

---

## Integration Instructions

### Current Implementation

The NavBar is already integrated into the root layout:

```tsx
// app/layout.tsx
import "styles/tailwind.css"
import { NavBar } from "./components/navBar"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
```

This ensures the NavBar appears on all pages without needing to import it individually.

---

## Future Enhancements

### 1. **Search Functionality**

To make the search bar functional:

```tsx
// Add state for search query
const [searchQuery, setSearchQuery] = useState('');

// Add search handler
const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  // Implement search logic
  // - Call search API endpoint
  // - Navigate to search results page
  // - Show search suggestions dropdown
};

// Update input
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
  placeholder="Search communities, posts, or users..."
  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
  aria-label="Search"
/>
```

**Suggested Search Features:**
- Real-time search suggestions
- Recent searches
- Search history
- Filters (posts, users, communities)
- Keyboard navigation (arrow keys, enter)

### 2. **Authentication Integration**

Connect the Sign In button and user menu to actual authentication:

```tsx
// Import auth hooks
import { useSession, signOut } from '@/lib/auth/auth-client';

// In component
const { data: session } = useSession();
const user = session?.user;

// Conditional rendering
{user ? (
  <UserMenu user={user} />
) : (
  <Link href="/login">
    <button className="text-sm font-medium text-brand-cornflower">
      Sign In
    </button>
  </Link>
)}

// Sign out handler
const handleSignOut = async () => {
  await signOut();
  router.push('/');
};
```

### 3. **Mobile Navigation**

Implement a full mobile navigation menu:

```tsx
// Add state for mobile menu
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Mobile menu panel (slide-in from side)
{isMobileMenuOpen && (
  <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
)}
```

**Mobile Menu Features:**
- Slide-in panel from right or bottom
- Navigation links to main sections
- Search bar for mobile
- User profile quick access
- Dark mode toggle
- Settings access

### 4. **Notifications**

Add a notifications icon between Sign In and User Menu:

```tsx
<button className="relative">
  {/* Bell icon */}
  <svg>...</svg>

  {/* Unread count badge */}
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</button>
```

### 5. **Dark Mode Toggle**

Add theme switching functionality:

```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

<button
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  className="..."
>
  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
</button>
```

---

## Component Props (Future)

When making the component more flexible, consider these props:

```typescript
interface NavBarProps {
  /** Show/hide search bar */
  showSearch?: boolean;

  /** Show/hide sign in button */
  showSignIn?: boolean;

  /** Custom logo (override default) */
  customLogo?: string;

  /** Search placeholder text */
  searchPlaceholder?: string;

  /** Additional menu items */
  menuItems?: MenuItem[];

  /** Callback for search */
  onSearch?: (query: string) => void;

  /** Callback for sign in */
  onSignIn?: () => void;

  /** Callback for sign out */
  onSignOut?: () => void;
}
```

---

## Testing Checklist

### Visual Testing
- [ ] Logo switches correctly at lg breakpoint
- [ ] Search bar appears at md breakpoint
- [ ] Sign In button appears at sm breakpoint
- [ ] User menu dropdown toggles correctly
- [ ] Hover states work on all interactive elements
- [ ] Border colors match brand guidelines
- [ ] Heights and spacing are consistent

### Responsive Testing
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (768px - 1023px)
- [ ] Test on desktop (≥ 1024px)
- [ ] Test on ultrawide (≥ 1440px)
- [ ] Verify touch targets are adequate (44x44px minimum)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA standards
- [ ] ARIA labels are descriptive

### Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Maintenance Notes

### Logo Updates
If logos change, update imports in `navBar.tsx`:
```tsx
import DesktopLogo from '@/public/logos/[new-logo].svg';
import MobileLogo from '@/public/logos/[new-mobile-logo].svg';
```

### Brand Color Changes
Colors are defined in `styles/tailwind.css`. Update CSS variables:
```css
--color-brand-cornflower: var(--brand-cornflower);
--color-brand-green-blue: var(--brand-green-blue);
```

### Height Adjustments
To change navbar height, update the `h-[10vh]` class:
```tsx
<nav className="h-[64px] ..."> {/* Fixed height */}
<nav className="h-[8vh] ...">   {/* Percentage height */}
```

---

## Performance Considerations

1. **Logo Optimization:**
   - SVG logos are used for crisp display at any size
   - `priority` prop ensures logos load immediately
   - Consider using `next/image` optimization

2. **Dropdown State:**
   - State is managed locally (no Redux overhead)
   - Click-outside uses event listener (cleanup on unmount)

3. **Responsive Design:**
   - CSS-based (no JavaScript media queries)
   - Tailwind utilities are optimized at build time
   - Minimal runtime overhead

---

## Related Documentation

- **Brand Guidelines:** `/brand/brand.md`
- **Logo Guidelines:** `/public/logos/logo.md`
- **Icon Guidelines:** `/public/icons/icons.md`
- **Tailwind Config:** `/styles/tailwind.css`
- **Authentication:** `/docs/AUTH_IMPLEMENTATION_SUMMARY.md`

---

**Version:** 1.0.0
**Last Updated:** 2024-11-13
**Author:** 10xR Development Team
