# Authentication Testing Guide

This guide provides step-by-step instructions for testing all authentication flows in the 10xR Community Platform.

## Prerequisites

Before testing, ensure:

1. **Environment Variables are Set** (`.env.local`)
   ```bash
   # Required for all auth flows
   BETTER_AUTH_SECRET=<your-secret>
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   DATABASE_URL=<your-postgres-connection-string>

   # Optional: For OAuth testing
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   FACEBOOK_CLIENT_ID=<your-facebook-client-id>
   FACEBOOK_CLIENT_SECRET=<your-facebook-client-secret>
   ```

2. **Supabase Local Stack is Running** (if testing locally)
   ```bash
   supabase start
   ```

3. **Development Server is Running**
   ```bash
   pnpm dev
   ```

4. **Database Schema is Applied**
   ```bash
   supabase db reset
   ```

---

## Test 1: Email/Password Signup

### Steps:

1. **Navigate to Signup Page**
   - Open browser to `http://localhost:3000/signup`
   - Verify page loads without errors

2. **Test Form Validation**
   - Click "Create Account" without filling any fields
   - Verify error messages appear for all required fields
   - Enter invalid email (e.g., `notanemail`)
   - Verify email validation error
   - Enter password shorter than 8 characters
   - Verify password length error
   - Enter password without uppercase letter
   - Verify uppercase requirement error
   - Enter password without number
   - Verify number requirement error
   - Enter different passwords in password and confirm fields
   - Verify password match error

3. **Test Username Validation**
   - Enter username with less than 3 characters
   - Verify minimum length error
   - Enter username with special characters (e.g., `user@123`)
   - Verify format error
   - Enter valid username (e.g., `testuser123`)
   - Verify no error

4. **Test Password Strength Indicator**
   - Type password: `pass` - Should show "Very Weak" (red)
   - Type password: `password` - Should show "Weak" (orange)
   - Type password: `Password` - Should show "Fair" (yellow)
   - Type password: `Password1` - Should show "Good" (blue)
   - Type password: `Password1!` - Should show "Strong" (green)

5. **Complete Valid Signup**
   - Fill all fields with valid data:
     - Name: `Test User`
     - Username: `testuser123`
     - Email: `test@example.com`
     - Password: `Test1234!`
     - Confirm Password: `Test1234!`
   - Click "Create Account"
   - Verify loading spinner appears
   - Wait for redirect to dashboard
   - Verify user is logged in and dashboard displays

6. **Verify Database Records**
   - Check `auth_users` table for new user
   - Check `users` table for corresponding community profile
   - Verify user ID matches in both tables

### Expected Results:
- ✅ Form validation works correctly
- ✅ Password strength indicator updates in real-time
- ✅ Signup succeeds with valid data
- ✅ User is automatically logged in after signup
- ✅ User is redirected to dashboard
- ✅ Database records are created correctly

---

## Test 2: Email/Password Login

### Steps:

1. **Navigate to Login Page**
   - Open browser to `http://localhost:3000/login`
   - Verify page loads without errors

2. **Test Invalid Credentials**
   - Enter non-existent email: `fake@example.com`
   - Enter any password: `password123`
   - Click "Sign In"
   - Verify error message: "Invalid email or password"

3. **Test Valid Login**
   - Enter email from Test 1: `test@example.com`
   - Enter password from Test 1: `Test1234!`
   - Click "Sign In"
   - Verify loading spinner appears
   - Wait for redirect to dashboard
   - Verify user is logged in

4. **Test Password Visibility Toggle**
   - Enter password in password field
   - Click eye icon
   - Verify password is visible
   - Click eye icon again
   - Verify password is hidden

5. **Test Remember Me**
   - Log out (if logged in)
   - Return to login page
   - Enter valid credentials
   - Check "Remember me" checkbox
   - Click "Sign In"
   - Close browser completely
   - Reopen browser and navigate to `http://localhost:3000/dashboard`
   - Verify user is still logged in (session persisted)

6. **Test Callback URL**
   - Log out (if logged in)
   - Navigate to protected route: `http://localhost:3000/profile`
   - Verify redirect to login with callback URL: `/login?callbackUrl=/profile`
   - Enter valid credentials and login
   - Verify redirect to original destination: `/profile`

### Expected Results:
- ✅ Invalid credentials show appropriate error
- ✅ Valid credentials log user in successfully
- ✅ Password visibility toggle works
- ✅ "Remember me" extends session duration
- ✅ Callback URL preserves destination after login

---

## Test 3: Google OAuth (If Configured)

### Steps:

1. **Navigate to Signup/Login Page**
   - Open `http://localhost:3000/signup` or `http://localhost:3000/login`

2. **Initiate Google OAuth**
   - Click "Google" button
   - Verify redirect to Google OAuth consent screen
   - Select Google account
   - Authorize the application

3. **Verify OAuth Callback**
   - After authorization, verify redirect back to app
   - Verify redirect to dashboard (or callback URL)
   - Verify user is logged in

