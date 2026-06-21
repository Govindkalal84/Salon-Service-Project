import { useState, useEffect, useCallback, type FC, type FormEvent } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Salon, Booking, Service, Category } from '../services/mockApi';
import { TrendingUp, IndianRupee, Scissors, Layers, Check, X, Calendar, Plus, Trash2 } from 'lucide-react';

export const OwnerDashboard: FC = () => {
  const { user, showToast } = useAuth();
  
  const [salon, setSalon] = useState<Salon | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [report, setReport] = useState({ totalBooking: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Mumbai');
  const [regState, setRegState] = useState('Maharashtra');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');

  // Catalog Add Form States
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('45');
  const [newServiceCatId, setNewServiceCatId] = useState('1');

  // Category Add Form States
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  const loadOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch salon details for this owner
      const salonData = await apiRequest("/api/salons/owner");
      if (salonData) {
        setSalon(salonData);
        
        // Load report
        const rpt = await apiRequest("/api/bookings/report");
        setReport(rpt || { totalBooking: 0, totalEarnings: 0 });
        
        // Load bookings
        const bks = await apiRequest("/api/bookings/salon");
        setBookings(Array.isArray(bks) ? bks : []);
        
        // Load services
        const svs = await apiRequest(`/api/service-offering/salon/${salonData.id}`);
        setServices(Array.isArray(svs) ? svs : []);
        
        // Load categories
        const cats = await apiRequest(`/api/categories/salon/${salonData.id}`);
        setCategories(Array.isArray(cats) ? cats : []);
      } else {
        setSalon(null);
      }
    } catch (e) {
      console.error("Failed to load owner dashboard data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwnerData();
  }, [loadOwnerData]);

  // Create Salon Profile
  const handleRegisterSalon = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("/api/salons", {
        method: "POST",
        body: {
          name: regName,
          address: regAddress,
          city: regCity,
          state: regState,
          phoneNumber: regPhone,
          email: regEmail
        }
      });
      showToast("Salon profile registered successfully!", "success");
      loadOwnerData();
    } catch (e: any) {
      showToast(e.message || "Failed to register salon profile", "danger");
    }
  };

  // Booking action: CONFIRM or CANCEL
  const handleUpdateBookingStatus = async (bookingId: number, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      await apiRequest(`/api/bookings/${bookingId}/status?status=${status}`, { method: "PUT" });
      showToast(`Reservation booking status set to ${status}`, "success");
      loadOwnerData();
    } catch (e: any) {
      showToast(e.message || "Failed to update status", "danger");
    }
  };

  // Add Treatment/Service
  const handleAddService = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon) return;
    try {
      await apiRequest("/api/service-offering/salon-owner", {
        method: "POST",
        body: {
          name: newServiceName,
          description: newServiceDesc,
          price: parseFloat(newServicePrice),
          duration: parseInt(newServiceDuration),
          categoryId: parseInt(newServiceCatId),
          category: parseInt(newServiceCatId),
          salonId: salon.id
        }
      });
      showToast("Treatment added to service menu", "success");
      setNewServiceName('');
      setNewServiceDesc('');
      setNewServicePrice('');
      loadOwnerData();
    } catch (e: any) {
      showToast(e.message || "Failed to add service", "danger");
    }
  };

  // Add Category
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!salon) return;
    try {
      await apiRequest("/api/categories/salon-owner", {
        method: "POST",
        body: {
          name: newCatName,
          image: newCatImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100",
          salonId: salon.id
        }
      });
      showToast("Category added successfully", "success");
      setNewCatName('');
      setNewCatImage('');
      loadOwnerData();
    } catch (e: any) {
      showToast(e.message || "Failed to add category", "danger");
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;
    try {
      await apiRequest(`/api/categories/salon-owner/${catId}`, { method: "DELETE" });
      showToast("Category deleted successfully", "info");
      loadOwnerData();
    } catch (e: any) {
      showToast(e.message || "Failed to delete category", "danger");
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateStr} @ ${timeStr}`;
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Curating your experience...</p>
      </div>
    );
  }

  // RENDER FORM: No salon profile listed yet
  if (!salon) {
    return (
      <div className="container" style={{ maxWidth: '560px', margin: '40px auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '20px', padding: '40px', boxShadow: '0 15px 40px rgba(0,0,0,0.5)' }}>
          <div className="text-center" style={{ marginBottom: '30px' }}>
            <span className="section-subtitle">Owner Registration</span>
            <h2 className="playfair gold-text" style={{ fontSize: '30px', marginTop: '6px' }}>List Your Salon</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Create a premium digital reservations portal for your treatments.
            </p>
          </div>
          <form onSubmit={handleRegisterSalon}>
            <div className="form-group">
              <label>Salon / Spa Name</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="AURA Signature Spa"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Physical Address</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Bandra West, Link Road"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>City</label>
                <select className="form-control" value={regCity} onChange={(e) => setRegCity(e.target.value)}>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Noida">Noida</option>
                  <option value="Gurgaon">Gurgaon</option>
                </select>
              </div>
              <div className="form-group">
                <label>State</label>
                <select className="form-control" value={regState} onChange={(e) => setRegState(e.target.value)}>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Contact Phone Number</label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="+91 99999 88888"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Concierge Email</label>
              <input
                type="email"
                className="form-control"
                required
                placeholder="salon@aura.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-gold w-full mt-4">
              Register Salon Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RENDER MAIN OWNER DASHBOARD
  return (
    <div className="container">
      {/* Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <span className="section-subtitle">{salon.city} ({salon.state})</span>
          <h2 className="playfair" style={{ fontSize: '32px' }}>{salon.name} Panel</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '10px 20px', textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Logged in as Owner</span>
            <p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{user?.fullName}</p>
          </div>
        </div>
      </div>

      {/* Reports and Live Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '30px', marginBottom: '40px' }}>
        {/* Earnings Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-primary)', padding: '10px', borderRadius: '50%' }}>
              <IndianRupee size={24} />
            </div>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Total Revenue</span>
          </div>
          <h3 className="gold-text playfair" style={{ fontSize: '36px', fontWeight: 700 }}>₹{report.totalEarnings}</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Calculated from confirmed UPI checks</span>
        </div>

        {/* Bookings Count Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(48,209,88,0.1)', color: 'var(--color-success)', padding: '10px', borderRadius: '50%' }}>
              <TrendingUp size={24} />
            </div>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Total Bookings</span>
          </div>
          <h3 style={{ fontSize: '36px', fontWeight: 700 }}>{report.totalBooking}</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Excludes cancelled/pending slots</span>
        </div>

        {/* Visual Revenue SVG Chart */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', padding: '20px 24px', position: 'relative' }}>
          <h4 className="playfair" style={{ fontSize: '16px', marginBottom: '14px', color: 'var(--text-secondary)' }}>Live Analytics (Weekly Earnings)</h4>
          <div style={{ width: '100%', height: '110px', marginTop: '10px' }}>
            {/* Custom vector line chart with golden gradients */}
            <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--gold-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="var(--border-subtle)" strokeWidth="0.1" />
              <line x1="0" y1="15" x2="100" y2="15" stroke="var(--border-subtle)" strokeWidth="0.1" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="var(--border-subtle)" strokeWidth="0.1" />
              
              {/* Glowing Area Fill */}
              <path d="M 0 25 L 15 22 L 30 18 L 48 20 L 65 10 L 82 8 L 100 2 Q 100 30 100 30 L 0 30 Z" fill="url(#chartGradient)" />
              {/* Glowing Line */}
              <path d="M 0 25 L 15 22 L 30 18 L 48 20 L 65 10 L 82 8 L 100 2" fill="none" stroke="var(--gold-primary)" strokeWidth="0.8" strokeLinecap="round" style={{ filter: 'drop-shadow(0px 2px 4px rgba(212,175,55,0.4))' }} />
              
              {/* Scatter Points */}
              <circle cx="0" cy="25" r="0.8" fill="var(--gold-primary)" />
              <circle cx="30" cy="18" r="0.8" fill="var(--gold-primary)" />
              <circle cx="65" cy="10" r="0.8" fill="var(--gold-primary)" />
              <circle cx="100" cy="2" r="0.8" fill="var(--gold-primary)" />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: '40px', alignItems: 'start' }}>
        
        {/* Left Side: Booking Reservations List */}
        <div>
          <h3 className="playfair mb-4" style={{ fontSize: '24px' }}>Reservations Queue</h3>
          {bookings.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '30px' }}>
              <Calendar size={30} className="gold-text" style={{ marginBottom: '10px' }} />
              <p>No bookings requested yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {bookings.map(bk => (
                <div
                  key={bk.id}
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid ${bk.status === 'PENDING' ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--border-radius-md)',
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: bk.status === 'PENDING' ? '0 0 10px rgba(212,175,55,0.05)' : 'none'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>#RSV-{bk.id.toString().substring(0, 10)}</span>
                      <span className={`status-badge ${bk.status.toLowerCase()}`} style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        color: bk.status === 'CONFIRMED' ? 'var(--color-success)' : bk.status === 'PENDING' ? 'var(--color-warning)' : 'var(--color-danger)',
                        background: bk.status === 'CONFIRMED' ? 'rgba(48,209,88,0.1)' : bk.status === 'PENDING' ? 'rgba(255,159,10,0.1)' : 'rgba(255,69,58,0.1)'
                      }}>{bk.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                      Time Slot: <strong style={{ color: 'var(--text-primary)' }}>{formatDateTime(bk.startTime)}</strong>
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Services requested: <span className="gold-text">{bk.servicesIds.length} treatments</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold-primary)' }}>₹{bk.totalPrice}</span>
                    {bk.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleUpdateBookingStatus(bk.id, 'CONFIRMED')}
                          style={{ padding: '6px 10px', fontSize: '10px', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleUpdateBookingStatus(bk.id, 'CANCELLED')}
                          style={{ padding: '6px 10px', fontSize: '10px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Catalog & Category Editors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Services Catalog Editor */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', padding: '24px' }}>
            <h4 className="playfair" style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scissors size={18} className="gold-text" />
              <span>Catalog & Add Treatment</span>
            </h4>
            
            {/* Simple list of custom services */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '180px', overflowY: 'auto' }}>
              {services.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>₹{s.price} | {s.duration} mins</p>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No treatments added yet.</p>
              )}
            </div>
            
            <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Treatment Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Deep Tissue Massage"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Description</label>
                <textarea
                  className="form-control"
                  required
                  placeholder="Gently relieves chronic muscle tension..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  rows={2}
                  style={{ resize: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    required
                    placeholder="1200"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Duration (mins)</label>
                  <select
                    className="form-control"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                    <option value="90">90 mins</option>
                    <option value="120">120 mins</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Group</label>
                <select
                  className="form-control"
                  value={newServiceCatId}
                  onChange={(e) => setNewServiceCatId(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="1">Haircut & Styling</option>
                      <option value="2">Facial & Spa</option>
                      <option value="3">Manicure & Pedicure</option>
                      <option value="4">Massage Therapy</option>
                    </>
                  )}
                </select>
              </div>
              <button type="submit" className="btn btn-gold w-full mt-2" style={{ display: 'flex', gap: '6px' }}>
                <Plus size={16} />
                <span>Add Service</span>
              </button>
            </form>
          </div>

          {/* Categories Manager */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', padding: '24px' }}>
            <h4 className="playfair" style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} className="gold-text" />
              <span>Category Manager</span>
            </h4>
            
            {/* Simple list of custom categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-dark)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                  <span>{c.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Title</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Bridal Special"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category Cover Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-outline btn-gold w-full mt-2" style={{ display: 'flex', gap: '6px' }}>
                <Plus size={16} />
                <span>Create Category</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
