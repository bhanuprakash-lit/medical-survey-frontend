import { useState, useMemo } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { ENDPOINTS, authHeaders, adminAuthHeaders } from '../config/api';
import './Screens.css'; // Using the unified stylesheet

const ACTIVE_SESSION_KEY = 'kirana-ai-active-session';

/**
 * StoreDetails Screen
 * Captures store information (Name, GPS, Mobile) after surveyor identification.
 * Handles store registration and starts a new survey session.
 */
const StoreDetails = ({ surveyorId, surveyorName, onComplete }) => {
  // --- State: Form Data ---
  const [formData, setFormData] = useState({
    storeName: '',
    storeLocation: '',
    storeNumber: '',
  });

  // --- State: Status & Interaction ---
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  // Checks if there's already an active survey session in progress
  const existingSession = useMemo(() => {
    try {
      const stored = window.localStorage.getItem(ACTIVE_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Updates form state on user input
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'storeNumber') {
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

  /**
   * Fetches GPS coordinates using the browser's Geolocation API.
   * Note: Requires HTTPS on mobile browsers.
   */
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    const isSecureOrigin = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecureOrigin) {
      setStatusMessage('GPS requires a secure connection (HTTPS). Please check your URL.');
    }

    setLocating(true);
    setErrors((prev) => ({ ...prev, storeLocation: '' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setFormData((prev) => ({ ...prev, storeLocation: locationString }));
        setLocating(false);
      },
      (error) => {
        console.error('Location error:', error);
        let msg = 'Unable to retrieve your location.';
        if (error.code === 1) msg = 'Permission denied. Ensure HTTPS and browser GPS access.';
        if (error.code === 2) msg = 'Position unavailable. Check your network/GPS signal.';
        if (error.code === 3) msg = 'Location request timed out. Please try again.';
        setStatusMessage(msg);
        setLocating(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 0 
      }
    );
  };

  // Skip registration and continue with the existing session
  const handleResume = () => {
    if (onComplete && existingSession) {
      onComplete(existingSession);
    }
  };

  /**
   * Primary Submission Logic:
   * 1. Validates form data.
   * 2. Saves store details to the backend.
   * 3. Starts a survey session for that store.
   * 4. Saves session context to LocalStorage.
   */
  const handleSubmit = async () => {
    // 1. Validation
    const nextErrors = {
      storeName: formData.storeName ? '' : 'Store name is required.',
      storeLocation: formData.storeLocation ? '' : 'Store location (GPS) is required.',
      storeNumber: formData.storeNumber ? '' : 'Store mobile number is required.',
    };

    if (nextErrors.storeName || nextErrors.storeLocation || nextErrors.storeNumber) {
      setErrors(nextErrors);
      setStatusMessage('Complete all store details (including GPS) before submitting.');
      return;
    }

    setErrors({});
    setStatusMessage('');
    setLoading(true);

    try {
      // Use surveyor headers first, fallback to admin headers for store registration
      const sHeaders = authHeaders();
      const aHeaders = adminAuthHeaders();
      const headers = Object.keys(sHeaders).length > 0 ? sHeaders : aHeaders;

      // 2. Register/Save Store
      const storeResponse = await fetch(ENDPOINTS.SAVE_STORE, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          store_name: formData.storeName,
          store_location: formData.storeLocation,
          store_mobile_number: formData.storeNumber,
          surveyor_id: surveyorId,
        }),
      });

      if (!storeResponse.ok) {
        const errorData = await storeResponse.json().catch(() => ({}));
        console.error('API Error:', errorData);
        setStatusMessage(errorData.detail || 'We could not save the store details right now. Please try again.');
        return;
      }

      const storeData = await storeResponse.json();
      const storeId = storeData.id || storeData.store_id || storeData.store_details_id;

      if (!storeId) {
        console.error('Store response is missing a store id:', storeData);
        setStatusMessage('Store was saved, but the session could not be started because the store id is missing.');
        return;
      }

      // 3. Start Survey Session
      const sessionResponse = await fetch(ENDPOINTS.START_SURVEY_SESSION, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          surveyor_id: surveyorId,
          store_id: storeId,
        }),
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json().catch(() => ({}));
        console.error('Session API Error:', errorData);
        setStatusMessage(errorData.detail || 'Store was saved, but the survey session could not be started. Please try again.');
        return;
      }

      // 4. Persistence & Completion
      const sessionData = await sessionResponse.json();
      const activeSession = {
        ...sessionData,
        surveyor_id: surveyorId,
        surveyor_name: surveyorName,
        store_id: storeId,
        store_name: formData.storeName,
        store_location: formData.storeLocation,
        store_mobile_number: formData.storeNumber,
        started_at: sessionData.started_at || new Date().toISOString(),
      };

      window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeSession));

      if (onComplete) onComplete(activeSession);
    } catch (error) {
      console.error('Network Error:', error);
      setStatusMessage('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-container">
      {/* Visual Header Section */}
      <div className="top-info-section animate-fade-in">
        <div className="top-info-chip">Outlet Survey</div>
        <h2 className="top-info-header">Capture the store details</h2>
        <p className="top-info-surveyor">Surveyor: <strong>{surveyorName}</strong></p>
      </div>

      <div className="centered-content-wrapper animate-fade-in">
        <div className="screen-card animate-premium-in">
          {/* Metadata Row */}
          <div className="screen-meta-row">
            <div className="step-pill">Step 2 of 2</div>
            <div className="status-pill">
              <span className="status-dot" />
              Linked
            </div>
          </div>

          <div className="screen-header">
            <h1 className="screen-title">Store Details</h1>
            <p className="screen-subtitle">
              Provide the information of the store being surveyed.
            </p>
          </div>

          {/* Form Fields */}
          <div className="form-container">
            <Input
              label="Store Name"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              placeholder="Enter store name"
              error={errors.storeName}
              hint="Required"
            />

            {/* GPS Input with Fetch Button */}
            <div className="relative">
              <Input
                label="Store Location (GPS)"
                name="storeLocation"
                value={formData.storeLocation}
                onChange={handleChange}
                placeholder={locating ? "Locating..." : "Click button to fetch GPS"}
                error={errors.storeLocation}
                hint="GPS Coordinates Required"
                readOnly
                className="pr-24"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="absolute right-2 bottom-3 flex h-9 items-center justify-center rounded-xl bg-sky-600 px-4 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-sky-200 transition-all active:scale-95 disabled:opacity-50 hover:bg-sky-700"
              >
                {locating ? (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white delay-75" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-white delay-150" />
                  </div>
                ) : (
                  "Get GPS"
                )}
              </button>
            </div>

            <Input
              label="Store Mobile Number"
              name="storeNumber"
              value={formData.storeNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              type="tel"
              error={errors.storeNumber}
              hint="10 Digits Required"
            />

            {/* Resume Session Prompt (If draft exists) */}
            {existingSession && (
              <div className="animate-in fade-in slide-in-bottom duration-500">
                <div className="flex flex-col gap-2 rounded-2xl border border-sky-100 bg-sky-50/50 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-600">Active Draft Found</span>
                    <span className="text-[10px] font-medium text-sky-400">
                      Started {new Date(existingSession.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{existingSession.store_name}</p>
                      <p className="truncate text-xs text-slate-500">{existingSession.store_location}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResume}
                      className="flex h-9 items-center justify-center rounded-xl bg-sky-600 px-4 text-xs font-bold text-white shadow-md shadow-sky-200 transition-all active:scale-95 hover:bg-sky-700"
                    >
                      Resume Draft
                    </button>
                  </div>
                </div>
              </div>
            )}

            {statusMessage ? <div className="error-banner">{statusMessage}</div> : null}

            {/* Action Buttons */}
            <div className="action-area">
              <Button
                onClick={handleSubmit}
                loading={loading}
                className="w-full"
                disabled={!formData.storeName.trim() || !formData.storeLocation.trim() || formData.storeNumber.length < 10}
              >
                Start Survey
              </Button>

              <button
                onClick={() => onComplete('back')}
                className="secondary-action"
              >
                Change Surveyor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;
