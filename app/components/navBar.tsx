/**
 * NavBar Component for 10xR Community Platform
 *
 * A responsive navigation bar with:
 * - Logo area (mobile + desktop)
 * - Search bar placeholder
 * - User authentication dropdown placeholder
 *
 * Design follows 10xR brand guidelines and uses Tailwind CSS utilities.
 * Mobile-first responsive design with breakpoints at md (768px) and lg (1024px).
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

// Import logos
import DesktopLogo from '@/public/logos/logo_1.svg';
import MobileLogo from '@/public/logos/logo_7.svg';

export function NavBar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

      {/* Right: Auth Dropdown Placeholder */}
      <div className="flex items-center gap-x-3">
        {/* Sign In Button - Hidden on small screens */}
        <button className="hidden sm:block text-sm font-medium text-brand-cornflower hover:text-brand-green-blue transition-colors">
          Sign In
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-accent transition-colors"
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            {/* User Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <>
              {/* Backdrop for closing menu when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsUserMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Dropdown Content */}
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                <ul className="text-sm text-popover-foreground" role="menu">
                  <li>
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                      role="menuitem"
                    >
                      <div className="flex items-center gap-x-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Profile</span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                      role="menuitem"
                    >
                      <div className="flex items-center gap-x-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Settings</span>
                      </div>
                    </button>
                  </li>
                  <li className="border-t border-border">
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-accent transition-colors text-destructive"
                      role="menuitem"
                    >
                      <div className="flex items-center gap-x-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Shows on small screens */}
        <button
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors"
          aria-label="Mobile menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
