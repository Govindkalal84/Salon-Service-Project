import { useState, type FC } from 'react';
import { useAuth } from '../context/AuthContext';
import { Info } from 'lucide-react';

interface AuthProps {
  onNavigate: (page: string) => void;
}

export const Auth: FC<AuthProps> = ({ onNavigate }) => {
  const { login, signup, demoMode, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'CUSTOMER' | 'SALON_OWNER'>('CUSTOMER');
  
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const data = await login(loginEmail, loginPassword);
      if (data) {
        if (data.role === 'SALON_OWNER') {
          onNavigate('owner-dashboard');
        } else if (data.role === 'ADMIN') {
          onNavigate('admin-dashboard');
        } else {
          onNavigate('home');
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Invalid credentials");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const data = await signup({
        fullName: signupName,
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
        role: signupRole
      });
      if (data) {
        if (data.role === 'SALON_OWNER') {
          onNavigate('owner-dashboard');
        } else if (data.role === 'ADMIN') {
          onNavigate('admin-dashboard');
        } else {
          onNavigate('home');
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Registration failed");
    }
  };

  const applyDemoPreset = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('123');
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - var(--header-height) - 100px)' }}>
      <div className="auth-wrapper" style={{ margin: '40px auto', width: '100%', maxWidth: '440px' }}>
        <div className="auth-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            Sign Up
          </button>
        </div>

        {demoMode && activeTab === 'login' && (
          <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-md)', padding: '15px', marginBottom: '20px', fontSize: '13px' }}>
            <p className="gold-text" style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} />
              <span>Demo Accounts (Click to auto-fill):</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                onClick={() => applyDemoPreset('customer@aura.com')}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', padding: '2px 0' }}
              >
                👤 <strong>Customer</strong>: customer@aura.com
              </button>
              <button
                onClick={() => applyDemoPreset('owner@aura.com')}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', padding: '2px 0' }}
              >
                💼 <strong>Owner</strong>: owner@aura.com
              </button>
              <button
                onClick={() => applyDemoPreset('admin@aura.com')}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', padding: '2px 0' }}
              >
                ⚙️ <strong>Admin</strong>: admin@aura.com
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(255, 69, 58, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '10px 15px', borderRadius: 'var(--border-radius-md)', marginBottom: '20px', fontSize: '13px' }}>
            {errorMsg}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  required
                  placeholder="name@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-gold w-full mt-4" disabled={loading}>
              {loading ? "Authenticating..." : "Access Account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Jane Doe"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="janedoe"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="name@domain.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Minimum 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select
                className="form-control"
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value as any)}
              >
                <option value="CUSTOMER">Customer (Book Treatments)</option>
                <option value="SALON_OWNER">Salon Owner (List & Manage)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-gold w-full mt-4" disabled={loading}>
              {loading ? "Creating Profile..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
