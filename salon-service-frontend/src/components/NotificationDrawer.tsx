import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, BellOff, CheckCircle } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useAuth();

  if (!isOpen) return null;

  return (
    <div id="notification-drawer" className="drawer show" style={{ display: 'block' }}>
      <div className="drawer-overlay" onClick={onClose}></div>
      <div className="drawer-content">
        <div className="drawer-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="drawer-body" id="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <BellOff size={40} className="gold-text" style={{ marginBottom: '10px' }} />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="notification-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                  style={{
                    background: notif.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(212,175,55,0.04)',
                    border: `1px solid ${notif.isRead ? 'var(--border-subtle)' : 'var(--border-glass)'}`,
                    borderRadius: 'var(--border-radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="notif-type" style={{ fontSize: '10px', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {notif.type.replace('_', ' ')}
                    </span>
                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--gold-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                        title="Mark as read"
                      >
                        <CheckCircle size={12} />
                        <span>Read</span>
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', margin: 0 }}>
                    {notif.description}
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {new Date(notif.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
