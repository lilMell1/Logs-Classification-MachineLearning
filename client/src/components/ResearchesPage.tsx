import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, LabelList } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { handleLogoutUtil } from "../utils/logoutUtil";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { checkAccessToken } from "../utils/checkAccessToken";
import '../css/researchesPage.css'

const ResearchesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Redux Dispatch
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const [logs, setLogs] = useState<string[]>([]);
  const [appVsProcessData, setAppVsProcessData] = useState<{ name: string; value: number }[]>([]);
  const [successRateData, setSuccessRateData] = useState<{ name: string; value: number }[]>([]);
  
  const COLORS = ['#0088FE', '#FF8042'];

  // Example data
  useEffect(() => {
    // Fetch the logs
    setLogs(["Log entry 1", "Log entry 2", "Log entry 3"]);

    // Mocked data for pie charts
    setAppVsProcessData([
      { name: 'Application-Level', value: 60 }, // 60%
      { name: 'Process-Level', value: 40 },     // 40%
    ]);

    setSuccessRateData([
      { name: 'Correct Predictions', value: 70 }, // 70%
      { name: 'Wrong Predictions', value: 30 },   // 30%
    ]);
  }, []);

  const handleLogout = async () => {
    if (refreshToken) {
      await handleLogoutUtil(refreshToken, dispatch, navigate);
    }
  };

  const handleHomePage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate("/home");
    }
  };
  const handleNewResearch = async () => {
      const isValid = await checkAccessToken(navigate);
      if (isValid) {
        navigate('/logsPage'); // Navigate only if the token is valid
      }
  };

  return (
    <div className="research-page-container">
      <div className="research-header">
        <button className="research-logout-btn" onClick={handleLogout}>
          Logout
        </button>
        <button className="research-home-btn" onClick={handleHomePage}>
          Home
        </button>
        <button className="research-newResearch-btn" onClick={handleNewResearch}>
          New research
        </button>
      </div>


      <div className="research-main">
        {/* Left: Logs */}
        <div className="research-logs-section">
          <h2>Logs</h2>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>

        {/* Right: Charts */}
        <div className="research-charts-section">
          <div className="research-chart-container">
            <h2>Application vs. Process Problems</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={appVsProcessData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {appVsProcessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                 <LabelList dataKey="value" position="inside" fill="#fff" fontSize={14}   formatter={(value: number) => `${value}%`}
                 />               
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
          <div className="research-chart-container">
            <h2>Machine Success Rate</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={successRateData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {successRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                  <LabelList dataKey="value" position="inside" fill="#fff" fontSize={14}   formatter={(value: number) => `${value}%`}
                  />                              
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchesPage;
