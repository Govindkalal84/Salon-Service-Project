/* ==========================================================================
   AURA PREMIUM SALON & SPA - LOCAL DEMO MODE API INTERCEPTOR (TYPESCRIPT)
   ========================================================================== */

export interface Category {
  id: number;
  name: string;
  image: string;
  salonId?: number;
}

export interface Salon {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  images: string[];
  ownerId: number;
  openTime: string;
  closeTime: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number; // in INR
  duration: number; // in minutes
  salonId: number;
  categoryId: number;
  image?: string;
}

export interface Review {
  id: number;
  rating: number;
  reviewText: string;
  salonId: number;
  userId: number;
  createdAt: string;
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  role: 'CUSTOMER' | 'SALON_OWNER' | 'ADMIN';
}

export interface Booking {
  id: number;
  salonId: number;
  customerId: number;
  startTime: string;
  endTime: string;
  servicesIds: number[];
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalPrice: number;
}

export interface Notification {
  id: number;
  type: string;
  description: string;
  isRead: boolean;
  userId: number;
  bookingId: number | null;
  salonId: number | null;
  createdAt: string;
}

// Check if demo mode is enabled
export const isDemoModeActive = (): boolean => {
  return localStorage.getItem("demo_mode") === "true";
};

export const setDemoModeActive = (active: boolean) => {
  localStorage.setItem("demo_mode", active ? "true" : "false");
};