4. **Verify Profile Data**
   - Check dashboard displays Google profile data:
     - Name from Google profile
     - Email from Google profile
     - Profile picture from Google profile
   - Verify `emailVerified` is `true`

5. **Test Account Linking**
   - Log out
   - Create new account with email/password using same email as Google account
   - Log out
   - Log in with Google
   - Verify accounts are automatically linked (trusted provider)

### Expected Results:
- ✅ Google OAuth flow completes successfully
- ✅ User is logged in after OAuth
- ✅ Profile data is mapped correctly from Google
- ✅ Account linking works for verified providers

---

## Test 4: Facebook OAuth (If Configured)

### Steps:

1. **Navigate to Signup/Login Page**
   - Open `http://localhost:3000/signup` or `http://localhost:3000/login`

2. **Initiate Facebook OAuth**
   - Click "Facebook" button
   - Verify redirect to Facebook login screen
   - Enter Facebook credentials
   - Authorize the application

3. **Verify OAuth Callback**
   - After authorization, verify redirect back to app
   - Verify redirect to dashboard (or callback URL)
   - Verify user is logged in

4. **Verify Profile Data**
   - Check dashboard displays Facebook profile data:
     - Name from Facebook profile
     - Email from Facebook profile
     - Profile picture from Facebook profile
   - Verify `emailVerified` is `true`

### Expected Results:
- ✅ Facebook OAuth flow completes successfully
- ✅ User is logged in after OAuth
- ✅ Profile data is mapped correctly from Facebook

---

## Test 5: Session Management

### Steps:

1. **Test Session Persistence**
   - Log in with valid credentials
   - Navigate to dashboard
   - Refresh page (F5 or Cmd+R)
   - Verify user remains logged in
   - Verify no flash of login page

2. **Test Session Across Tabs**
   - Log in in one tab
   - Open new tab
   - Navigate to `http://localhost:3000/dashboard`
   - Verify user is logged in (session shared)

3. **Test Logout**
   - Click "Log Out" button on dashboard
   - Verify loading state
   - Verify redirect to home page
   - Attempt to navigate to `/dashboard`
   - Verify redirect to login

4. **Test Session Expiration**
   - Log in
   - Wait for session to expire (7 days by default, or configure shorter for testing)
   - Try to access protected route
   - Verify redirect to login with session expired message

### Expected Results:
- ✅ Session persists across page refreshes
- ✅ Session is shared across browser tabs
- ✅ Logout clears session completely
- ✅ Expired sessions redirect to login

---

## Test 6: Route Protection (Middleware)

### Steps:

1. **Test Protected Routes (Unauthenticated)**
   - Ensure you're logged out
   - Try to access:
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/profile`
     - `http://localhost:3000/settings`
     - `http://localhost:3000/communities`
   - Verify each redirects to `/login?callbackUrl=<route>`

2. **Test Public Routes (Unauthenticated)**
   - Access these routes while logged out:
     - `http://localhost:3000/` (home)
     - `http://localhost:3000/about`
     - `http://localhost:3000/terms`
     - `http://localhost:3000/privacy`
   - Verify no redirects (pages load normally)

3. **Test Auth Routes (Authenticated)**
   - Log in
   - Try to access:
     - `http://localhost:3000/login`
     - `http://localhost:3000/signup`
   - Verify redirect to `/dashboard`

4. **Test Protected Routes (Authenticated)**
   - While logged in, access:
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/profile`
     - `http://localhost:3000/settings`
   - Verify pages load normally (no redirects)

### Expected Results:
- ✅ Protected routes require authentication
- ✅ Public routes are accessible without authentication
- ✅ Auth routes redirect authenticated users to dashboard
- ✅ Callback URLs are preserved for post-login navigation

---

## Test 7: Error Handling

### Steps:

1. **Test Network Errors**
   - Stop the development server
   - Try to login
   - Verify user-friendly error message

2. **Test Duplicate Email**
   - Create account with email `duplicate@example.com`
   - Log out
   - Try to create another account with same email
   - Verify error: "An account with this email already exists"

3. **Test Invalid Session**
   - Log in
   - Manually delete auth cookies in browser DevTools
   - Try to access protected route
   - Verify redirect to login

4. **Test Validation Errors**
   - Test all validation scenarios from Test 1
   - Verify all error messages are user-friendly
   - Verify errors clear when user corrects input

### Expected Results:
- ✅ Network errors display user-friendly messages
- ✅ Duplicate email attempts are prevented
- ✅ Invalid sessions are handled gracefully
- ✅ All validation errors are clear and helpful

---

## Test 8: Cross-Browser Testing

### Browsers to Test:
- Chrome/Chromium
- Firefox
- Safari (macOS)
- Edge

### Steps:
1. Repeat Tests 1-7 in each browser
2. Verify consistent behavior across browsers
3. Check for browser-specific issues

