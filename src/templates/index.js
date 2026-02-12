function middleware() {
  return `import { authMiddleware } from '@githat/nextjs/middleware';

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up'],
  signInUrl: '/sign-in',
});

export const config = {
  matcher: ['/((?!_next|api|.*\\\\..*).*)'],
};
`;
}

function layout(typescript) {
  const type = typescript ? ': { children: React.ReactNode }' : '';
  return `import { GitHatProvider } from '@githat/nextjs';
import '@githat/nextjs/styles';
import './globals.css';

export const metadata = {
  title: 'My GitHat App',
  description: 'Built with GitHat identity',
};

export default function RootLayout({ children }${type}) {
  return (
    <html lang="en">
      <body>
        <GitHatProvider config={{
          publishableKey: process.env.NEXT_PUBLIC_GITHAT_PUBLISHABLE_KEY || '',
          signInUrl: '/sign-in',
          signUpUrl: '/sign-up',
          afterSignInUrl: '/dashboard',
          afterSignOutUrl: '/',
        }}>
          {children}
        </GitHatProvider>
      </body>
    </html>
  );
}
`;
}

function page() {
  return `import { SignInButton, SignUpButton } from '@githat/nextjs';

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem', background: '#09090b', color: '#fafafa' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Welcome to My App</h1>
      <p style={{ color: '#a1a1aa', maxWidth: '32rem', textAlign: 'center' }}>
        Powered by GitHat identity. Sign in or create an account to get started.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <SignInButton />
        <SignUpButton />
      </div>
    </main>
  );
}
`;
}

function globalsCss() {
  return `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #09090b;
  color: #fafafa;
}

a {
  color: inherit;
  text-decoration: none;
}
`;
}

function signInPage() {
  return `import { SignInForm } from '@githat/nextjs';

export default function SignInPage() {
  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#09090b' }}>
      <SignInForm signUpUrl="/sign-up" />
    </main>
  );
}
`;
}

function signUpPage() {
  return `import { SignUpForm } from '@githat/nextjs';

export default function SignUpPage() {
  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#09090b' }}>
      <SignUpForm signInUrl="/sign-in" />
    </main>
  );
}
`;
}

function dashboardLayout() {
  return `import { ProtectedRoute, UserButton, OrgSwitcher } from '@githat/nextjs';

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: '#09090b' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fafafa' }}>Dashboard</h2>
            <OrgSwitcher />
          </div>
          <UserButton />
        </header>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
`;
}

function dashboardPage() {
  return `'use client';

import { useAuth } from '@githat/nextjs';

export default function DashboardPage() {
  const { user, org } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Welcome{user?.name ? \`, \${user.name}\` : ''}
      </h1>
      {org && (
        <p style={{ color: '#a1a1aa' }}>
          Organization: <strong style={{ color: '#6366f1' }}>{org.name}</strong> ({org.role})
        </p>
      )}
      <p style={{ color: '#71717a', marginTop: '1rem' }}>
        This is your dashboard. Start building your app!
      </p>
    </div>
  );
}
`;
}

module.exports = {
  middleware,
  layout,
  page,
  globalsCss,
  signInPage,
  signUpPage,
  dashboardLayout,
  dashboardPage,
};
