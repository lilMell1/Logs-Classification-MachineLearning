import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { handleLogoutUtil } from "../utils/logoutUtil";
import { checkAccessToken } from "../utils/checkAccessToken";
import LogFilters from "../components/LogFilters";
import AnimatedNumber from "../elements/AnimatedNumber";
import PageTitle from '../elements/PageTitle';
import "../css/machineStatsPage.css";
import axios from "axios";
import { ResponsivePie } from '@nivo/pie';

interface Props {
  embedded?: boolean;
  skipInitialLoading?: boolean;
  initialData?: any;
}

const MachineStatsPage: React.FC<Props> = ({
  embedded = false,
  skipInitialLoading = false,
  initialData = null
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const location = useLocation();

  const [machineStats, setMachineStats] = useState<any | null>(initialData);

  const [filters, setFilters] = useState({
    logLevel: "",
    serviceName: "",
    source: "",
    timestamp: "",
  });

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

  // Count occurrences of predicted_category for pie chart
  const pieData = React.useMemo(() => {
    if (!machineStats?.results) return [];

    const counts = { "process-level": 0, "application-level": 0 };
    machineStats.results.forEach((log: any) => {
      const cat = log.predicted_category?.toLowerCase();
      if (cat === "process-level") counts["process-level"]++;
      else if (cat === "application-level") counts["application-level"]++;
    });

    return [
      { id: "Process-level", label: "Process-level", value: counts["process-level"] },
      { id: "Application-level", label: "Application-level", value: counts["application-level"] },
    ];
  }, [machineStats]);

  return (
    <div className={embedded ? "embedded-wrapper" : "msp-container"}>
      {!embedded && (
        <div className="msp-header">
          <button className="msp-btn" onClick={handleLogout}>Logout</button>
          <button className="msp-btn" onClick={handleHomePage}>Home</button>
          <button className="msp-btn" onClick={handleBackToResearch}>New research</button>
        </div>
      )}

      <div className="msp-main">
        <PageTitle title="Machine Stats" subtitle="Machine's last learning summary results" />

        {machineStats ? (
          <div className="msp-results-container">
            <div className="msp-results-box msp-results-left" >
              <p>
                <strong>Accuracy:</strong> 
                <AnimatedNumber value={machineStats.machineSummary.accuracy} showPercent />
                <span className="tooltip">?
                  <span className="tooltiptext">
                    אחוז התחזיות שהמודל עשה נכון מסך כל התחזיות
                  </span>
                </span>
              </p>
              <p>
                <strong>Average Confidence:</strong> 
                <AnimatedNumber value={machineStats.machineSummary.average_confidence} showPercent />
                <span className="tooltip">?
                  <span className="tooltiptext">
                    כמה המודל בטוח בממוצע בכל תחזית שהוא עושה     
                  </span>
                </span>
              </p>
              <p>
                <strong>Precision:</strong> 
                <AnimatedNumber value={machineStats.machineSummary.precision} showPercent />
                <span className="tooltip">?
                  <span className="tooltiptext">
                    מתוך כל הפעמים שהמודל ניבא "חיובי", כמה פעמים הוא צדק
                  </span>
                </span>
              </p>
              <p>
                <strong>Recall:</strong> 
                <AnimatedNumber value={machineStats.machineSummary.recall} showPercent />
                <span className="tooltip">?
                  <span className="tooltiptext">
                    מתוך כל המקרים האמיתיים שחשוב לנו למצוא (למשל: כל הלוגים שבהם יש תקלה), כמה המודל הצליח לזהות ולא לפספס את התשובה הנכונה
                  </span>
                </span>
              </p>
              <p>
                <strong>F1 Score:</strong> 
                <AnimatedNumber value={machineStats.machineSummary.f1_score} showPercent />
                <span className="tooltip">?
                  <span className="tooltiptext">
                    מדד המשלב את הדיוק והזיכרון כדי להראות ביצועים כלליים על המכונה
                  </span>
                </span>
              </p>
            </div>

            <div
              style={{
                width: 280,
                height: 280,
                background: "white",
                borderRadius: 16,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: 20,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
              aria-label="Predicted category distribution pie chart"
            >
              <h3 style={{ textAlign: "center", marginBottom: 10 }}>Log Prediction Breakdown</h3>
              <ResponsivePie
                data={pieData}
                margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: "nivo" }}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                enableArcLabels={true}
                arcLabelsRadiusOffset={0.55}
                arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              />
            </div>
          </div>
        ) : (
          <p style={{ color: "#666", fontStyle: "italic" }}>No machine results available.</p>
        )}

        <h1>log classification</h1>
        <LogFilters filters={filters} onChange={handleFilterChange} />
        <div className="msp-log-scroll">
          <ul>
            {machineStats?.results
              .filter((log: any) =>
                log.serviceName.toLowerCase().includes(filters.serviceName.toLowerCase()) &&
                log.source.toLowerCase().includes(filters.source.toLowerCase()) &&
                log.timestamp.toLowerCase().includes(filters.timestamp.toLowerCase()) &&
                (filters.logLevel === "" || log.logLevel.toLowerCase() === filters.logLevel.toLowerCase())
              )
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
    </div>
  );
};

export default MachineStatsPage;
