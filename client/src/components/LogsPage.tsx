import React, { useState } from "react";
import "../css/logsPage.css";
import { handleLogoutUtil } from "../utils/logoutUtil";
import { RootState } from "../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkAccessToken } from "../utils/checkAccessToken";
import axios from "axios";

interface LogObject {
  machineAnswer: string;
  machineAccuracy: number;
}

function LogsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const [id, setId] = useState<number | "">("");
  const [logProcessedInfo, setLogProcessedInfo] = useState<LogObject | null>(null);
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
        console.log("Searching for ID:", id);
        console.log(`${process.env.REACT_APP_API_BASE_URL}/splunk/search-log-by-id`);

        const response = await axios.post<{ logProcessedInfo: LogObject }>(
          `${process.env.REACT_APP_API_BASE_URL}/splunk/search-log-by-id`,
          { id },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Splunk Response:", response.data);
        setLogProcessedInfo(response.data.logProcessedInfo);
      } catch (err: any) {
        console.error("Search Log Error:", err);
        setError(err.response?.data?.message || "An error occurred");
      }
    } else {
      alert("Insert ID/index");
    }
  };

  return (
    <>
      <div className="logout-div">
        <button className="hp-logout-btn" onClick={handleLogout}>
          Logout
        </button>
        <button className="hp-home-btn" onClick={handleHomePage}>
          Home
        </button>
      </div>
      <div className="logs-page">
        <div>
          <label htmlFor="insert-index">Index:</label>
          <input
            type="number"
            id="index"
            value={id} // ✅ Track input value
            onChange={(e) => setId(Number(e.target.value))} // ✅ Update state
            required
          />
          <button onClick={searchLogById}>Search</button>
        </div>

        {/* Show search result */}
        {logProcessedInfo && (
          <div className="result">
            <p><strong>Machine Answer:</strong> {logProcessedInfo.machineAnswer}</p>
            <p><strong>Accuracy:</strong> {logProcessedInfo.machineAccuracy}%</p>
          </div>
        )}

        {/* Show errors */}
        {error && <p className="error">{error}</p>}
      </div>
    </>
  );
}

export default LogsPage;
