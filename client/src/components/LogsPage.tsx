import React from 'react';
import '../css/logsPage.css';

function LogsPage() {
  return (
    <div className="logs-page">
      <div>
        <label htmlFor="insert-index">index:</label>
        <input
          type="number"
          id="index"
          required
        />
        <button>search</button>
      </div>
      {/* <div>
        <label htmlFor="insert-time">time duration:</label>
        <input
          type="date"
          id="time"
          required
        />
        <button>search</button>
      </div> */}
    </div>
  );
}

export default LogsPage;
