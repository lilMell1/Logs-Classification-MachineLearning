import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { handleLogoutUtil } from "../utils/logoutUtil";
import { checkAccessToken } from "../utils/checkAccessToken";
import "../css/machineStatsPage.css";
import axios from "axios";

const MachineStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [machineStats, setMachineStats] = useState<any | null>(null);

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
      }
    };

    fetchMachineStats();
  }, [accessToken]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    if (refreshToken) await handleLogoutUtil(refreshToken, dispatch, navigate);
  };

  const handleHomePage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) navigate("/home");
  };

  const handleBackToResearch = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) navigate("/logsPage");
  };

  return (
    <div className="machine-page-container">
      <div className="machine-header">
        <button className="machine-logout-btn" onClick={handleLogout}>Logout</button>
        <button className="machine-home-btn" onClick={handleHomePage}>Home</button>
        <button className="machine-research-btn" onClick={handleBackToResearch}>New research</button>
      </div>

      <div className="machine-main">
        <h2>Machine Last Learning Summary</h2>
        <p>(the machine statistics)</p>

        {machineStats ? (
          <div className="machine-results-box">
            <p><strong>Accuracy:</strong> {machineStats.machineSummary.accuracy}</p>
            <p><strong>Average Confidence:</strong> {machineStats.machineSummary.average_confidence}</p>
            <p><strong>Precision:</strong> {machineStats.machineSummary.precision}</p>
            <p><strong>Recall:</strong> {machineStats.machineSummary.recall}</p>
            <p><strong>F1 Score:</strong> {machineStats.machineSummary.f1_score}</p>

            <div className="logs-filter-controls">
              <input
                type="text"
                placeholder="Service name"
                value={filters.serviceName}
                onChange={(e) => handleFilterChange("serviceName", e.target.value)}
              />
              <input
                type="text"
                placeholder="Source"
                value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
              />
              <input
                type="text"
                placeholder="Timestamp"
                value={filters.timestamp}
                onChange={(e) => handleFilterChange("timestamp", e.target.value)}
              />
              <select
                value={filters.logLevel}
                onChange={(e) => handleFilterChange("logLevel", e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="debug">Debug</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="fatal">Fatal</option>
                <option value="trace">Trace</option>
              </select>
            </div>

            <div className="log-scroll-container">
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
                      <p><strong>Prediction:</strong> {log.predicted_category}</p>
                      <p><strong>Confidence:</strong> {log.confidence.toFixed(4)}</p>
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
