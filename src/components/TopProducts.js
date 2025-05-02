import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
} from 'recharts';

const TopProductShow = ({ data }) => {
  console.log("Top 10 Products :=>", data);

  // Dynamically handle both 'month' and 'year' based labeling
  const chartData = data?.map((item) => {
    const timeLabel = item.month || item.year || ''; // Use month if available, else year
    return {
      name: `${item.product_name} (${timeLabel})`,
      topProducts: parseInt(item.total, 10),
    };
  });

  return (
    <div
      style={{
        background: '#fff',
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
        padding: '20px',
        margin: '10px auto',
        width: '24.1vw',
        height: '18.5vw',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <h3
        style={{
          marginBottom: '12px',
          fontSize: '20px',
          color: 'gray',
          fontWeight: '580',
        }}
      >
        Top Products Visualization
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          // margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          margin={{ top: 2, right: 20, left: 0, bottom: 20 }}
          barCategoryGap={8}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 }}
            width={120}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#333',
              borderRadius: '4px',
              border: 'none',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Bar dataKey="topProducts" fill="#00c49f" barSize={18}>
            <LabelList
              dataKey="topProducts"
              position="right"
              style={{ fontSize: 12, fill: '#333' }}
            />
          </Bar>
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductShow;