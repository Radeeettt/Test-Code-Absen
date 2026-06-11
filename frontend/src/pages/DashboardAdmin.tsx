import { useState, useEffect, useCallback } from 'react';
import { attendanceApi, employeeApi, AttendanceWithUser, User } from '../api/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardAdmin() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceWithUser[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [att, emp] = await Promise.all([
        attendanceApi.getAllAttendances(),
        employeeApi.getAll(),
      ]);
      setAttendances(att);
      setEmployees(emp);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendances = attendances.filter((a) => a.date === todayStr);
  const totalEmployees = employees.filter((e) => e.role === 'employee').length;
  const presentToday = todayAttendances.length;
  const absentToday = Math.max(0, totalEmployees - presentToday);
  const completedToday = todayAttendances.filter((a) => a.clockOutTime).length;

  const stats = [
    {
      label: 'Total Karyawan',
      value: totalEmployees,
      icon: '👥',
      color: '#1d4ed8',
      bg: '#eff6ff',
    },
    {
      label: 'Hadir Hari Ini',
      value: presentToday,
      icon: '✅',
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      label: 'Belum Absen',
      value: absentToday,
      icon: '⏳',
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      label: 'Sudah Clock Out',
      value: completedToday,
      icon: '🏁',
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
  ];

  const recent = [...attendances].slice(0, 5);

  return (
    <div className="admin-layout">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="admin-body">
        <Sidebar activePage={activePage} onNavigate={(p) => { setActivePage(p); setSidebarOpen(false); }} isOpen={sidebarOpen} />
        <main className="admin-content">
          {activePage === 'dashboard' && (
            <DashboardOverview stats={stats} recent={recent} loading={loading} />
          )}
          {activePage === 'attendance' && (
            <AttendancePage attendances={attendances} onRefresh={loadData} />
          )}
          {activePage === 'employees' && (
            <EmployeePage employees={employees} onRefresh={loadData} />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardOverview({
  stats, recent, loading
}: {
  stats: any[];
  recent: AttendanceWithUser[];
  loading: boolean;
}) {
  const todayStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="animate-slide-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Admin HRD</h1>
          <p className="page-subtitle">{todayStr}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: 200 }}><div className="spinner" /></div>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                </div>
                <div className="stat-info">
                  <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ marginTop: 24 }}>
            <h2 className="section-title" style={{ marginBottom: 20 }}>
              📋 Absensi Terbaru
            </h2>
            {recent.length === 0 ? (
              <div className="empty-state">
                <p>Belum ada data absensi</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="corp-table">
                  <thead>
                    <tr>
                      <th>Karyawan</th>
                      <th>Tanggal</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm">{r.fullName?.[0] || '?'}</div>
                            <div>
                              <div className="user-cell-name">{r.fullName}</div>
                              <div className="user-cell-username">@{r.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>{r.date}</td>
                        <td>{r.clockInTime?.slice(0, 5) || '—'}</td>
                        <td>{r.clockOutTime?.slice(0, 5) || '—'}</td>
                        <td>
                          <span className={`badge ${r.clockOutTime ? 'badge-success' : 'badge-warning'}`}>
                            {r.clockOutTime ? 'Selesai' : 'Aktif'}
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
    </div>
  );
}

import AttendancePage from './AdminAttendancePage';

import EmployeePage from './AdminEmployeePage';
