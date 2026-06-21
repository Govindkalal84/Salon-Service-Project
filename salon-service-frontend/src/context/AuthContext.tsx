import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest, getInitialAuthState, registerLogoutHandler, registerFailoverListener } from '../services/api';
import { isDemoModeActive, setDemoModeActive, initDemoDatabase } from '../services/mockApi';

export interface UserProfile {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: 'CUSTOMER' | 'SALON_OWNER' | 'ADMIN';
}

export interface AppNotification {
  id: number;
  type: string;
  description: string;
  isRead: boolean;
  userId: number;
  bookingId: number | null;
  salonId: number | null;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  jwt: string | null;
  role: 'CUSTOMER' | 'SALON_OWNER' | 'ADMIN' | null;
  demoMode: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (formData: any) => Promise<any>;
  logout: () => void;
  toggleDemoMode: (val?: boolean) => void;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
  showToast: (message: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
  toast: { message: string; type: 'success' | 'warning' | 'danger' | 'info' } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuthState());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [demoMode, setDemoMode] = useState(isDemoModeActive());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'danger' | 'info' } | null>(null);

  // Helper to show custom micro-animated toast
  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'danger' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("demo_current_user_id");
    
    setAuth({
      user: null,
      jwt: null,
      refreshToken: null,
      role: null
    });
    setUserProfile(null);
    setNotifications([]);
    showToast("Logged out successfully", "info");
  }, [showToast]);

  const toggleDemoMode = useCallback((val?: boolean) => {
    const nextVal = val !== undefined ? val : !demoMode;
    setDemoModeActive(nextVal);
    setDemoMode(nextVal);
    
    if (nextVal) {
      initDemoDatabase();
    }
    
    // Clear tokens/user profile on toggle to avoid cross-mode leaks
    localStorage.removeItem("jwt");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("demo_current_user_id");
    setAuth({ user: null, jwt: null, refreshToken: null, role: null });
    setUserProfile(null);
    setNotifications([]);
    
    showToast(`Switched to ${nextVal ? 'Local Demo' : 'Live Gateway'} Mode`, "success");
  }, [demoMode, showToast]);

  // Hook into api.ts logout and failover handlers
  useEffect(() => {
    registerLogoutHandler(logout);
    registerFailoverListener((useDemo) => {
      toggleDemoMode(useDemo);
    });
  }, [logout, toggleDemoMode]);

  const fetchUserProfile = useCallback(async () => {
    if (!auth.jwt && !isDemoModeActive()) return;
    try {
      const profile = await apiRequest("/api/users/profile");
      setUserProfile(profile);
      if (auth.role !== profile.role) {
        localStorage.setItem("user_role", profile.role);
        setAuth(prev => ({ ...prev, role: profile.role }));
      }
    } catch (e: any) {
      console.error("Failed to load user profile", e);
      if (e.message === "DEMO_MODE_ACTIVATED") {
        toggleDemoMode(true);
      }
    }
  }, [auth.jwt, auth.role, toggleDemoMode]);

  const fetchNotifications = useCallback(async () => {
    if (!userProfile) return;
    try {
      let endpoint = `/api/notifications/user/${userProfile.id}`;
      if (userProfile.role === 'SALON_OWNER') {
        // Find owner's salon first
        const salon = await apiRequest("/api/salons/owner", { noFailover: true });
        if (salon) {
          endpoint = `/api/notifications/salon-owner/salon/${salon.id}`;
        }
      }
      const data = await apiRequest(endpoint, { noFailover: true });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Notifications fetch failed", e);
      if (e.message === "DEMO_MODE_ACTIVATED") {
        toggleDemoMode(true);
      }
    }
  }, [userProfile, toggleDemoMode]);

  const markNotificationRead = async (id: number) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: "PUT", noFailover: true });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (e: any) {
      console.error("Mark notification read failed", e);
      if (e.message === "DEMO_MODE_ACTIVATED") {
        toggleDemoMode(true);
      }
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password }
      });
      
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user_role", data.role || "CUSTOMER");
      
      setAuth({
        user: null,
        jwt: data.jwt,
        refreshToken: data.refresh_token,
        role: data.role || "CUSTOMER"
      });
      
      showToast("Access Granted. Welcome to AURA!", "success");
      setLoading(false);
      return data;
    } catch (e: any) {
      setLoading(false);
      if (e.message !== "DEMO_MODE_ACTIVATED") {
        throw e;
      }
    }
  };

  const signup = async (formData: any) => {
    setLoading(true);
    try {
      const data = await apiRequest("/auth/signup", {
        method: "POST",
        body: formData
      });
      
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user_role", data.role || formData.role);
      
      setAuth({
        user: null,
        jwt: data.jwt,
        refreshToken: data.refresh_token,
        role: data.role || formData.role
      });
      
      showToast("Profile created successfully!", "success");
      setLoading(false);
      return data;
    } catch (e: any) {
      setLoading(false);
      if (e.message !== "DEMO_MODE_ACTIVATED") {
        throw e;
      }
    }
  };

  // Sync profile details when auth changes
  useEffect(() => {
    if (auth.jwt || (demoMode && localStorage.getItem("demo_current_user_id"))) {
      fetchUserProfile();
    }
  }, [auth.jwt, demoMode, fetchUserProfile]);

  // Notifications poll timer
  useEffect(() => {
    if (userProfile) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [userProfile, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
        jwt: auth.jwt,
        role: auth.role,
        demoMode,
        notifications,
        unreadCount,
        loading,
        login,
        signup,
        logout,
        toggleDemoMode,
        fetchNotifications,
        markNotificationRead,
        refreshProfile: fetchUserProfile,
        showToast,
        toast
      }}
    >
      {children}
      
      {/* Dynamic Toast Renderer */}
      {toast && (
        <div id="toast-container">
          <div className={`toast ${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
