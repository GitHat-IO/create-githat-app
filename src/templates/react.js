function viteConfig() {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
}

function indexHtml(projectName, typescript) {
  const ext = typescript ? 'tsx' : 'jsx';
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>
`;
}

function mainEntry() {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GitHatProvider } from '@githat/nextjs';
import '@githat/nextjs/styles';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GitHatProvider config={{
        publishableKey: import.meta.env.VITE_GITHAT_PUBLISHABLE_KEY || '',
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
        afterSignInUrl: '/dashboard',
        afterSignOutUrl: '/',
      }}>
        <App />
      </GitHatProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`;
}

function appRoutes(includeDashboard) {
  const dashboardImport = includeDashboard ? `\nimport Dashboard from './pages/Dashboard';` : '';
  const dashboardRoute = includeDashboard
    ? `\n        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />`
    : '';
  const protectedImport = includeDashboard ? `, ProtectedRoute` : '';

  return `import { Routes, Route } from 'react-router-dom';
import { SignInForm, SignUpForm${protectedImport} } from '@githat/nextjs';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';${dashboardImport}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />${dashboardRoute}
    </Routes>
  );
}
`;
}

function indexCss() {
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

function homePage() {
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

function signInPage() {
  return `import { SignInForm } from '@githat/nextjs';

export default function SignIn() {
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

export default function SignUp() {
  return (
    <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#09090b' }}>
      <SignUpForm signInUrl="/sign-in" />
    </main>
  );
}
`;
}

function dashboardPage() {
  return `import { useAuth } from '@githat/nextjs';
import { UserButton, OrgSwitcher } from '@githat/nextjs';

export default function Dashboard() {
  const { user, org } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#09090b' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #1e1e2e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fafafa' }}>Dashboard</h2>
          <OrgSwitcher />
        </div>
        <UserButton />
      </header>
      <main style={{ padding: '2rem' }}>
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
      </main>
    </div>
  );
}
`;
}

module.exports = {
  viteConfig,
  indexHtml,
  mainEntry,
  appRoutes,
  indexCss,
  homePage,
  signInPage,
  signUpPage,
  dashboardPage,
};
