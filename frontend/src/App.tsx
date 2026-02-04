import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QueryLibrary from './pages/QueryLibrary';
import QueryEditor from './pages/QueryEditor';
import QueryTemplates from './pages/QueryTemplates';
import Schedules from './pages/Schedules';
import Connections from './pages/Connections';
import ExecutionHistory from './pages/ExecutionHistory';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import Invitations from './pages/Invitations';
import GettingStarted from './pages/GettingStarted';
import QuerySchedulingGuide from './pages/QuerySchedulingGuide';
import APIIntegrationGuide from './pages/APIIntegrationGuide';
import TeamCollaborationGuide from './pages/TeamCollaborationGuide';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      
      {/* Public guide pages */}
      <Route path="/getting-started" element={<GettingStarted />} />
      <Route path="/query-scheduling-guide" element={<QuerySchedulingGuide />} />
      <Route path="/api-integration-guide" element={<APIIntegrationGuide />} />
      <Route path="/team-collaboration-guide" element={<TeamCollaborationGuide />} />
      
      {/* Protected app routes */}
      <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/queries" element={<QueryLibrary />} />
        <Route path="/queries/new" element={<QueryEditor />} />
        <Route path="/queries/:id" element={<QueryEditor />} />
        <Route path="/templates" element={<QueryTemplates />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/connections" element={<Connections />} />
        <Route path="/history" element={<ExecutionHistory />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetails />} />
        <Route path="/invitations" element={<Invitations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
      
      {/* Catch-all route for undefined paths */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;
// CI/CD test
