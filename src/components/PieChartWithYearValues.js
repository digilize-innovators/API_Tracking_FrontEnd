import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PrintedExecutedChart({ Data }) {
  console.log(Data)
  const ExecutedData = [];
  if (Data) {
    for (const key in Data) {
      const entry = Data[key];

      ExecutedData.push({
        name: key,
        TotalCode: entry.totalCodeCreate,
        executed: entry.executedCode,
      });
    }
  }

  const grandTotal = ExecutedData.reduce((sum, entry) => sum + entry.TotalCode, 0);

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57',
    '#ffc658', '#ff9999', '#66ccff', '#cc99ff',
  ];

  const renderCustomLabel = ({ name, value }) => {
    const percent = ((value / grandTotal) * 100).toFixed(1);
    return `${name}: ${percent}%`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '4px 6px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '12px',
          lineHeight: '1.3',
          maxWidth: '140px'
        }}>
          <p style={{ margin: '4px 0' }}><strong> {item.name}</strong></p>
          <p style={{ margin: '2px 0' }}>Total Codes: {item.TotalCode}</p>
          <p style={{ margin: '2px 0' }}>Executed Codes: {item.executed}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400, }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart >
          <Pie
            data={ExecutedData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="TotalCode"
            nameKey="name"
            label={renderCustomLabel}
          >
            {ExecutedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}