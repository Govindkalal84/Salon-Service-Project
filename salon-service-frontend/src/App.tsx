import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { SalonDetail } from './pages/SalonDetail';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Phone, Mail } from 'lucide-react';

function MainAppContent() {
  const { user, showToast } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [pageParams, setPageParams] = useState<any>(null);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Sync state navigation
  const navigate = (page: string, params: any = null) => {
    setPageParams(params);
    setActivePage(page);
    window.location.hash = page + (params ? `?id=${params}` : '');
  };

  // Listen to browser back/forward and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const [page, query] = hash.split('?');
      setActivePage(page);
      
      if (query) {
        const urlParams = new URLSearchParams(query);
        const id = urlParams.get('id');
        setPageParams(id ? parseInt(id) : null);
      } else {
        setPageParams(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Guard routes based on authentication role
  useEffect(() => {
    if (activePage === 'customer-dashboard' && !user) {
      showToast("Authentication required", "warning");
      navigate('auth');
    }
    if (activePage === 'owner-dashboard') {
      if (!user) {
        showToast("Authentication required", "warning");
        navigate('auth');
      } else if (user.role !== 'SALON_OWNER' && user.role !== 'ADMIN') {
        showToast("Access Denied. Owner rights required.", "danger");
        navigate('home');
      }
    }
    if (activePage === 'admin-dashboard') {
      if (!user) {
        showToast("Authentication required", "warning");
        navigate('auth');
      } else if (user.role !== 'ADMIN' && user.role !== 'SALON_OWNER') {
        showToast("Access Denied. Owner or Admin permissions required.", "danger");
        navigate('home');
      }
    }
  }, [activePage, user, showToast]);

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'auth':
        return <Auth onNavigate={navigate} />;
      case 'salon-detail':
        return <SalonDetail salonId={pageParams} onNavigate={navigate} />;
      case 'customer-dashboard':
        return <CustomerDashboard />;
      case 'owner-dashboard':
        return <OwnerDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div id="app-container">
      <Navbar
        onNavigate={navigate}
        activePage={activePage}
        onToggleNotifications={() => setNotifDrawerOpen(!notifDrawerOpen)}
      />

      <main id="app-content">
        {renderActivePage()}
      </main>

      {activePage !== 'home' && (
        <footer id="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="logo-text" style={{ fontSize: '24px', fontWeight: 800, color: '#1e1e24' }}>
                B<span style={{ color: '#ea6a75' }}>Beauty</span>
              </span>
              <p>India's premier digital sanctuary for luxury salon appointments and holistic self-care.</p>
            </div>
            <div className="footer-links">
              <h4>Explore</h4>
              <button className="footer-link-btn" onClick={() => navigate('home')}>Salon Locations</button>
              <button className="footer-link-btn" onClick={() => navigate('home')}>Beauty Categories</button>
            </div>
            <div className="footer-links">
              <h4>Partner Services</h4>
              <button className="footer-link-btn" onClick={() => navigate('auth')}>Register as Owner</button>
              <button className="footer-link-btn" onClick={() => navigate('auth')}>List Your Salon</button>
            </div>
            <div className="footer-contact">
              <h4>Contact Us</h4>
              <p><Phone size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#ea6a75' }} /> +91 80 4123 7890</p>
              <p><Mail size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#ea6a75' }} /> concierge@bbeauty.in</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 BBeauty Platform. Crafted for modern elegance &amp; self-care.</p>
          </div>
        </footer>
      )}

      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
