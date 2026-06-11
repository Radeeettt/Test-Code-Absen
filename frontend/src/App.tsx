import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardEmployee from './pages/DashboardEmployee';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', background: '#f0f4f8' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'admin') {
    return <DashboardAdmin />;
  }

  return <DashboardEmployee />;
}

export default App;
