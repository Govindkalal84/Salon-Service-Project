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
          <span className="logo-text">AURA</span>
          <span className="logo-subtitle">SALON & SPA</span>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link-btn nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            Explore
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
            <button
              className={`nav-link-btn nav-link ${activePage === 'owner-dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('owner-dashboard')}
            >
              Owner Dashboard
            </button>
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
            className="btn btn-outline"
            onClick={() => toggleDemoMode()}
            style={{
              borderColor: demoMode ? 'var(--gold-primary)' : 'rgba(212, 175, 55, 0.3)',
              padding: '8px 14px',
              fontSize: '12px',
              color: demoMode ? 'var(--gold-primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PlayCircle size={16} />
            <span>Demo Mode: {demoMode ? 'On' : 'Off'}</span>
          </button>

          {/* Notification Bell */}
          {user && (
            <button className="nav-action-btn" onClick={onToggleNotifications}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
          )}

          {/* Auth Toggle Button / Profile Dropdown */}
          {!user ? (
            <button className="btn btn-outline" onClick={() => handleNav('auth')}>
              <User size={16} />
              <span>Login</span>
            </button>
          ) : (
            <div className="profile-dropdown">
              <div className="profile-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar">{initials}</div>
                <span className="username">{user.fullName || user.username}</span>
                <ChevronDown size={14} />
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
