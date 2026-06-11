import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { attendanceApi, AttendanceRecord } from '../api/api';
import Navbar from '../components/Navbar';
import WebcamCapture from '../components/WebcamCapture';
import PhotoViewer from '../components/PhotoViewer';
import Modal from '../components/Modal';

type ClockAction = 'clock-in' | 'clock-out';

function formatTime(time?: string) {
  if (!time) return '—';
  return time.slice(0, 5);
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function DashboardEmployee() {
  const { user } = useAuth();
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [clockAction, setClockAction] = useState<ClockAction>('clock-in');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [todayData, histData] = await Promise.all([
        attendanceApi.getToday(),
        attendanceApi.getHistory(),
      ]);
      setToday(todayData);
      setHistory(histData);
    } catch {
      setError('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openModal = (action: ClockAction) => {
    setClockAction(action);
    setPhotoFile(null);
    setError('');
    setSuccess('');
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!photoFile) {
      setError('Foto bukti wajib dilampirkan');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      if (clockAction === 'clock-in') {
        await attendanceApi.clockIn(formData);
        setSuccess('Clock In berhasil! Selamat bekerja.');
      } else {
        await attendanceApi.clockOut(formData);
        setSuccess('Clock Out berhasil! Terima kasih atas kerja keras Anda.');
      }
      setModalOpen(false);
      setPhotoFile(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setActionLoading(false);
    }
  };

  const canClockIn = !today;
  const canClockOut = today && !today.clockOutTime;

  const now = new Date();
  const todayStr = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="layout-wrapper">
      <Navbar />

      <main className="employee-main">
        <div className="page-header animate-slide-in">
          <div>
            <h1 className="page-title">
              Halo, {user?.fullName?.split(' ')[0]} 👋
            </h1>
            <p className="page-subtitle">{todayStr} — {timeStr} WIB</p>
          </div>
        </div>

        {success && (
          <div className="alert alert-success animate-slide-in">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {success}
          </div>
        )}
        {error && !modalOpen && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex-center" style={{ minHeight: 200 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="glass-card animate-slide-in" style={{ marginBottom: 24 }}>
              <div className="status-card-header">
                <h2 className="section-title">Status Absensi Hari Ini</h2>
                <span className={`badge ${today?.clockOutTime ? 'badge-success' : today ? 'badge-warning' : 'badge-error'}`}>
                  {today?.clockOutTime ? '✅ Selesai' : today ? '🟡 Sedang Bekerja' : '❌ Belum Absen'}
                </span>
              </div>

              <div className="status-grid">
                <div className={`status-time-card ${today ? 'has-data' : ''}`}>
                  <div className="status-time-icon clock-in-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="status-time-info">
                    <span className="status-time-label">Clock In</span>
                    <span className="status-time-value">
                      {today ? formatTime(today.clockInTime) : '—'}
                    </span>
                  </div>
                  {today && <PhotoViewer src={today.clockInPhoto} label="Foto" />}
                </div>

                <div className={`status-time-card ${today?.clockOutTime ? 'has-data' : ''}`}>
                  <div className="status-time-icon clock-out-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </div>
                  <div className="status-time-info">
                    <span className="status-time-label">Clock Out</span>
                    <span className="status-time-value">
                      {today?.clockOutTime ? formatTime(today.clockOutTime) : '—'}
                    </span>
                  </div>
                  {today?.clockOutPhoto && <PhotoViewer src={today.clockOutPhoto} label="Foto" />}
                </div>
              </div>

              <div className="action-buttons">
                <button
                  id="clock-in-btn"
                  className="btn btn-success btn-lg"
                  onClick={() => openModal('clock-in')}
                  disabled={!canClockIn}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {today ? 'Sudah Clock In' : 'Clock In Sekarang'}
                </button>

                <button
                  id="clock-out-btn"
                  className="btn btn-primary btn-lg"
                  onClick={() => openModal('clock-out')}
                  disabled={!canClockOut}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {today?.clockOutTime ? 'Sudah Clock Out' : 'Clock Out Sekarang'}
                </button>
              </div>
            </div>

            <div className="glass-card animate-slide-in">
              <h2 className="section-title" style={{ marginBottom: 20 }}>
                📋 Riwayat Absensi
              </h2>
              {history.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p>Belum ada riwayat absensi</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="corp-table">
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Clock In</th>
                        <th>Foto In</th>
                        <th>Clock Out</th>
                        <th>Foto Out</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((rec) => (
                        <tr key={rec.id}>
                          <td><strong>{formatDate(rec.date)}</strong></td>
                          <td>{formatTime(rec.clockInTime)}</td>
                          <td><PhotoViewer src={rec.clockInPhoto} /></td>
                          <td>{formatTime(rec.clockOutTime)}</td>
                          <td><PhotoViewer src={rec.clockOutPhoto} /></td>
                          <td>
                            <span className={`badge ${rec.clockOutTime ? 'badge-success' : 'badge-warning'}`}>
                              {rec.clockOutTime ? 'Selesai' : 'Aktif'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Modal
        isOpen={modalOpen}
        title={clockAction === 'clock-in' ? '📷 Clock In — Ambil Foto Bukti' : '📷 Clock Out — Ambil Foto Bukti'}
        onClose={() => { setModalOpen(false); setError(''); setPhotoFile(null); }}
        size="md"
      >
        <p className="modal-desc">
          {clockAction === 'clock-in'
            ? 'Ambil foto selfie sebagai bukti Anda sudah siap bekerja dari rumah.'
            : 'Ambil foto selfie sebagai bukti Anda sudah selesai bekerja hari ini.'}
        </p>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <WebcamCapture
          onCapture={(f) => { setPhotoFile(f); setError(''); }}
          onClear={() => setPhotoFile(null)}
          capturedFile={photoFile}
        />

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={() => { setModalOpen(false); setError(''); setPhotoFile(null); }}
            disabled={actionLoading}
          >
            Batal
          </button>
          <button
            id="submit-clock-btn"
            className={`btn ${clockAction === 'clock-in' ? 'btn-success' : 'btn-primary'}`}
            onClick={handleSubmit}
            disabled={!photoFile || actionLoading}
          >
            {actionLoading ? (
              <><span className="spinner-sm" /> Menyimpan...</>
            ) : (
              clockAction === 'clock-in' ? '✅ Konfirmasi Clock In' : '✅ Konfirmasi Clock Out'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
