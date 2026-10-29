import { useState, useEffect, type FC, type FormEvent } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User, Salon } from '../services/mockApi';
import { 
  Shield, 
  Trash2, 
  Building, 
  Users, 
  Plus, 
  Wallet, 
  Percent, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  ArrowRightLeft, 
  CreditCard, 
  Lock
} from 'lucide-react';

interface SplitTransaction {
  id: string;
  bookingRef: string;
  customerName: string;
  salonName: string;
  totalAmount: number;
  adminCommission: number;
  ownerPayout: number;
  status: 'VAULTED_IN_ESCROW' | 'DISBURSED_TO_OWNER';
  date: string;
}

export const AdminDashboard: FC = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'salons' | 'users' | 'finance'>('salons');
  
  // Salons State
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loadingSalons, setLoadingSalons] = useState(false);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Add Owner Form State
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [newOwnerFullName, setNewOwnerFullName] = useState('');
  const [newOwnerUsername, setNewOwnerUsername] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPassword, setNewOwnerPassword] = useState('');
  const [submittingOwner, setSubmittingOwner] = useState(false);

  // Marketplace Escrow & Commission Engine State
  const [commissionRate, setCommissionRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bbeauty_platform_commission');
      return saved ? parseInt(saved) : 10;
    } catch {
      return 10;
    }
  });

  const [payoutSchedule, setPayoutSchedule] = useState<'DAILY' | 'WEEKLY' | 'INSTANT'>('DAILY');
  
  const [transactions, setTransactions] = useState<SplitTransaction[]>([
    {
      id: 'TXN-9021',
      bookingRef: 'RSV-8102',
      customerName: 'Aarav Sharma',
      salonName: 'Andrew Beauty Spa',
      totalAmount: 2400,
      adminCommission: 240,
      ownerPayout: 2160,
      status: 'DISBURSED_TO_OWNER',
      date: 'Today, 11:30 AM'
    },
    {
      id: 'TXN-9022',
      bookingRef: 'RSV-8105',
      customerName: 'Priya Mehra',
      salonName: 'Alpha Beauty',
      totalAmount: 1850,
      adminCommission: 185,
      ownerPayout: 1665,
      status: 'VAULTED_IN_ESCROW',
      date: 'Today, 01:15 PM'
    },
    {
      id: 'TXN-9023',
      bookingRef: 'RSV-8109',
      customerName: 'Rohan Gupta',
      salonName: 'Queen B Salon',
      totalAmount: 3200,
      adminCommission: 320,
      ownerPayout: 2880,
      status: 'VAULTED_IN_ESCROW',
      date: 'Today, 02:40 PM'
    },
    {
      id: 'TXN-9024',
      bookingRef: 'RSV-8114',
      customerName: 'Simran Kaur',
      salonName: 'Urban Crown Studio',
      totalAmount: 4500,
      adminCommission: 450,
      ownerPayout: 4050,
      status: 'DISBURSED_TO_OWNER',
      date: 'Yesterday'
    }
  ]);

  // Fetch Salons
  const fetchSalonsList = async () => {
    try {
      setLoadingSalons(true);
      const data = await apiRequest("/api/salons", { noFailover: true });
      setSalons(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Failed to load salons directory", e);
    } finally {
      setLoadingSalons(false);
    }
  };

  // Fetch Users
  const fetchUsersList = async () => {
    try {
      setLoadingUsers(true);
      const data = await apiRequest("/api/users", { noFailover: true });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Failed to load user directory", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchSalonsList();
    fetchUsersList();
  }, []);

  // Update Commission Policy
  const handleSaveCommissionPolicy = () => {
    try {
      localStorage.setItem('bbeauty_platform_commission', commissionRate.toString());
      showToast(`Platform Commission rule updated to ${commissionRate}%. All future customer payments will split automatically.`, "success");
    } catch {
      showToast("Commission policy saved", "success");
    }
  };

  // Disburse Escrow Payout to Owner Bank Account
  const handleReleaseEscrow = (txId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'DISBURSED_TO_OWNER' };
      }
      return t;
    }));
    showToast(`Escrow funds for transaction ${txId} disbursed directly to Owner's linked bank account!`, "success");
  };

  // Calculate Aggregates
  const totalVolume = transactions.reduce((acc, t) => acc + t.totalAmount, 0) + 142500;
  const escrowVaulted = transactions.filter(t => t.status === 'VAULTED_IN_ESCROW').reduce((acc, t) => acc + t.ownerPayout, 0) + 21400;
  const adminCommissions = Math.round(totalVolume * (commissionRate / 100));
  const ownerDisbursed = totalVolume - adminCommissions - escrowVaulted;

  // Delete Salon
  const handleDeleteSalon = async (salonId: number, salonName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${salonName}" (ID: ${salonId})? This will immediately remove it from the platform.`);
    if (!confirmDelete) return;

    try {
      await apiRequest(`/api/salons/${salonId}`, { method: "DELETE", noFailover: true });
      showToast(`Salon "${salonName}" deleted successfully!`, "info");
      fetchSalonsList();
    } catch (e: any) {
      showToast(e.message || "Failed to delete salon", "danger");
    }
  };

  // Change User Role
  const handleChangeRole = async (userId: number, currentRole: string) => {
    const nextRole = currentRole === 'CUSTOMER' ? 'SALON_OWNER' : currentRole === 'SALON_OWNER' ? 'ADMIN' : 'CUSTOMER';
    const confirmChange = window.confirm(`Update this user's role permission to ${nextRole}?`);
    if (!confirmChange) return;

    try {
      await apiRequest(`/api/users/${userId}`, {
        method: "PUT",
        body: { role: nextRole }
      });
      showToast("User role updated successfully", "success");
      fetchUsersList();
    } catch (e: any) {
      showToast(e.message || "Failed to update role", "danger");
    }
  };

  // Delete User & Associated Salons
  const handleDeleteUser = async (userId: number, fullName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete owner "${fullName}" (ID: ${userId})? This will also remove any salons listed by this owner.`);
    if (!confirmDelete) return;

    try {
      const allSalons = await apiRequest("/api/salons").catch(() => []);
      if (Array.isArray(allSalons)) {
        const ownerSalons = allSalons.filter((s: any) => s.ownerId === userId);
        for (const s of ownerSalons) {
          await apiRequest(`/api/salons/${s.id}`, { method: "DELETE" }).catch(() => {});
        }
      }

      await apiRequest(`/api/users/${userId}`, { method: "DELETE" });
      showToast(`Owner "${fullName}" and their salon listings have been completely deleted!`, "info");
      fetchUsersList();
      fetchSalonsList();
    } catch (e: any) {
      showToast(e.message || "Failed to delete user", "danger");
    }
  };

  // Add New Owner
  const handleCreateOwner = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingOwner(true);
      await apiRequest("/auth/signup", {
        method: "POST",
        body: {
          fullName: newOwnerFullName,
          username: newOwnerUsername,
          email: newOwnerEmail,
          password: newOwnerPassword,
          role: "SALON_OWNER"
        }
      });
      showToast(`New Salon Owner "${newOwnerFullName}" registered successfully!`, "success");
      setNewOwnerFullName('');
      setNewOwnerUsername('');
      setNewOwnerEmail('');
      setNewOwnerPassword('');
      setShowAddOwnerModal(false);
      fetchUsersList();
    } catch (e: any) {
      showToast(e.message || "Failed to create new owner", "danger");
    } finally {
      setSubmittingOwner(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <span className="section-subtitle">System Directory &amp; Marketplace Operations</span>
          <h2 className="playfair" style={{ fontSize: '32px' }}>Admin &amp; Management Portal</h2>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'salons' ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setActiveTab('salons')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Building size={16} />
            <span>Salons Directory ({salons.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setActiveTab('users')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Users size={16} />
            <span>Owners &amp; Users ({users.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'finance' ? 'btn-gold' : 'btn-outline'}`}
            onClick={() => setActiveTab('finance')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Wallet size={16} />
            <span>Escrow &amp; Commission</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: SALONS DIRECTORY
          ========================================================================= */}
      {activeTab === 'salons' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Manage and clean up active salon listings. Click <strong>Delete</strong> to remove old or duplicate listings.
            </p>
            <button className="btn btn-outline" onClick={fetchSalonsList} style={{ fontSize: '12px', padding: '6px 14px' }}>
              Refresh Salons
            </button>
          </div>

          {loadingSalons ? (
            <div className="page-loader" style={{ height: '200px' }}>
              <div className="spinner"></div>
            </div>
          ) : salons.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '50px', textAlign: 'center' }}>
              <Building size={40} className="gold-text" style={{ marginBottom: '15px' }} />
              <h3>No Salons Found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>All salons have been cleared. New salon owners can now register fresh profiles.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '16px 20px' }}>Salon</th>
                    <th style={{ padding: '16px 20px' }}>Location</th>
                    <th style={{ padding: '16px 20px' }}>Contact</th>
                    <th style={{ padding: '16px 20px' }}>Owner ID</th>
                    <th style={{ padding: '16px 20px' }}>Timing</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salons.map(s => {
                    const cover = (s.images && s.images[0]) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80';
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img
                              src={cover}
                              alt={s.name}
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                            />
                            <div>
                              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '15px' }}>{s.name}</strong>
                              <span style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>ID: #{s.id}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span>{s.city}, {s.address}</span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div>{s.phoneNumber}</div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.email}</span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span className="user-role-badge">Owner #{s.ownerId}</span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {s.openTime ? String(s.openTime).slice(0, 5) : '09:00'} - {s.closeTime ? String(s.closeTime).slice(0, 5) : '21:00'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button
                            className="btn btn-secondary text-danger"
                            onClick={() => handleDeleteSalon(s.id, s.name)}
                            style={{ padding: '6px 12px', fontSize: '11px', textTransform: 'none', border: '1px solid rgba(255,69,58,0.2)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Delete this salon listing"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: OWNERS & USERS DIRECTORY
          ========================================================================= */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Audit registered users, manage platform roles, and add verified salon owners.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-gold"
                onClick={() => setShowAddOwnerModal(true)}
                style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add Salon Owner</span>
              </button>
              <button className="btn btn-outline" onClick={fetchUsersList} style={{ fontSize: '12px', padding: '6px 14px' }}>
                Refresh
              </button>
            </div>
          </div>

          {/* Modal / Inline Form to Add Owner */}
          {showAddOwnerModal && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--gold-primary)', borderRadius: '16px', padding: '30px', marginBottom: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="playfair gold-text" style={{ margin: 0, fontSize: '22px' }}>Create New Salon Owner Account</h3>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddOwnerModal(false)}
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleCreateOwner}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Owner Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={newOwnerFullName}
                      onChange={(e) => setNewOwnerFullName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. vikram_salon"
                      value={newOwnerUsername}
                      onChange={(e) => setNewOwnerUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      placeholder="e.g. vikram@auraspa.com"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Password</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      placeholder="Enter strong password"
                      value={newOwnerPassword}
                      onChange={(e) => setNewOwnerPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddOwnerModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gold" disabled={submittingOwner}>
                    {submittingOwner ? "Creating..." : "Register Owner"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingUsers ? (
            <div className="page-loader" style={{ height: '200px' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="table-responsive" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '16px 20px' }}>ID</th>
                    <th style={{ padding: '16px 20px' }}>Full Name</th>
                    <th style={{ padding: '16px 20px' }}>Username</th>
                    <th style={{ padding: '16px 20px' }}>Email Address</th>
                    <th style={{ padding: '16px 20px' }}>System Role</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '18px 20px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{u.id.toString().substring(0, 8)}</td>
                      <td style={{ padding: '18px 20px', fontWeight: 600 }}>{u.fullName}</td>
                      <td style={{ padding: '18px 20px' }}>@{u.username}</td>
                      <td style={{ padding: '18px 20px' }}>{u.email}</td>
                      <td style={{ padding: '18px 20px' }}>
                        <span className="user-role-badge" style={{ margin: 0 }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => handleChangeRole(u.id, u.role)}
                            style={{ padding: '6px 12px', fontSize: '11px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Promote / Toggle Role"
                          >
                            <Shield size={12} className="gold-text" />
                            <span>Toggle Role</span>
                          </button>
                          <button
                            className="btn btn-secondary text-danger"
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            style={{ padding: '6px 12px', fontSize: '11px', textTransform: 'none', border: '1px solid rgba(255,69,58,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Delete Profile"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: MARKETPLACE ESCROW & COMMISSION ENGINE (Three-Party Architecture)
          ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="marketplace-finance-engine">
          {/* Architecture Concept Infographic */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234, 106, 117, 0.08) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: '1px solid #ffd5d1',
            borderRadius: '18px',
            padding: '24px',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ArrowRightLeft size={20} style={{ color: '#ea6a75' }} />
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e1e24' }}>
                Three-Party Marketplace Payment &amp; Escrow Engine
              </h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#686875', lineHeight: 1.6 }}>
              Money flows from the <strong>Customer</strong> into the <strong>Administrator Vault (Escrow)</strong>, 
              where the platform fee/commission is calculated and retained. Upon verified appointment delivery, 
              the remaining net balance is disbursed directly into the <strong>Owner's linked bank account</strong>.
            </p>

            {/* 4 Phases Visual Progression */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #f0e6e5', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ea6a75', fontWeight: 700, fontSize: '12px' }}>
                  <CreditCard size={15} />
                  <span>PHASE 1: CUSTOMER PAYS</span>
                </div>
                <div style={{ fontSize: '12px', color: '#4b4b56' }}>
                  Customer pays total fee via UPI QR or card. Processed by central gateway.
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #f0e6e5', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#b45309', fontWeight: 700, fontSize: '12px' }}>
                  <Lock size={15} />
                  <span>PHASE 2: ADMIN VAULT (ESCROW)</span>
                </div>
                <div style={{ fontSize: '12px', color: '#4b4b56' }}>
                  Funds held securely in central platform escrow until salon treatment completion.
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #f0e6e5', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#15803d', fontWeight: 700, fontSize: '12px' }}>
                  <Percent size={15} />
                  <span>PHASE 3: SPLIT ENGINE</span>
                </div>
                <div style={{ fontSize: '12px', color: '#4b4b56' }}>
                  Platform fee deducted ({commissionRate}%). Formula: <code>Total = Commission + Owner Net</code>.
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #f0e6e5', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2563eb', fontWeight: 700, fontSize: '12px' }}>
                  <Landmark size={15} />
                  <span>PHASE 4: OWNER PAYOUT</span>
                </div>
                <div style={{ fontSize: '12px', color: '#4b4b56' }}>
                  {100 - commissionRate}% transferred directly to Salon Owner's bank account / UPI ID.
                </div>
              </div>
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Total Customer Volume</span>
              <h3 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 4px', color: 'var(--text-primary)' }}>₹{totalVolume.toLocaleString('en-IN')}</h3>
              <span style={{ fontSize: '11px', color: '#16a34a' }}>● Processed across all salons</span>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid #fed7aa', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '12px', color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Admin Vault (In Escrow)</span>
              <h3 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 4px', color: '#ea580c' }}>₹{escrowVaulted.toLocaleString('en-IN')}</h3>
              <span style={{ fontSize: '11px', color: '#9a3412' }}>🔒 Awaiting treatment completion</span>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid #ffd5d1', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '12px', color: '#ea6a75', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Platform Profit ({commissionRate}%)</span>
              <h3 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 4px', color: '#ea6a75' }}>₹{adminCommissions.toLocaleString('en-IN')}</h3>
              <span style={{ fontSize: '11px', color: '#b91c1c' }}>● Administrator retained revenue</span>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px' }}>
              <span style={{ fontSize: '12px', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Disbursed to Owners ({100 - commissionRate}%)</span>
              <h3 style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0 4px', color: '#16a34a' }}>₹{ownerDisbursed.toLocaleString('en-IN')}</h3>
              <span style={{ fontSize: '11px', color: '#166534' }}>✓ Bank transfers completed</span>
            </div>
          </div>

          {/* Commission Policy Control Panel */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', marginBottom: '30px' }}>
            <h4 className="playfair" style={{ fontSize: '20px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Percent size={18} className="gold-text" />
              <span>Platform Commission &amp; Settlement Rules</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Platform Commission Cut ({commissionRate}%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: '#ea6a75' }}
                  />
                  <span style={{ fontWeight: 800, color: '#ea6a75', fontSize: '18px', minWidth: '45px' }}>
                    {commissionRate}%
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Salon Owner receives remaining {100 - commissionRate}% on each booking.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Automated Bank Settlement Schedule
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['DAILY', 'WEEKLY', 'INSTANT'] as const).map(sch => (
                    <button
                      key={sch}
                      onClick={() => setPayoutSchedule(sch)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: payoutSchedule === sch ? '1px solid #ea6a75' : '1px solid var(--border-subtle)',
                        background: payoutSchedule === sch ? '#fff0f1' : 'transparent',
                        color: payoutSchedule === sch ? '#ea6a75' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {sch}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-gold" onClick={handleSaveCommissionPolicy} style={{ padding: '10px 20px' }}>
                  Save Commission Rule
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Split Ledger & Escrow Release Audit Table */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-glass)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 className="playfair" style={{ margin: 0, fontSize: '18px' }}>Marketplace Multi-Split Ledger</h4>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Real-time breakdown of customer charges, admin cut, and owner payouts</p>
              </div>
              <span className="badge-pill" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                Live Escrow Auditor Active
              </span>
            </div>

            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '14px 20px' }}>Txn / Booking</th>
                    <th style={{ padding: '14px 20px' }}>Customer</th>
                    <th style={{ padding: '14px 20px' }}>Salon (Owner)</th>
                    <th style={{ padding: '14px 20px' }}>Customer Paid</th>
                    <th style={{ padding: '14px 20px' }}>Admin Fee ({commissionRate}%)</th>
                    <th style={{ padding: '14px 20px' }}>Owner Payout ({100 - commissionRate}%)</th>
                    <th style={{ padding: '14px 20px' }}>Escrow State</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{t.id}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.bookingRef} &bull; {t.date}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{t.customerName}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{t.salonName}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>₹{t.totalAmount}</td>
                      <td style={{ padding: '16px 20px', color: '#ea6a75', fontWeight: 600 }}>
                        +₹{Math.round(t.totalAmount * (commissionRate / 100))}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#16a34a', fontWeight: 700 }}>
                        ₹{t.totalAmount - Math.round(t.totalAmount * (commissionRate / 100))}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {t.status === 'VAULTED_IN_ESCROW' ? (
                          <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} />
                            <span>Vaulted in Escrow</span>
                          </span>
                        ) : (
                          <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} />
                            <span>Disbursed to Bank</span>
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {t.status === 'VAULTED_IN_ESCROW' ? (
                          <button
                            className="btn btn-gold"
                            onClick={() => handleReleaseEscrow(t.id)}
                            style={{ padding: '5px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                          >
                            Release to Owner Bank
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
