import React, { useState,useEffect } from "react";
import "../css/logsPage.css";
import { handleLogoutUtil } from "../utils/logoutUtil";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkAccessToken } from "../utils/checkAccessToken";
import axios from "axios";

interface LogObject {
  serviceName: string;
  timestamp: string;
  logLevel:string;
  logString: string;
  itemId: number;
  source:string;
}

const LogsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken); 
  const [selectedProcess, setProcess] = useState("");
  // const [startItemId, setStartItemId] = useState<number | "">("");
  // const [endItemId, setEndItemId] = useState<number | "">("");
  const [logData, setLogData] = useState<LogObject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  
  useEffect(() => {
    const storedStart = localStorage.getItem("logs_startTime");
    const storedEnd = localStorage.getItem("logs_endTime");
  
    if (storedStart) setStartTime(storedStart);
    if (storedEnd) setEndTime(storedEnd);
  }, []);

  const handleLogout = async () => {
    if (refreshToken) {
      localStorage.removeItem("logs_startTime");
      localStorage.removeItem("logs_endTime");
      await handleLogoutUtil(refreshToken, dispatch, navigate);
    }
  };

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    localStorage.setItem("logs_startTime", value);
  };
  
  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    localStorage.setItem("logs_endTime", value);
  };

  const handleHomePage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate("/home");
    }
  };

  const handleResearchPage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate('/researchesPage'); 
    }
  };

  const handleMachineStatsPage = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid) {
      navigate("/machineStats");
    }
  };
  

  const fetchLogs = async () => {
    setLogData([]);
    try {
      const isValid = await checkAccessToken(navigate);
      if (!isValid) return;
      
      if (!selectedProcess) {
        alert("No process selected silly!");
        return;
      }
      
      const formattedStart = startTime ? new Date(startTime).toISOString() : undefined; //make sure its splank compatible
      const formattedEnd = endTime ? new Date(endTime).toISOString() : undefined;
      if (formattedEnd === formattedStart){
        alert("You chose the same time silly!");
        return;
      }
      const response = await axios.post<{ logs: LogObject[] }>(`${process.env.REACT_APP_SERVER_BASE_URL}/splunk/search-logs`,
        { selectedProcess, startTime: formattedStart, endTime: formattedEnd }
      );

      setLogData(response.data.logs);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const sendToMachine = async () => {
    if (logData.length === 0) {
      alert("No logs to analyze. Please fetch logs first.");
      return;
    }
  
    try {
      const isValid = await checkAccessToken(navigate);
      if (!isValid) return;
  
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/pythonApi/analyze-log`,
        { logs: logData },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      );
  
      setStats(response.data);
      localStorage.setItem("latest_machine_results", JSON.stringify(response.data));
      navigate('/machineStats');
    } catch (err: any) {
      console.error("Error sending logs to ML server:", err);
      alert("Failed to analyze logs.");
    }
  };
  
  const sendToAnalyze = async () => {
    if (logData.length === 0) {
      alert("No logs to analyze. Please fetch logs first.");
      return;
    }
  
    try {
      const isValid = await checkAccessToken(navigate);
      if (!isValid) return;
  
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASE_URL}/stats/analyze-logs`,
        { logs: logData },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      );
  
      localStorage.setItem("latest_analysis", JSON.stringify(response.data));
      navigate("/researchesPage");
    } catch (err: any) {
      console.error("Error sending logs to analysis:", err);
      alert("Failed to analyze logs.");
    }
  };
  
  
  

  return (
  <div className="logsPage-container">
    <div className="lp-header">
          <button className="lp-logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button className="lp-home-btn" onClick={handleHomePage}>
            Home
          </button>
          <button className="lp-researches-btn" onClick={handleResearchPage}>
            researches
          </button>
          <button className="lp-machine-btn" onClick={handleMachineStatsPage}>
            Machine Stats
          </button>
        </div>

        <div className="lp-container">
          <div>
            <label htmlFor="process">Process (as splunk INDEX):</label>
            <input
              type="text"
              id="process"
              value={selectedProcess}
              onChange={(e) => setProcess(e.target.value)}
              required
            />
          </div>
          {/* <div>
            <label htmlFor="start-itemId">Start Item ID:</label>
            <input
              type="number"
              id="start-itemId"
              value={startItemId}
              onChange={(e) => setStartItemId(e.target.value ? Number(e.target.value) : "")}      
            />
          </div>
          <div>
            <label htmlFor="end-itemId">End Item ID:</label>
            <input
              type="number"
              id="end-itemId"
              value={endItemId}
              onChange={(e) => setEndItemId(e.target.value ? Number(e.target.value) : "")}
            />
          </div> */}
          <div>
          <label htmlFor="start-time">Start Time (ISO-splank format):</label>
          <input
            type="datetime-local"
            id="start-time"
            value={startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            
          />
          </div>
          <div>
            <label htmlFor="end-time">End Time (ISO-splank format):</label>
            <input
              type="datetime-local"
              id="end-time"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              />
          </div>

          <button onClick={fetchLogs}>Fetch Logs</button>

          {error && <p className="error">{error}</p>}

          {logData.length > 0 && (
            <>
              <div className="lp-log-details">
                <h3>Logs</h3>
                {logData.map((log, index) => (
                  <div key={index}>
                    <p><strong>Service:</strong> {log.serviceName}</p>
                    <p><strong>Timestamp:</strong> {log.timestamp}</p>
                    <p><strong>LogLevel:</strong> {log.logLevel}</p>
                    <p><strong>Log:</strong> {log.logString}</p>
                    <p><strong>ID:</strong> {log.itemId}</p>
                    <p><strong>Source:</strong> {log.source}</p>
                  </div>
                ))}
              </div>
              <div className="send-div">
                <button onClick={sendToMachine}>Send to Machine</button>
                <button onClick={sendToAnalyze}>Analyze statistically</button>
              </div>
            </>
          )}

          {stats && (
            <div>
              <h3>Stats</h3>
              <p>Total Problems: {stats.totalProblems}</p>
              <p>Average Running Time: {stats.avgRunTime}</p>
              <p>Service with Most Problems: {stats.serviceWithMostProblems}</p>
            </div>
          )}
        </div>
  </div>
    
  );
}

export default LogsPage;
