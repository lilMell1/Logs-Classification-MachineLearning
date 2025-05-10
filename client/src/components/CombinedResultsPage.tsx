import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MachineStatsPage from "./MachineStatsPage";
import ResearchesPage from "./ResearchesPage";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { checkAccessToken } from "../utils/checkAccessToken";
import { handleLogoutUtil } from "../utils/logoutUtil";
import axios from "axios";

import "../css/combinedResultsPage.css";

const CombinedResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [view, setView] = useState<"stats" | "ml">("stats");
  const [loading, setLoading] = useState(
    new URLSearchParams(location.search).get("loading") === "true"
  );

  const [statsData, setStatsData] = useState<any>(null);
  const [mlData, setMlData] = useState<any>(null);

  useEffect(() => {
  const savedView = localStorage.getItem("combined_view");
  if (savedView === "ml" || savedView === "stats") {
    setView(savedView);
  }

  const fetchAll = async () => {
        try {
        const [statsRes, mlRes] = await Promise.all([
            axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/stats/latest`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            }),
            axios.get(`${process.env.REACT_APP_SERVER_BASE_URL}/pythonApi/latest`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ]);
        setStatsData(statsRes.data);
        setMlData(mlRes.data);
        } catch (err) {
        console.error("Failed to fetch combined results:", err);
        } finally {
        setLoading(false);
        }
    };

    if (!statsData || !mlData) {
        // only fetch if one of them is missing
        if (accessToken) {
        if (loading) {
            const params = new URLSearchParams(location.search);
            params.delete("loading");
            window.history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
            setTimeout(fetchAll, 2000);
        } else {
            fetchAll();
        }
        }
    } else {
        // we already have both — turn off loading
        setLoading(false);
    }
  }, []);


  const toggleView = () => {
    const newView = view === "stats" ? "ml" : "stats";
    setView(newView);
    localStorage.setItem("combined_view", newView);
  };

  const handleLogout = async () => {
    await handleLogoutUtil(refreshToken, dispatch, navigate);
  };

  const handleHome = async () => {
    const valid = await checkAccessToken(navigate);
    if (valid) navigate("/home");
  };

  if (loading || !statsData || !mlData) {
    return (
      <div className="crp-spinner-wrapper">
        <h2>Loading Combined Results...</h2>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="crp-container">
       <div className="crp-nav-header">
            <button className="crp-btn" onClick={handleLogout}>Logout</button>
            <button className="crp-btn" onClick={handleHome}>Home</button>
            <button className="crp-btn" onClick={() => navigate("/logsPage")}>New Research</button>
       </div>  


      <div className="crp-header">
        <button className="crp-btn" onClick={toggleView}>
          {view === "stats" ? "Show Machine Learning" : "Show Statistics"}
        </button>
      </div>

      <div className="crp-content-wrapper">
        {view === "stats" ? (
          <ResearchesPage embedded initialData={statsData} />
        ) : (
          <MachineStatsPage embedded initialData={mlData} />
        )}
      </div>
    </div>
  );
};

export default CombinedResultsPage;
