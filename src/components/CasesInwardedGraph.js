import PropTypes from 'prop-types'
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CasesInwarded = ({ data }) => {
  const chartData = data?.data
  const xAxisKey = data?.data?.[0]?.year ? 'year' : 'month'
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
        boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)'
      }}
    >
      <h3
        style={{
          marginBottom: '12px',
          fontSize: '20px',
          color: 'gray',
          fontWeight: '580'
        }}
      >
        Cases Inwarded
      </h3>

      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} axisLine={true} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#393939',
              borderRadius: '4px',
              border: 'none',
              color: '#fff',
              fontSize: 12
            }}
          />
          <Legend />
          <Bar dataKey='SALES_RETURN' fill='#00d09c' name='Sales Return' barSize={20} />
          <Bar dataKey='STOCKTRANSFER_ORDER' fill='#5EADAE' name='Stock Transfer' barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
CasesInwarded.propTypes={
  data:PropTypes.any
}
export default CasesInwarded
