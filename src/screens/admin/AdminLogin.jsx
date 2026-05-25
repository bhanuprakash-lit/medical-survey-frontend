import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ENDPOINTS, ADMIN_AUTH_STORAGE_KEY } from '../../config/api';
import '../Screens.css';

const AdminLogin = ({ onLogin, onBack }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(ENDPOINTS.LOGIN_ADMIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid admin credentials');
      }

      const data = await response.json();
      window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify({
        token: data.token,
        loggedInAt: new Date().toISOString()
      }));
      
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-container">
      <div className="top-info-section animate-fade-in">
        <div className="top-info-chip">Restricted Access</div>
        <h2 className="top-info-header">Admin Portal Authentication</h2>
        <p className="top-info-surveyor">Please enter your administrative credentials to access the submissions dashboard.</p>
      </div>

      <div className="centered-content-wrapper animate-fade-in">
        <div className="screen-card animate-premium-in">
          <div className="screen-header">
            <h1 className="screen-title">Admin Login</h1>
            <p className="screen-subtitle">
              Secure login for reviewing survey data and analytics.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="form-container">
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter admin username"
              error={error && !formData.username ? 'Required' : ''}
            />

            <Input
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              type="password"
              error={error && !formData.password ? 'Required' : ''}
            />

            {error ? <div className="error-banner">{error}</div> : null}

            <div className="action-area">
              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                Access Dashboard
              </Button>

              <button
                type="button"
                onClick={onBack}
                className="secondary-action"
              >
                Back to Surveyor App
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
