import PropTypes from 'prop-types';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Barchart = ({ data }) => {
  const formattedData = Array.isArray(data)
    ? data
      .filter(item => item && item.codeGenerated !== undefined && (item.year || item.month || item.date))
      .map(item => ({
        ...item,
        name: item.date || item.month || String(item.year),
      }))
    : [];

  return (
    <div style={{
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
    }}>
      <h3 style={{
        marginBottom: '12px',
        fontSize: '20px',
        color: 'gray',
        fontWeight: '580'
      }}>
        Code Generation
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
        >
          {/* Removed CartesianGrid to eliminate dashed background lines */}

          <XAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="number"
            tick={{ fontSize: 12 }}
            axisLine={true}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#393939',
              borderRadius: '4px',
              border: 'none',
              color: '#fff',
              fontSize: 12,
            }}
          />
          <Legend />
          <Bar
            dataKey="codeGenerated"
            fill="#00d09c"
            //radius={[10, 10, 0, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
Barchart.propTypes={
  data:PropTypes.any
}
export default Barchart;
