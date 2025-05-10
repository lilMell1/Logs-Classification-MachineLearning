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
  const [refreshFlag, setRefreshFlag] = useState(false);

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
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          // No data found, clear state
          setTotalLogs(0);
          setAverageDurationMinutes(0);
          setErrorDistribution([]);
          setServiceDurations([]);
          setLogs([]);
        } else {
          console.error('Failed to fetch analysis:', err);
        }
      }
    };
    

    fetchAnalysis();
  }, [viewType, accessToken, refreshFlag]);

  const handleLogout = async () => {
     await handleLogoutUtil(refreshToken, dispatch, navigate);
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

  const handleDeleteAndRestore = async () => {
    const isValid = await checkAccessToken(navigate);
    try {
      const confirmed = window.confirm("Are you sure you want to delete the latest analysis?");
      if (!confirmed) return;

      await axios.delete(`${process.env.REACT_APP_SERVER_BASE_URL}/stats/delete-latest`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      alert("Deleted latest analysis. If a previous one existed, it has been restored.");
      setRefreshFlag(prev => !prev);
    } catch (err) {
      console.error("Failed to delete and restore:", err);
      alert("Could not delete the latest analysis.");
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
        <button className="research-delete-btn" onClick={handleDeleteAndRestore}>Delete Last & Restore</button>
      </div>

      <div className="research-main">
        <div className="research-logs-section">
          <h2 style={{ justifySelf: "center", marginTop: "0px" }}>Logs Summary</h2>

          <div className="log-summary-metrics">
            <div className="metric-box">
              <h3>Total Logs</h3>
              <p>{totalLogs}</p>
            </div>
            <div className="metric-box">
              <h3>Average Duration</h3>
              <p>{averageDurationMinutes.toFixed(2)} min</p>
            </div>
          </div>

          <p className="log-summary-note">
            The following table shows the <strong>average time between logs</strong> for each service:
          </p>

          <ul className="log-summary-list">
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>

        <AnalysisCharts
          errorDistribution={errorDistribution}
          serviceDurations={serviceDurations}
        />
      </div>
    </div>
  );
};

export default ResearchesPage;
