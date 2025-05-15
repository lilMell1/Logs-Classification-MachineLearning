import React, { useState } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import PageTitle from '../elements/PageTitle';

import '../css/researchesPage.css';

interface AnalysisChartsProps {
  errorDistribution: { id: string; label: string; value: number }[];
  serviceDurations: { service: string; durationSeconds: number }[];
}

const chartTheme = {
  axis: {
    ticks: {
      text: {
        fill: '#2c2f36', // dark gray for axes
      },
    },
    legend: {
      text: {
        fill: '#2c2f36',
      },
    },
  },
  labels: {
    text: {
      fill: '#2c2f36',
      fontSize: 14,
    },
  },
  legends: {
    text: {
      fill: '#2c2f36',
    },
  },
  tooltip: {
    container: {
      background: '#ffffff',
      color: '#2c2f36',
      fontSize: 13,
    },
  },
};


const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ errorDistribution, serviceDurations }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const formattedDurations = serviceDurations.map(item => ({
    service: item.service,
    durationSeconds: Number(item.durationSeconds.toFixed(2)),
  }));

  return (
    <div className="research-charts-section">
      {/* PIE CHART */}
      <div className="research-chart-container">
        <h2>LogLevel Distribution</h2>
        <div style={{ height: 500 }}>
          <ResponsivePie
            data={errorDistribution}
            theme={chartTheme}
            margin={{ top: 50, right: 50, bottom: 160, left: 80 }}
            innerRadius={0.5}
            padAngle={1}
            cornerRadius={4}
            activeOuterRadiusOffset={10}
            colors={{ scheme: 'set2' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#ccc"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            enableArcLabels={true}
          />
        </div>
      </div>

      {/* BAR CHART WITH SEARCH */}
      <div className="research-chart-container">
        <h2>Service Durations</h2>

        <input
          type="text"
          placeholder="Search service name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            marginBottom: '16px',
            padding: '8px 12px',
            fontSize: '0.9rem',
            width: '100%',
            maxWidth: '300px',
            border: '1px solid #ccc',
            borderRadius: '6px',
          }}
        />

        <div style={{ height: 550, width: '1200px', minWidth: '1200px' }}>
          <ResponsiveBar 
            data={formattedDurations}
            theme={chartTheme}
            keys={['durationSeconds']}
            indexBy="service"
            margin={{ top: 50, right: 50, bottom: 180, left: 80 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(bar) =>
              searchTerm &&
              !bar.data.service.toLowerCase().includes(searchTerm.toLowerCase())
                ? '#c5c5c5' // dim
                : '#3b82f6' // highlight
            }
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisBottom={{
              tickRotation: -45,
              legend: 'Service',
              legendPosition: 'middle',
              legendOffset: 130 // bump this up
            }}
            axisLeft={{
              legend: 'Duration (s)',
              legendPosition: 'middle',
              legendOffset: -50
            }}
            enableLabel={false}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'top-left',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: -40,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                symbolSize: 20,
              }
            ]}
            animate
          />
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;
