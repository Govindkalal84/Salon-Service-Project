import { mockApiRequest, isDemoModeActive } from './mockApi';

export const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || "https://salon-service-project-spmu.onrender.com";
export const CATEGORY_SERVICE_URL = import.meta.env.VITE_CATEGORY_SERVICE_URL || "https://salon-service-project-wpp6.onrender.com";
export const BOOKING_SERVICE_URL = import.meta.env.VITE_BOOKING_SERVICE_URL || "https://salon-service-project-yd8g.onrender.com";
export const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || "https://salon-service-project-ekud.onrender.com";
export const SALON_SERVICE_URL = import.meta.env.VITE_SALON_SERVICE_URL || "https://salon-service-project-z307.onrender.com";
export const SERVICE_OFFERING_URL = import.meta.env.VITE_SERVICE_OFFERING_URL || "https://salon-service-project-wv4y.onrender.com";

export const BASE_URL = GATEWAY_URL;

export function getBaseUrl(endpoint: string): string {
  if (endpoint.startsWith('/auth') || endpoint.startsWith('/api/users') || endpoint.startsWith('/users')) {
    return USER_SERVICE_URL;
  }
  if (endpoint.startsWith('/api/categories')) {
    return CATEGORY_SERVICE_URL;
  }
  if (endpoint.startsWith('/api/bookings')) {
    return BOOKING_SERVICE_URL;
  }
  if (endpoint.startsWith('/api/salons')) {
    return SALON_SERVICE_URL;
  }
  if (endpoint.startsWith('/api/service-offering')) {
    return SERVICE_OFFERING_URL;
  }
  return GATEWAY_URL;
}

export interface AuthState {
  user: any | null;
  jwt: string | null;
  refreshToken: string | null;
  role: 'CUSTOMER' | 'SALON_OWNER' | 'ADMIN' | null;
}

// Read initial auth state from localStorage
export const getInitialAuthState = (): AuthState => {
  return {
    user: null,
    jwt: localStorage.getItem("jwt") || null,
    refreshToken: localStorage.getItem("refresh_token") || null,
    role: (localStorage.getItem("user_role") as any) || null
  };
};

let globalLogoutHandler: (() => void) | null = null;

export const registerLogoutHandler = (handler: () => void) => {
  globalLogoutHandler = handler;
};

export const registerFailoverListener = (_callback: (useDemo: boolean) => void) => {
  // Demo mode auto-failover disabled as requested
};

// Unified API Request helper
export async function apiRequest(endpoint: string, options: any = {}): Promise<any> {
  const isDemo = isDemoModeActive();
  
  if (isDemo) {
    return mockApiRequest(endpoint, options);
  }
  
  const baseUrl = getBaseUrl(endpoint);
  const url = `${baseUrl}${endpoint}`;
  
  // Set headers
  if (!options.headers) {
    options.headers = {};
  }
  
  const jwt = localStorage.getItem("jwt");
  if (jwt) {
    options.headers["Authorization"] = `Bearer ${jwt}`;
  }
  
  // Default to JSON content type if body is object and not FormData
  if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }
  
  const controller = new AbortController();
  const isRead = !options.method || options.method === 'GET';
  const timeoutMs = options.timeout || (isRead ? 10000 : 30000);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  if (!options.signal) {
    options.signal = controller.signal;
  }

  try {
    let response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    // Handle token expiration / unauthorized
    if (response.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        console.warn("JWT expired. Attempting token refresh...");
        const refreshed = await attemptTokenRefresh(refreshToken);
        if (refreshed) {
          // Retry request with new token
          const newJwt = localStorage.getItem("jwt");
          options.headers["Authorization"] = `Bearer ${newJwt}`;
          response = await fetch(url, options);
        } else {
          if (globalLogoutHandler) {
            globalLogoutHandler();
          }
          throw new Error("Session expired. Please log in again.");
        }
      }
    }
    
    if (!response.ok) {
      if (response.status === 503 || response.status === 502 || response.status === 504) {
        throw new Error(`The backend service is currently waking up (Status ${response.status}). Please try again in a few moments.`);
      }
      
      const errorText = await response.text();
      let errorMessage = "An error occurred";
      try {
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.message || parsed.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error("HTTP_ERROR: " + errorMessage);
    }
    
    // Parse JSON if response is not empty
    const text = await response.text();
    if (!text) return null;
    
    try {
      const parsed = JSON.parse(text);
      // Detect Spring Boot wrapped exception response (GlobalExceptionHandler returning 200 OK)
      if (parsed && typeof parsed === 'object' && parsed.error && typeof parsed.error === 'string' && parsed.error.startsWith('uri=') && parsed.message) {
        throw new Error("HTTP_ERROR: " + parsed.message);
      }
      return parsed;
    } catch (parseError: any) {
      if (parseError.message && parseError.message.startsWith("HTTP_ERROR: ")) {
        throw parseError;
      }
      // Return plain text response gracefully without throwing JSON parse error
      return { message: text };
    }
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`API Request Error [${endpoint}]:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error("Request timed out waiting for backend. Please retry.");
    }
    
    if (error.message && error.message.startsWith("HTTP_ERROR: ")) {
      throw new Error(error.message.replace("HTTP_ERROR: ", ""));
    }
    
    throw new Error(error.message || "Network Error");
  }
}

// Token Refresh Handler
async function attemptTokenRefresh(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${USER_SERVICE_URL}/auth/access-token/refresh-token/${refreshToken}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("refresh_token", data.refresh_token);
      return true;
    }
  } catch (e) {
    console.error("Refresh token request failed", e);
  }
  return false;
}
