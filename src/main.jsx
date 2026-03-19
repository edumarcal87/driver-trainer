import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './lib/AuthContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import App from './App.jsx';
import './index.css';

function Root() {
  const [view, setView] = useState(() => {
    // If URL has #app or user previously entered, go to app
    if (window.location.hash === '#app') return 'app';
    if (sessionStorage.getItem('dt_entered')) return 'app';
    return 'landing';
  });

  const enterApp = () => {
    sessionStorage.setItem('dt_entered', '1');
    window.location.hash = 'app';
    setView('app');
    window.scrollTo(0, 0);
  };

  const goToLanding = () => {
    sessionStorage.removeItem('dt_entered');
    window.location.hash = '';
    setView('landing');
    window.scrollTo(0, 0);
  };

  if (view === 'landing') {
    return <LandingPage onEnterApp={enterApp} />;
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
