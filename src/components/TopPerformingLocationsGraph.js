import PropTypes from 'prop-types';
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

const TopPerformingLocationsData = ({ data }) => {
  console.log("getTopPerformingLocationsData :", data);

  const yAxisKey = data?.[0]?.year ? 'year' : 'month';

  // Prepare chart data with dynamic tooltip label
  const chartData = data?.map((item) => {
    const timeLabel = item.month || item.year || '';
    const fullName = item.location_name;
    const truncatedName = fullName.length > 10 ? `${fullName.slice(0,8)} ..`: fullName;
    return {
      name: truncatedName,
      topLocations: parseInt(item.total, 10),
      tooltipLabel: `${item.location_name} (${timeLabel})`,
    };
  });

  return (
    <div
      style={{
        background: '#fff',
        padding: '20px',
        margin: '10px auto',
        // width: '23.5vw',
        // height: '18.5vw',
        width: '100%',
        aspectRatio: '4 / 3', // Ensures height adjusts with width
        maxHeight: '400px',
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
        Top Performing Locations ({yAxisKey})
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
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
            width={95}
            barSize={20}
            fontSize={12}
            interval={0}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value, name, props) => [value, 'Total']}
            labelFormatter={(label, payload) => {
              const tooltipData = payload?.[0]?.payload;
              return `Product: ${tooltipData?.tooltipLabel || label}`;
            }}
            contentStyle={{
              backgroundColor: '#393939',
              borderRadius: '4px',
              border: 'none',
              color: '#fff',
              fontSize: 12,
            }}
          />

          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          <Bar dataKey="topLocations" fill="#00d09c" barSize={20}>
            <LabelList
              dataKey="topLocations"
              position="right"
              style={{ fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
TopPerformingLocationsData.propTypes={
  data:PropTypes.any
}
export default TopPerformingLocationsData;
