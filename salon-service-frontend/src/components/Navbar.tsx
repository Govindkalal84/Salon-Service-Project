import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  onToggleNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage, onToggleNotifications }) => {
  const { user, logout, demoMode, toggleDemoMode, unreadCount } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const handleNav = (page: string) => {
    onNavigate(page);
    setDropdownOpen(false);
  };

  return (
    <header id="app-header">
      <div className="header-content">
        <div className="logo-area" onClick={() => handleNav('home')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              B<span style={{ color: '#ea6a75' }}>Beauty</span>
            </span>
            <span style={{ background: '#fff0f1', color: '#ea6a75', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '12px', letterSpacing: '1px' }}>
              AURA
            </span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link-btn nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            Home
          </button>
          <button
            className="nav-link-btn nav-link"
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                const el = document.getElementById('bbeauty-salons-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Services
          </button>
          <button
            className="nav-link-btn nav-link"
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                const el = document.getElementById('exquisite-categories-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Blog
          </button>
          <button
            className="nav-link-btn nav-link"
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                const el = document.getElementById('bbeauty-app-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            About Us
          </button>
          <button
            className="nav-link-btn nav-link"
            onClick={() => {
              handleNav('home');
              setTimeout(() => {
                const el = document.getElementById('bbeauty-footer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          >
            Contact
          </button>
          {user?.role === 'CUSTOMER' && (
            <button
              className={`nav-link-btn nav-link ${activePage === 'customer-dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('customer-dashboard')}
            >
              My Bookings
            </button>
          )}
          {user?.role === 'SALON_OWNER' && (
            <>
              <button
                className={`nav-link-btn nav-link ${activePage === 'owner-dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('owner-dashboard')}
              >
                Owner Dashboard
              </button>
              <button
                className={`nav-link-btn nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('admin-dashboard')}
              >
                Salons Directory
              </button>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <button
                className={`nav-link-btn nav-link ${activePage === 'customer-dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('customer-dashboard')}
              >
                My Bookings
              </button>
              <button
                className={`nav-link-btn nav-link ${activePage === 'owner-dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('owner-dashboard')}
              >
                Owner Dashboard
              </button>
              <button
                className={`nav-link-btn nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => handleNav('admin-dashboard')}
              >
                Admin Portal
              </button>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => toggleDemoMode()}
            style={{
              background: demoMode ? '#fff0f1' : '#f8f8fa',
              border: demoMode ? '1px solid #ea6a75' : '1px solid #e8e8ee',
              borderRadius: '20px',
              padding: '6px 13px',
              fontSize: '12px',
              fontWeight: 600,
              color: demoMode ? '#ea6a75' : '#7a7a85',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <PlayCircle size={15} style={{ color: demoMode ? '#ea6a75' : '#9a9aa8' }} />
            <span>Demo: {demoMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Notification Bell (Dribbble icon) */}
          <button
            onClick={onToggleNotifications}
            aria-label="Notifications"
            style={{
              background: '#fcfcfd',
              border: '1px solid #f0e6e5',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4b4b56',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ea6a75', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Login (Dribbble user icon) */}
          {!user ? (
            <button
              onClick={() => handleNav('auth')}
              aria-label="Login"
              style={{
                background: '#fcfcfd',
                border: '1px solid #f0e6e5',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4b4b56',
                cursor: 'pointer'
              }}
            >
              <User size={18} />
            </button>
          ) : (
            <div className="profile-dropdown">
              <div
                className="profile-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: '#fff0f1',
                  border: '1px solid #ffd5d1',
                  borderRadius: '24px',
                  padding: '4px 12px 4px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ea6a75', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {initials}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e1e24' }}>{user.fullName ? user.fullName.split(' ')[0] : user.username}</span>
                <ChevronDown size={14} style={{ color: '#ea6a75' }} />
              </div>
              
              {dropdownOpen && (
                <>
                  <div className="dropdown-overlay-detector" onClick={() => setDropdownOpen(false)} />
                  <div className="dropdown-menu show" style={{ display: 'block' }}>
                    <div className="dropdown-header">
                      <p className="user-role-badge">{user.role}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <hr />
                    <button
                      className="dropdown-item-btn"
                      onClick={() => handleNav('profile')}
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      <Settings size={16} />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      className="dropdown-item-btn text-danger"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        handleNav('home');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
