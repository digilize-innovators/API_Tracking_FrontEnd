import PropTypes from 'prop-types';
import React from 'react';
import {
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';

const ScatterchartGraph = ({ data }) => {
  console.log("ScatterchartGraph :=>>", data);

  const hasData = data && data.length > 0;

  const xKey = data?.data?.[0]?.year ? 'year' : 'month';
  

  const transformedData = hasData
    ? data.map(item => ({
        [xKey]: item[xKey],
        cases: item.cases ?? item.total ?? 0,
      }))
    : [];

  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      margin: '10px auto',
      width: '100%',
      aspectRatio: '4 / 3',
      maxHeight: '400px',
      fontFamily: 'sans-serif',
      boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
      position: 'relative' // for overlay
    }}>
      <h3 style={{
        marginBottom: '12px',
        fontSize: '20px',
        color: 'gray',
        fontWeight: '580'
      }}>
        Cases Dispatched 
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="cases"
            type="number"
            tick={{ fontSize: 12 }}
            axisLine
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '4px',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend />
          <Scatter name="Cases Dispatched" data={transformedData} fill="#00d09c" />
        </ScatterChart>
      </ResponsiveContainer>

      {!hasData && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          fontSize: '16px',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '10px 20px',
          borderRadius: '8px',
          pointerEvents: 'none'
        }}>
          No data available
        </div>
      )}
    </div>
  );
};

ScatterchartGraph.propTypes = {
  data: PropTypes.any
};

export default ScatterchartGraph;
