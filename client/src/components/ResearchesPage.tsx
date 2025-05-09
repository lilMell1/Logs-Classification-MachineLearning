import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { handleLogoutUtil } from '../utils/logoutUtil';
import { checkAccessToken } from '../utils/checkAccessToken';
import axios from 'axios';
import AnalysisCharts from '../components/AnalysisCharts';
import PageTitle from '../elements/PageTitle';

import '../css/researchesPage.css';

const ResearchesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken); 
  const [viewType, setViewType] = useState<'latest' | 'cumulative'>('latest');

  const [logs, setLogs] = useState<string[]>([]);
  const [errorDistribution, setErrorDistribution] = useState<any[]>([]);
  const [serviceDurations, setServiceDurations] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [averageDurationMinutes, setAverageDurationMinutes] = useState<number>(0);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/stats/${viewType}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const parsed = response.data;

        setTotalLogs(parsed.totalLogs);
        setAverageDurationMinutes(parsed.averageDurationMinutes);

        const errorData = Object.entries(parsed.errorDistribution).map(([key, value]) => ({
          id: key.toUpperCase(),
          label: key.toUpperCase(),
          value: Number(value),
        }));
        setErrorDistribution(errorData);

        const serviceData = parsed.serviceDurations.map((item: any) => ({
          service: item.serviceName,
          durationSeconds: item.durationSeconds,
        }));
        setServiceDurations(serviceData);

        const logLines = parsed.serviceDurations.map((log: any) =>
          `${log.serviceName}: ${log.durationSeconds.toFixed(2)}s`
        );
        setLogs(logLines);
      } catch (err) {
        console.error('Failed to fetch analysis:', err);
      }
    };

    fetchAnalysis();
  }, [viewType, accessToken]);

  const handleLogout = async () => {
    if (refreshToken) await handleLogoutUtil(refreshToken, dispatch, navigate);
  };

  const handleHomePage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) navigate('/home');
  };

  const handleNewResearch = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) navigate('/logsPage');
  };

  const handleMachineStatsPage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate("/machineStats");
    }
  };
  

  return (
    <div className="research-page-container">
      <div className="research-header">
        <button className="research-logout-btn" onClick={handleLogout}>Logout</button>
        <button className="research-home-btn" onClick={handleHomePage}>Home</button>
        <button className="research-newResearch-btn" onClick={handleNewResearch}>New research</button>
        <button className="research-newResearch-btn" onClick={handleMachineStatsPage}>Machine stats</button>
      </div>
      <PageTitle title="Researches" />

      <div className="research-toggle-container">
        <button className={`research-toggle-btn ${viewType === 'latest' ? 'active' : ''}`} onClick={() => setViewType('latest')}>
          Latest Analysis
        </button>
        <button className={`research-toggle-btn ${viewType === 'cumulative' ? 'active' : ''}`} onClick={() => setViewType('cumulative')}>
          Cumulative View
        </button>
        
      </div>

      <div className="research-main">
        <div className="research-logs-section">
          <h2>Logs Summary</h2>
          <p><strong>Total Logs:</strong> {totalLogs}</p>
          <p><strong>Average Duration (in minutes):</strong> {averageDurationMinutes.toFixed(2)}</p>

          <p style={{ fontSize: '0.9em', color: '#666' }}>
            The following table shows the <strong>average time between logs</strong> for each service (based on consecutive log entries).
          </p>

          <ul style={{ marginTop: '10px' }}>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>

        {/* הוספת גרפים עם נתונים מהמודל */}
        <AnalysisCharts
          errorDistribution={errorDistribution}
          serviceDurations={serviceDurations}
        />
      </div>
    </div>
  );
};

export default ResearchesPage;