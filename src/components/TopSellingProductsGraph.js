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

const TopSellingProductsData = ({ data }) => {
  console.log("TopSellingProductsData Chart Data:", data);
  
  const yAxisKey = data?.[0]?.year ? 'year' : 'month';
  console.log("yAxisKey",yAxisKey);
  
  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        margin: '10px auto',
        width: '23.5vw',
        height: '18.5vw',
        fontFamily: 'sans-serif',
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)',
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
        Top Selling Products ({yAxisKey})
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          barCategoryGap={10}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey={yAxisKey}
            type="category"
            tick={{ fontSize: 12 }}
            width={50}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [value, 'Total']}
            labelFormatter={(label) => `${yAxisKey.charAt(0).toUpperCase() + yAxisKey.slice(1)}: ${label}`}
            contentStyle={{
              backgroundColor: '#393939',
              borderRadius: '4px',
              border: 'none',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          <Bar dataKey="total" fill="#00d09c" barSize={20}>
            <LabelList
              dataKey="total"
              position="right"
              style={{ fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopSellingProductsData;
