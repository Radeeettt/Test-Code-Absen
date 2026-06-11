import { useState, useMemo } from 'react';
import { attendanceApi, AttendanceWithUser } from '../api/api';
import PhotoViewer from '../components/PhotoViewer';

interface Props {
  attendances: AttendanceWithUser[];
  onRefresh: () => void;
}

export default function AttendancePage({ attendances, onRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filtered = useMemo(() => {
    return attendances.filter((a) => {
      const matchSearch =
        !search ||
        a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        a.username?.toLowerCase().includes(search.toLowerCase());
      const matchDate = !filterDate || a.date === filterDate;
      return matchSearch && matchDate;
    });
  }, [attendances, search, filterDate]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus record absensi ini?')) return;
    setDeleteLoading(id);
    setError('');
    try {
      await attendanceApi.deleteAttendance(id);
      setSuccess('Record berhasil dihapus');
      onRefresh();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('HAPUS SEMUA data absensi? Tindakan ini tidak dapat dibatalkan!')) return;
    setDeleteAllLoading(true);
    setError('');
    try {
      await attendanceApi.deleteAllAttendances();
      setSuccess('Semua data absensi berhasil dihapus');
      onRefresh();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus semua data');
    } finally {
      setDeleteAllLoading(false);
    }
  };

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monitoring Absensi</h1>
          <p className="page-subtitle">{attendances.length} total record absensi</p>
        </div>
        <button
          id="delete-all-btn"
          className="btn btn-danger"
          onClick={handleDeleteAll}
          disabled={deleteAllLoading || attendances.length === 0}
        >
          {deleteAllLoading ? <><span className="spinner-sm" /> Menghapus...</> : (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg> Hapus Semua</>
          )}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filter-bar glass-card">
        <div className="filter-group">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" className="filter-icon">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input-field filter-input"
            type="text"
            placeholder="Cari nama atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" className="filter-icon">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <input
            className="input-field filter-input"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button className="btn-clear" onClick={() => setFilterDate('')} title="Reset filter">✕</button>
          )}
        </div>
        <span className="filter-count">{filtered.length} data</span>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 48 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p>Tidak ada data absensi {search || filterDate ? 'yang sesuai filter' : ''}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="corp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Karyawan</th>
                  <th>Tanggal</th>
                  <th>Clock In</th>
                  <th>Foto In</th>
                  <th>Clock Out</th>
                  <th>Foto Out</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">{r.fullName?.[0] || '?'}</div>
                        <div>
                          <div className="user-cell-name">{r.fullName}</div>
                          <div className="user-cell-username">@{r.username}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{r.date}</strong></td>
                    <td>{r.clockInTime?.slice(0, 5) || '—'}</td>
                    <td><PhotoViewer src={r.clockInPhoto} /></td>
                    <td>{r.clockOutTime?.slice(0, 5) || '—'}</td>
                    <td><PhotoViewer src={r.clockOutPhoto} /></td>
                    <td>
                      <span className={`badge ${r.clockOutTime ? 'badge-success' : 'badge-warning'}`}>
                        {r.clockOutTime ? 'Selesai' : 'Aktif'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(r.id)}
                        disabled={deleteLoading === r.id}
                        title="Hapus record"
                      >
                        {deleteLoading === r.id ? <span className="spinner-sm" /> : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
