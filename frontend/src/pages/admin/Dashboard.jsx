import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import io from 'socket.io-client';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [socket, setSocket] = useState(null);
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/admin/stats', config);
        setStats(data);
        const { data: clients } = await axios.get('http://localhost:5000/api/admin/clients', config);
        setRecentClients(clients.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();

    const newSocket = io('http://localhost:5000');
    newSocket.emit('join_room', user._id);
    newSocket.on('new_document', (doc) => {
      alert(`New document uploaded: ${doc.title}`);
    });
    newSocket.on('payment_made', (invoice) => {
      alert(`Client paid invoice of amount $${invoice.amount}`);
      fetchStats();
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [user]);

  if (!stats) return <div style={{padding:'2rem'}}>Loading...</div>;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <span>Welcome, <strong>{user.name}</strong></span>
          </div>
        </div>

        <div className="page-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Clients</h3>
              <p>{stats.clientCount}</p>
            </div>
            <div className="stat-card">
              <h3>Documents</h3>
              <p>{stats.docCount}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue (Paid)</h3>
              <p>${stats.totalRevenue}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Revenue</h3>
              <p style={{color: 'var(--danger)'}}>${stats.pendingRevenue}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="table-container">
              <div className="table-header">
                <h2>Revenue Overview</h2>
              </div>
              <div style={{ padding: '1.5rem', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="table-container">
              <div className="table-header">
                <h2>Recent Clients</h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClients.map(c => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                    </tr>
                  ))}
                  {recentClients.length === 0 && <tr><td colSpan="2">No clients yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
