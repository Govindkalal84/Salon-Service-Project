import { useState, useEffect, type FC } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../services/mockApi';
import { Shield, Trash2 } from 'lucide-react';

export const AdminDashboard: FC = () => {
  const { showToast } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load user directory", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

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

  const handleDeleteUser = async (userId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user profile? This cannot be undone.");
    if (!confirmDelete) return;

    try {
      await apiRequest(`/api/users/${userId}`, { method: "DELETE" });
      showToast("User deleted from database directory", "info");
      fetchUsersList();
    } catch (e: any) {
      showToast(e.message || "Failed to delete user", "danger");
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Curating your experience...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <span className="section-subtitle">System Directory</span>
        <h2 className="playfair" style={{ fontSize: '32px' }}>Admin Portal</h2>
      </div>

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
                      onClick={() => handleDeleteUser(u.id)}
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
    </div>
  );
};
