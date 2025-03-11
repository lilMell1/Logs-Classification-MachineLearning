import React, { useState } from "react";
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
  logString: string;
  itemId: number;
}

function LogsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const [id, setId] = useState<number | "">("");
  const [logData, setLogData] = useState<LogObject | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const searchLogById = async () => {
    const isValid = await checkAccessToken(navigate);
    if (isValid && id !== "") {
      try {
        const response = await axios.post<{ logs: LogObject[] }>(
          `${process.env.REACT_APP_SERVER_BASE_URL}/splunk/search-log-by-id`,
          { id }
        );
        console.log("Splunk Response:", response.data);

        if (response.data.logs.length > 0) {
          setLogData(response.data.logs[0]); 
        } else {
          setError("No log found for the given ID.");
          setLogData(null);
        }
      } catch (err: any) {
        console.error("Search Log Error:", err);
        setError(err.response?.data?.message || "An error occurred");
      }
    } else {
      alert("Insert ID/index");
    }
};


  const sendToMachine = async () => {
    if (!logData) {
      alert("No log to send!");
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/pythonApi/analyze-log`, {
        logs: [logData]  
      });

      console.log("Machine Learning Response:", response.data);
      alert(`Analysis Complete: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      console.error("Error sending to ML Server:", err);
      alert("Failed to analyze log.");
    }
  };

  return (
    <>
      <div className="lp-header">
        <button className="lp-logout-btn" onClick={handleLogout}>
          Logout
        </button>
        <button className="lp-home-btn" onClick={handleHomePage}>
          Home
        </button>
      </div>

      <div className="lp-container">
        <div>
          <label htmlFor="insert-index">Index:</label>
          <input
            type="number"
            id="index"
            value={id}
            onChange={(e) => setId(Number(e.target.value))}
            required
          />
          <button onClick={searchLogById}>Search</button>
        </div>

        {error && <p className="error">{error}</p>}

        {/* Show fetched log */}
        {logData && (
          <div className="lp-log-details">
            <h3>Fetched Log</h3>
            <p><strong>Service:</strong> {logData.serviceName}</p>
            <p><strong>Timestamp:</strong> {logData.timestamp}</p>
            <p><strong>Log:</strong> {logData.logString}</p>
            <p><strong>ID:</strong> {logData.itemId}</p>
            <button onClick={sendToMachine}>Send to Machine / Analyze</button>
          </div>
        )}
      </div>
    </>
  );
}

export default LogsPage;
