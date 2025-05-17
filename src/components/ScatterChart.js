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
  
  if (!data || data.length === 0) return <div>No data available</div>;

  // Determine key: 'year' or 'month'
  const xKey = data[0]?.year !== undefined ? 'year' : 'month';

  // Normalize data: support both `cases` and `total`
  const transformedData = data.map(item => ({
    [xKey]: item[xKey],
    cases: item.cases ?? item.total ?? 0,
  }));

  // Determine if xKey is string or number
  const isCategory = typeof transformedData[0][xKey] === 'string';

  // Unique sorted ticks (for months: 'Jan', 'Feb', ..., for years: 2021, 2022, ...)
  const ticks = [...new Set(transformedData.map(item => item[xKey]))];

  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      margin: '10px auto',
      width: '23.5vw',
      height: '18.5vw',
      fontFamily: 'sans-serif',
      boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)'
    }}>
      <h3 style={{
        marginBottom: '12px',
        fontSize: '20px',
        color: 'gray',
        fontWeight: '580'
      }}>
        Cases Dispatched ({xKey})
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <XAxis
            dataKey={xKey}
            type={isCategory ? 'category' : 'number'}
            ticks={ticks}
            tick={{ fontSize: 12 }}
            axisLine
            tickLine={false}
            padding={{ left: 25 }}
          />
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
    </div>
  );
};

export default ScatterchartGraph;
