import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [socket, setSocket] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: docs } = await axios.get('http://localhost:5000/api/client/documents', config);
      const { data: invs } = await axios.get('http://localhost:5000/api/client/invoices', config);
      setDocuments(docs);
      setInvoices(invs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    const newSocket = io('http://localhost:5000');
    newSocket.emit('join_room', user._id);
    newSocket.on('new_document', (doc) => {
      alert(`New document from CA: ${doc.title}`);
      fetchData();
    });
    newSocket.on('new_invoice', (inv) => {
      alert(`New invoice received for: $${inv.amount}`);
      fetchData();
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [user]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('file', uploadFile);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
      await axios.post('http://localhost:5000/api/client/documents/upload', formData, config);
      setUploadTitle('');
      setUploadFile(null);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePay = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/client/invoices/${id}/pay`, {}, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1>Client Dashboard</h1>
          <div className="header-actions">
            <span>Welcome, <strong>{user.name}</strong></span>
          </div>
        </div>

        <div className="page-content">
          <Routes>
            {/* Main / Default View: Show Everything together like original MVP */}
            <Route path="/" element={
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}>
                <div className="table-container" style={{ padding: '1.5rem', height: 'fit-content' }}>
                  <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Quick Upload</h2>
                  <form onSubmit={handleUpload}>
                    <div className="form-group">
                      <label>Document Title</label>
                      <input type="text" className="form-input" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Select File</label>
                      <input type="file" className="form-input" onChange={e => setUploadFile(e.target.files[0])} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Upload Securely</button>
                  </form>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="table-container">
                    <div className="table-header"><h2>Recent Invoices</h2></div>
                    <table>
                      <thead><tr><th>Desc</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {invoices.slice(0, 3).map(i => (
                          <tr key={i._id}><td>{i.description}</td><td>${i.amount}</td><td><span className={`badge ${i.status}`}>{i.status.toUpperCase()}</span></td></tr>
                        ))}
                        {invoices.length === 0 && <tr><td colSpan="3">No invoices yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            } />

            {/* Documents View */}
            <Route path="/documents" element={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="table-container" style={{ padding: '1.5rem' }}>
                  <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Upload New Document</h2>
                  <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Document Title</label>
                      <input type="text" className="form-input" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Select File</label>
                      <input type="file" className="form-input" onChange={e => setUploadFile(e.target.files[0])} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Upload Securely</button>
                  </form>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <h2>My Documents</h2>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Date Uploaded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(d => (
                        <tr key={d._id}>
                          <td><a href={`http://localhost:5000/${d.filePath}`} target="_blank" rel="noreferrer" style={{color: 'var(--primary)', textDecoration: 'none'}}>{d.title}</a></td>
                          <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {documents.length === 0 && <tr><td colSpan="2">No documents yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            } />

            {/* Invoices View */}
            <Route path="/invoices" element={
              <div className="table-container">
                <div className="table-header">
                  <h2>All Invoices</h2>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(i => (
                      <tr key={i._id}>
                        <td>{i.description}</td>
                        <td>${i.amount}</td>
                        <td>{new Date(i.dueDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${i.status}`}>{i.status.toUpperCase()}</span>
                        </td>
                        <td>
                          {i.status === 'unpaid' && (
                            <button onClick={() => handlePay(i._id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Pay Now</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && <tr><td colSpan="5">No invoices yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
