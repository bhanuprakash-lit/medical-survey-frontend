import { useState, useEffect, useMemo } from 'react';
import { ENDPOINTS, adminAuthHeaders } from '../../config/api';
import Button from '../../components/Button';
import './Admin.css';

const SubmissionsDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('submissions');
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [combinationAnalytics, setCombinationAnalytics] = useState([]);
  const [similarityAnalytics, setSimilarityAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const headers = adminAuthHeaders();
        
        if (activeTab === 'submissions') {
          const response = await fetch(ENDPOINTS.GET_SUBMISSIONS, { headers });
          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              onBack(); // Logout if unauthorized
              return;
            }
            throw new Error('Failed to fetch submissions');
          }
          const data = await response.json();
          setSubmissions(data);
          if (data.length > 0 && !selectedStoreId) {
            setSelectedStoreId(data[0].store_id);
          }
        } else {
          const [basicRes, comboRes, simRes] = await Promise.all([
            fetch(ENDPOINTS.GET_ANALYTICS, { headers }),
            fetch(ENDPOINTS.GET_COMBINATION_ANALYTICS, { headers }),
            fetch(ENDPOINTS.GET_SIMILARITY_ANALYTICS, { headers }),
          ]);

          if (basicRes.ok) setAnalytics(await basicRes.json());
          if (comboRes.ok) setCombinationAnalytics(await comboRes.json());
          if (simRes.ok) setSimilarityAnalytics(await simRes.json());
          
          if (!basicRes.ok && basicRes.status !== 404) {
            if (basicRes.status === 401 || basicRes.status === 403) {
              onBack();
              return;
            }
            setError('Some analytics could not be loaded.');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

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
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div className="admin-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="admin-back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">
                {activeTab === 'submissions' 
                  ? 'Review completed outlet surveys and interviews.' 
                  : 'Aggregated analytics and AI-driven similarity insights.'}
              </p>
            </div>
          </div>
          
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              Submissions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'submissions' ? (
          <>
            {/* Sidebar / Store List */}
            <aside className={`admin-sidebar ${isMobileDetailView ? 'hidden sm:block' : 'block'}`}>
              <div className="sidebar-inner">
                <h2 className="sidebar-title">Outlets ({submissions.length})</h2>
                {submissions.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No submissions yet.</p>
                ) : (
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
                )}
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
                  <p>{submissions.length > 0 ? 'Select a store from the list to view its responses.' : 'No data to display.'}</p>
                </div>
              )}
            </main>
          </>
        ) : (
          <main className="admin-main analytics-view">
            <div className="analytics-container animate-in fade-in slide-in-bottom">
              
              {error && <div className="error-banner mb-6">{error}</div>}

              {/* Single Select Analytics */}
              <section className="analytics-section">
                <h2 className="section-title">Single Selection Insights</h2>
                {analytics.length === 0 ? (
                  <p className="text-slate-400 pl-2">No single-selection data yet.</p>
                ) : (
                  <div className="analytics-grid">
                    {analytics.map((item) => (
                      <div key={item.question_id} className="analytics-card">
                        <h3 className="analytics-q">{item.question_text}</h3>
                        <div className="analytics-stats">
                          {item.analytics.map((stat, idx) => (
                            <div key={idx} className="stat-row">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold">{stat.option}</span>
                                <span className="text-slate-500">{stat.percentage}% ({stat.selected_count})</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${stat.percentage}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Combination Analytics */}
              <section className="analytics-section">
                <h2 className="section-title">Multi-Select Combinations</h2>
                {combinationAnalytics.length === 0 ? (
                  <p className="text-slate-400 pl-2">No multi-selection data yet.</p>
                ) : (
                  <div className="analytics-grid">
                    {combinationAnalytics.map((item) => (
                      <div key={item.question_id} className="analytics-card">
                        <h3 className="analytics-q">{item.question_text}</h3>
                        <div className="analytics-stats">
                          {item.analytics.map((stat, idx) => (
                            <div key={idx} className="stat-row">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold">{stat.combination.join(', ')}</span>
                                <span className="text-slate-500">{stat.percentage}% ({stat.count})</span>
                              </div>
                              <div className="progress-bar combination">
                                <div className="progress-fill" style={{ width: `${stat.percentage}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Similarity Analytics (AI clusters) */}
              <section className="analytics-section">
                <h2 className="section-title">AI Theme Clustering (Similarity)</h2>
                {similarityAnalytics?.status === 'disabled' ? (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <p className="text-amber-800 text-sm font-semibold">{similarityAnalytics.message}</p>
                    <p className="text-amber-600 text-xs mt-1">To enable this, install 'sentence-transformers' and 'scikit-learn' on the server.</p>
                  </div>
                ) : (!similarityAnalytics || similarityAnalytics.data.length === 0) ? (
                  <p className="text-slate-400 pl-2">No similarity data yet or Open-ended questions found.</p>
                ) : (
                  <div className="analytics-grid">
                    {similarityAnalytics.data.map((item) => (
                      <div key={item.question_id} className="analytics-card">
                        <h3 className="analytics-q">{item.question_text}</h3>
                        <div className="theme-list">
                          {item.analytics.map((theme, idx) => (
                            <div key={idx} className="theme-item">
                              <div className="theme-header">
                                <span className="theme-label">Theme:</span>
                                <p className="theme-text">{theme.theme_answer}</p>
                                <span className="theme-count">{theme.count} responses</span>
                              </div>
                              <div className="theme-similarity">
                                <details>
                                  <summary>Show similar responses ({theme.similar_answers.length})</summary>
                                  <ul className="similar-list">
                                    {theme.similar_answers.map((ans, i) => (
                                      <li key={i}>{ans}</li>
                                    ))}
                                  </ul>
                                </details>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default SubmissionsDashboard;
