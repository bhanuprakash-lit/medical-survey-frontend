import { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { AUTH_STORAGE_KEY, ENDPOINTS } from '../config/api';
import './Screens.css'; // Using the unified stylesheet

/**
 * SurveyTaker Screen
 * Authenticates surveyors by phone and password.
 * First-time users can set their password with the optional name field.
 */
const SurveyTaker = ({ onComplete }) => {
  // --- State: Form Data ---
  const [formData, setFormData] = useState({
    surveyName: '',
    phoneNumber: '',
    password: '',
  });

  // --- State: Status & Validation ---
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  // Updates form state and clears errors/messages on user input
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Only allow numbers and limit to 10 digits
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatusMessage('');
  };

  // Main logic for the "Continue" button
  const handleContinue = async () => {
    // 1. Client-side Validation
    const nextErrors = {
      phoneNumber: formData.phoneNumber.length === 10 ? '' : '10-digit phone number is required.',
      password: formData.password.length >= 6 ? '' : 'Password must be at least 6 characters.',
    };

    if (nextErrors.phoneNumber || nextErrors.password) {
      setErrors(nextErrors);
      setStatusMessage('Please provide valid details to continue.');
      return;
    }

    setErrors({});
    setStatusMessage('');
    setLoading(true);

    try {
      const response = await fetch(ENDPOINTS.LOGIN_SURVEYOR, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.surveyName.trim() || null,
          mobile_number: formData.phoneNumber,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const surveyor = data.surveyor || {};
        const surveyorId = surveyor.id || surveyor.surveyor_id;
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
        if (onComplete) onComplete(surveyorId, surveyor.name, data.token);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        setStatusMessage(errorData.detail || 'We could not sign you in. Check your phone number and password.');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setStatusMessage('Network issue detected. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-container">
      {/* Visual Header Section */}
      <div className="top-info-section animate-fade-in">
        <div className="top-info-chip">Outlet Survey</div>
        <h2 className="top-info-header">Sign in</h2>
        <p className="top-info-surveyor">Use your mobile number and password.</p>
      </div>

      {/* Main Card Container */}
      <div className="centered-content-wrapper animate-fade-in">
        <div className="screen-card animate-premium-in">
          {/* Progress Metadata */}
          <div className="screen-meta-row">
            <div className="step-pill">Secure access</div>
            <div className="status-pill">
              <span className="status-dot" />
              Ready
            </div>
          </div>

          {/* Form Header */}
          <div className="screen-header">
            <h1 className="screen-title">Surveyor Sign In</h1>
            <p className="screen-subtitle">
              First time here? Add your name and choose a password. After that, phone and password are enough.
            </p>
          </div>

          {/* Input Fields Container */}
          <div className="form-container">
            <Input
              label="Surveyor Name"
              name="surveyName"
              value={formData.surveyName}
              onChange={handleChange}
              placeholder="Enter your name"
              error={errors.surveyName}
              hint="First login"
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              type="tel"
              error={errors.phoneNumber}
              hint="10 Digits Required"
            />

            <Input
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              type="password"
              error={errors.password}
              hint="Required"
            />

            {/* Global Status/Error Messages */}
            {statusMessage ? <div className="error-banner">{statusMessage}</div> : null}

            {/* Primary Action Button */}
            <div className="action-area">
              <Button
                onClick={handleContinue}
                loading={loading}
                className="w-full"
                disabled={formData.phoneNumber.length < 10 || formData.password.length < 6}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyTaker;