// Initialize Demo Mode database in localStorage if not exists
export function initDemoDatabase() {
  if (!localStorage.getItem("demo_initialized_v4")) {
    // 1. Categories
    const mockCategories: Category[] = [
      { id: 1, name: "Haircut & Styling", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&q=80" },
      { id: 2, name: "Facial & Spa", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&q=80" },
      { id: 3, name: "Manicure & Pedicure", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&q=80" },
      { id: 4, name: "Massage Therapy", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&q=80" }
    ];

    // 2. Salons (Indian Cities and States)
    const mockSalons: Salon[] = [
      { 
        id: 1, 
        name: "AURA Premium Spa & Salon", 
        address: "Hill Road, Bandra West", 
        city: "Mumbai", 
        state: "Maharashtra", 
        phoneNumber: "+91 22 5550 1890", 
        email: "mumbai@aura.com", 
        images: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"], 
        ownerId: 102, 
        openTime: "09:00", 
        closeTime: "21:00" 
      },
      { 
        id: 2, 
        name: "Luxe Grooming Lounge", 
        address: "100 Feet Road, Indiranagar", 
        city: "Bangalore", 
        state: "Karnataka", 
        phoneNumber: "+91 80 5550 1440", 
        email: "blr@luxe.com", 
        images: ["https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=800"], 
        ownerId: 103, 
        openTime: "10:00", 
        closeTime: "20:00" 
      },
      { 
        id: 3, 
        name: "Velvet Retreat & Spa", 
        address: "Ashok Marg, C-Scheme", 
        city: "Jaipur", 
        state: "Rajasthan", 
        phoneNumber: "+91 141 5550 1550", 
        email: "jaipur@velvet.com", 
        images: ["https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=800"], 
        ownerId: 104, 
        openTime: "09:00", 
        closeTime: "22:00" 
      },
      { 
        id: 4, 
        name: "Royal Touch Salon", 
        address: "Koregaon Park Road", 
        city: "Pune", 
        state: "Maharashtra", 
        phoneNumber: "+91 20 5550 1660", 
        email: "pune@royal.com", 
        images: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800"], 
        ownerId: 102, 
        openTime: "09:00", 
        closeTime: "21:00" 
      },
      { 
        id: 5, 
        name: "Golden Glow Salon & Spa", 
        address: "Outer Circle, Connaught Place", 
        city: "Delhi", 
        state: "Delhi", 
        phoneNumber: "+91 11 5550 1770", 
        email: "delhi@goldenglow.com", 
        images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800"], 
        ownerId: 105, 
        openTime: "10:00", 
        closeTime: "21:00" 
      }
    ];

    // 3. Services (Pricing in INR)
    const mockServices: Service[] = [
      { id: 11, name: "Signature Haircut", description: "Shampoo, cut, and customized styling blow-out.", price: 650, duration: 45, salonId: 1, categoryId: 1 },
      { id: 12, name: "Hydrating Facial Spa", description: "Anti-aging facial utilizing premium herbal extracts.", price: 1200, duration: 60, salonId: 1, categoryId: 2 },
      { id: 13, name: "Gel Manicure", description: "Precision nail shaping, cuticle care, and gel polish.", price: 450, duration: 40, salonId: 1, categoryId: 3 },
      { id: 14, name: "Traditional Thai Massage", description: "Deep tissue stretching and body massage.", price: 1800, duration: 75, salonId: 1, categoryId: 4 },
      
      { id: 21, name: "Premium Beard Grooming", description: "Classic hot towel shave with beard trim and styling.", price: 350, duration: 30, salonId: 2, categoryId: 1 },
      { id: 22, name: "Hot Stone Therapy", description: "Warm volcanic stone massage targeting muscle tension.", price: 2500, duration: 75, salonId: 2, categoryId: 4 },
      { id: 23, name: "Organic Pedicure", description: "Relaxing foot soak, scrub, and standard nail polish.", price: 500, duration: 45, salonId: 2, categoryId: 3 },
      
      { id: 31, name: "Balayage Highlights", description: "Hand-painted natural looking color gradient highlights.", price: 4500, duration: 120, salonId: 3, categoryId: 1 },
      { id: 32, name: "Deep Tissue Swedish Massage", description: "Intense pressure massage relieving chronic tension.", price: 2000, duration: 90, salonId: 3, categoryId: 4 },
      
      { id: 41, name: "Style & Blow Dry", description: "Professional wash, conditioning, and custom styling.", price: 550, duration: 30, salonId: 4, categoryId: 1 },
      { id: 42, name: "Detoxifying Clay Facial", description: "Deep cleansing clay mask and blackhead removal.", price: 950, duration: 50, salonId: 4, categoryId: 2 },
      
      { id: 51, name: "Royal Bridal Makeover", description: "Premium wedding makeup, hair styling, and draping.", price: 8500, duration: 180, salonId: 5, categoryId: 1 },
      { id: 52, name: "Aromatherapy Massage", description: "Calming massage using premium essential oils.", price: 2200, duration: 60, salonId: 5, categoryId: 4 }
    ];
    
    // 4. Reviews
    const mockReviews: Review[] = [
      { id: 201, rating: 5, reviewText: "Absolutely divine service! The Bandra ambiance is unparalleled.", salonId: 1, userId: 101, createdAt: "2026-06-18T10:00:00" },
      { id: 202, rating: 4, reviewText: "Fantastic beard groom in Indiranagar. Will definitely return.", salonId: 2, userId: 101, createdAt: "2026-06-19T14:30:00" }
    ];

    // 5. Users
    const mockUsers: User[] = [
      { id: 101, fullName: "Govind Customer", username: "customer", email: "customer@aura.com", password: "123", role: "CUSTOMER" },
      { id: 102, fullName: "Marcus Owner", username: "owner", email: "owner@aura.com", password: "123", role: "SALON_OWNER" },
      { id: 105, fullName: "System Admin", username: "admin", email: "admin@aura.com", password: "123", role: "ADMIN" }
    ];

    // 6. Bookings
    const mockBookings: Booking[] = [
      { id: 501, salonId: 1, customerId: 101, startTime: "2026-06-25T11:00:00", endTime: "2026-06-25T11:45:00", servicesIds: [11], status: "CONFIRMED", totalPrice: 650 }
    ];

    // 7. Notifications
    const mockNotifications: Notification[] = [
      { id: 801, type: "WELCOME", description: "Welcome to AURA Premium Indian reservations portal!", isRead: false, userId: 101, bookingId: null, salonId: null, createdAt: "2026-06-19T09:00:00" }
    ];

    localStorage.setItem("demo_categories", JSON.stringify(mockCategories));
    localStorage.setItem("demo_salons", JSON.stringify(mockSalons));
    localStorage.setItem("demo_services", JSON.stringify(mockServices));
    localStorage.setItem("demo_reviews", JSON.stringify(mockReviews));
    localStorage.setItem("demo_users", JSON.stringify(mockUsers));
    localStorage.setItem("demo_bookings", JSON.stringify(mockBookings));
    localStorage.setItem("demo_notifications", JSON.stringify(mockNotifications));
    localStorage.setItem("demo_initialized_v4", "true");
  }
}

// Simulated mock API requests
export function mockApiRequest(endpoint: string, options: any = {}): Promise<any> {
  initDemoDatabase();
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const response = handleMockRouting(endpoint, options);
        resolve(response);
      } catch (e) {
        reject(e);
      }
    }, 400);
  });
}

