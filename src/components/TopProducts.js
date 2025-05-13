
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

  const chartData = data?.map((item) => {
    const timeLabel = item.month || item.year || '';
    return {
      name: item.product_name,
      topProducts: parseInt(item.total, 10),
      tooltipLabel: `${item.product_name} (${timeLabel})`,
    };
  });

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
        Top Products Visualization
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
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
            dataKey="name"
            type="category"
            tick={({ x, y, payload }) => {
              return (
                <text
                  x={x - 5}
                  y={y + 4}
                  textAnchor="end"
                  fill="#666"
                  fontSize={12}
                >
                  {payload.value}
                </text>
              );
            }}
            width={138}
            interval={0}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value) => [value, 'Total']}
            labelFormatter={(label) => `Product : ${label}`}
            contentStyle={{
              backgroundColor: '#393939',
              borderRadius: '4px',
              border: 'none',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />

          <Bar dataKey="topProducts" fill="#00d09c" barSize={20} >
            <LabelList
              dataKey="topProducts"
              position="right"
              // style={{ fontSize: 12, fill: '#333' }}
              style={{fontSize:12}}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductShow;
