import { useState, useEffect, type FC, type FormEvent } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User, Salon } from '../services/mockApi';
import { Shield, Trash2, Building, Users, Plus, Scissors, MapPin, Phone, Mail, Image as ImageIcon } from 'lucide-react';

export const AdminDashboard: FC = () => {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'salons' | 'users'>('salons');
  
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

  // Delete Salon
  const handleDeleteSalon = async (salonId: number, salonName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${salonName}" (ID: ${salonId})? This will immediately remove it from the platform.`);
    if (!confirmDelete) return;

    try {
      await apiRequest(`/api/salons/${salonId}`, { method: "DELETE" });
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

  // Delete User
  const handleDeleteUser = async (userId: number, fullName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete user "${fullName}"? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await apiRequest(`/api/users/${userId}`, { method: "DELETE" });
      showToast(`User "${fullName}" deleted from directory`, "info");
      fetchUsersList();
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
          <span className="section-subtitle">System Directory & Operations</span>
          <h2 className="playfair" style={{ fontSize: '32px' }}>Admin & Management Portal</h2>
        </div>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px' }}>
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
            <span>Owners & Users ({users.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SALONS DIRECTORY */}
      {activeTab === 'salons' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Manage and clean up active salon listings. Click <strong>Delete</strong> to remove old, test, or duplicate salons.
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
              <p style={{ color: 'var(--text-secondary)' }}>All old salons have been removed. New salon owners can now register fresh profiles.</p>
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
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>{s.name}</div>
                              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{s.id}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                            <MapPin size={14} className="gold-text" />
                            <span>{s.city}, {s.address}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {s.phoneNumber && <div>{s.phoneNumber}</div>}
                            {s.email && <div style={{ color: 'var(--text-muted)' }}>{s.email}</div>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: 'var(--gold-primary)' }}>
                          #{s.ownerId}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {s.openTime || '09:00'} - {s.closeTime || '20:00'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button
                            className="btn btn-secondary text-danger"
                            onClick={() => handleDeleteSalon(s.id, s.name)}
                            style={{ padding: '6px 14px', fontSize: '12px', textTransform: 'none', border: '1px solid rgba(255,69,58,0.25)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            title="Delete this salon listing"
                          >
                            <Trash2 size={13} />
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

      {/* TAB 2: OWNERS & USERS */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Manage registered platform accounts. Create new salon owners or delete old profiles.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-gold"
                onClick={() => setShowAddOwnerModal(true)}
                style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Add New Salon Owner</span>
              </button>
              <button className="btn btn-outline" onClick={fetchUsersList} style={{ fontSize: '12px', padding: '6px 14px' }}>
                Refresh Users
              </button>
            </div>
          </div>

          {/* Add Owner Modal / Drawer Form */}
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
    </div>
  );
};