function handleMockRouting(endpoint: string, options: any) {
  const method = options.method || "GET";
  let body: any = null;
  if (options.body) {
    if (typeof options.body === 'object') {
      body = options.body;
    } else {
      try {
        body = JSON.parse(options.body);
      } catch (e) {
        body = options.body;
      }
    }
  }
  
  const getDB = (key: string): any[] => JSON.parse(localStorage.getItem(key) || "[]");
  const setDB = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));
  const getUserId = (): number | null => {
    const id = localStorage.getItem("demo_current_user_id");
    return id ? parseInt(id) : null;
  };

  // --- ROUTE: /auth/login ---
  if (endpoint.startsWith("/auth/login") && method === "POST") {
    const users = getDB("demo_users");
    const user = users.find(u => u.email === body.email && u.password === body.password);
    if (!user) throw new Error("Invalid email or password");
    
    localStorage.setItem("demo_current_user_id", user.id.toString());
    return {
      jwt: "mock_jwt_token_for_" + user.username,
      refresh_token: "mock_refresh_token_for_" + user.username,
      role: user.role,
      message: "login Success"
    };
  }

  // --- ROUTE: /auth/signup ---
  if (endpoint.startsWith("/auth/signup") && method === "POST") {
    const users = getDB("demo_users");
    if (users.some(u => u.email === body.email || u.username === body.username)) {
      throw new Error("Username or Email already registered");
    }
    const newUser = {
      id: Date.now(),
      fullName: body.fullName,
      username: body.username,
      email: body.email,
      password: body.password,
      role: body.role
    };
    users.push(newUser);
    setDB("demo_users", users);
    
    localStorage.setItem("demo_current_user_id", newUser.id.toString());
    return {
      jwt: "mock_jwt_token_for_" + newUser.username,
      refresh_token: "mock_refresh_token_for_" + newUser.username,
      role: newUser.role,
      message: "Registered Successfully"
    };
  }

  // --- ROUTE: /api/users/profile ---
  if (endpoint.startsWith("/api/users/profile")) {
    const uid = getUserId();
    const users = getDB("demo_users");
    const user = users.find(u => u.id === uid);
    if (!user) throw new Error("Unauthorized");
    return user;
  }

  // --- ROUTE: /api/users ---
  if (endpoint.startsWith("/api/users")) {
    const parts = endpoint.split("/");
    if (parts.length === 4) {
      const uid = parseInt(parts[3]);
      let users = getDB("demo_users");
      
      if (method === "DELETE") {
        users = users.filter(u => u.id !== uid);
        setDB("demo_users", users);
        return "Deleted successfully";
      }
      if (method === "PUT") {
        const idx = users.findIndex(u => u.id === uid);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...body };
          setDB("demo_users", users);
          return users[idx];
        }
      }
    }
    return getDB("demo_users");
  }

  // --- ROUTE: /api/salons/owner ---
  if (endpoint.startsWith("/api/salons/owner")) {
    const uid = getUserId();
    const salons = getDB("demo_salons");
    const salon = salons.find(s => s.ownerId === uid);
    if (!salon) return null; // Safe fallback in React
    return salon;
  }

  // --- ROUTE: /api/salons ---
  if (endpoint.startsWith("/api/salons")) {
    const salons = getDB("demo_salons");
    const parts = endpoint.split("?")[0].split("/");
    
    if (endpoint.includes("/search")) {
      const queryParams = new URLSearchParams(endpoint.split("?")[1] || "");
      const city = queryParams.get("city")?.toLowerCase() || "";
      return salons.filter(s => 
        s.city.toLowerCase().includes(city) || 
        s.name.toLowerCase().includes(city) ||
        s.state.toLowerCase().includes(city)
      );
    }
    
    if (parts.length === 4) {
      const sid = parseInt(parts[3]);
      const salon = salons.find(s => s.id === sid);
      if (!salon) throw new Error("Salon not found");
      
      if (method === "PUT") {
        const idx = salons.findIndex(s => s.id === sid);
        salons[idx] = { ...salons[idx], ...body };
        setDB("demo_salons", salons);
        return salons[idx];
      }
      return salon;
    }
    
    if (method === "POST") {
      const newSalon = {
        id: Date.now(),
        name: body.name,
        address: body.address,
        city: body.city,
        state: body.state || "Maharashtra",
        phoneNumber: body.phoneNumber,
        email: body.email,
        images: body.images || ["https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800"],
        ownerId: getUserId() || 102,
        openTime: body.openTime || "09:00",
        closeTime: body.closeTime || "21:00"
      };
      salons.push(newSalon);
      setDB("demo_salons", salons);
      return newSalon;
    }
    return salons;
  }

  // --- ROUTE: /api/service-offering ---
  if (endpoint.startsWith("/api/service-offering")) {
    let services = getDB("demo_services");
    
    if (endpoint.includes("/salon/")) {
      const salonId = parseInt(endpoint.split("/").pop() || "0");
      return services.filter(s => s.salonId === salonId);
    }
    
    if (method === "POST" && endpoint.includes("/salon-owner")) {
      const newServ = {
        id: Date.now(),
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        duration: parseInt(body.duration),
        categoryId: parseInt(body.categoryId),
        salonId: parseInt(body.salonId),
        image: body.image
      };
      services.push(newServ);
      setDB("demo_services", services);
      return newServ;
    }
  }

  // --- ROUTE: /api/categories ---
  if (endpoint.startsWith("/api/categories")) {
    let categories = getDB("demo_categories");
    
    if (endpoint.includes("/salon/")) {
      return categories;
    }
    
    if (method === "POST" && endpoint.includes("/salon-owner")) {
      const newCat = {
        id: Date.now(),
        name: body.name,
        image: body.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100",
        salonId: body.salonId
      };
      categories.push(newCat);
      setDB("demo_categories", categories);
      return newCat;
    }
    
    if (method === "DELETE" && endpoint.includes("/salon-owner/")) {
      const catId = parseInt(endpoint.split("/").pop() || "0");
      categories = categories.filter(c => c.id !== catId);
      setDB("demo_categories", categories);
      return "Deleted successfully";
    }
  }

  // --- ROUTE: /api/bookings ---
  if (endpoint.startsWith("/api/bookings")) {
    let bookings = getDB("demo_bookings");
    
    if (endpoint.includes("/slots/salon/")) {
      const parts = endpoint.split("/");
      const dateStr = parts.pop() || "";
      const salonId = parseInt(parts[parts.length - 2] || "0");
      return bookings.filter(b => b.salonId === salonId && b.startTime.startsWith(dateStr) && b.status !== "CANCELLED");
    }
    
    if (endpoint.includes("/report")) {
      const uid = getUserId();
      const salons = getDB("demo_salons");
      const salon = salons.find(s => s.ownerId === uid);
      if (!salon) return { totalBooking: 0, totalEarnings: 0 };
      
      const salonBookings = bookings.filter(b => b.salonId === salon.id && b.status === "CONFIRMED");
      const totalEarnings = salonBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      return {
        totalBooking: salonBookings.length,
        totalEarnings: totalEarnings
      };
    }
    
    if (endpoint.includes("/customer")) {
      const uid = getUserId();
      return bookings.filter(b => b.customerId === uid);
    }
    
    if (endpoint.includes("/salon")) {
      const uid = getUserId();
      const salons = getDB("demo_salons");
      const salon = salons.find(s => s.ownerId === uid);
      if (!salon) return [];
      return bookings.filter(b => b.salonId === salon.id);
    }
    
    if (endpoint.includes("/status")) {
      const bookingId = parseInt(endpoint.split("/")[3]);
      const queryParams = new URLSearchParams(endpoint.split("?")[1] || "");
      const status = queryParams.get("status") as any;
      const idx = bookings.findIndex(b => b.id === bookingId);
      if (idx !== -1) {
        bookings[idx].status = status;
        setDB("demo_bookings", bookings);
        
        let notifications = getDB("demo_notifications");
        notifications.push({
          id: Date.now(),
          type: "STATUS_UPDATE",
          description: `Your reservation #RSV-${bookingId} is now ${status}.`,
          isRead: false,
          userId: bookings[idx].customerId,
          bookingId: bookingId,
          salonId: bookings[idx].salonId,
          createdAt: new Date().toISOString()
        });
        setDB("demo_notifications", notifications);
        
        return bookings[idx];
      }
    }
    
    if (method === "POST") {
      const queryParams = new URLSearchParams(endpoint.split("?")[1] || "");
      const salonId = parseInt(queryParams.get("salonId") || "0");
      
      let total = 0;
      const services = getDB("demo_services");
      body.serviceIds.forEach((id: number) => {
        const s = services.find(serv => serv.id === id);
        if (s) total += s.price;
      });
      
      const newBooking: Booking = {
        id: Date.now(),
        salonId: salonId,
        customerId: getUserId() || 101,
        startTime: body.startTime,
        endTime: body.endTime,
        servicesIds: body.serviceIds,
        status: "PENDING",
        totalPrice: total
      };
      bookings.push(newBooking);
      setDB("demo_bookings", bookings);
      
      const salons = getDB("demo_salons");
      const salon = salons.find(s => s.id === salonId);
      if (salon) {
        let notifications = getDB("demo_notifications");
        notifications.push({
          id: Date.now(),
          type: "NEW_BOOKING",
          description: `A new booking has been requested for ${body.startTime.replace("T", " ")}.`,
          isRead: false,
          userId: salon.ownerId,
          bookingId: newBooking.id,
          salonId: salonId,
          createdAt: new Date().toISOString()
        });
        setDB("demo_notifications", notifications);
      }
      
      return {
        payment_link_url: `http://localhost:3000/#payment_link_${newBooking.id}`,
        getPayment_link_id: "plink_" + newBooking.id
      };
    }
  }

  // --- ROUTE: /api/reviews ---
  if (endpoint.startsWith("/api/reviews")) {
    let reviews = getDB("demo_reviews");
    
    if (endpoint.includes("/salon")) {
      const salonId = parseInt(endpoint.replace("/api/reviews/salon", ""));
      
      if (method === "POST") {
        const newRev = {
          id: Date.now(),
          rating: body.rating,
          reviewText: body.reviewText,
          salonId: salonId,
          userId: getUserId() || 101,
          createdAt: new Date().toISOString()
        };
        reviews.push(newRev);
        setDB("demo_reviews", reviews);
        return newRev;
      }
      return reviews.filter(r => r.salonId === salonId);
    }
  }

  // --- ROUTE: /api/notifications ---
  if (endpoint.startsWith("/api/notifications")) {
    let notifications = getDB("demo_notifications");
    
    if (endpoint.includes("/user/")) {
      const uid = parseInt(endpoint.split("/").pop() || "0");
      return notifications.filter(n => n.userId === uid);
    }
    if (endpoint.includes("/salon-owner/salon/")) {
      const salonId = parseInt(endpoint.split("/").pop() || "0");
      const salons = getDB("demo_salons");
      const salon = salons.find(s => s.id === salonId);
      if (!salon) return [];
      return notifications.filter(n => n.userId === salon.ownerId);
    }
    if (endpoint.includes("/read") && method === "PUT") {
      const nid = parseInt(endpoint.split("/")[3]);
      const idx = notifications.findIndex(n => n.id === nid);
      if (idx !== -1) {
        notifications[idx].isRead = true;
        setDB("demo_notifications", notifications);
        return notifications[idx];
      }
    }
  }

  // --- ROUTE: /api/payments/proceed ---
  if (endpoint.startsWith("/api/payments/proceed") && method === "PATCH") {
    const queryParams = new URLSearchParams(endpoint.split("?")[1] || "");
    const linkId = queryParams.get("paymentLinkId") || "";
    const bookingId = parseInt(linkId.replace("plink_", ""));
    
    let bookings = getDB("demo_bookings");
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
      bookings[idx].status = "CONFIRMED";
      setDB("demo_bookings", bookings);
      
      let notifications = getDB("demo_notifications");
      notifications.push({
        id: Date.now(),
        type: "PAYMENT_CONFIRMED",
        description: `Payment for reservation #RSV-${bookingId} was confirmed. Status updated to CONFIRMED.`,
        isRead: false,
        userId: bookings[idx].customerId,
        bookingId: bookingId,
        salonId: bookings[idx].salonId,
        createdAt: new Date().toISOString()
      });
      setDB("demo_notifications", notifications);
      return true;
    }
    return false;
  }

  return null;
}
