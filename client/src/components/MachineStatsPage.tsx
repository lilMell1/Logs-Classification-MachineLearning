import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { handleLogoutUtil } from "../utils/logoutUtil";
import { checkAccessToken } from "../utils/checkAccessToken";
import "../css/researchesPage.css"; // משתמשים באותו CSS כמו ResearchesPage
import axios from "axios";

const MachineStatsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken); 
  const [machineStats, setMachineStats] = useState<any | null>(null);

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
        console.error('Failed to fetch machine stats:', error);
      }
    };
  
    fetchMachineStats();
  }, [accessToken]);
  
  console.log(machineStats);

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
    <div className="research-page-container">
      <div className="research-header">
        <button className="research-logout-btn" onClick={handleLogout}>Logout</button>
        <button className="research-home-btn" onClick={handleHomePage}>Home</button>
        <button className="research-newResearch-btn" onClick={handleBackToResearch}>New research</button>
      </div>

      <div className="research-main">
        <div className="research-logs-section">
          <h2>Machine Last Learning Summary</h2>
          <p>(the machine statistics)</p>
          {machineStats ? (
              <>
                <p><strong>Accuracy:</strong> {machineStats.machineSummary.accuracy}</p>
                <p><strong>Average Confidence:</strong> {machineStats.machineSummary.average_confidence}</p>
                <p><strong>Precision:</strong> {machineStats.machineSummary.precision}</p>
                <p><strong>Recall:</strong> {machineStats.machineSummary.recall}</p>
                <p><strong>F1 Score:</strong> {machineStats.machineSummary.f1_score}</p>

                <h3 style={{ marginTop: "20px" }}>Classified Logs:</h3>
                <ul>
                  {machineStats.results.map((log: any, index: number) => (
                    <li key={index} style={{ marginBottom: "15px" }}>
                      <p><strong>Service:</strong> {log.serviceName}</p>
                      <p><strong>Timestamp:</strong> {log.timestamp}</p>
                      <p><strong>Source:</strong> {log.source}</p>
                      <p><strong>LogString:</strong> {log.log}</p>
                      <p><strong>Prediction:</strong> {log.predicted_category}</p>
                      <p><strong>Confidence:</strong> {log.confidence.toFixed(4)}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p style={{ color: "#666", fontStyle: "italic" }}>No machine results available.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default MachineStatsPage;
