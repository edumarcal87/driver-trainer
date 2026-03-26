import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './lib/AuthContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import SubscriptionConfirmation from './components/SubscriptionConfirmation.jsx';
import { PrivacyPolicy, TermsOfService } from './components/LegalPages.jsx';
import App from './App.jsx';
import './index.css';

function Root() {
  const { isLoggedIn, loading } = useAuth();
  const [view, setView] = useState(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;

    // Subscription confirmation page
    if (path === '/confirmacao-assinatura' || path === '/confirmacao-assinatura/') {
      return 'subscription_confirmation';
    }
    // Legal pages
    if (path === '/privacidade' || path === '/privacidade/') {
      return 'privacy';
    }
    if (path === '/termos' || path === '/termos/') {
      return 'terms';
    }
    // OAuth callback
    if (hash.includes('access_token') || search.includes('code=') || hash.includes('type=recovery')) {
      return 'app';
    }
    return 'landing';
  });

  // When auth finishes loading and user is logged in, go to app
  useEffect(() => {
    if (!loading && isLoggedIn && view === 'landing') {
      setView('app');
    }
  }, [loading, isLoggedIn]);

  const enterApp = () => {
    setView('app');
    window.history.pushState({}, '', '/');
    window.scrollTo(0, 0);
  };

  const goToLanding = () => {
    setView('landing');
    window.history.pushState({}, '', '/');
    window.scrollTo(0, 0);
  };

  // Subscription confirmation page
  if (view === 'subscription_confirmation') {
    return <SubscriptionConfirmation onGoToApp={enterApp} />;
  }

  // Legal pages
  if (view === 'privacy') {
    return <PrivacyPolicy onBack={goToLanding} />;
  }
  if (view === 'terms') {
    return <TermsOfService onBack={goToLanding} />;
  }

  // Show loading while auth initializes (only when coming from OAuth redirect)
  if (loading && view === 'app') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0efe8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, border: '2px solid #e74c3c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <svg width="28" height="28" viewBox="0 0 56 56"><path d="M8 44 Q10 20, 18 14 Q24 10, 30 22 Q34 30, 38 28 Q42 26, 44 14" fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/></svg>
          </div>
          <p style={{ fontSize: 12, color: '#9a9a90', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '1px' }}>CARREGANDO...</p>
        </div>
      </div>
    );
  }

  // Landing page
  if (view === 'landing' && !isLoggedIn) {
    return <LandingPage onEnterApp={enterApp} />;
  }

  // User clicked "enter app" but not logged in yet
  if (view === 'app' && !loading && !isLoggedIn) {
    return <LoginScreen onSkip={goToLanding} />;
  }

  // Logged in → app
  if (isLoggedIn) {
    return <App onGoToLanding={goToLanding} />;
  }

  // Fallback: landing
  return <LandingPage onEnterApp={enterApp} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);
