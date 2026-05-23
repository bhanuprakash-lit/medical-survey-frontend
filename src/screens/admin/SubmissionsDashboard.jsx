import { useState, useEffect, useMemo } from 'react';
import { ENDPOINTS } from '../../config/api';
import Button from '../../components/Button';
import './Admin.css';

const SubmissionsDashboard = ({ onBack }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(ENDPOINTS.GET_SUBMISSIONS);
        if (!response.ok) throw new Error('Failed to fetch submissions');
        const data = await response.json();
        setSubmissions(data);
        if (data.length > 0 && !selectedStoreId) {
          setSelectedStoreId(data[0].store_id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [selectedStoreId]);

  const selectedSubmission = useMemo(() => 
    submissions.find(s => s.store_id === selectedStoreId),
    [submissions, selectedStoreId]
  );

  const handleStoreSelect = (id) => {
    setSelectedStoreId(id);
    setIsMobileDetailView(true);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading Submissions...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div className="admin-header">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="admin-back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className="admin-title">Submissions Dashboard</h1>
            <p className="admin-subtitle">Review completed outlet surveys and interviews.</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Sidebar / Store List */}
        <aside className={`admin-sidebar ${isMobileDetailView ? 'hidden sm:block' : 'block'}`}>
          <div className="sidebar-inner">
            <h2 className="sidebar-title">Outlets ({submissions.length})</h2>
            <div className="store-list">
              {submissions.map((sub) => (
                <button
                  key={sub.store_id}
                  onClick={() => handleStoreSelect(sub.store_id)}
                  className={`store-item ${selectedStoreId === sub.store_id ? 'active' : ''}`}
                >
                  <div className="store-info">
                    <span className="store-name">{sub.store_name}</span>
                    <span className="store-meta">ID: #{sub.store_id} • {sub.store_location}</span>
                  </div>
                  {sub.is_completed && <span className="status-badge">Done</span>}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main View / Q&A Detail */}
        <main className={`admin-main ${isMobileDetailView ? 'block' : 'hidden sm:block'}`}>
          {isMobileDetailView && (
            <button 
              onClick={() => setIsMobileDetailView(false)}
              className="sm:hidden mb-4 flex items-center gap-2 text-sky-600 font-bold text-sm"
            >
              ← Back to list
            </button>
          )}

          {selectedSubmission ? (
            <div className="detail-view animate-in fade-in slide-in-bottom">
              <div className="detail-header">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="detail-chip">Store ID: #{selectedSubmission.store_id}</div>
                    <h2 className="detail-title">{selectedSubmission.store_name}</h2>
                    <p className="detail-meta">
                      {selectedSubmission.store_location} • {selectedSubmission.store_mobile_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`status-pill ${selectedSubmission.is_completed ? 'success' : 'pending'}`}>
                      {selectedSubmission.is_completed ? 'Completed' : 'Partial'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="responses-section">
                <h3 className="section-title">Question & Answer Responses</h3>
                <div className="responses-grid">
                  {selectedSubmission.responses.map((resp, idx) => (
                    <div key={resp.question_id} className="response-card">
                      <div className="response-q-row">
                        <span className="q-num">Q{idx + 1}</span>
                        <p className="q-text">{resp.question_text}</p>
                      </div>
                      <div className="response-a-row">
                        <div className="a-label">Response</div>
                        <div className="a-content">
                          {resp.answers.length > 1 ? (
                            <ul className="list-disc pl-4 space-y-1">
                              {resp.answers.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                          ) : (
                            <p>{resp.answers[0] || 'No answer provided'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-selection">
              <p>Select a store from the list to view its responses.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SubmissionsDashboard;
