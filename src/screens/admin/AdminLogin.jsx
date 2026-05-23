import { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
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

    // For now, using a simple hardcoded check. 
    // This can be replaced with a real API call to /api/admin/login if available.
    setTimeout(() => {
      if (formData.username === 'admin' && formData.password === 'admin123') {
        onLogin();
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
      setLoading(false);
    }, 800);
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
