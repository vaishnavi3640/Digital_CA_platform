import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role, inviteCode);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign:'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="client">Client</option>
              <option value="admin">Admin (CA)</option>
            </select>
          </div>
          {role === 'client' && (
            <div className="form-group">
              <label>Invite Code (CA's ID)</label>
              <input type="text" className="form-input" value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem', justifyContent: 'center'}}>
            Register
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{color: 'var(--primary)', textDecoration: 'none'}}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
