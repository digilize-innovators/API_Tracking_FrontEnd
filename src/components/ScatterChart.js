//src/components/ScatterChart.js

import React from 'react'
import { Legend, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const Scatterchart = ({ data }) => {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        fontFamily: "sans-serif",
        boxShadow: "2px 4px 10px 1px rgba(201, 201, 201, 0.47)",
        width: '23.6vw',
        height: '20.5vw',
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          marginBottom: '12px',
          fontSize: '20px',
          color: 'gray',
          fontWeight: '580'
        }}
      >
        Scatter Graph
      </div>
      <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
      >
        <XAxis
          dataKey='name'
          type={data?.length && typeof data[0]?.name == 'number' ? 'number' : 'category'}
          {...(data?.length && typeof data[0]?.name === 'number' ? { domain: ['auto', 'auto'] } : {})}
          textAnchor='end'
          allowDuplicatedCategory={false}
          tickFormatter={(tick) => (tick)}
        />
        <YAxis dataKey='y' type='number' />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        <Scatter name='executedBatch' data={data?.map(el => ({ name: el.name, y: el.executedBatch }))} fill='#8884d8' />
        <Scatter
          name='totalBatch'
          data={data?.map(el => ({ name: el.name, y: el.totalBatch }))}
          fill='#82ca9d'
        />
      </ScatterChart>
    </ResponsiveContainer>
    </div >
  )
}

export default Scatterchart;