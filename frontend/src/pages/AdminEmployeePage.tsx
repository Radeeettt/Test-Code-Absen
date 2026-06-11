import { useState } from 'react';
import { employeeApi, User } from '../api/api';
import Modal from '../components/Modal';

interface Props {
  employees: User[];
  onRefresh: () => void;
}

interface FormData {
  username: string;
  password: string;
  fullName: string;
  role: 'employee' | 'admin';
}

const emptyForm: FormData = {
  username: '',
  password: '',
  fullName: '',
  role: 'employee',
};

export default function EmployeePage({ employees, onRefresh }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const openCreate = () => {
    setEditTarget(null);
    setFormData(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (emp: User) => {
    setEditTarget(emp);
    setFormData({
      username: emp.username,
      password: '',
      fullName: emp.fullName,
      role: emp.role,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editTarget) {
        const payload: any = {
          fullName: formData.fullName,
          username: formData.username,
          role: formData.role,
        };
        if (formData.password) payload.password = formData.password;
        await employeeApi.update(editTarget.id, payload);
        setSuccess(`Data ${formData.fullName} berhasil diperbarui`);
      } else {
        if (!formData.password) {
          setError('Password wajib diisi saat membuat karyawan baru');
          setLoading(false);
          return;
        }
        await employeeApi.create(formData);
        setSuccess(`Karyawan ${formData.fullName} berhasil ditambahkan`);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emp: User) => {
    if (!confirm(`Hapus karyawan "${emp.fullName}"? Semua data absensinya juga akan dihapus.`)) return;
    setDeleteLoading(emp.id);
    setError('');
    try {
      await employeeApi.delete(emp.id);
      setSuccess(`Karyawan ${emp.fullName} berhasil dihapus`);
      onRefresh();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus karyawan');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Karyawan</h1>
          <p className="page-subtitle">{employees.length} karyawan terdaftar</p>
        </div>
        <button id="add-employee-btn" className="btn btn-primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="17" height="17">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Karyawan
        </button>
      </div>

      {error && !modalOpen && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Employee Cards Grid */}
      {employees.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>Belum ada karyawan. Klik "Tambah Karyawan" untuk memulai.</p>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="corp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Lengkap</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Terdaftar</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={emp.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: emp.role === 'admin' ? '#dbeafe' : '#dcfce7', color: emp.role === 'admin' ? '#1d4ed8' : '#166534' }}>
                          {emp.fullName?.[0] || '?'}
                        </div>
                        <strong>{emp.fullName}</strong>
                      </div>
                    </td>
                    <td><code className="username-code">@{emp.username}</code></td>
                    <td>
                      <span className={`badge ${emp.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                        {emp.role === 'admin' ? '👑 Admin' : '👤 Karyawan'}
                      </span>
                    </td>
                    <td className="text-muted">
                      {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td>
                      <div className="action-row">
                        <button
                          className="btn-icon btn-icon-primary"
                          onClick={() => openEdit(emp)}
                          title="Edit karyawan"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => handleDelete(emp)}
                          disabled={deleteLoading === emp.id}
                          title="Hapus karyawan"
                        >
                          {deleteLoading === emp.id ? <span className="spinner-sm" /> : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" /><path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        title={editTarget ? `✏️ Edit Karyawan — ${editTarget.fullName}` : '➕ Tambah Karyawan Baru'}
        onClose={() => { setModalOpen(false); setError(''); }}
        size="sm"
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="input-group">
            <label className="input-label">Nama Lengkap *</label>
            <input
              className="input-field"
              name="fullName"
              placeholder="Contoh: Budi Santoso"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Username *</label>
            <input
              className="input-field"
              name="username"
              placeholder="Contoh: budi.santoso"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Password {editTarget ? '(Kosongkan jika tidak ingin mengubah)' : '*'}
            </label>
            <input
              className="input-field"
              name="password"
              type="password"
              placeholder={editTarget ? 'Kosongkan = tidak berubah' : 'Min. 6 karakter'}
              value={formData.password}
              onChange={handleChange}
              required={!editTarget}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Role *</label>
            <select
              className="input-field"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="employee">Karyawan</option>
              <option value="admin">Admin HRD</option>
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setModalOpen(false); setError(''); }}
              disabled={loading}
            >
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Menyimpan...</> : (
                editTarget ? '💾 Simpan Perubahan' : '✅ Tambah Karyawan'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
