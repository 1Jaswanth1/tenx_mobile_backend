/**
 * NavBar Component for 10xR Community Platform
 *
 * A responsive navigation bar with:
 * - Logo area (mobile + desktop)
 * - Search bar placeholder
 * - Dynamic authentication state (Sign Up/Login or User Dropdown)
 *
 * This is an async server component that fetches the user session
 * from BetterAuth to conditionally render authenticated vs unauthenticated UI.
 *
 * Design follows 10xR brand guidelines and uses Tailwind CSS utilities.
 * Mobile-first responsive design with breakpoints at md (768px) and lg (1024px).
 */

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { UserDropdown } from './user-dropdown';
import { auth } from '@/lib/auth/auth-server';

// Import logos
import DesktopLogo from '@/public/logos/logo_1.svg';
import MobileLogo from '@/public/logos/logo_7.svg';

export async function NavBar() {
  // Fetch the current user session from BetterAuth
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="h-[10vh] w-full flex items-center justify-between border-b border-border px-5 lg:px-14 bg-background text-foreground">
      {/* Left: Logo Area */}
      <Link href="/" className="flex items-center gap-x-3 hover:opacity-90 transition-opacity">
        {/* Mobile Logo - Shows on small screens */}
        <Image
          src={MobileLogo}
          alt="10xR mobile logo"
          className="h-8 w-auto lg:hidden"
          priority
        />

        {/* Desktop Logo - Shows on large screens */}
        <Image
          src={DesktopLogo}
          alt="10xR desktop logo"
          className="hidden lg:block h-7 w-auto"
          priority
        />
      </Link>

      {/* Center: Search Bar Placeholder */}
      <div className="hidden md:flex items-center w-full max-w-lg mx-6">
        <div className="flex items-center w-full bg-muted rounded-full px-4 py-2 border border-border hover:border-brand-cornflower transition-colors">
          {/* Search Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground mr-3"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search communities, posts, or users..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right: Authentication & Theme */}
      <div className="flex items-center gap-x-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Conditional Authentication UI */}
        {user ? (
          // Authenticated: Show User Dropdown
          <UserDropdown
            userImage={user.image}
            userName={user.name}
            userEmail={user.email}
          />
        ) : (
          // Unauthenticated: Show Sign Up / Login Buttons
          <div className="flex items-center gap-x-3">
            {/* Sign Up Button - Hidden on extra small screens */}
            <Link
              href="/signup"
              className="hidden sm:block text-sm font-medium text-brand-cornflower hover:text-brand-green-blue transition-colors"
            >
              Sign Up
            </Link>

            {/* Login Button */}
            <Link
              href="/login"
              className="text-sm font-medium text-brand-cornflower hover:text-brand-green-blue transition-colors"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
