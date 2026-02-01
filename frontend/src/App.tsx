import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QueryLibrary from './pages/QueryLibrary';
import QueryEditor from './pages/QueryEditor';
import Schedules from './pages/Schedules';
import Connections from './pages/Connections';
import ExecutionHistory from './pages/ExecutionHistory';
import AdminUsers from './pages/AdminUsers';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/queries" element={<QueryLibrary />} />
        <Route path="/queries/new" element={<QueryEditor />} />
        <Route path="/queries/:id" element={<QueryEditor />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/history" element={<ExecutionHistory />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
      
      {/* Catch-all route for undefined paths */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
