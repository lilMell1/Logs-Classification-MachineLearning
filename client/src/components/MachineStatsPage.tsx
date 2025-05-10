import React, { useEffect, useState } from "react";
import { useNavigate, useLocation} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { handleLogoutUtil } from "../utils/logoutUtil";
import { checkAccessToken } from "../utils/checkAccessToken";
import LogFilters from "../components/LogFilters"; 
import AnimatedNumber from "../elements/AnimatedNumber";
import PageTitle from '../elements/PageTitle';
import "../css/machineStatsPage.css";

import axios from "axios";

const MachineStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [machineStats, setMachineStats] = useState<any | null>(null);
  const location = useLocation();
  const isLoadingInit = new URLSearchParams(location.search).get("loading") === "true";
  const [loading, setLoading] = useState(isLoadingInit);
  
  const [filters, setFilters] = useState({
    logLevel: "",
    serviceName: "",
    source: "",
    timestamp: "",
  });

 useEffect(() => {
  const fetchMachineStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_BASE_URL}/pythonApi/latest`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMachineStats(response.data);
    } catch (error) {
      console.error("Failed to fetch machine stats:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (accessToken) { 
    if (loading) {
       const params = new URLSearchParams(location.search);
      params.delete("loading");
      window.history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
      setTimeout(fetchMachineStats, 2500); 
      
    } else {
      fetchMachineStats();
    }
  }
}, [accessToken, loading]);


  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
     await handleLogoutUtil(refreshToken, dispatch, navigate);
  };

  const handleHomePage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) navigate("/home");
  };

  const handleBackToResearch = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) navigate("/logsPage");
  };

  if (loading) {
    return (
      <div className="msp-spinner-wrapper">
        <h2>Loading Machine Stats...</h2>
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="msp-container">
      <div className="msp-header">
        <button className="msp-btn" onClick={handleLogout}>Logout</button>
        <button className="msp-btn" onClick={handleHomePage}>Home</button>
        <button className="msp-btn" onClick={handleBackToResearch}>New research</button>
      </div>

      <div className="msp-main">
        <PageTitle title="Machine Stats" subtitle="Machine's last learning summary results" />

        {machineStats ? (
          <div className="msp-results-box">
            <p><strong>Accuracy:</strong> <AnimatedNumber value={machineStats.machineSummary.accuracy} showPercent /></p>
            <p><strong>Average Confidence:</strong> <AnimatedNumber value={machineStats.machineSummary.average_confidence} showPercent /></p>
            <p><strong>Precision:</strong> <AnimatedNumber value={machineStats.machineSummary.precision} showPercent /></p>
            <p><strong>Recall:</strong> <AnimatedNumber value={machineStats.machineSummary.recall} showPercent /></p>
            <p><strong>F1 Score:</strong> <AnimatedNumber value={machineStats.machineSummary.f1_score} showPercent /></p>

            <LogFilters filters={filters} onChange={handleFilterChange} />

            <div className="msp-log-scroll">
              
              <ul>
                {machineStats.results
                  .filter((log: any) => {
                    return (
                      log.serviceName.toLowerCase().includes(filters.serviceName.toLowerCase()) &&
                      log.source.toLowerCase().includes(filters.source.toLowerCase()) &&
                      log.timestamp.toLowerCase().includes(filters.timestamp.toLowerCase()) &&
                      (filters.logLevel === "" || log.logLevel.toLowerCase() === filters.logLevel.toLowerCase())
                    );
                  })
                  .map((log: any, index: number) => (
                    <li key={index}>
                      <p><strong>Service:</strong> {log.serviceName}</p>
                      <p><strong>Timestamp:</strong> {log.timestamp}</p>
                      <p><strong>Source:</strong> {log.source}</p>
                      <p><strong>LogString:</strong> {log.log}</p>
                      <p><strong>LogLevel:</strong> {log.logLevel}</p>
                      <p style={{ color: 'red' }}><strong>Prediction:</strong> {log.predicted_category}</p>
                      <p style={{ color: 'red' }}><strong>Confidence:</strong> {log.confidence.toFixed(4)}</p>

                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>No machine results available.</p>
        )}
      </div>
    </div>

  );
};

export default MachineStatsPage;