### Expected Results:
- ✅ All functionality works consistently across browsers
- ✅ No browser-specific errors or UI issues

---

## Test 9: Mobile Responsive Testing

### Steps:

1. **Test Mobile Signup**
   - Open DevTools and toggle device toolbar
   - Select mobile device (e.g., iPhone 12)
   - Navigate to `/signup`
   - Verify layout is responsive
   - Test signup flow

2. **Test Mobile Login**
   - Navigate to `/login`
   - Verify layout is responsive
   - Test login flow

3. **Test Mobile Dashboard**
   - Navigate to `/dashboard`
   - Verify dashboard is readable and usable on mobile

### Expected Results:
- ✅ All pages are mobile-responsive
- ✅ Forms are usable on mobile devices
- ✅ No layout issues or overlapping elements

---

## Common Issues and Solutions

### Issue 1: OAuth Redirect URI Mismatch
**Symptom:** OAuth fails with redirect URI error

**Solution:**
- Verify OAuth redirect URIs are configured correctly in provider console
- For Google: Add `http://localhost:3000/api/auth/callback/google`
- For Facebook: Add `http://localhost:3000/api/auth/callback/facebook`

### Issue 2: Database Connection Error
**Symptom:** "Failed to connect to database" error

**Solution:**
- Verify `DATABASE_URL` in `.env.local` is correct
- Ensure Supabase local stack is running: `supabase start`
- Check PostgreSQL is accessible

### Issue 3: Session Not Persisting
**Symptom:** User is logged out after page refresh

**Solution:**
- Verify cookies are enabled in browser
- Check `BETTER_AUTH_SECRET` is set in `.env.local`
- Ensure cookies are not being blocked by browser settings

### Issue 4: Middleware Not Working
**Symptom:** Protected routes are accessible without login

**Solution:**
- Verify `middleware.ts` is in project root
- Check middleware configuration matcher
- Restart development server

### Issue 5: OAuth Credentials Invalid
**Symptom:** OAuth flow fails with invalid credentials

**Solution:**
- Verify OAuth client ID and secret are correct
- Check environment variables are loaded: `console.log(process.env.GOOGLE_CLIENT_ID)`
- Ensure credentials are for correct environment (development vs production)

---

## Automated Testing

### Unit Tests (Vitest)

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
pnpm e2e:headless

# Run E2E tests with UI
pnpm e2e:ui
```

### Example E2E Test (Create this file: `tests/auth.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should signup with email and password', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="confirmPassword"]', 'Test1234!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('should login with email and password', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test1234!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('should protect dashboard route', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });
});
```

---

## Production Deployment Testing

Before deploying to production, ensure:

1. ✅ All environment variables are set in production environment
2. ✅ OAuth redirect URIs include production domain
3. ✅ Supabase production database has schema applied
4. ✅ `BETTER_AUTH_URL` points to production domain
5. ✅ SSL/HTTPS is enabled (required for secure cookies)
6. ✅ Rate limiting is configured
7. ✅ Error monitoring is set up (e.g., Sentry)
8. ✅ All tests pass in production-like environment

---

## Performance Testing

### Metrics to Monitor:

1. **Page Load Times**
   - Signup page: < 2 seconds
   - Login page: < 2 seconds
   - Dashboard page: < 3 seconds

2. **Authentication Operations**
   - Signup: < 1 second
   - Login: < 500ms
   - Logout: < 200ms
   - Session check: < 100ms

3. **Database Queries**
   - Monitor slow queries in Supabase dashboard
   - Optimize queries that take > 100ms

### Tools:
- Lighthouse (Chrome DevTools)
- WebPageTest
- Supabase Query Performance Analyzer

---

## Security Testing

### Checklist:

1. ✅ Password requirements enforced (minimum 8 chars, complexity)
2. ✅ Passwords are hashed (never stored in plaintext)
3. ✅ Session cookies are HTTP-only
4. ✅ Session cookies are secure in production
5. ✅ CSRF protection enabled
6. ✅ SQL injection prevention (parameterized queries)
7. ✅ XSS prevention (input sanitization)
8. ✅ Rate limiting configured
9. ✅ OAuth tokens are never exposed to client
10. ✅ Service role key is never exposed to client

---

## Reporting Issues

If you encounter issues during testing:

1. **Check Browser Console** for JavaScript errors
2. **Check Network Tab** for failed API requests
3. **Check Server Logs** for backend errors
4. **Review Environment Variables** for configuration issues
5. **Create GitHub Issue** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Browser and OS information
   - Error messages and stack traces

---

## Next Steps

After completing all tests:

1. ✅ Document any issues found
2. ✅ Fix critical bugs
3. ✅ Optimize performance bottlenecks
4. ✅ Add automated E2E tests for critical flows
5. ✅ Set up CI/CD pipeline
6. ✅ Deploy to staging environment
7. ✅ Perform final QA in staging
8. ✅ Deploy to production

---

**Happy Testing! 🚀**
