import React from "react";
import '../css/logFilters.css';

interface LogFiltersProps {
  filters: {
    serviceName: string;
    source: string;
    timestamp: string;
    logLevel: string;
  };
  onChange: (field: string, value: string) => void;
}

const LogFilters: React.FC<LogFiltersProps> = ({ filters, onChange }) => {
  return (
    <div className="logs-filter-controls">
      <input
        type="text"
        placeholder="Service name"
        value={filters.serviceName}
        onChange={(e) => onChange("serviceName", e.target.value)}
      />
      <input
        type="text"
        placeholder="Source"
        value={filters.source}
        onChange={(e) => onChange("source", e.target.value)}
      />
      <input
        type="text"
        placeholder="Timestamp"
        value={filters.timestamp}
        onChange={(e) => onChange("timestamp", e.target.value)}
      />
      <select
        value={filters.logLevel}
        onChange={(e) => onChange("logLevel", e.target.value)}
      >
        <option value="">All Levels</option>
        <option value="info">info</option>
        <option value="debug">Debug</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
        <option value="fatal">Fatal</option>
        <option value="trace">Trace</option>
      </select>
    </div>
  );
};

export default LogFilters;
