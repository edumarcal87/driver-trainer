import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './lib/AuthContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import App from './App.jsx';
import './index.css';

function Root() {
  const { isLoggedIn, loading } = useAuth();
  const [view, setView] = useState('landing');

  const enterApp = () => {
    setView('app');
    window.scrollTo(0, 0);
  };

  const goToLanding = () => {
    setView('landing');
    window.scrollTo(0, 0);
  };

  // Always start on landing page
  if (view === 'landing') {
    return <LandingPage onEnterApp={enterApp} />;
  }

  // Show loading while auth initializes
  if (loading) {
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

  // App view — requires login
  if (!isLoggedIn) {
    return <LoginScreen onSkip={goToLanding} />;
  }

  return <App onGoToLanding={goToLanding} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);
