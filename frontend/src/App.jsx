import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import ClientDashboard from './pages/client/Dashboard';

const PrivateRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Role based redirection */}
        <Route path="/" element={
          user ? (
            user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/client" />
          ) : <Navigate to="/login" />
        } />

        <Route path="/admin/*" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/client/*" element={
          <PrivateRoute role="client">
            <ClientDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
