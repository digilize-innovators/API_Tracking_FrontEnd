
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import PropTypes from 'prop-types';

const Linechart = ({ data }) => {
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
        Top Performing Locations
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={true}
            tickLine={false}
            padding={{ left: 25 }}
          />
          <YAxis
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
          <Line type="monotone" dataKey="executedBatch" stroke="#00d09c" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="totalBatch" stroke="#5EADAE" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
Linechart.propTypes={
  data:PropTypes.any
}

export default Linechart;
