import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const AuthPanel = () => {
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isRegistering) {
      try {
        await authService.register(formData.username, formData.email, formData.password);
        setSuccessMsg('Registration successful! You can now log in.');
        setIsRegistering(false);
        setFormData({ username: formData.email, email: '', password: '' }); // Pre-fill login field
      } catch (err) {
        setError(err.response?.data?.detail || 'Registration failed. Try again.');
      }
    } else {
      // Log in using username field (which FastAPI routes to email/username string)
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setError(result.message);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{isRegistering ? 'Create Account' : 'Study Planner Login'}</h2>
        
        {error && <div style={styles.errorAlert}>{error}</div>}
        {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegistering && (
            <div style={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          
          <div style={styles.inputGroup}>
            <label>{isRegistering ? 'Email Address' : 'Email or Username'}</label>
            <input
              type={isRegistering ? 'email' : 'text'}
              name={isRegistering ? 'email' : 'username'}
              value={isRegistering ? formData.email : formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" style={styles.submitBtn}>
            {isRegistering ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isRegistering ? 'Already have an account?' : 'Need an account?'} {' '}
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={styles.toggleLink}
          >
            {isRegistering ? 'Login here' : 'Register here'}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f7fb' },
  card: { padding: '2.5rem', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  form: { marginTop: '1.5rem', textAlign: 'left' },
  inputGroup: { marginBottom: '1.25rem', display: 'flex', flexDirection: 'column' },
  errorAlert: { backgroundColor: '#ffebe9', color: '#ff3b30', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' },
  successAlert: { backgroundColor: '#e6f4ea', color: '#34a853', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' },
  submitBtn: { width: '100%', padding: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#4f46e5', color: '#fff', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' },
  toggleText: { marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' },
  toggleLink: { color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }
};

export default AuthPanel;
